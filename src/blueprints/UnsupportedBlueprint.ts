import type { Bytes } from "../bytes.js";
import { parseAddress, parseBytes, tokenDefinitionParsers, type Tokenizer } from "../parser.js";
import { validateAddress } from "../utils.js";
import { TokenDefinition } from "./token.js";

export default class UnsupportedBlueprint extends TokenDefinition {
    static override name = "UnsupportedBlueprint";

    constructor(readonly address: string, readonly tokenId: Bytes) {
        if (tokenId.length() !== 32) {
            throw new Error("Invalid token id");
        }

        validateAddress(address);

        super(1n);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        return this.tokenId.bytes();
    }

    override blueprintAddress(): string {
        return this.address;
    }

    override toString(): string {
        return `UnsupportedBlueprint<${this.address}, ${this.tokenId.toString()}>`;
    }

    override toHTMLString(): string {
        let result = `<span class="bp-blueprint">UnsupportedBlueprint</span>&lt;`;
        result += `<span class="bp-address">${this.address}</span>, `;
        result += `${this.tokenId.toHTMLString()}&gt;`;
        return result;
    }
}

function parseUnsupportedBlueprint(tokenizer: Tokenizer): UnsupportedBlueprint {
    const address = parseAddress(tokenizer, false);
    tokenizer.mustConsume(", ");
    const tokenId = parseBytes(tokenizer);
    return new UnsupportedBlueprint(address, tokenId);
}

tokenDefinitionParsers.set(UnsupportedBlueprint.name, parseUnsupportedBlueprint);
