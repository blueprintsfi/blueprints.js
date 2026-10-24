import { hexToBytes } from "@noble/hashes/utils.js";
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

    assertEOF() {
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
        while (end + 2 < inputLength) {
            const c1 = input.charCodeAt(end);
            if ((c1 < 48 || c1 > 57) && (c1 < 97 || c1 > 102)) break;
            const c2 = input.charCodeAt(end);
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
