import * as types from "../types.js";
import Oracle from "./Oracle.js";

const paramsType = new types.Struct({
    address: types.address,
    feedId: types.bytes,
});

export type UnsupportedOracleParams = types.Infer<typeof paramsType>;

export default class UnsupportedOracle extends Oracle {
    static paramsType = paramsType;
    static override name = "UnsupportedOracle";

    override params: UnsupportedOracleParams;

    constructor(params: UnsupportedOracleParams) {
        if (params.feedId.length() !== 32) {
            throw new Error("Invalid feed id");
        }

        super();
        this.params = paramsType.deepCopy(params);
    }

    protected override calculateFeedId(): Uint8Array {
        return this.params.feedId.bytes();
    }

    override address(): string {
        return this.params.address;
    }
}

types.registerOracle(UnsupportedOracle);
