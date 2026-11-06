import type { Bytes } from "../bytes.js";
import {
    type AstNodeTokenDefinition,
    parseAddress,
    parseBytes,
    tokenDefinitionParsers,
    type Tokenizer,
} from "../parser.js";
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

    override toAst(): AstNodeTokenDefinition {
        return {
            type: "token_definition",
            payload: {
                blueprint: UnsupportedBlueprint.name,
                params: [
                    { type: "address", payload: this.address },
                    this.tokenId.toAst(),
                ],
            },
        };
    }
}

function parseUnsupportedBlueprint(tokenizer: Tokenizer): UnsupportedBlueprint {
    const address = parseAddress(tokenizer);
    tokenizer.expectPunctuation(", ");
    const tokenId = parseBytes(tokenizer);
    return new UnsupportedBlueprint(address, tokenId);
}

tokenDefinitionParsers.set(UnsupportedBlueprint.name, parseUnsupportedBlueprint);
