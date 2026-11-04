import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import type { Token, TokenDefinition } from "./blueprints/token.js";
import { HashedBytes, MapBytes, RawBytes, StringBytes, type Bytes } from "./bytes.js";
import Oracle from "./oracles/Oracle.js";
import { validateAddress } from "./utils.js";

export class Tokenizer {
    offset = 0;

    constructor(readonly input: string) {}

    consume(str: string): boolean {
        if (!this.input.startsWith(str, this.offset)) return false;

        this.offset += str.length;
        return true;
    }

    mustConsume(str: string) {
        if (!this.consume(str)) {
            throw new SyntaxError(`Expected '${str}'`);
        }
    }

    ensureEOF() {
        if (this.offset !== this.input.length) {
            throw new SyntaxError("Expected EOF");
        }
    }

    until(char: string) {
        const index = this.input.indexOf(char, this.offset);
        if (index === -1) {
            throw new SyntaxError(`Expected '${char}', got EOF`);
        }

        const result = this.input.slice(this.offset, index);
        this.offset = index + 1;
        return result;
    }
}

export const tokenDefinitionParsers = new Map<string, (tokenizer: Tokenizer) => TokenDefinition>();
export const oracleParsers = new Map<string, (tokenizer: Tokenizer) => Oracle>();

export function parseToken(tokenizer: Tokenizer): Token {
    const amount = tokenizer.until(" ");
    const definition = parseTokenDefinition(tokenizer);
    return definition.withAmount(amount);
}

export function parseTokenDefinition(tokenizer: Tokenizer): TokenDefinition {
    const blueprint = tokenizer.until("<");
    const parser = tokenDefinitionParsers.get(blueprint);
    if (parser === undefined) {
        throw new SyntaxError(`Unknown blueprint: ${blueprint}`);
    }

    const result = parser(tokenizer);
    tokenizer.mustConsume(">");
    return result;
}

export function parseOracle(tokenizer: Tokenizer): Oracle {
    const oracle = tokenizer.until("<");
    const parser = oracleParsers.get(oracle);
    if (parser === undefined) {
        throw new SyntaxError(`Unknown oracle: ${oracle}`);
    }

    return parser(tokenizer);
}

export function parseInteger(tokenizer: Tokenizer): bigint {
    const input = tokenizer.input;
    const inputLength = input.length;

    const start = tokenizer.offset;
    let end = start;
    while (end < inputLength) {
        const c = input.charCodeAt(end);
        if (c < 48 || c > 57) break;
        end++;
    }

    const length = end - start;
    if (length === 0) {
        throw new SyntaxError("Expected an integer");
    }
    if (length > 1 && input.charCodeAt(start) === 48) {
        throw new SyntaxError("Integer has leading zeros");
    }

    tokenizer.offset = end;
    return BigInt(input.slice(start, end));
}

export function parseAddress(tokenizer: Tokenizer, validateChecksum = true): string {
    const input = tokenizer.input;
    const start = tokenizer.offset;
    const end = start + 42;
    if (end > input.length) {
        throw new SyntaxError("Expected an address");
    }
    tokenizer.offset = end;

    const address = input.slice(start, end);
    if (validateChecksum) validateAddress(address);
    return address;
}

export function parseBytes(tokenizer: Tokenizer): Bytes {
    if (tokenizer.consume("\"")) {
        const string = tokenizer.until("\"");
        return new StringBytes(string);
    }

    if (tokenizer.consume("{")) {
        return parseMapBytes(tokenizer);
    }

    if (tokenizer.consume("0x")) {
        const input = tokenizer.input;
        const inputLength = tokenizer.input.length;

        const start = tokenizer.offset;
        let end = start;
        while (end + 2 <= inputLength) {
            const c1 = input.charCodeAt(end);
            if ((c1 < 48 || c1 > 57) && (c1 < 97 || c1 > 102)) break;
            const c2 = input.charCodeAt(end + 1);
            if ((c2 < 48 || c2 > 57) && (c2 < 97 || c2 > 102)) break;

            end += 2;
        }

        tokenizer.offset = end;
        return new RawBytes(hexToBytes(input.slice(start, end)));
    }

    if (tokenizer.consume("keccak256(")) {
        const inner = parseBytes(tokenizer);
        const result = new HashedBytes(inner);
        tokenizer.mustConsume(')');
        return result;
    }

    throw new Error("Failed to parse bytes");
}

// TODO: ensure order
function parseMapBytes(tokenizer: Tokenizer): MapBytes {
    const map = new Map<string, string>();
    if (tokenizer.consume("}")) {
        return new MapBytes(map);
    }

    while (true) {
        tokenizer.mustConsume(` "`);
        const key = tokenizer.until(`"`);
        tokenizer.mustConsume(`: "`);
        const value = tokenizer.until(`"`);
        if (map.has(key)) {
            throw new Error("Duplicated map key");
        }
        map.set(key, value);

        if (tokenizer.consume(" }")) {
            return new MapBytes(map);
        }
        tokenizer.mustConsume(",");
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
        case "integer":
            return `${node.payload}`;
        case "address":
            return node.payload;
        case "array":
            return `[${joinParams(node.payload, astToString)}]`;
        case "tuple":
            return `(${joinParams(node.payload, astToString)})`;
        case "raw_bytes":
            return "0x" + bytesToHex(node.payload);
        case "string_bytes":
            return `"${node.payload}"`;
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
        case "hashed_bytes":
            return `keccak256(${astToString(node.payload)})`;
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
