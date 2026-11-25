import type { Bytes } from "../bytes.js";
import {
    type AstNodeToken,
    parseBytes,
    parseTokenWithAmount,
    tokenParsers,
    type Tokenizer,
} from "../parser.js";
import { Token, TokenWithAmount } from "./token.js";

export default class WithMetadata extends Token {
    static override name = "WithMetadata";

    constructor(readonly wrapped: TokenWithAmount, readonly metadata: Bytes) {
        if (wrapped.weiAmount === 0n) {
            throw new Error("Wrapped token in WithMetadata must have non-zero amount");
        }

        super(wrapped.weiAmount);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        return this.wrapped.token.internalTokenId();
    }

    override blueprintAddress(): string {
        return this.wrapped.token.blueprintAddress();
    }

    override externalTokenId(): Uint8Array {
        return this.wrapped.token.externalTokenId();
    }

    override toAst(): AstNodeToken {
        return {
            type: "token",
            payload: {
                blueprint: WithMetadata.name,
                params: [this.wrapped.toAst(), this.metadata.toAst()],
            },
        };
    }
}

function parseWithMetadata(tokenizer: Tokenizer): WithMetadata {
    const wrapped = parseTokenWithAmount(tokenizer);
    tokenizer.expectPunctuation(", ");
    const metadata = parseBytes(tokenizer);
    return new WithMetadata(wrapped, metadata);
}

tokenParsers.set(WithMetadata.name, parseWithMetadata);
