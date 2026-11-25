import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import {
    type AstNodeTokenWithAmount,
    type AstNodeToken,
    Tokenizer,
    astToString,
    parseTokenWithAmount,
    parseToken,
} from "../parser.js";
import { Fraction, UINT256_MAX, weiFromString, weiToString } from "../utils.js";

type Cache = {
    internalTokenId: Uint8Array | null;
    externalTokenId: Uint8Array | null;
};

export abstract class Token {
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

    withAmount(amount: Fraction | bigint | string): TokenWithAmount {
        let weiAmount: bigint;
        if (typeof amount === "string") {
            weiAmount = weiFromString(amount, this._weiPerUnit);
        } else {
            weiAmount = this._weiPerUnit.mul(amount).toBigInt();
        }

        // @ts-ignore
        return new TokenWithAmount(weiAmount, this);
    }

    withWeiAmount(amount: bigint): TokenWithAmount {
        // @ts-ignore
        return new TokenWithAmount(amount, this);
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

    static fromString(input: string): Token {
        const tokenizer = new Tokenizer(input);
        const token = parseToken(tokenizer);
        tokenizer.expectEOF();
        return token;
    }

    static tryFromString(input: string): Token | null {
        try {
            return Token.fromString(input);
        } catch {
            return null;
        }
    }

    abstract toAst(): AstNodeToken;

    toString(): string {
        return astToString(this.toAst());
    }
}

export class TokenWithAmount {
    private constructor(private _weiAmount: bigint, readonly token: Token) {
        if (_weiAmount < 0n || _weiAmount > UINT256_MAX) {
            throw new Error("Amount out of range");
        }
    }

    get amount(): Fraction {
        return new Fraction(this._weiAmount, 1n).div(this.token.weiPerUnit).normalize();
    }

    get weiAmount() {
        return this._weiAmount;
    }

    static fromString(input: string): TokenWithAmount {
        const tokenizer = new Tokenizer(input);
        const token = parseTokenWithAmount(tokenizer);
        tokenizer.expectEOF();
        return token;
    }

    static tryFromString(input: string): TokenWithAmount | null {
        try {
            return TokenWithAmount.fromString(input);
        } catch {
            return null;
        }
    }

    amountString(): string {
        return weiToString(this._weiAmount, this.token.weiPerUnit);
    }

    toAst(): AstNodeTokenWithAmount {
        return {
            type: "token_with_amount",
            payload: {
                amount: this.amountString(),
                token: this.token.toAst(),
            },
        };
    }

    toString(): string {
        return astToString(this.toAst());
    }
}
