import Token  from "./Token.js";
import * as types from "../types.js";
import type { Fraction } from "../utils.js";

const zero = new Uint8Array(32);

const paramsType = new types.Struct({
    decimals: types.integer,
});

export type NativeTokenParams = types.Infer<typeof paramsType>;

export default class NativeToken extends Token {
    static paramsType = paramsType;
    static override name = "NativeToken";

    override params: NativeTokenParams;

    constructor(amount: Fraction | bigint, params: NativeTokenParams) {
        super(amount, 10n ** params.decimals);
        this.params = paramsType.deepCopy(params);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        return zero;
    }

    override blueprintAddress(): string {
        return "0xF3F67A0F38BF0A61DD2D93ADf9B04753D39C631C";
    }
}

types.registerBlueprint(NativeToken);
