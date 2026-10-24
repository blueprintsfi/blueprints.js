`ComposablePrediction` expresses binary payoffs. For example, it can pay out
1 USDC if an oracle reporting the ETH price at a specific time responds with a value
greater than $2000.

`ComposablePrediction` tokens may also be created using [`yesToken` and
`noToken` helper functions](#yestoken-notoken).

## Parameters

```ts
import { Oracle, Token, TokenDefinition } from "@blueprintsfi/blueprints.js";

type ComposablePredictionConstraint = {
    oracle: Oracle;
    rangeStart: bigint;
    rangeEnd: bigint;
};

declare class ComposablePrediction extends TokenDefinition {
    readonly collateral: Token;
    readonly constraints: readonly Readonly<ComposablePredictionConstraint>[];
    constructor(collateral: Token, constraints: readonly ComposablePredictionConstraint[]);
}
```

`ComposablePrediction` takes two parameters – the collateral, which must have
a non-zero amount, and a list of constraints. The `ComposablePredictionConstraint`
type is exported by the library.

A `ComposablePrediction` token can be exchanged for the underlying collateral if
all oracles resolve to a value in their respective ranges $[\textrm{rangeStart},
\textrm{rangeEnd})$. Oracles resolve to a 256-bit unsigned integer, therefore
`rangeStart`s and `rangeEnd`s should also be 256-bit unsigned integers.

> [!WARNING]
> Instead of $2^{256}$, `rangeEnd` should be set to $0$.

| `rangeStart` | `rangeEnd` | Values an oracle can resolve to |
|--------------|------------|---------------------------------|
| 0            | 3          | $0, 1, 2$                       |
| 4            | 5          | $4$                             |
| 3            | 0          | $3, 4, \dots, 2^{256} - 1$      |

An error is thrown if for some constraint
- both `rangeStart` and `rangeEnd` are set to 0,
- $\text{rangeStart} < \text{rangeEnd}$ and $\text{rangeEnd} \neq 0$.

Note that internally oracles are wrapped in `ConstantOracle`, which means that
the value a feed resolves to is read only once and can't change afterwards.

After any constraint's oracle resolves within the specified range, the blueprint
enables removing the constraint. If all constraints are removed, the underlying
is redeemable.

Multiplying the collateral by a factor has the same result as multiplying the
number of `ComposablePrediction` positions by that factor – the final onchain
token id and wei amounts don't change.

`prediction.opposite()` returns the definition of the opposite position with the
same collateral and oracle parameters. It is only defined for predictions with a
single constraint where either `rangeStart` or `rangeEnd` is `0`: `[0, x)` is
converted to `[x, 0)`, and `[x, 0)` is converted to `[0, x)`. Throws if these
conditions are not met.

For more information on this model, see [Multiverse
Finance](https://www.paradigm.xyz/2025/05/multiverse-finance).

### `yesToken()`, `noToken()`

`yesToken` and `noToken` are helper functions for creating
`ComposablePrediction` token definitions with a single oracle, whose response is
binary.

```ts
import {
    yesToken,
    noToken,
    ERC20,
    ComposablePrediction,
    MapBytes,
    MultisigOracle,
    HashedBytes,
} from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const oracle = new MultisigOracle(
    ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
    1n,
    new HashedBytes(new MapBytes({
        market: "BTC",
        condition: "above 100000",
        time: "2027-01-01 00:00:00 UTC",
    })),
);
const collateral = new ERC20("0x6fc2e9b25fa19eeC97a05A18aF69332477BA3728", 18n).withAmount(20n);

const yes = yesToken(collateral, oracle);
assert(yes instanceof ComposablePrediction);

// This is equivalent to:
const yes2 = new ComposablePrediction(collateral, [
    { oracle, rangeStart: 1n, rangeEnd: 0n },
]);
assert.strictEqual(yes.toString(), yes2.toString());

const no = noToken(collateral, oracle);
assert(no instanceof ComposablePrediction);

// This is equivalent to:
const no2 = new ComposablePrediction(collateral, [
    { oracle, rangeStart: 0n, rangeEnd: 1n },
]);
assert.strictEqual(no.toString(), no2.toString());
```

### `isBinaryPrediction()`, `isYesToken()`, `isNoToken()`

`isBinaryPrediction` returns whether a given token definition is a binary
prediction (a `ComposablePrediction` token definition with a single constraint
with `rangeStart` set to 0 and `rangeEnd` set to 1 or vice versa).

`isYesToken` returns whether a given token definition is a binary prediction with
`rangeStart` set to 1 and `rangeEnd` set to 0.

`isNoToken` returns whether a given token definition is a binary prediction with
`rangeStart` set to 0 and `rangeEnd` set to 1.

```ts
import {
    yesToken,
    ERC20,
    MapBytes,
    MultisigOracle,
    HashedBytes,
    isBinaryPrediction,
    isYesToken,
    isNoToken,
} from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const collateral = new ERC20("0x6fc2e9b25fa19eeC97a05A18aF69332477BA3728", 18n).withAmount(20n);

const oracle = new MultisigOracle(
    ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
    1n,
    new HashedBytes(new MapBytes({
        market: "BTC",
        condition: "above 100000",
        time: "2027-01-01 00:00:00 UTC",
    })),
);

const yes = yesToken(collateral, oracle);
assert(isBinaryPrediction(yes));
assert(isYesToken(yes));
assert(!isNoToken(yes));
```

## Examples

```ts
import {
    ComposablePrediction,
    HashedBytes,
    MapBytes,
    MultisigOracle,
    NativeToken,
} from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = new NativeToken(18n).withAmount(5n);

const oracle = new MultisigOracle(
    ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
    1n,
    new HashedBytes(new MapBytes({
        market: "BTC",
        condition: "above 100000",
        time: "2027-01-01 00:00:00 UTC",
    })),
);

const prediction = new ComposablePrediction(eth, [{
    oracle,
    rangeStart: 0n,
    rangeEnd: 1n,
}]).withAmount(1n);
assert.strictEqual(prediction.toString(), `1 ComposablePrediction<5 NativeToken<18>, [(MultisigOracle<[0xCA2421bE4AA793c9F95faef57811F4eD360f54e1], 1, keccak256({ "market": "BTC", "condition": "above 100000", "time": "2027-01-01 00:00:00 UTC" })>, 0, 1)]>`);

assert(prediction.definition instanceof ComposablePrediction);
const opposite = prediction.definition.opposite().withAmount(1n);
assert.strictEqual(opposite.toString(), `1 ComposablePrediction<5 NativeToken<18>, [(MultisigOracle<[0xCA2421bE4AA793c9F95faef57811F4eD360f54e1], 1, keccak256({ "market": "BTC", "condition": "above 100000", "time": "2027-01-01 00:00:00 UTC" })>, 1, 0)]>`);
```

## See also

- [Intro](/)
- [MultisigOracle](/oracles/MultisigOracle)
- [ConstantOracle](/oracles/ConstantOracle)
- [blueprints.js](/blueprintsjs)
