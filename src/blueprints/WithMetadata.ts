import type { Bytes } from "../bytes.js";
import { parseBytes, parseToken, tokenDefinitionParsers, type Tokenizer } from "../parser.js";
import { Token, TokenDefinition } from "./token.js";

export default class WithMetadata extends TokenDefinition {
    static override name = "WithMetadata";

    constructor(readonly token: Token, readonly metadata: Bytes) {
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

    override toString(): string {
        return `WithMetadata<${this.token.toString()}, ${this.metadata.toString()}>`;
    }

    override toHTMLString(): string {
        let result = `<span class="bp-blueprint">WithMetadata</span>&lt;`;
        result += `${this.token.toHTMLString()}, `;
        result += `${this.metadata.toHTMLString()}&gt;`;
        return result;
    }
}

function parseWithMetadata(tokenizer: Tokenizer): WithMetadata {
    const token = parseToken(tokenizer);
    tokenizer.mustConsume(", ");
    const metadata = parseBytes(tokenizer);
    return new WithMetadata(token, metadata);
}

tokenDefinitionParsers.set(WithMetadata.name, parseWithMetadata);
