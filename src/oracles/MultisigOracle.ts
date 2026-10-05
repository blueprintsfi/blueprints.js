import { keccak_256 } from "@noble/hashes/sha3.js";
import * as types from "../types.js";
import Oracle from "./Oracle.js";
import { numberToBytesBE } from "../utils.js";
import { hexToBytes } from "@noble/hashes/utils.js";

const paramsType = new types.Struct({
    addresses: new types.Array(types.address),
    threshold: types.integer,
    feedId: types.bytes,
});

export type MultisigOracleParams = types.Infer<typeof paramsType>;

export default class MultisigOracle extends Oracle {
    static paramsType = paramsType;
    static override name = "MultisigOracle";

    override params: MultisigOracleParams;

    constructor(params: MultisigOracleParams) {
        if (params.threshold <= 0n || params.threshold > BigInt(params.addresses.length)) {
            throw new Error("Invalid threshold");
        }

        if (params.feedId.length() !== 32) {
            throw new Error("'feedId' must be 32 bytes long");
        }

        super();
        this.params = paramsType.deepCopy(params);
    }

    protected override calculateFeedId(): Uint8Array {
        const { addresses } = this.params;
        const numAddresses = addresses.length;

        const multisigBuffer = new Uint8Array(0x20 + numAddresses * 0x20);
        multisigBuffer.set(numberToBytesBE(this.params.threshold, 0x20));
        for (let i = 0; i < numAddresses; i++) {
            multisigBuffer.set(hexToBytes(addresses[i]!.slice(2)), 0x20 + i * 0x20 + 12);
        }

        const finalBuffer = new Uint8Array(64);
        finalBuffer.set(keccak_256(multisigBuffer));
        finalBuffer.set(this.params.feedId.bytes(), 0x20);

        return keccak_256(finalBuffer);
    }

    override address(): string {
        return "0x1A939e6b7DbF9a9E3dC1215e8C7FF9BE6Db82939";
    }
}

types.registerOracle(MultisigOracle);
