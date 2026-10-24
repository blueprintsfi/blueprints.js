import type { Bytes } from "../bytes.js";
import { parseBytes, tokenDefinitionParsers, type Tokenizer } from "../parser.js";
import { TokenDefinition } from "./token.js";

export default class UnknownBlueprint extends TokenDefinition {
    static override name = "UnknownBlueprint";

    constructor(readonly tokenId: Bytes) {
        if (tokenId.length() !== 32) {
            throw new Error("Invalid token id");
        }
        super(1n);
    }

    protected override calculateInternalTokenId(): never {
        throw new Error("Internal token id is unknown");
    }

    override blueprintAddress(): never {
        throw new Error("Blueprint address is unknown");
    }

    override externalTokenId(): Uint8Array<ArrayBufferLike> {
        return this.tokenId.bytes();
    }

    override toString(): string {
        return `UnknownBlueprint<${this.tokenId.toString()}>`;
    }

    override toHTMLString(): string {
        let result = `<span class="blueprint">UnknownBlueprint</span>&lt;`;
        result += `${this.tokenId.toHTMLString()}&gt;`;
        return result;
    }
}

function parseUnknownBlueprint(tokenizer: Tokenizer): UnknownBlueprint {
    return new UnknownBlueprint(parseBytes(tokenizer));
}

tokenDefinitionParsers.set(UnknownBlueprint.name, parseUnknownBlueprint);
