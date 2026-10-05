import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import Tokenizer from "../Tokenizer.js";
import * as types from "../types.js";
import { Fraction, weiToString } from "../utils.js";

type IdCache = {
    internalTokenId: Uint8Array | null;
    externalTokenId: Uint8Array | null;
};

export default abstract class Token {
    private _weiPerUnit: Fraction;
    private _weiAmount!: bigint
    private cache: IdCache;

    abstract params: unknown;

    /**
     * `weiPerUnit` must be positive.
     */
    constructor(amount: Fraction | bigint, weiPerUnit: Fraction | bigint) {
        if (typeof weiPerUnit === "bigint") {
            weiPerUnit = new Fraction(weiPerUnit, 1n);
        }

        this._weiPerUnit = weiPerUnit.normalize();
        this.setAmount(amount);
        this.cache = {
            internalTokenId: null,
            externalTokenId: null,
        };
    }

    get amount(): Fraction {
        return new Fraction(this._weiAmount, 1n).div(this._weiPerUnit);
    }

    setAmount(newAmount: Fraction | bigint): void {
        let weiAmount: bigint;
        try {
            weiAmount = this._weiPerUnit.mul(newAmount).toBigInt();
        } catch {
            throw new Error("Amount cannot be represented");
        }
        this.setWeiAmount(weiAmount);
    }

    get weiAmount() {
        return this._weiAmount;
    }

    get weiPerUnit() {
        return this._weiPerUnit;
    }

    setWeiAmount(newAmount: bigint): void {
        if (newAmount < 0n) {
            throw new Error("Amount must be nonnegative");
        }

        this._weiAmount = newAmount;
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

    toString(format: types.ToStringFormat = "raw") {
        return types.token.stringify(this, format);
    }

    static fromString(str: string) {
        const tokenizer = new Tokenizer(str);
        const res = types.token.parse(tokenizer);
        tokenizer.assertEOF();
        return res;
    }

    amountString(): string {
        return weiToString(this._weiAmount, this._weiPerUnit);
    }

    copy(): this {
        let result: this = Object.create(Object.getPrototypeOf(this));
        result._weiAmount = this._weiAmount;
        result._weiPerUnit = this._weiPerUnit;
        result.params = this.params;
        result.cache = this.cache;
        return result;
    }
}
