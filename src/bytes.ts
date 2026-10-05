import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { type ToStringFormat } from "./types.js";
import { keccak_256 } from "@noble/hashes/sha3.js";

export abstract class Bytes {
    abstract length(): number;
    abstract bytes(): Uint8Array;
    abstract toString(type?: ToStringFormat): string;
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

    override toString(type: ToStringFormat = "raw"): string {
        const hex = bytesToHex(this.raw);
        return type === "raw" ? "0x" + hex : `<span class="bp-bytes">0x${hex}</span>`;
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

    override toString(type: ToStringFormat = "raw"): string {
        if (type === "raw") {
            return `"${this.string}"`;
        }

        return `"<span class="bp-string">${this.string}</span>"`;
    }
}

export class MapBytes extends Bytes {
    readonly map: Readonly<Record<string, string>>;
    private encoded: Uint8Array | null = null;
    private json: string | null = null;
    private html: string | null = null;

    constructor(map: Record<string, string>) {
        super();

        const copied = Object.create(null) as Record<string, string>;
        for (const key in map) {
            const value = map[key]!;
            validateString(key, "Map key");
            validateString(value, "Map value");
            copied[key] = value;
        }

        this.map = copied;
    }

    override bytes(): Uint8Array {
        if (this.encoded === null) {
            this.encoded = new TextEncoder().encode(this.toString("raw"));
        }
        return this.encoded.slice();
    }

    override length(): number {
        return this.toString("raw").length;
    }

    override toString(type: ToStringFormat = "raw"): string {
        if (type === "raw") {
            if (this.json === null) {
                this.json = JSON.stringify(this.map);
            }
            return this.json;
        }

        if (this.html === null) {
            let result = "{";
            let isFirst = true;
            for (const key in this.map) {
                if (!isFirst) {
                    result += ",";
                } else {
                    isFirst = false;
                }

                result += `"<span class="bp-string">${key}</span>":`;
                result += `"<span class="bp-string">${this.map[key]!}</span>"`;
            }
            result += "}";
            this.html = result;
        }

        return this.html;
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

    override toString(type: ToStringFormat = "raw"): string {
        if (type === "raw") {
            return `keccak256(${this.preimage.toString("raw")})`;
        }

        return `<span class="bp-func">keccak256</span>(${this.preimage.toString("html")})`;
    }
}
