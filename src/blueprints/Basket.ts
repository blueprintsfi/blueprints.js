import Token from "./Token.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import * as types from "../types.js";
import { calculateGcd, Fraction, numberToBytesBE } from "../utils.js";
import { bytesToHex } from "@noble/hashes/utils.js";

const MAX_AMOUNT = (1n << 256n) - 1n;

function compareIds(lhs: Uint8Array, rhs: Uint8Array): number {
    for (let i = 0; i < 32; i++) {
        if (lhs[i]! !== rhs[i]!) {
            return lhs[i]! - rhs[i]!;
        }
    }
    return 0;
}

type AggregateAmounts = {
    tokenId: Uint8Array;
    weiAmount: bigint;
}[];

function aggregateAmounts(tokens: Token[]): AggregateAmounts {
    let result: AggregateAmounts = [];
    const tokenIdMap = new Map<string, number>();

    for (const token of tokens) {
        const tokenId = token.externalTokenId();
        const index = getOrInsert(tokenIdMap, bytesToHex(tokenId), result.length);
        if (index === result.length) {
            result.push({
                tokenId,
                weiAmount: token.weiAmount,
            });
        } else {
            const amount = result[index]!.weiAmount += token.weiAmount;
            if (amount > MAX_AMOUNT) {
                throw new Error("Amount too large");
            }
        }
    }

    return result;
}

const hasGetOrInsert = "getOrInsert" in Map.prototype;

function getOrInsert<K, V>(map: Map<K, V>, key: K, value: V): V {
    if (hasGetOrInsert) {
        // @ts-ignore
        return map.getOrInsert(key, value);
    }

    const existing = map.get(key);
    if (existing !== undefined) {
        return existing;
    }

    map.set(key, value);
    return value;
}

const paramsType = new types.Struct({
    tokens: new types.Array(types.token),
});

export type BasketParams = types.Infer<typeof paramsType>;

export default class Basket extends Token {
    static paramsType = paramsType;
    static override name = "Basket";

    override params: BasketParams;

    constructor(amount: Fraction | bigint, params: BasketParams) {
        const { tokens } = params;
        if (tokens.length === 0) {
            throw new Error("There must be at least one token in a basket");
        }

        for (const token of tokens) {
            if (token.weiAmount === 0n) {
                throw new Error("Tokens in a basket must have non-zero amounts");
            }
        }

        const aggregated = aggregateAmounts(tokens);

        let gcd = 0n;
        for (const { weiAmount } of aggregated) {
            gcd = calculateGcd(gcd, weiAmount);
        }

        super(amount, gcd);
        this.params = paramsType.deepCopy(params);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        const aggregated = aggregateAmounts(this.params.tokens);
        aggregated.sort((lhs, rhs) => compareIds(lhs.tokenId, rhs.tokenId));

        const buffer = new Uint8Array(0x40 * aggregated.length);
        for (let i = 0; i < aggregated.length; i++) {
            const { tokenId, weiAmount } = aggregated[i]!;
            const raw = new Fraction(weiAmount, 1n).div(this.weiPerUnit).toBigInt();
            buffer.set(numberToBytesBE(raw, 0x20), i * 0x40);
            buffer.set(tokenId, i * 0x40 + 0x20);
        }
        return keccak_256(buffer);
    }

    override blueprintAddress(): string {
        return "0x52B785358dDAff5B7A8C16b52f0C2f7C21f3eAa4";
    }
}

types.registerBlueprint(Basket);
