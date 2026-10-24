import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import type { Bytes } from "../bytes.js";
import {
    oracleParsers,
    parseAddress,
    parseBytes,
    parseInteger,
    type Tokenizer,
} from "../parser.js";
import { numberToBytesBE } from "../utils.js";
import Oracle from "./Oracle.js";

export default class MultisigOracle extends Oracle {
    static override name = "MultisigOracle";

    readonly addresses: readonly string[];

    constructor(
        addresses: readonly string[],
        readonly threshold: bigint,
        readonly signedFeed: Bytes,
    ) {
        if (threshold <= 0n || threshold > BigInt(addresses.length)) {
            throw new Error("Invalid threshold");
        }

        if (signedFeed.length() !== 32) {
            throw new Error("'signedFeed' must be 32 bytes long");
        }

        super();
        this.addresses = addresses.slice();
    }

    protected override calculateFeedId(): Uint8Array {
        const { addresses } = this;
        const numAddresses = addresses.length;

        const multisigBuffer = new Uint8Array(0x20 + numAddresses * 0x20);
        multisigBuffer.set(numberToBytesBE(this.threshold, 0x20));
        for (let i = 0; i < numAddresses; i++) {
            multisigBuffer.set(hexToBytes(addresses[i]!.slice(2)), 0x20 + i * 0x20 + 12);
        }

        const finalBuffer = new Uint8Array(64);
        finalBuffer.set(keccak_256(multisigBuffer));
        finalBuffer.set(this.signedFeed.bytes(), 0x20);

        return keccak_256(finalBuffer);
    }

    override address(): string {
        return "0x1A939e6b7DbF9a9E3dC1215e8C7FF9BE6Db82939";
    }

    override toString(): string {
        let result = `MultisigOracle<[`;
        result += `${this.addresses.join(", ")}], `;
        result += `${this.threshold}, `;
        result += `${ this.signedFeed.toString() }>`;
        return result;
    }

    override toHTMLString(): string {
        let result = `<span class="oracle">MultisigOracle</span>&lt;[`;
        for (let i = 0; i < this.addresses.length; i++) {
            if (i > 0) result += ", ";
            result += `<span class="address">${this.addresses[i]!}</span>`;
        }
        result += `], <span class="int">${this.threshold}</span>, `;
        return result + this.signedFeed.toHTMLString() + "&gt;";
    }
}

function parse(tokenizer: Tokenizer): MultisigOracle {
    tokenizer.mustConsume("[");
    const addresses: string[] = [];
    if (!tokenizer.consume("]")) {
        while (true) {
            addresses.push(parseAddress(tokenizer));
            if (tokenizer.consume("]")) break;
            tokenizer.mustConsume(", ");
        }
    }
    tokenizer.mustConsume(", ");
    const threshold = parseInteger(tokenizer);
    tokenizer.mustConsume(", ");
    const feedIdBytes = parseBytes(tokenizer);
    tokenizer.mustConsume(">");
    return new MultisigOracle(addresses, threshold, feedIdBytes);
}

oracleParsers.set(MultisigOracle.name, parse);
