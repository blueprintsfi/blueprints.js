import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";

export const UINT256_MAX = (1n << 256n) - 1n;
export const _2_TO_256 = (1n << 256n);
export const INT256_MIN = -(1n << 255n);
export const INT256_MAX = (1n << 255n) - 1n;

const textEncoder = new TextEncoder();

export function validateAddress(address: string): void {
    if (!isAddressValid(address)) {
        throw new Error("Invalid address");
    }
}

function isAddressValid(address: string): boolean {
    if (address.length !== 42 || !address.startsWith("0x")) return false;

    for (let i = 2; i < 42; i++) {
        const c = address.charCodeAt(i);
        if ((c < 48 || c > 57) && (c < 97 || c > 102) && (c < 65 || c > 70)) return false;
    }

    const lower = address.slice(2).toLowerCase();
    const hash = keccak_256(textEncoder.encode(lower));
    for (let i = 0; i < 40; i++) {
        const c = address.charCodeAt(i + 2);
        if (c <= 57) continue;
        const uppercase = (hash[i >> 1]! & (i % 2 === 0 ? 0x80 : 0x08)) !== 0;
        if (uppercase !== (c < 97)) return false;
    }
    return true;
}

/**
 * Adds checksum to a **lowercase** address. The result will be invalid if
 * `address` in not a valid lowercase address.
 */
export function addressWithChecksum(address: string): string {
    address = address.slice(2);
    const hash = keccak_256(textEncoder.encode(address));

    let result = "0x";
    for (let index = 0; index < address.length; index++) {
        const char = address[index]!;
        const uppercase = (hash[index >> 1]! & (index % 2 === 0 ? 0x80 : 0x08)) !== 0;
        result += uppercase ? char.toUpperCase() : char;
    }
    return result;
};

export function numberToBytesBE(number: bigint, length: number): Uint8Array {
    return hexToBytes(number.toString(16).padStart(2 * length, "0"));
}

export function compareIds(lhs: Uint8Array, rhs: Uint8Array): number {
    for (let i = 0; i < 32; i++) {
        if (lhs[i]! !== rhs[i]!) {
            return lhs[i]! - rhs[i]!;
        }
    }
    return 0;
}

export function calculateGcd(a: bigint, b: bigint) {
    while (b !== 0n) [a, b] = [b, a % b];
    return a;
}

export function abs(value: bigint): bigint {
    return value < 0n ? -value : value;
}

export class Fraction {
    constructor(readonly numerator: bigint, readonly denominator: bigint) {
        if (denominator === 0n) throw new Error("Invalid fraction");
        if (denominator < 0n) {
            this.numerator *= -1n;
            this.denominator *= -1n;
        }
    }

    mul(other: Fraction | bigint): Fraction {
        if (typeof other === "bigint") {
            other = new Fraction(other, 1n);
        }

        return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator);
    }

    div(other: Fraction | bigint): Fraction {
        if (typeof other === "bigint") {
            other = new Fraction(other, 1n);
        }

        return new Fraction(this.numerator * other.denominator, this.denominator * other.numerator);
    }

    normalize(): Fraction {
        const gcd = calculateGcd(abs(this.numerator), this.denominator);
        return new Fraction(this.numerator / gcd, this.denominator / gcd);
    }

    toBigInt(): bigint {
        if (this.numerator % this.denominator !== 0n) {
            throw new Error("Fraction is not an integer");
        }

        return this.numerator / this.denominator;
    }
}

export function weiToString(weiAmount: bigint, weiPerUnit: Fraction | bigint): string {
    if (typeof weiPerUnit === "bigint") {
        weiPerUnit = new Fraction(weiPerUnit, 1n);
    }
    if (weiAmount < 0n) throw new Error("Wei amount must be non-negative");
    if (weiPerUnit.numerator <= 0n) throw new Error("Wei per unit must be positive");

    const scaledAmount = weiPerUnit.denominator * weiAmount;
    if (scaledAmount % weiPerUnit.numerator === 0n) {
        return (scaledAmount / weiPerUnit.numerator).toString();
    }

    // The digit-count difference is at most one below ceil(log10(weiPerUnit)).
    let decimals = Math.max(
        0,
        weiPerUnit.numerator.toString().length - weiPerUnit.denominator.toString().length,
    );
    let multiplier = 10n ** BigInt(decimals);
    if (multiplier * weiPerUnit.denominator < weiPerUnit.numerator) {
        multiplier *= 10n;
        decimals++;
    }

    multiplier *= 100n;
    decimals += 2;

    const num = scaledAmount * multiplier;
    const isExact = num % weiPerUnit.numerator === 0n;

    let result = (num << 1n) / weiPerUnit.numerator;
    if ((result & 1n) === 1n) {
        result += 1n;
    }
    result >>= 1n;

    const integer = result / multiplier;

    let fraction = (result % multiplier).toString().padStart(decimals, "0");
    if (isExact) {
        while (fraction.length > 0 && fraction[fraction.length - 1] === "0") {
            fraction = fraction.slice(0, -1);
        }
    }
    if (fraction.length > 0) {
        fraction = "." + fraction;
    }

    return `${isExact ? "" : "~"}${integer}${fraction}`;
}

export function weiFromString(input: string, weiPerUnit: Fraction | bigint): bigint {
    if (typeof weiPerUnit === "bigint") {
        weiPerUnit = new Fraction(weiPerUnit, 1n);
    }
    if (weiPerUnit.numerator <= 0n) throw new Error("Wei per unit must be positive");

    const stripped = input.startsWith("~") ? input.slice(1) : input;
    const dotIndex = stripped.indexOf(".");

    let result: bigint;
    try {
        if (dotIndex === -1) {
            const numerator = BigInt(stripped) * weiPerUnit.numerator;
            if (numerator < 0n || numerator % weiPerUnit.denominator !== 0n) {
                throw new Error("Fraction must represent a non-negative integer");
            }
            result = numerator / weiPerUnit.denominator;
        } else {
            const integer = BigInt(stripped.slice(0, dotIndex));
            const fraction = BigInt(stripped.slice(dotIndex + 1));
            const scale = 10n ** BigInt(stripped.length - dotIndex - 1);
            const num = (integer * scale + fraction);
            const doubledNumerator = 2n * num * weiPerUnit.numerator / (scale * weiPerUnit.denominator);
            result = doubledNumerator >> 1n;
            if ((doubledNumerator & 1n) === 1n) {
                result += 1n;
            }
        }
    } catch {
        throw new Error("Invalid fraction");
    }

    if (weiToString(result, weiPerUnit) !== input) {
        throw new Error("Invalid fraction");
    }

    return result;
}
