import type { Bytes } from "../bytes.js";
import {
    type AstNodeToken,
    parseAddress,
    parseBytes,
    tokenParsers,
    type Tokenizer,
} from "../parser.js";
import { skipAddressValidation, validateAddress } from "../utils.js";
import { Token } from "./token.js";

export default class UnsupportedBlueprint extends Token {
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

    override toAst(): AstNodeToken {
        return {
            type: "token",
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
    return skipAddressValidation(() => new UnsupportedBlueprint(address, tokenId));
}

tokenParsers.set(UnsupportedBlueprint.name, parseUnsupportedBlueprint);
