import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import {
    astToString,
    type AstNodeBytes,
    type AstNodeHashedBytes,
    type AstNodeMapBytes,
    type AstNodeRawBytes,
    type AstNodeStringBytes,
} from "./parser.js";

export abstract class Bytes {
    abstract length(): number;
    abstract bytes(): Uint8Array;
    abstract toAst(): AstNodeBytes;

    toString(): string {
        return astToString(this.toAst());
    }
}

export class RawBytes extends Bytes {
    private raw: Uint8Array;

    constructor(bytes: Uint8Array | string) {
        super();
        if (typeof bytes === "string") {
            this.raw = hexToBytes(bytes);
        } else {
            this.raw = bytes.slice();
        }
    }

    override bytes(): Uint8Array {
        return this.raw.slice();
    }

    override length(): number {
        return this.raw.length;
    }

    override toAst(): AstNodeRawBytes {
        return { type: "raw_bytes", payload: this.raw.slice() };
    }
}

export function validateString(value: string, name: string) {
    if (!/^[\x20-\x21\x23-\x5b\x5d-\x7e]*$/.test(value)) {
        throw new Error(
            `${name} must consist of spaces and ASCII printable characters excluding '\\' and '\"'`,
        );
    }
}

export class StringBytes extends Bytes {
    private encoded: Uint8Array | null = null;

    constructor(public readonly string: string) {
        super();
        validateString(string, "String");
    }

    override bytes(): Uint8Array {
        if (this.encoded === null) {
            this.encoded = new TextEncoder().encode(this.string);
        }
        return this.encoded.slice();
    }

    override length(): number {
        // Since string consists of ASCII characters only, its code units length
        // is equal to its byte length.
        return this.string.length;
    }

    override toAst(): AstNodeStringBytes {
        return { type: "string_bytes", payload: this.string };
    }
}

export class MapBytes extends Bytes {
    readonly map: ReadonlyMap<string, string>;
    private encoded: Uint8Array | null = null;
    private cachedRaw: string | null = null;

    constructor(entries: ReadonlyMap<string, string> | readonly (readonly [string, string])[]) {
        super();

        const map = new Map<string, string>();
        for (const [key, value] of entries) {
            validateString(key, "Map keys");
            validateString(value, "Map values");

            if (key.length === 0) throw new Error("Map keys must be non-empty");
            if (map.has(key)) throw new Error(`Duplicated map key "${key}"`);
            map.set(key, value);
        }

        this.map = map;
    }

    override bytes(): Uint8Array {
        if (this.encoded === null) {
            this.encoded = new TextEncoder().encode(this.toString());
        }
        return this.encoded.slice();
    }

    override length(): number {
        return this.toString().length;
    }

    override toAst(): AstNodeMapBytes {
        return { type: "map_bytes", payload: new Map(this.map) };
    }

    override toString(): string {
        if (this.cachedRaw !== null) return this.cachedRaw;
        return this.cachedRaw = super.toString();
    }
}

export class HashedBytes extends Bytes {
    private hashed: Uint8Array | null = null;

    constructor(readonly preimage: Bytes) {
        super();
    }

    override bytes(): Uint8Array {
        if (this.hashed === null) {
            this.hashed = keccak_256(this.preimage.bytes());
        }
        return this.hashed.slice();
    }

    override length(): number {
        return 32;
    }

    override toAst(): AstNodeHashedBytes {
        return { type: "hashed_bytes", payload: this.preimage.toAst() };
    }
}
