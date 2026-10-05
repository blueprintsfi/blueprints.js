import Token from "./Token.js";
import * as types from "../types.js";
import type { Fraction } from "../utils.js";

const paramsType = new types.Struct({
    address: types.address,
    internalTokenId: types.bytes,
});

export type UnsupportedBlueprintParams = types.Infer<typeof paramsType>;

export default class UnsupportedBlueprint extends Token {
    static paramsType = paramsType;
    static override name = "UnsupportedBlueprint";

    override params: UnsupportedBlueprintParams;

    constructor(amount: Fraction | bigint, params: UnsupportedBlueprintParams) {
        if (params.internalTokenId.length() !== 32) {
            throw new Error("Invalid token id");
        }

        super(amount, 1n);
        this.params = paramsType.deepCopy(params);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        return this.params.internalTokenId.bytes();
    }

    override blueprintAddress(): string {
        return this.params.address;
    }
}

types.registerBlueprint(UnsupportedBlueprint);
