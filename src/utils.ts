import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

export function addressWithChecksum(address: string): string {
    address = address.slice(2);
    const hash = bytesToHex(keccak_256(new TextEncoder().encode(address)));

    let result = "0x";
    for (let index = 0; index < address.length; index++) {
        const char = address[index]!;
        result += parseInt(hash[index]!, 16) >= 8 ? char.toUpperCase() : char;
    }
    return result;
};

export function numberToBytesBE(number: bigint, length: number): Uint8Array {
    return hexToBytes(number.toString(16).padStart(2 * length, "0"));
}

export function calculateGcd(a: bigint, b: bigint) {
    while (b !== 0n) [a, b] = [b, a % b];
    return a;
}

export class Fraction {
    constructor(public readonly numerator: bigint, public readonly denominator: bigint) {
        if (numerator < 0n || denominator <= 0n) {
            throw new Error("Invalid fraction");
        }
    }

    mul(other: Fraction | bigint): Fraction {
        if (typeof other === "bigint") {
            other = new Fraction(other, 1n);
        }

        return new Fraction(
            this.numerator * other.numerator,
            this.denominator * other.denominator,
        ).normalize();
    }

    div(divisor: Fraction | bigint): Fraction {
        if (typeof divisor === "bigint") {
            divisor = new Fraction(divisor, 1n);
        }

        return this.mul(new Fraction(divisor.denominator, divisor.numerator)).normalize();
    }

    normalize(): Fraction {
        const factor = calculateGcd(this.numerator, this.denominator);
        return new Fraction(this.numerator / factor, this.denominator / factor);
    }

    toBigInt(): bigint {
        if (this.numerator % this.denominator != 0n) {
            throw new Error("Fraction must represent an integer");
        }

        return this.numerator / this.denominator;
    }
}

export function weiToString(weiAmount: bigint, weiPerUnit: Fraction | bigint): string {
    if (typeof weiPerUnit === "bigint") {
        weiPerUnit = new Fraction(weiPerUnit, 1n);
    }
    let multiplier = 1n;
    let decimals = 0;
    while (multiplier * weiPerUnit.denominator < weiPerUnit.numerator) {
        multiplier *= 10n;
        decimals++;
    }

    multiplier *= 100n;
    decimals += 2;

    const num = weiPerUnit.denominator * multiplier * weiAmount;
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

export function weiFromString(str: string, weiPerUnit: Fraction | bigint): bigint {
    if (typeof weiPerUnit === "bigint") {
        weiPerUnit = new Fraction(weiPerUnit, 1n);
    }
    const stripped = str.startsWith("~") ? str.slice(1) : str;
    const dotIndex = stripped.indexOf(".");

    let result: bigint;
    try {
        if (dotIndex === -1) {
            result = new Fraction(BigInt(stripped), 1n).mul(weiPerUnit).toBigInt();
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

    if (weiToString(result, weiPerUnit) !== str) {
        throw new Error("Invalid fraction");
    }

    return result;
}
