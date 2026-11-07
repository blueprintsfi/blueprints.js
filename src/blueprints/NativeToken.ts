import {
    type AstNodeTokenDefinition,
    parseInteger,
    tokenDefinitionParsers,
    type Tokenizer,
} from "../parser.js";
import { TokenDefinition } from "./token.js";

const zero = new Uint8Array(32);

export default class NativeToken extends TokenDefinition {
    static override name = "NativeToken";

    constructor(readonly decimals: bigint) {
        // ❯ 10n**77n >= 2n ** 256n
        // false
        // ❯ 10n**78n >= 2n ** 256n
        // true
        if (decimals < 0n || decimals > 77n) {
            throw new Error("Decimals out of range");
        }

        super(10n ** decimals);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        return zero;
    }

    override blueprintAddress(): string {
        return "0x98198D50bA4e2ac6624f3659F8e404A3aFE30e71";
    }

    override toAst(): AstNodeTokenDefinition {
        return {
            type: "token_definition",
            payload: {
                blueprint: NativeToken.name,
                params: [{ type: "integer", payload: this.decimals }],
            },
        };
    }
}

function parseNativeToken(tokenizer: Tokenizer): NativeToken {
    const decimals = parseInteger(tokenizer);
    return new NativeToken(decimals);
}

tokenDefinitionParsers.set(NativeToken.name, parseNativeToken);
