import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import type { Token, TokenDefinition } from "./blueprints/token.js";
import { HashedBytes, MapBytes, RawBytes, StringBytes, validateString, type Bytes } from "./bytes.js";
import Oracle from "./oracles/Oracle.js";
import { isAddressValid } from "./utils.js";

export enum TokenType {
    /** `~?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?` */
    Number,
    Identifier,
    Bytes,
    Punctuation,
    EOF,
    String,
    /** Currently, there is only one keyword: `keccak256`. */
    Keyword,
}

function tokenTypeToString(tokenType: TokenType): string {
    switch (tokenType) {
        case TokenType.Number: return "number";
        case TokenType.Identifier: return "identifier";
        case TokenType.Bytes: return "bytes";
        case TokenType.Punctuation: return "punctuation";
        case TokenType.EOF: return "end of input";
        case TokenType.String: return "string";
        case TokenType.Keyword: return "keyword";
    }
}

export type TextToken = {
    type: TokenType;
    text: string;
    position: number;
};

function describeToken(token: TextToken): string {
    switch (token.type) {
        case TokenType.EOF: return "end of input";
        default: return `'${token.text}'`;
    }
}

export class Tokenizer {
    private offset = 0;
    private peeked: TextToken | null = null;

    constructor(readonly input: string) {}

    next(): TextToken {
        const { peeked } = this;
        if (peeked !== null) {
            this.peeked = null;
            return peeked;
        }

        const { input } = this;
        const { length } = input;
        const start = this.offset;
        if (start === length) {
            return { type: TokenType.EOF, text: "", position: start };
        }

        const c = input.charAt(start);
        if (c === `"`) {
            const end = input.indexOf(`"`, start + 1);
            if (end === -1) this.fail("Unterminated string", start);
            try {
                validateString(input.slice(start + 1, end), "String");
            } catch (error) {
                this.fail((error as Error).message, start);
            }
            return this.token(TokenType.String, end + 1);
        }

        if (",:<>()[]{} ".includes(c)) {
            return this.token(TokenType.Punctuation, start + 1);
        }

        if (c === "0" && input.charAt(start + 1) === "x") {
            let end = start + 2;
            while (end < length && Tokenizer.isHexChar(input.charAt(end))) end++;

            if (end < length && Tokenizer.isIdentifierChar(input.charAt(end))) {
                this.fail("Invalid hex digit", end);
            }
            if (((end - start) & 1) !== 0) {
                this.fail("Bytes must have an even number of hex digits", start);
            }
            return this.token(TokenType.Bytes, end);
        }

        if (c === "~" || Tokenizer.isDigit(c)) {
            return this.number();
        }

        if (Tokenizer.isIdentifierChar(c)) {
            let end = start + 1;
            while (end < length && Tokenizer.isIdentifierChar(input.charAt(end))) end++;
            const text = input.slice(start, end);
            return this.token(text === "keccak256" ? TokenType.Keyword : TokenType.Identifier, end);
        }

        this.fail(`Unexpected character ${JSON.stringify(input.charAt(start))}`);
    }

    private number(): TextToken {
        const { input } = this;
        const { length } = input;
        const start = this.offset;
        let end = start;

        if (input.charCodeAt(end) === 126 /* "~" */) end++;

        const integerStart = end;
        while (end < length && Tokenizer.isDigit(input.charAt(end))) end++;
        if (end === integerStart ||
            (input.charCodeAt(integerStart) === 48 /* "0" */ && end - integerStart > 1)
        ) {
            this.fail("Malformed number", start);
        }

        if (input.charCodeAt(end) === 46 /* "." */) {
            end++;
            const fractionStart = end;
            while (end < length && Tokenizer.isDigit(input.charAt(end))) end++;
            if (end === fractionStart) {
                this.fail("Malformed number", start);
            }
        }

        if (end < length && Tokenizer.isIdentifierChar(input.charAt(end))) {
            this.fail("Malformed number", start);
        }

        return this.token(TokenType.Number, end);
    }

    private token(type: TokenType, end: number): TextToken {
        const position = this.offset;
        this.offset = end;
        return { type, text: this.input.slice(position, end), position };
    }

    peek(): TextToken {
        const { peeked } = this;
        if (peeked !== null) return peeked;

        return this.peeked = this.next();
    }

    discardPeeked(): void {
        this.peeked = null;
    }

    private static isDigit(c: string): boolean {
        return c >= "0" && c <= "9";
    }

    private static isHexChar(c: string): boolean {
        return Tokenizer.isDigit(c) || (c >= "a" && c <= "f") || (c >= "A" && c <= "F");
    }

    private static isIdentifierChar(c: string): boolean {
        return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || Tokenizer.isDigit(c) ||
            c === "_";
    }

    fail(message: string, position = this.offset): never {
        throw new SyntaxError(`${message} at position ${position}`);
    }

    unexpected(expected: string, token: TextToken): never {
        this.fail(`Expected ${expected}, got ${describeToken(token)}`, token.position);
    }

    expect(tokenType: TokenType): TextToken {
        const token = this.next();
        if (token.type !== tokenType) {
            this.unexpected(tokenTypeToString(tokenType), token);
        }
        return token;
    }

    expectEOF(): void {
        this.expect(TokenType.EOF);
    }

    /**
     * Consumes each character from `punctuation` as a separate punctuation token.
     */
    expectPunctuation(punctuation: string): void {
        for (const c of punctuation) {
            const token = this.next();
            if (token.type !== TokenType.Punctuation || token.text !== c) {
                this.unexpected(`'${c}'`, token);
            }
        }
    }

    /**
     * Consumes the next token iff it is the punctuation character `c`. Returns whether the token
     * was consumed.
     */
    consumePunctuation(c: string): boolean {
        const token = this.peek();
        if (token.type !== TokenType.Punctuation || token.text !== c) return false;

        this.discardPeeked();
        return true;
    }
}

export const tokenDefinitionParsers = new Map<string, (tokenizer: Tokenizer) => TokenDefinition>();
export const oracleParsers = new Map<string, (tokenizer: Tokenizer) => Oracle>();

export function parseAddress(tokenizer: Tokenizer): string {
    const token = tokenizer.next();
    const address = token.text;
    if (token.type !== TokenType.Bytes) {
        tokenizer.unexpected("address", token);
    }
    if (address.length !== 42) {
        tokenizer.fail("Address must consist of 40 hex digits", token.position);
    }
    if (!isAddressValid(address)) {
        tokenizer.fail("Invalid address checksum", token.position);
    }

    return address;
}

export function parseToken(tokenizer: Tokenizer): Token {
    const amount = tokenizer.expect(TokenType.Number);
    tokenizer.expectPunctuation(" ");

    const definition = parseTokenDefinition(tokenizer);
    return definition.withAmount(amount.text);
}

export function parseTokenDefinition(tokenizer: Tokenizer): TokenDefinition {
    const blueprint = tokenizer.next();
    if (blueprint.type !== TokenType.Identifier) {
        tokenizer.unexpected("blueprint name", blueprint);
    }

    const parser = tokenDefinitionParsers.get(blueprint.text);
    if (parser === undefined) {
        tokenizer.fail(`Unknown blueprint '${blueprint.text}'`, blueprint.position);
    }

    tokenizer.expectPunctuation("<");
    const result = parser(tokenizer);
    tokenizer.expectPunctuation(">");
    return result;
}

export function parseOracle(tokenizer: Tokenizer): Oracle {
    const oracle = tokenizer.next();
    if (oracle.type !== TokenType.Identifier) {
        tokenizer.unexpected("oracle name", oracle);
    }

    const parser = oracleParsers.get(oracle.text);
    if (parser === undefined) {
        tokenizer.fail(`Unknown oracle '${oracle.text}'`, oracle.position);
    }

    tokenizer.expectPunctuation("<");
    return parser(tokenizer);
}

export function parseInteger(tokenizer: Tokenizer): bigint {
    const token = tokenizer.expect(TokenType.Number);
    try {
        return BigInt(token.text);
    } catch {
        tokenizer.fail("Malformed integer", token.position);
    }
}

export function parseBytes(tokenizer: Tokenizer): Bytes {
    const token = tokenizer.next();
    switch (token.type) {
        case TokenType.String:
            return new StringBytes(token.text.slice(1, -1));

        case TokenType.Bytes: {
            const { text } = token;
            const { length } = text;

            for (let i = 2; i < length; i++) {
                const c = text.charCodeAt(i);
                if (c >= 65 /* "A" */ && c <= 70 /* "F" */) {
                    tokenizer.fail("Bytes must be lowercase", token.position);
                }
            }

            return new RawBytes(hexToBytes(text.slice(2)));
        }

        case TokenType.Keyword: {
            tokenizer.expectPunctuation("(");
            const result = new HashedBytes(parseBytes(tokenizer));
            tokenizer.expectPunctuation(")");
            return result;
        }

        case TokenType.Punctuation: {
            if (token.text === "{") {
                return parseMapBytes(tokenizer);
            }
            break;
        }
    }

    tokenizer.unexpected("bytes", token);
}

function parseMapBytes(tokenizer: Tokenizer): MapBytes {
    const map = new Map<string, string>();
    if (tokenizer.consumePunctuation("}")) {
        return new MapBytes(map);
    }

    while (true) {
        tokenizer.expectPunctuation(" ");
        const key = tokenizer.expect(TokenType.String);
        tokenizer.expectPunctuation(": ");
        const value = tokenizer.expect(TokenType.String);

        const keyText = key.text.slice(1, -1);
        if (keyText.length === 0) {
            tokenizer.fail("Map keys must be non-empty", key.position);
        }
        if (map.has(keyText)) {
            tokenizer.fail(`Duplicated map key ${key.text}`, key.position);
        }
        map.set(keyText, value.text.slice(1, -1));

        if (tokenizer.consumePunctuation(",")) continue;
        tokenizer.expectPunctuation(" }");
        return new MapBytes(map);
    }
}

export type AstNode =
    | AstNodeInteger
    | AstNodeAddress
    | AstNodeArray
    | AstNodeTuple
    | AstNodeBytes
    | AstNodeToken
    | AstNodeTokenDefinition
    | AstNodeOracle;

export type AstNodeBytes =
    | AstNodeRawBytes
    | AstNodeStringBytes
    | AstNodeMapBytes
    | AstNodeHashedBytes;

export type AstNodeInteger = {
    type: "integer";
    payload: bigint;
};

export type AstNodeAddress = {
    type: "address";
    payload: string;
};

export type AstNodeArray = {
    type: "array";
    payload: AstNode[];
};

export type AstNodeTuple = {
    type: "tuple";
    payload: AstNode[];
};

export type AstNodeRawBytes = {
    type: "raw_bytes";
    payload: Uint8Array;
};

export type AstNodeStringBytes = {
    type: "string_bytes";
    payload: string;
};

export type AstNodeMapBytes = {
    type: "map_bytes";
    payload: Map<string, string>;
};

export type AstNodeHashedBytes = {
    type: "hashed_bytes";
    payload: AstNodeBytes;
};

export type AstNodeToken = {
    type: "token";
    payload: {
        amount: string;
        definition: AstNodeTokenDefinition;
    };
};

export type AstNodeTokenDefinition = {
    type: "token_definition";
    payload: {
        blueprint: string;
        params: AstNode[];
    };
};

export type AstNodeOracle = {
    type: "oracle";
    payload: {
        oracle: string;
        params: AstNode[];
    };
};

function joinParams(params: readonly AstNode[], render: (node: AstNode) => string): string {
    let result = "";
    const { length } = params;
    for (let i = 0; i < length; i++) {
        result += render(params[i]!);
        if (i < length - 1) result += ", ";
    }
    return result;
}

export function astToString(node: AstNode): string {
    switch (node.type) {
        case "integer": return `${node.payload}`;
        case "address": return node.payload;
        case "array": return `[${joinParams(node.payload, astToString)}]`;
        case "tuple": return `(${joinParams(node.payload, astToString)})`;
        case "raw_bytes": return "0x" + bytesToHex(node.payload);
        case "string_bytes": return `"${node.payload}"`;

        case "map_bytes": {
            if (node.payload.size === 0) return "{}";

            let result = "{ ";
            let isFirst = true;
            for (const [key, value] of node.payload) {
                if (!isFirst) {
                    result += ", ";
                } else {
                    isFirst = false;
                }

                result += `"${key}": "${value}"`;
            }
            return result + " }";
        }

        case "hashed_bytes": return `keccak256(${astToString(node.payload)})`;

        case "token": {
            const { amount, definition } = node.payload;
            return `${amount} ${astToString(definition)}`;
        }

        case "token_definition": {
            const { blueprint, params } = node.payload;
            return `${blueprint}<${joinParams(params, astToString)}>`;
        }

        case "oracle": {
            const { oracle, params } = node.payload;
            return `${oracle}<${joinParams(params, astToString)}>`;
        }
    }
}
