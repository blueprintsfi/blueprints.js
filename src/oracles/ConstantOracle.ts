import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import { oracleParsers, parseOracle, type Tokenizer } from "../parser.js";
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
        return "0x9F082c41045dEaCf53D5cfEF4b5b60edA38D95Af";
    }

    override toString(): string {
        return `ConstantOracle<${this.innerOracle.toString()}>`;
    }

    override toHTMLString(): string {
        let result = `<span class="bp-oracle">ConstantOracle</span>&lt;`;
        result += `${this.innerOracle.toHTMLString()}&gt;`;
        return result;
    }
}

function parse(tokenizer: Tokenizer): ConstantOracle {
    const innerOracle = parseOracle(tokenizer);
    tokenizer.mustConsume(">");
    return new ConstantOracle(innerOracle);
}

oracleParsers.set(ConstantOracle.name, parse);
