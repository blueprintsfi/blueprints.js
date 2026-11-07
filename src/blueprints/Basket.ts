import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import {
    type AstNodeTokenDefinition,
    parseToken,
    tokenDefinitionParsers,
    type Tokenizer,
} from "../parser.js";
import { calculateGcd, compareIds, numberToBytesBE, UINT256_MAX } from "../utils.js";
import { Token, TokenDefinition } from "./token.js";

type AggregatedAmounts = {
    tokenId: Uint8Array;
    weiAmount: bigint;
}[];

function aggregateAmounts(tokens: readonly Token[]): AggregatedAmounts {
    let result: AggregatedAmounts = [];
    const tokenIdMap = new Map<string, number>();

    for (const token of tokens) {
        const tokenId = token.definition.externalTokenId();
        const index = getOrInsert(tokenIdMap, bytesToHex(tokenId), result.length);
        if (index === result.length) {
            result.push({
                tokenId,
                weiAmount: token.weiAmount,
            });
        } else {
            result[index]!.weiAmount += token.weiAmount;
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

export default class Basket extends TokenDefinition {
    static override name = "Basket";

    tokens: readonly Token[];
    private aggregatedAmounts: AggregatedAmounts;

    constructor(tokens: Token[]) {
        if (tokens.length === 0) {
            throw new Error("There must be at least one token in the basket");
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

        for (const entry of aggregated) {
            const amount = entry.weiAmount /= gcd;
            if (amount > UINT256_MAX) {
                throw new Error("Accumulated token amount in the Basket is too large");
            }
        }

        super(gcd);
        this.tokens = tokens.slice();
        this.aggregatedAmounts = aggregated;
    }

    protected override calculateInternalTokenId(): Uint8Array {
        this.aggregatedAmounts.sort((lhs, rhs) => compareIds(lhs.tokenId, rhs.tokenId));

        const { length } = this.aggregatedAmounts;
        const buffer = new Uint8Array(0x40 * length);
        for (let i = 0; i < length; i++) {
            const { tokenId, weiAmount } = this.aggregatedAmounts[i]!;
            buffer.set(tokenId, i * 0x20);
            buffer.set(numberToBytesBE(weiAmount, 0x20), (length + i) * 0x20);
        }

        // Will not be needed anymore.
        this.aggregatedAmounts.length = 0;
        return keccak_256(buffer);
    }

    override blueprintAddress(): string {
        return "0x52B785358dDAff5B7A8C16b52f0C2f7C21f3eAa4";
    }

    override toAst(): AstNodeTokenDefinition {
        return {
            type: "token_definition",
            payload: {
                blueprint: Basket.name,
                params: [{ type: "array", payload: this.tokens.map(token => token.toAst()) }],
            },
        };
    }
}

function parseBasket(tokenizer: Tokenizer): Basket {
    tokenizer.expectPunctuation("[");

    const tokens: Token[] = [];
    while (true) {
        tokens.push(parseToken(tokenizer));
        if (tokenizer.consumePunctuation("]")) break;
        tokenizer.expectPunctuation(", ");
    }

    return new Basket(tokens);
}

tokenDefinitionParsers.set(Basket.name, parseBasket);
