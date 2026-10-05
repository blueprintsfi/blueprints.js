import Token from "./Token.js";
import * as types from "../types.js";
import type { Fraction } from "../utils.js";

const paramsType = new types.Struct({
    token: types.token,
    metadata: types.bytes,
});

export type WithMetadataParams = types.Infer<typeof paramsType>;

export default class WithMetadata extends Token {
    static paramsType = paramsType;
    static override name = "WithMetadata";

    override params: WithMetadataParams;

    constructor(amount: Fraction | bigint, params: WithMetadataParams) {
        super(amount, params.token.weiPerUnit);
        this.params = paramsType.deepCopy(params);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        return this.params.token.internalTokenId();
    }

    override blueprintAddress(): string {
        return this.params.token.blueprintAddress();
    }

    override externalTokenId(): Uint8Array {
        return this.params.token.externalTokenId();
    }
}

types.registerBlueprint(WithMetadata);
