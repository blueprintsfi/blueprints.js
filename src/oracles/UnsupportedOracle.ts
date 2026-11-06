import type { Bytes } from "../bytes.js";
import {
    type AstNodeOracle,
    oracleParsers,
    parseAddress,
    parseBytes,
    type Tokenizer,
} from "../parser.js";
import { validateAddress } from "../utils.js";
import Oracle from "./Oracle.js";

export default class UnsupportedOracle extends Oracle {
    static override name = "UnsupportedOracle";

    constructor(readonly oracleAddress: string, readonly feedIdBytes: Bytes) {
        validateAddress(oracleAddress);

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

    override toAst(): AstNodeOracle {
        return {
            type: "oracle",
            payload: {
                oracle: UnsupportedOracle.name,
                params: [
                    { type: "address", payload: this.oracleAddress },
                    this.feedIdBytes.toAst(),
                ],
            },
        };
    }
}

function parse(tokenizer: Tokenizer): UnsupportedOracle {
    const address = parseAddress(tokenizer);
    tokenizer.expectPunctuation(", ");
    const feedIdBytes = parseBytes(tokenizer);
    tokenizer.expectPunctuation(">");
    return new UnsupportedOracle(address, feedIdBytes);
}

oracleParsers.set(UnsupportedOracle.name, parse);
