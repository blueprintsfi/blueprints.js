import type { Bytes } from "../bytes.js";
import { oracleParsers, parseAddress, parseBytes, type Tokenizer } from "../parser.js";
import Oracle from "./Oracle.js";

export default class UnsupportedOracle extends Oracle {
    static override name = "UnsupportedOracle";

    constructor(readonly oracleAddress: string, readonly feedIdBytes: Bytes) {
        if (feedIdBytes.length() !== 32) {
            throw new Error("Invalid feed id");
        }

        super();
    }

    protected override calculateFeedId(): Uint8Array {
        return this.feedIdBytes.bytes();
    }

    override address(): string {
        return this.oracleAddress;
    }

    override toString(): string {
        return `UnsupportedOracle<${this.oracleAddress}, ${this.feedIdBytes.toString()}>`;
    }

    override toHTMLString(): string {
        let result = `<span class="oracle">UnsupportedOracle</span>&lt;`;
        result += `<span class="address">${this.oracleAddress}</span>, `;
        return result + this.feedIdBytes.toHTMLString() + "&gt;";
    }
}

function parse(tokenizer: Tokenizer): UnsupportedOracle {
    const address = parseAddress(tokenizer);
    tokenizer.mustConsume(", ");
    const feedIdBytes = parseBytes(tokenizer);
    tokenizer.mustConsume(">");
    return new UnsupportedOracle(address, feedIdBytes);
}

oracleParsers.set(UnsupportedOracle.name, parse);
