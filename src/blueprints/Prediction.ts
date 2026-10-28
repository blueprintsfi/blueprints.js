import { keccak_256 } from "@noble/hashes/sha3.js";
import ConstantOracle from "../oracles/ConstantOracle.js";
import Oracle from "../oracles/Oracle.js";
import {
    type Tokenizer,
    parseInteger,
    parseOracle,
    parseToken,
    tokenDefinitionParsers,
} from "../parser.js";
import {
    Fraction,
    INT256_MAX,
    INT256_MIN,
    UINT256_MAX,
    _2_TO_256,
    abs,
    calculateGcd,
    compareIds,
    numberToBytesBE,
} from "../utils.js";
import { Token, TokenDefinition } from "./token.js";

export type PredictionPoint = {
    x: bigint;
    y: bigint;
};

export type PredictionConstraint = {
    readonly oracle: Oracle;
    readonly points: readonly Readonly<PredictionPoint>[];
};

function int256ToBytes(value: bigint): Uint8Array {
    return numberToBytesBE(value < 0n ? value + (1n << 256n) : value, 0x20);
}

function validateUint256(value: bigint, name: string) {
    if (value < 0n || value > UINT256_MAX) {
        throw new Error(`'${name}' must be a 256-bit unsigned integer`);
    }
}

function calculateScale(points: PredictionPoint[]): Fraction {
    const length = points.length;
    if (length === 0 || points[0]!.x !== 0n) {
        throw new Error("First point of Prediction payoff must have 'x' equal to 0");
    }
    if (length === 1) {
        throw new Error("Payoff of Prediction must not be constant");
    }

    const initialValue = points[0]!.y;
    validateUint256(initialValue, "y");

    let multiplier = 1n;
    let divisor = initialValue;

    let previousX = 0n;
    let previousY = initialValue;
    let previousSlopeNumerator: bigint | undefined;
    let previousSlopeDenominator: bigint | undefined;
    for (let i = 1; i < length; i++) {
        const { x, y } = points[i]!;
        validateUint256(x, "x");
        validateUint256(y, "y");

        const deltaY = y - previousY;
        const deltaX = x - previousX;
        if (deltaX <= 0n) {
            throw new Error("'x' coordinates of points must be strictly increasing");
        }

        const gcd = calculateGcd(abs(deltaY), deltaX);
        const slopeNumerator = deltaY / gcd;
        const slopeDenominator = deltaX / gcd;

        if (previousSlopeNumerator !== undefined &&
            previousSlopeNumerator === slopeNumerator &&
            previousSlopeDenominator === slopeDenominator)
        {
            throw new Error("Consecutive slopes of Prediction payoff must differ");
        }

        divisor = calculateGcd(divisor, abs(slopeNumerator));
        multiplier *= slopeDenominator / calculateGcd(multiplier, slopeDenominator);

        previousX = x;
        previousY = y;
        previousSlopeNumerator = slopeNumerator;
        previousSlopeDenominator = slopeDenominator;
    }

    if (previousSlopeNumerator! === 0n) {
        throw new Error("Last slope of Prediction payoff must not be zero");
    }

    const scale = new Fraction(multiplier, divisor);
    validateScale(points, scale);
    return scale;
}

function validateScale(points: PredictionPoint[], scale: Fraction): void {
    const { y: initialValue } = points[0]!;
    if (scale.mul(initialValue).toBigInt() > UINT256_MAX) {
        throw new Error("Normalized Prediction payoff must fit in a 256-bit unsigned integer");
    }

    const length = points.length;

    let previousX = 0n;
    let previousY = initialValue;
    for (let i = 1; i < length; i++) {
        const { x, y } = points[i]!;
        const slope = scale.mul(new Fraction(y - previousY, x - previousX)).toBigInt();
        if (slope < INT256_MIN || slope > INT256_MAX) {
            throw new Error("Normalized slopes of Prediction payoff must fit in int256");
        }

        if (scale.mul(y).toBigInt() > UINT256_MAX) {
            throw new Error("Normalized Prediction payoff must fit in a 256-bit unsigned integer");
        }

        previousX = x;
        previousY = y;
    }
}

function payoffHash(constraint: PredictionConstraint, scale: Fraction): Uint8Array {
    const { points } = constraint;
    const { length } = points;
    const scaledInitialValue = points[0]!.y;

    const initialValue = scale.mul(scaledInitialValue).toBigInt();
    const buffer = new Uint8Array(0x80 + 0x40 * (length - 1));
    buffer.set(numberToBytesBE(0x20n, 0x20));
    buffer.set(numberToBytesBE(initialValue, 0x20), 0x20);
    buffer.set(numberToBytesBE(0x40n, 0x20), 0x40);
    buffer.set(numberToBytesBE(BigInt(length - 1), 0x20), 0x60);

    let offset = 0x80;
    let previousX = 0n;
    let previousY = scaledInitialValue;
    for (let i = 1; i < length; i++) {
        const { x, y } = points[i]!;
        const deltaX = x - previousX;
        const slope = scale.mul(new Fraction(y - previousY, deltaX)).toBigInt();
        buffer.set(int256ToBytes(slope), offset);
        buffer.set(numberToBytesBE(deltaX, 0x20), offset + 0x20);

        offset += 0x40;
        previousX = x;
        previousY = y;
    }

    return keccak_256(buffer);
}

export default class Prediction extends TokenDefinition {
    static override name = "Prediction";
    readonly constraints: readonly PredictionConstraint[];
    private feedIds: Uint8Array[];
    private constraintsOrder: number[];
    private scales: Fraction[];

    constructor(readonly collateral: Token, constraints: readonly PredictionConstraint[]) {
        if (collateral.weiAmount === 0n) {
            throw new Error("Collateral of Prediction must have non-zero amount");
        }
        const length = constraints.length;
        if (length === 0) {
            throw new Error("Prediction must have at least one constraint");
        }

        const constraintsCopy: PredictionConstraint[] = [];
        const scales: Fraction[] = [];
        let weiPerUnit = new Fraction(collateral.weiAmount, 1n);
        for (const { oracle, points } of constraints) {
            const pointsCopy = points.map(({ x, y }) => ({ x, y }));

            const scale = calculateScale(pointsCopy);
            weiPerUnit = weiPerUnit.div(scale).normalize();
            scales.push(scale);

            constraintsCopy.push({
                oracle,
                points: pointsCopy
            });
        }

        super(weiPerUnit);
        this.constraints = constraintsCopy;
        this.scales = scales;

        this.feedIds = [];
        this.constraintsOrder = [];
        for (let i = 0; i < length; i++) {
            const wrapped = new ConstantOracle(this.constraints[i]!.oracle);
            this.feedIds.push(wrapped.feedId());
            this.constraintsOrder.push(i);
        }

        this.constraintsOrder.sort((lhs, rhs) => {
            return compareIds(this.feedIds[lhs]!, this.feedIds[rhs]!);
        });

        for (let i = 1; i < length; i++) {
            const previous = this.constraintsOrder[i - 1]!;
            const current = this.constraintsOrder[i]!;
            if (compareIds(this.feedIds[previous]!, this.feedIds[current]!) === 0) {
                throw new Error("Duplicated feed ID in Prediction");
            }
        }
    }

    protected override calculateInternalTokenId() {
        const length = this.constraints.length;

        const buffer = new Uint8Array(0x60 + 0x40 * length);
        buffer.set(numberToBytesBE(0x40n, 0x20));
        buffer.set(this.collateral.definition.externalTokenId(), 0x20);
        buffer.set(numberToBytesBE(BigInt(length), 0x20), 0x40);

        let offset = 0x60;
        for (const index of this.constraintsOrder) {
            buffer.set(this.feedIds[index]!, offset);

            const constraint = this.constraints[index]!;
            const scale = this.scales[index]!;
            buffer.set(payoffHash(constraint, scale), offset + 0x20);

            offset += 0x40;
        }

        return keccak_256(buffer);
    }

    override blueprintAddress(): string {
        return "0x034727215C779d73A466B32D74976333136D5738";
    }

    override toString(): string {
        let result = `Prediction<${this.collateral.toString()}, [`;

        const { length } = this.constraints;
        for (let i = 0; i < length; i++) {
            const { oracle, points } = this.constraints[i]!;
            result += `(${oracle.toString()}, [`;
            for (let j = 0; j < points.length; j++) {
                const { x, y } = points[j]!;
                result += `(${x}, ${y})`;
                if (j < points.length - 1) result += ", ";
            }
            result += "])";
            if (i < length - 1) result += ", ";
        }

        return result + "]>";
    }

    override toHTMLString(): string {
        let result = `<span class="blueprint">Prediction</span>&lt;`;
        result += `${this.collateral.toHTMLString()}, [`;

        const { length } = this.constraints;
        for (let i = 0; i < length; i++) {
            const { oracle, points } = this.constraints[i]!;
            result += `(${oracle.toHTMLString()}, [`;
            for (let j = 0; j < points.length; j++) {
                const { x, y } = points[j]!;
                result += `(<span class="int">${x}</span>, <span class="int">${y}</span>)`;
                if (j < points.length - 1) result += ", ";
            }
            result += "])";
            if (i < length - 1) result += ", ";
        }

        return result + "]&gt;";
    }
}

function parsePrediction(tokenizer: Tokenizer): Prediction {
    const collateral = parseToken(tokenizer);
    tokenizer.mustConsume(", [");

    const constraints: PredictionConstraint[] = [];
    while (true) {
        tokenizer.mustConsume("(");
        const oracle = parseOracle(tokenizer);
        tokenizer.mustConsume(", [");

        const points: PredictionPoint[] = [];
        if (!tokenizer.consume("]")) {
            while (true) {
                tokenizer.mustConsume("(");
                const x = parseInteger(tokenizer);
                tokenizer.mustConsume(", ");
                const y = parseInteger(tokenizer);
                tokenizer.mustConsume(")");
                points.push({ x, y });
                if (tokenizer.consume("]")) break;
                tokenizer.mustConsume(", ");
            }
        }

        constraints.push({ oracle, points });

        tokenizer.mustConsume(")");
        if (tokenizer.consume("]")) break;
        tokenizer.mustConsume(", ");
    }

    return new Prediction(collateral, constraints);
}

tokenDefinitionParsers.set(Prediction.name, parsePrediction);

/**
 * Pays out the collateral if the oracle resolves to a value of at least 1.
 */
export function yesToken(collateral: Token, oracle: Oracle): Prediction {
    return rangeToken(collateral, oracle, 1n);
}

/**
 * Pays out the collateral if the oracle resolves to 0.
 */
export function noToken(collateral: Token, oracle: Oracle): Prediction {
    return rangeToken(collateral, oracle, 0n, 1n);
}

export type RangeCondition = {
    oracle: Oracle;
    rangeStart: bigint;
    rangeEnd?: bigint;
};

function rangeConstraint(
    { oracle, rangeStart, rangeEnd }: Readonly<RangeCondition>,
): PredictionConstraint {
    validateUint256(rangeStart, "rangeStart");
    if (rangeEnd !== undefined) {
        if (rangeEnd <= rangeStart) {
            throw new Error("'rangeStart' must be less than 'rangeEnd'");
        }
        if (rangeEnd > _2_TO_256) {
            throw new Error("'rangeEnd' must be in range [1, 2^256]");
        }
    }

    const isSuffix = rangeEnd === undefined || rangeEnd === _2_TO_256;
    if (isSuffix && rangeStart === 0n) {
        throw new Error("Range must not include every possible oracle response");
    }

    const points: PredictionPoint[] = [{ x: 0n, y: rangeStart === 0n ? 1n : 0n }];
    if (rangeStart > 1n) points.push({ x: rangeStart - 1n, y: 0n });
    if (rangeStart > 0n) points.push({ x: rangeStart, y: 1n });
    if (!isSuffix) {
        if (rangeEnd - 1n > rangeStart) points.push({ x: rangeEnd - 1n, y: 1n });
        points.push({ x: rangeEnd, y: 0n });
    }

    return { oracle, points };
}

export type ParlayCondition = {
    oracle: Oracle;
    answer: boolean;
};

/**
 * Pays out the collateral if every oracle resolves to the required answer, where a value of at
 * least 1 is interpreted as true and 0 as false.
 */
export function parlayToken(
    collateral: Token,
    conditions: readonly Readonly<ParlayCondition>[],
): Prediction {
    return new Prediction(collateral, conditions.map(({ oracle, answer }) => {
        if (answer) {
            return rangeConstraint({ oracle, rangeStart: 1n });
        } else {
            return rangeConstraint({ oracle, rangeStart: 0n, rangeEnd: 1n });
        }
    }));
}

/**
 * Pays out the collateral if the oracle resolves to a value in [rangeStart, rangeEnd). A `rangeEnd`
 * of 2^256 or undefined means the range is unbounded.
 */
export function rangeToken(
    collateral: Token,
    oracle: Oracle,
    rangeStart: bigint,
    rangeEnd?: bigint,
): Prediction {
    return new Prediction(collateral, [rangeConstraint({ oracle, rangeStart, rangeEnd })]);
}

/**
 * Pays out the collateral if each of the underlying oracles resolve to a value in its [rangeStart,
 * rangeEnd) range. A `rangeEnd` of 2^256 or undefined means the range is unbounded.
 */
export function rangeParlayToken(
    collateral: Token,
    conditions: readonly Readonly<RangeCondition>[],
): Prediction {
    return new Prediction(collateral, conditions.map(rangeConstraint));
}

/**
 * Pays out a share of `collateral` that grows linearly with the oracle's response, from nothing at
 * 0 to the full `collateral` at `max` and above.
 */
export function linearPayoff(collateral: Token, oracle: Oracle, max: bigint): Prediction {
    if (max < 1n || max > UINT256_MAX) {
        throw new Error("'max' must be a positive 256-bit unsigned integer");
    }
    return new Prediction(collateral, [{ oracle, points: [{ x: 0n, y: 0n }, { x: max, y: 1n }] }]);
}
