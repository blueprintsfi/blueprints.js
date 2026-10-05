import Token from "./Token.js";
import * as types from "../types.js";
import type { Fraction } from "../utils.js";

const paramsType = new types.Struct({
    externalTokenId: types.bytes,
});

export type UnknownBlueprintParams = types.Infer<typeof paramsType>;

export default class UnknownBlueprint extends Token {
    static paramsType = paramsType;
    static override name = "UnknownBlueprint";

    override params: UnknownBlueprintParams;

    constructor(amount: Fraction | bigint, params: UnknownBlueprintParams) {
        if (params.externalTokenId.length() !== 32) {
            throw new Error("Invalid token id");
        }
        super(amount, 1n);
        this.params = paramsType.deepCopy(params);
    }


    protected override calculateInternalTokenId(): never {
        throw new Error("Internal token id is unknown");
    }

    override blueprintAddress(): never {
        throw new Error("Blueprint address is unknown");
    }

    override externalTokenId(): Uint8Array<ArrayBufferLike> {
        return this.params.externalTokenId.bytes();
    }
}

types.registerBlueprint(UnknownBlueprint);
