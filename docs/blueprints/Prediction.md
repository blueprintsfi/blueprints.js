The `Prediction` Blueprint is used for expressing payoffs as functions of
oracles' responses.

## Parameters

```ts
import { Oracle, Token, TokenDefinition } from "@blueprintsfi/blueprints.js";

type PredictionPoint = {
    x: bigint;
    y: bigint;
};

type PredictionConstraint = {
    readonly oracle: Oracle;
    readonly points: readonly Readonly<PredictionPoint>[];
};

declare class Prediction extends TokenDefinition {
    readonly collateral: Token;
    readonly constraints: readonly PredictionConstraint[];
    constructor(collateral: Token, constraints: readonly PredictionConstraint[]);
}
```

`Prediction` takes two parameters – the collateral, which must have a non-zero
amount, and a non-empty list of constraints. The `PredictionPoint` and
`PredictionConstraint` types are exported by the library.

The $i$-th constraint of a `Prediction` token $\text{T}$ consists of an oracle
$o_i$ and a payoff $f_i$, which is a piecewise linear[^linear], nonnegative
function. Let $o_i()$ be the value the oracle resolved to (a 256-bit unsigned
integer). Then the payoff of a `Prediction` token in terms of the collateral
token is equal to: $$ P = \prod_i f_i(o_i()). $$ The payoff function must not be
constant.

When the oracle specified in the $i$-th constraint resolves to a value,
$\text{T}$ can be redeemed for a `Prediction` token with the same parameters but
with the $i$-th constraint removed and the collateral amount multiplied by
$f_i(o_i())$. If this would result in a `Prediction` token with zero
constraints, $\text{T}$ can be redeemed for the collateral multiplied by
$f_i(o_i())$ instead.

Note that oracles are internally wrapped in `ConstantOracle`, which means that
the value a feed resolves to is read only once and can't change afterwards.
Passing a `ConstantOracle` instance to the constructor or any of the helper
functions is very likely a bug.

All oracles in a single `Prediction` token must have pairwise distinct feed IDs.

For ease of use, the library provides several helper functions for defining
special kinds of `Prediction` tokens:
- [`yesToken`, `noToken`](#yestoken-notoken): binary payoffs dependent on a
  single oracle (more specifically, whether the oracle's response is zero or
  nonzero).
- [`parlayToken`](#parlaytoken): works on binary outcomes as well, but pays out
  if every oracle resolves to its required true/false value.
- [`rangeToken`](#rangetoken): pays out the collateral if an oracle resolves to
  a value in the specified range.
- [`rangeParlayToken`](#rangeparlaytoken): pays out the collateral if each of
  the underlying oracles resolves to a value in its specified range.
- [`linearPayoff`](#linearpayoff): pays out a share of `collateral` that grows
  linearly with the oracle's response, from nothing at 0 to the full
  `collateral` at `max` and above.

## Encoding Functions

###### In the Library

In the library, a piecewise linear function $f$ is defined by a list of points
$(x_1, y_1), \dots, (x_n, y_n)$ with strictly increasing $x$ coordinates at
which its slope changes. The $x$ coordinate of the first point must be $0$.
For $x \geq x_n$ the function is constant and equal to $y_n$. The function
must be encoded using the minimal number of points possible. This means that
$y_{n - 1} \neq y_n$ and if the slope doesn't change at $x > 0$, then
$(x, f(x))$ must not be included in the list of points. All coordinates must
be 256-bit unsigned integers.

The following table shows several examples of `points` as well as payoff
functions they represent.

| `points`                                              | Payoff at $x$                              |
|-------------------------------------------------------|--------------------------------------------|
| `[(0, 0), (1, 1)]`                                    | $0$ if $x = 0$, otherwise $1$              |
| `[(0, 1), (1, 0)]`                                    | $1$ if $x = 0$, otherwise $0$              |
| `[(0, 0), (100, 100)]`                                | $\min(x, 100)$                             |
| `[(0, 0), (99, 0), (100, 100), (200, 100), (201, 0)]` | $100$ if $x \in [100, 200]$, otherwise $0$ |
| `[(0, 0), (2, 1)]`                                    | $\min(\frac{x}{2}, 1)$                     |

###### In the Smart Contract

In the smart contract, functions are represented differently. Instead of being
defined by a list of points at which the slope changes, they are defined by
their value at 0 and a list of segments. Each segment is defined by its slope
and length (more precisely, length of the segment projected onto the x axis).

On chain, every slope must be an integer. This ensures that the function takes
only integer values. However, this is not necessarily the case for a function
defined using the library. To solve this issue, the library limits the possible
amounts of `Prediction` tokens that can be expressed by setting a
[`weiAmount`](/blueprintsjs#wei-amounts-human-readable-amounts) which is not
necessarily an integer.

For example, if the payoff is to rise linearly from zero for oracle responses
from $0$ to $3$ and at $3$ the value should be $10$, then the slope would be
$\frac{10}{3}$. If the `collateral`'s wei amount is divisible by 3 (for example
`3 NativeToken<18>`), then every integer amount of the `Prediction` token is
expressible. On the other hand, if the `collateral` is `1 NativeToken<18>`, for
example, then only amounts that are integer multiples of $\frac{3}{10^{19}}$ are
expressible. In particular, when it comes to whole numbers of tokens, only
multiples of $3$ are expressible.

More precisely, the library multiplies the $i$-th function by a fraction $s_i$
such that all values it takes at integer points are integers and their GCD is 1.
Then it verifies that every value the function takes is a 256-bit unsigned
integer and every slope is a 256-bit signed integer. These restrictions are
imposed by the contract. The token's wei per unit is equal to the collateral
multiplied by the product of such fractions for each constraint.

The developer should be aware of the underlying construction and lack of
rounding when defining the tokens. The library is not meant to abstract this
away as it needs to be handled on a per-use-case basis. What this representation
achieves is that once a token is verified to be expressible, it is cognitively
easy to understand the position, optimizing for ease of verification. The
developer should insert the values such that they're easy to read given a
typical mental model, rather than easy to implement.

To maximize the expressiveness without concerning users with rounding, it is
recommended to lower the maximum value of the payoff functions and use oracles
which have their useful range in the low digits. For example, a linear payoff up
to 1 billion in the oracle's response will require the collateral's wei amount
multiplied by the `Prediction`'s human-readable amount to be divisible by a
billion, while a payoff up to ten thousand will only require it to be divisible
by ten thousand.

For more information on this model, see [Multiverse
Finance](https://www.paradigm.xyz/2025/05/multiverse-finance).

## `yesToken()`, `noToken()`

`yesToken` and `noToken` are helper functions for creating `Prediction` token
definitions with a single oracle, whose response is binary. A `yesToken` pays
out the collateral if the oracle resolves to a value of at least 1, and a
`noToken` pays it out if the oracle resolves to 0.

```ts
import {
    yesToken,
    noToken,
    ERC20,
    Prediction,
    MapBytes,
    MultisigOracle,
    HashedBytes,
} from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

function oracle(market: string, condition: string) {
    return new MultisigOracle(
        ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
        1n,
        new HashedBytes(new MapBytes({ market, condition, time: "2027-01-01 00:00:00 UTC" })),
    );
}
const collateral = new ERC20("0x6fc2e9b25fa19eeC97a05A18aF69332477BA3728", 18n).withAmount(20n);

const btc = oracle("BTC", "above 100000");

const yes = yesToken(collateral, btc);
const no = noToken(collateral, btc);

// This is equivalent to:
const yes2 = new Prediction(collateral, [
    { oracle: btc, points: [{ x: 0n, y: 0n }, { x: 1n, y: 1n }] },
]);
const no2 = new Prediction(collateral, [
    { oracle: btc, points: [{ x: 0n, y: 1n }, { x: 1n, y: 0n }] },
]);
assert.strictEqual(yes.toString(), yes2.toString());
assert.strictEqual(no.toString(), no2.toString());
```

## `parlayToken()`

`parlayToken` works on binary outcomes as well, but pays out the collateral if
every oracle resolves to its required answer, where a value of at least 1 is
interpreted as true and 0 as false.

```ts
import {
    parlayToken,
    ERC20,
    Prediction,
    MapBytes,
    MultisigOracle,
    HashedBytes,
} from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

function oracle(market: string, condition: string) {
    return new MultisigOracle(
        ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
        1n,
        new HashedBytes(new MapBytes({ market, condition, time: "2027-01-01 00:00:00 UTC" })),
    );
}
const collateral = new ERC20("0x6fc2e9b25fa19eeC97a05A18aF69332477BA3728", 18n).withAmount(20n);

const btc = oracle("BTC", "above 100000");
const eth = oracle("ETH", "above 5000");

// Pays out if BTC is above 100000 and ETH is not above 5000.
const parlay = parlayToken(collateral, [
    { oracle: btc, answer: true },
    { oracle: eth, answer: false },
]);

// This is equivalent to:
const parlay2 = new Prediction(collateral, [
    { oracle: btc, points: [{ x: 0n, y: 0n }, { x: 1n, y: 1n }] },
    { oracle: eth, points: [{ x: 0n, y: 1n }, { x: 1n, y: 0n }] },
]);
assert.strictEqual(parlay.toString(), parlay2.toString());
```

## `rangeToken()`

`rangeToken` pays out the collateral if an oracle resolves to a value in the
range $[\text{rangeStart}, \text{rangeEnd})$. If `rangeEnd` is omitted or
equal to $2^{256}$, the range is unbounded. The range must not include every
possible oracle response.

```ts
import {
    rangeToken,
    ERC20,
    Prediction,
    MapBytes,
    MultisigOracle,
    HashedBytes,
} from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

function oracle(market: string, condition: string) {
    return new MultisigOracle(
        ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
        1n,
        new HashedBytes(new MapBytes({ market, condition, time: "2027-01-01 00:00:00 UTC" })),
    );
}
const collateral = new ERC20("0x6fc2e9b25fa19eeC97a05A18aF69332477BA3728", 18n).withAmount(20n);

const btc = oracle("BTC", "price");

// Pays out if the price is in [90000, 110000).
const range = rangeToken(collateral, btc, 90000n, 110000n);

// This is equivalent to:
const range2 = new Prediction(collateral, [{
    oracle: btc,
    points: [
        { x: 0n, y: 0n },
        { x: 89999n, y: 0n },
        { x: 90000n, y: 1n },
        { x: 109999n, y: 1n },
        { x: 110000n, y: 0n },
    ],
}]);
assert.strictEqual(range.toString(), range2.toString());
```

## `rangeParlayToken()`

`rangeParlayToken` pays out the collateral if each of the underlying oracles
resolves to a value in its $[\text{rangeStart}, \text{rangeEnd})$ range. As in
`rangeToken`, an omitted `rangeEnd` or one equal to $2^{256}$ means the range is
unbounded.

```ts
import {
    rangeParlayToken,
    ERC20,
    Prediction,
    MapBytes,
    MultisigOracle,
    HashedBytes,
} from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

function oracle(market: string, condition: string) {
    return new MultisigOracle(
        ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
        1n,
        new HashedBytes(new MapBytes({ market, condition, time: "2027-01-01 00:00:00 UTC" })),
    );
}
const collateral = new ERC20("0x6fc2e9b25fa19eeC97a05A18aF69332477BA3728", 18n).withAmount(20n);

const btc = oracle("BTC", "price");
const eth = oracle("ETH", "price");

// Pays out if the BTC price is at least 100000 and the ETH price is below 3000.
const rangeParlay = rangeParlayToken(collateral, [
    { oracle: btc, rangeStart: 100000n },
    { oracle: eth, rangeStart: 0n, rangeEnd: 3000n },
]);

// This is equivalent to:
const rangeParlay2 = new Prediction(collateral, [
    { oracle: btc, points: [{ x: 0n, y: 0n }, { x: 99999n, y: 0n }, { x: 100000n, y: 1n }] },
    { oracle: eth, points: [{ x: 0n, y: 1n }, { x: 2999n, y: 1n }, { x: 3000n, y: 0n }] },
]);
assert.strictEqual(rangeParlay.toString(), rangeParlay2.toString());
```

## `linearPayoff()`

`linearPayoff` pays out a share of `collateral` that grows linearly with the
oracle's response, from nothing at 0 to the full `collateral` at `max` and
above.

```ts
import {
    linearPayoff,
    ERC20,
    Prediction,
    MapBytes,
    MultisigOracle,
    HashedBytes,
} from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

function oracle(market: string, condition: string) {
    return new MultisigOracle(
        ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
        1n,
        new HashedBytes(new MapBytes({ market, condition, time: "2027-01-01 00:00:00 UTC" })),
    );
}
const collateral = new ERC20("0x6fc2e9b25fa19eeC97a05A18aF69332477BA3728", 18n).withAmount(20n);

const temperature = oracle("Warsaw", "temperature in Celsius");

// Pays out 1 token for each degree, up to 20 tokens at 20°C and above.
const linear = linearPayoff(collateral, temperature, 20n);

// This is equivalent to:
const linear2 = new Prediction(collateral, [
    { oracle: temperature, points: [{ x: 0n, y: 0n }, { x: 20n, y: 1n }] },
]);
assert.strictEqual(linear.toString(), linear2.toString());
```

## See also

- [Intro](/)
- [MultisigOracle](/oracles/MultisigOracle)
- [ConstantOracle](/oracles/ConstantOracle)
- [blueprints.js](/blueprintsjs)

[^linear]: Here a linear function is defined as $\lambda x.ax + b$ for some
constants $a$ and $b$. The term affine function might be more accurate.
