import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { parseToken, tokenDefinitionParsers, type Tokenizer } from "../parser.js";
import { calculateGcd, Fraction, numberToBytesBE } from "../utils.js";
import { Token, TokenDefinition } from "./token.js";

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

function aggregateAmounts(tokens: readonly Token[]): AggregateAmounts {
    let result: AggregateAmounts = [];
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

export default class Basket extends TokenDefinition {
    static override name = "Basket";

    tokens: readonly Token[];

    constructor(tokens: Token[]) {
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

        super(gcd);
        this.tokens = tokens.slice();
    }

    protected override calculateInternalTokenId(): Uint8Array {
        const aggregated = aggregateAmounts(this.tokens);
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

    override toString(): string {
        let result = "Basket<[";

        const { length } = this.tokens;
        for (let i = 0; i < length; i++) {
            result += this.tokens[i]!.toString();
            result += i === length - 1 ? "]>" : ", ";
        }

        return result;
    }

    override toHTMLString(): string {
        let result = `<span class="bp-blueprint">Basket</span>&lt;[`;

        const { length } = this.tokens;
        for (let i = 0; i < length; i++) {
            result += this.tokens[i]!.toHTMLString();
            result += i === length - 1 ? "]&gt;" : ", ";
        }

        return result;
    }
}

function parseBasket(tokenizer: Tokenizer): Basket {
    tokenizer.mustConsume("[");

    const tokens: Token[] = [];
    while (true) {
        tokens.push(parseToken(tokenizer));
        if (tokenizer.consume("]")) break;
        tokenizer.mustConsume(", ");
    }

    return new Basket(tokens);
}

tokenDefinitionParsers.set(Basket.name, parseBasket);
