import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import * as types from "../types.js";
import Oracle from "./Oracle.js";

const paramsType = new types.Struct({
    innerOracle: types.oracle,
});

export type ConstantOracleParams = types.Infer<typeof paramsType>;

export default class ConstantOracle extends Oracle {
    static paramsType = paramsType;
    static override name = "ConstantOracle";

    params: ConstantOracleParams;

    constructor(params: ConstantOracleParams) {
        super();
        this.params = paramsType.deepCopy(params);
    }

    protected override calculateFeedId() {
        const { innerOracle } = this.params;
        const buffer = new Uint8Array(52);
        buffer.set(hexToBytes(innerOracle.address().slice(2)));
        buffer.set(innerOracle.feedId(), 20);
        return keccak_256(buffer);
    }

    override address() {
        return "0x9F082c41045dEaCf53D5cfEF4b5b60edA38D95Af";
    }
}

types.registerOracle(ConstantOracle);
