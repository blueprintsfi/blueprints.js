import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

export abstract class Bytes {
    abstract length(): number;
    abstract bytes(): Uint8Array;

    abstract toString(): string;
    abstract toHTMLString(): string;
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

    override toString(): string {
        return "0x" + bytesToHex(this.raw);
    }

    override toHTMLString(): string {
        return `<span class="bp-bytes">${this.toString()}</span>`;
    }
}

function validateString(value: string, name: string) {
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

    override toString(): string {
        return `"${this.string}"`;
    }

    override toHTMLString(): string {
        return `"<span class="bp-string">${this.string}</span>"`;
    }
}

export class MapBytes extends Bytes {
    readonly map: ReadonlyMap<string, string>;
    private encoded: Uint8Array | null = null;
    private cachedRaw: string | null = null;
    private cachedHtml: string | null = null;

    constructor(map: Map<string, string> | Record<string, string>) {
        super();

        if (!(map instanceof Map)) {
            const converted = new Map<string, string>();
            for (const key in map) {
                converted.set(key, map[key]!);
            }

            this.map = converted;
        } else {
            this.map = new Map(map);
        }

        for (const [key, value] of this.map) {
            validateString(key, "Map keys");
            validateString(value, "Map values");
        }
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

    override toString(): string {
        if (this.map.size === 0) return "{}";
        if (this.cachedRaw !== null) return this.cachedRaw;

        let result = "{ ";
        let isFirst = true;
        for (const [key, value] of this.map) {
            if (!isFirst) {
                result += ", ";
            } else {
                isFirst = false;
            }

            result += `"${key}": "${value}"`;
        }
        result += " }";

        return this.cachedRaw = result;
    }

    override toHTMLString(): string {
        if (this.map.size === 0) return "{}";
        if (this.cachedHtml !== null) return this.cachedHtml;

        let result = "{ ";
        let isFirst = true;
        for (const [key, value] of this.map) {
            if (!isFirst) {
                result += ", ";
            } else {
                isFirst = false;
            }

            result += `"<span class="bp-string">${key}</span>": `;
            result += `"<span class="bp-string">${value}</span>"`;
        }
        result += " }";

        return this.cachedHtml = result;
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

    override toString(): string {
        return `keccak256(${this.preimage.toString()})`;
    }

    override toHTMLString(): string {
        return `<span class="bp-func">keccak256</span>(${this.preimage.toHTMLString()})`;
    }
}
