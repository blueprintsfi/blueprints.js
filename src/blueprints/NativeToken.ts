import { parseInteger, tokenDefinitionParsers, type Tokenizer } from "../parser.js";
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
        return "0xF3F67A0F38BF0A61DD2D93ADf9B04753D39C631C";
    }

    override toString(): string {
        return `NativeToken<${this.decimals}>`;
    }

    override toHTMLString(): string {
        let result = `<span class="bp-blueprint">NativeToken</span>&lt;`;
        result += `<span class="bp-int">${this.decimals}</span>&gt;`;
        return result;
    }
}

function parseNativeToken(tokenizer: Tokenizer): NativeToken {
    const decimals = parseInteger(tokenizer);
    return new NativeToken(decimals);
}

tokenDefinitionParsers.set(NativeToken.name, parseNativeToken);
