import { keccak_256 } from "@noble/hashes/sha3.js";
import { Token, TokenDefinition } from "./token.js";
import ConstantOracle from "../oracles/ConstantOracle.js";
import Oracle from "../oracles/Oracle.js";
import {
    type Tokenizer,
    parseInteger,
    parseOracle,
    parseToken,
    tokenDefinitionParsers,
} from "../parser.js";
import { numberToBytesBE } from "../utils.js";

const RANGE_MAX = (1n << 256n);

export type Constraint = {
    oracle: Oracle;
    rangeStart: bigint;
    rangeEnd: bigint;
};

export default class ComposablePrediction extends TokenDefinition {
    static override name = "ComposablePrediction";
    readonly constraints: readonly Readonly<Constraint>[];

    constructor(readonly collateral: Token, constraints: readonly Constraint[]) {
        if (collateral.weiAmount === 0n) {
            throw new Error("Collateral of ComposablePrediction must have non-zero amount");
        }

        for (const { rangeStart, rangeEnd } of constraints) {
            if (rangeStart < 0n) {
                throw new Error("'rangeStart' must be a 256-bit unsigned integer");
            }
            if (rangeEnd === 0n) {
                if (rangeStart === 0n) {
                    throw new Error("'rangeStart' and 'rangeEnd' must not be both 0");
                }
                if (rangeStart >= RANGE_MAX) {
                    throw new Error("'rangeStart' must be a 256-bit unsigned integer");
                }
            } else {
                if (rangeStart >= rangeEnd) {
                    throw new Error("'rangeStart' must be less than 'rangeEnd'");
                }
                if (rangeEnd >= RANGE_MAX) {
                    throw new Error("'rangeEnd' must be a 256-bit unsigned integer");
                }
            }
        }

        super(collateral.weiAmount);

        const constraintsCopy: Constraint[] = [];
        for (const { oracle, rangeStart, rangeEnd } of constraints) {
            constraintsCopy.push({ oracle, rangeStart, rangeEnd });
        }
        this.constraints = constraints;

    }

    opposite(): ComposablePrediction {
        if (this.constraints.length !== 1) {
            throw new Error("Opposite prediction requires exactly one constraint");
        }

        const { oracle, rangeStart: startRange, rangeEnd: endRange } = this.constraints[0]!;
        if (startRange === 0n) {
            return new ComposablePrediction(
                this.collateral,
                [{ oracle, rangeStart: endRange, rangeEnd: 0n }],
            );
        }
        if (endRange === 0n) {
            return new ComposablePrediction(
                this.collateral,
                [{ oracle, rangeStart: 0n, rangeEnd: startRange }],
            );
        }

        throw new Error(
            "Opposite prediction requires a constraint with startRange or endRange equal to 0",
        );
    }

    protected override calculateInternalTokenId() {
        const buffer = new Uint8Array(0x20 + 0x60 * this.constraints.length);
        buffer.set(this.collateral.definition.externalTokenId());

        let offset = 0x20;
        for (const { oracle, rangeStart: startRange, rangeEnd: endRange } of this.constraints) {
            const constantOracle = new ConstantOracle(oracle);
            buffer.set(constantOracle.feedId(), offset);
            buffer.set(numberToBytesBE(startRange, 0x20), offset + 0x20);
            buffer.set(numberToBytesBE(endRange, 0x20), offset + 0x40);
            offset += 0x60;
        }

        return keccak_256(buffer);
    }

    override blueprintAddress(): string {
        return "0x53e479FE18D269292851413Fe2094eb62b370B19";
    }

    override toString(): string {
        let result = `ComposablePrediction<${this.collateral.toString()}, [`;

        const { length } = this.constraints;
        for (let i = 0; i < length; i++) {
            const { oracle, rangeStart: startRange, rangeEnd: endRange } = this.constraints[i]!;
            result += `(${oracle.toString()}, ${startRange}, ${endRange})`;
            if (i < length - 1) result += ", ";
        }

        return result + "]>";
    }

    override toHTMLString(): string {
        let result = `<span class="bp-blueprint">ComposablePrediction</span>&lt;`;
        result += `${this.collateral.toHTMLString()}, [`;

        const { length } = this.constraints;
        for (let i = 0; i < length; i++) {
            const { oracle, rangeStart: startRange, rangeEnd: endRange } = this.constraints[i]!;
            result += `(${oracle.toHTMLString()}, `;
            result += `<span class="bp-int">${startRange}</span>, `;
            result += `<span class="bp-int">${endRange}</span>)`;
            if (i < length - 1) result += ", ";
        }

        return result + "]&gt;";
    }
}

function parseComposablePrediction(tokenizer: Tokenizer): ComposablePrediction {
    const collateral = parseToken(tokenizer);
    tokenizer.mustConsume(", [");

    const constraints: Constraint[] = [];
    if (tokenizer.consume("]")) {
        return new ComposablePrediction(collateral, constraints);
    }

    while (true) {
        tokenizer.mustConsume("(");
        const oracle = parseOracle(tokenizer);
        tokenizer.mustConsume(", ");
        const startRange = parseInteger(tokenizer);
        tokenizer.mustConsume(", ");
        const endRange = parseInteger(tokenizer);

        constraints.push({ oracle, rangeStart: startRange, rangeEnd: endRange });

        tokenizer.mustConsume(")");
        if (tokenizer.consume("]")) break;
        tokenizer.mustConsume(", ");
    }

    return new ComposablePrediction(collateral, constraints);
}

tokenDefinitionParsers.set(ComposablePrediction.name, parseComposablePrediction);

export function noToken(collateral: Token, oracle: Oracle): ComposablePrediction {
    return new ComposablePrediction(collateral, [{ oracle, rangeStart: 0n, rangeEnd: 1n }]);
}

export function yesToken(collateral: Token, oracle: Oracle): ComposablePrediction {
    return new ComposablePrediction(collateral, [{ oracle, rangeStart: 1n, rangeEnd: 0n }]);
}

export function isBinaryPrediction(token: TokenDefinition): token is ComposablePrediction {
    if (!(token instanceof ComposablePrediction)) return false;

    const { constraints } = token;
    if (constraints.length !== 1) return false;

    const { rangeStart: startRange, rangeEnd: endRange } = constraints[0]!;
    return (startRange === 0n && endRange === 1n) || (startRange === 1n && endRange === 0n);
}

export function isNoToken(token: TokenDefinition) {
    return isBinaryPrediction(token) && token.constraints[0]!.rangeStart === 0n;
}

export function isYesToken(token: TokenDefinition): token is ComposablePrediction {
    return isBinaryPrediction(token) && token.constraints[0]!.rangeStart === 1n;
}
