import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import { Tokenizer, parseToken, parseTokenDefinition } from "../parser.js";
import { Fraction, weiFromString, weiToString } from "../utils.js";

type Cache = {
    internalTokenId: Uint8Array | null;
    externalTokenId: Uint8Array | null;
};

const MAX_AMOUNT = (1n << 256n) - 1n;

export abstract class TokenDefinition {
    private _weiPerUnit: Fraction;
    private cache: Cache = {
        internalTokenId: null,
        externalTokenId: null,
    };

    /**
     * `weiPerUnit` must be positive.
     */
    constructor(weiPerUnit: Fraction | bigint) {
        if (typeof weiPerUnit === "bigint") {
            this._weiPerUnit = new Fraction(weiPerUnit, 1n);
        } else {
            this._weiPerUnit = weiPerUnit;
        }
    }

    get weiPerUnit() {
        return this._weiPerUnit;
    }

    withAmount(amount: Fraction | bigint | string): Token {
        let weiAmount: bigint;
        if (typeof amount === "string") {
            weiAmount = weiFromString(amount, this._weiPerUnit);
        } else {
            weiAmount = this._weiPerUnit.mul(amount).toBigInt();
        }

        // @ts-ignore
        return new Token(weiAmount, this);
    }

    withWeiAmount(amount: bigint): Token {
        // @ts-ignore
        return new Token(amount, this);
    }


    abstract blueprintAddress(): string;
    protected abstract calculateInternalTokenId(): Uint8Array;

    internalTokenId(): Uint8Array {
        if (this.cache.internalTokenId !== null) {
            return this.cache.internalTokenId.slice();
        }
        return (this.cache.internalTokenId = this.calculateInternalTokenId()).slice();
    }

    externalTokenId(): Uint8Array {
        if (this.cache.externalTokenId !== null) {
            return this.cache.externalTokenId.slice();
        }

        const buffer = new Uint8Array(52);
        buffer.set(hexToBytes(this.blueprintAddress().slice(2)));
        buffer.set(this.internalTokenId(), 20);
        return (this.cache.externalTokenId = keccak_256(buffer)).slice();
    }

    static fromString(input: string): TokenDefinition {
        const tokenizer = new Tokenizer(input);
        const tokenDefinition = parseTokenDefinition(tokenizer);
        tokenizer.ensureEOF();
        return tokenDefinition;
    }

    abstract toString(): string;
    abstract toHTMLString(): string;
}

export class Token {
    private constructor(private _weiAmount: bigint, readonly definition: TokenDefinition) {
        if (_weiAmount < 0n || _weiAmount > MAX_AMOUNT) {
            throw new Error("Amount out of range");
        }
    }

    get amount(): Fraction {
        return new Fraction(this._weiAmount, 1n).div(this.definition.weiPerUnit);
    }

    get weiAmount() {
        return this._weiAmount;
    }

    static fromString(input: string): Token {
        const tokenizer = new Tokenizer(input);
        const token = parseToken(tokenizer);
        tokenizer.ensureEOF();
        return token;
    }

    amountString(): string {
        return weiToString(this._weiAmount, this.definition.weiPerUnit);
    }

    toString(): string {
        return `${this.amountString()} ${this.definition.toString()}`;
    }

    toHTMLString(): string {
        let result = `<span class="bp-amount">${this.amountString()}</span> `;
        result += this.definition.toHTMLString();
        return result;
    }
}
