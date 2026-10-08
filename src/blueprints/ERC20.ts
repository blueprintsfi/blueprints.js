import Token from "./Token.js";
import * as types from "../types.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import type { Fraction } from "../utils.js";

const paramsType = new types.Struct({
    address: types.address,
    decimals: types.integer,
});

export type ERC20Params = types.Infer<typeof paramsType>;

export default class ERC20 extends Token {
    static paramsType = paramsType;
    static override name = "ERC20";

    override params: ERC20Params;

    constructor(amount: Fraction | bigint, params: types.Infer<typeof paramsType>) {
        const { decimals } = params;

        // ❯ 10n**77n >= 2n ** 256n
        // false
        // ❯ 10n**78n >= 2n ** 256n
        // true
        if (decimals < 0n || decimals > 77n) {
            throw new Error("Decimals out of range");
        }

        super(amount, 10n ** decimals);
        this.params = paramsType.deepCopy(params);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        const buffer = new Uint8Array(0x20);
        buffer.set(hexToBytes(this.params.address.slice(2)), 12);
        return buffer;
    }

    override blueprintAddress(): string {
        return "0x01B522c50242747c576717052FBA75e7fA2aa6a8";
    }
};

types.registerBlueprint(ERC20);
