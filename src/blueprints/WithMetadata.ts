import type { Bytes } from "../bytes.js";
import {
    type AstNodeTokenDefinition,
    parseBytes,
    parseToken,
    tokenDefinitionParsers,
    type Tokenizer,
} from "../parser.js";
import { Token, TokenDefinition } from "./token.js";

export default class WithMetadata extends TokenDefinition {
    static override name = "WithMetadata";

    constructor(readonly token: Token, readonly metadata: Bytes) {
        if (token.weiAmount === 0n) {
            throw new Error("Token in WithMetadata must have non-zero amount");
        }

        super(token.weiAmount);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        return this.token.definition.internalTokenId();
    }

    override blueprintAddress(): string {
        return this.token.definition.blueprintAddress();
    }

    override externalTokenId(): Uint8Array {
        return this.token.definition.externalTokenId();
    }

    override toAst(): AstNodeTokenDefinition {
        return {
            type: "token_definition",
            payload: {
                blueprint: WithMetadata.name,
                params: [this.token.toAst(), this.metadata.toAst()],
            },
        };
    }
}

function parseWithMetadata(tokenizer: Tokenizer): WithMetadata {
    const token = parseToken(tokenizer);
    tokenizer.expectPunctuation(", ");
    const metadata = parseBytes(tokenizer);
    return new WithMetadata(token, metadata);
}

tokenDefinitionParsers.set(WithMetadata.name, parseWithMetadata);
