import { keccak_256 } from "@noble/hashes/sha3.js";
import ConstantOracle from "../oracles/ConstantOracle.js";
import * as types from "../types.js";
import Blueprint from "./Token.js";
import { numberToBytesBE, Fraction } from "../utils.js";

const RANGE_MAX = (1n << 256n);

const paramsType = new types.Struct({
    collateral: types.token,
    constraints: new types.Array(new types.Struct({
        oracle: types.oracle,
        startRange: types.integer,
        endRange: types.integer,
    })),
});

export type ComposablePredictionParams = types.Infer<typeof paramsType>;

export default class ComposablePrediction extends Blueprint {
    static paramsType = paramsType;
    static override name = "ComposablePrediction";

    override params: ComposablePredictionParams;

    constructor(amount: Fraction | bigint, params: ComposablePredictionParams) {
        for (const { startRange, endRange } of params.constraints) {
            if (startRange < 0n) {
                throw new Error("'startRange' must be a 256-bit unsigned integer");
            }
            if (endRange === 0n) {
                if (startRange === 0n) {
                    throw new Error("'startRange' and 'endRange' must not be both 0");
                }
                if (startRange >= RANGE_MAX) {
                    throw new Error("'startRange' must be a 256-bit unsigned integer");
                }
            } else {
                if (startRange >= endRange) {
                    throw new Error("'startRange' must be less than 'endRange'");
                }
                if (endRange >= RANGE_MAX) {
                    throw new Error("'endRange' must be a 256-bit unsigned integer");
                }
            }
        }

        if (params.collateral.weiAmount === 0n) {
            throw new Error("Collateral of ComposablePrediction must have non-zero amount");
        }

        super(amount, params.collateral.weiAmount);
        this.params = paramsType.deepCopy(params);
    }

    opposite(): ComposablePrediction {
        if (this.params.constraints.length !== 1) {
            throw new Error("Opposite prediction requires exactly one constraint");
        }

        const { oracle, startRange, endRange } = this.params.constraints[0]!;
        if (startRange === 0n) {
            return new ComposablePrediction(this.amount, {
                collateral: this.params.collateral,
                constraints: [{ oracle, startRange: endRange, endRange: 0n }],
            });
        }
        if (endRange === 0n) {
            return new ComposablePrediction(this.amount, {
                collateral: this.params.collateral,
                constraints: [{ oracle, startRange: 0n, endRange: startRange }],
            });
        }

        throw new Error(
            "Opposite prediction requires a constraint with startRange or endRange equal to 0",
        );
    }

    protected override calculateInternalTokenId() {
        const buffer = new Uint8Array(0x20 + 0x60 * this.params.constraints.length);
        buffer.set(this.params.collateral.externalTokenId());

        let offset = 0x20;
        for (const { oracle, startRange, endRange } of this.params.constraints) {
            const constantOracle = new ConstantOracle({ innerOracle: oracle });
            buffer.set(constantOracle.feedId(), offset);
            buffer.set(numberToBytesBE(startRange, 0x20), offset + 0x20);
            buffer.set(numberToBytesBE(endRange, 0x20), offset + 0x40);
            offset += 0x60;
        }

        return keccak_256(buffer);
    }

    blueprintAddress() {
        return "0x53e479FE18D269292851413Fe2094eb62b370B19";
    }
}

types.registerBlueprint(ComposablePrediction);
