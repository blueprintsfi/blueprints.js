import type { Bytes } from "../bytes.js";
import {
    type AstNodeTokenDefinition,
    parseBytes,
    tokenDefinitionParsers,
    type Tokenizer,
} from "../parser.js";
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

    override toAst(): AstNodeTokenDefinition {
        return {
            type: "token_definition",
            payload: {
                blueprint: UnknownBlueprint.name,
                params: [this.tokenId.toAst()],
            },
        };
    }
}

function parseUnknownBlueprint(tokenizer: Tokenizer): UnknownBlueprint {
    return new UnknownBlueprint(parseBytes(tokenizer));
}

tokenDefinitionParsers.set(UnknownBlueprint.name, parseUnknownBlueprint);
