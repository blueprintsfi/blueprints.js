import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import { type AstNodeOracle, oracleParsers, parseOracle, type Tokenizer } from "../parser.js";
import Oracle from "./Oracle.js";

export default class ConstantOracle extends Oracle {
    static override name = "ConstantOracle";

    constructor(readonly innerOracle: Oracle) {
        super();
    }

    protected override calculateFeedId() {
        const buffer = new Uint8Array(52);
        buffer.set(hexToBytes(this.innerOracle.address().slice(2)));
        buffer.set(this.innerOracle.feedId(), 20);
        return keccak_256(buffer);
    }

    override address() {
        return "0x864ed9f1D46386127323ab4Bb0645aF1eC65EA35";
    }

    override toAst(): AstNodeOracle {
        return {
            type: "oracle",
            payload: {
                oracle: ConstantOracle.name,
                params: [this.innerOracle.toAst()],
            },
        };
    }
}

function parse(tokenizer: Tokenizer): ConstantOracle {
    const innerOracle = parseOracle(tokenizer);
    tokenizer.expectPunctuation(">");
    return new ConstantOracle(innerOracle);
}

oracleParsers.set(ConstantOracle.name, parse);
