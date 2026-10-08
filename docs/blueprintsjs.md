**blueprints.js** is a free and open-source TypeScript library for working with
Blueprints. It can be installed from npm.

```shell
npm i @blueprintsfi/blueprints.js
```

Note that blueprints.js does not provide functionality for interacting with the
smart contracts directly.

## Defining tokens

```ts
import { Basket, ERC20, Token, Fraction, MapBytes, NativeToken, WithMetadata } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

// Represents the chain's native token (e.g. ETH).
const eth = new NativeToken(9n, {
    decimals: 18n,
});
assert.strictEqual(eth.toString(), "9 NativeToken<18>");

// Tokens can be also parsed from their string representations. This
// position represents an ERC20 token with address
// `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` that has 18 decimals.
const erc20 = Token.fromString("4.5 ERC20<0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 18>");
assert(erc20 instanceof ERC20);
assert.strictEqual(erc20.params.address, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
assert.strictEqual(erc20.params.decimals, 18n);

// Represents a basket – a single token that wraps two positions inside.
const basket = new Basket(new Fraction(2n, 3n), {
    tokens: [eth, erc20],
});

assert.strictEqual(basket.toString(), "~0.666666666666666666667 Basket<[9 NativeToken<18>, 4.5 ERC20<0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 18>]>");

// Attaches application-specific bytes to a token without changing its token id.
const annotated = new WithMetadata(2n, {
    token: new NativeToken(1n, { decimals: 18n }),
    metadata: new MapBytes({
        user_comment: "I know I'm overexposed but the price is down right now",
    }),
});
assert.strictEqual(
    annotated.toString(),
    `2 WithMetadata<1 NativeToken<18>, { "user_comment": "I know I'm overexposed but the price is down right now" }>`,
);
assert.strictEqual(annotated.externalTokenId().toHex(), annotated.params.token.externalTokenId().toHex());
```

Each Blueprint has its own docs page, where you can learn about its parameters.
The token parameters are immutable, unlike its amount.

## String representation

Each token has exactly one string representation (although multiple tokens can
have the same external token ids). The representation can be obtained by calling
the [`toString`](#tostring) method. A token can be parsed from its string
representation using the [`Token.fromString`](#tokenfromstring) function.

Tokens' amounts in their string representations might be approximated, as seen
in the `basket` defined in the [defining tokens](#defining-tokens) section.
However, if that is the case, enough decimals are included so that the exact
amount can be recovered unambiguously.

### `toString()`

Returns the token's unique string representation.

It optionally takes a single `format` parameter which can be `raw` or `html`. If
it is omitted or set to `raw`, the raw string representation is returned. If set
to `html`, the string representation is formatted as HTML, which means parts of
it are wrapped in `<span>` tags with different classes:
- `bp-address` – for address literals,
- `bp-int` – for integer literals,
- `bp-bytes` – for bytes literals,
- `bp-string` – for string literals,
- `bp-func` – for function names,
- `bp-amount` – for token amounts,
- `bp-blueprint` – for blueprint names,
- `bp-oracle` – for oracle names.

```ts
import { Basket, ERC20, Fraction, NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = new NativeToken(9n, {
    decimals: 18n,
});

assert.strictEqual(eth.toString(), "9 NativeToken<18>");
assert.strictEqual(
    eth.toString("html"),
    `<span class="bp-amount">9</span> <span class="bp-blueprint">NativeToken</span>&lt;<span class="bp-int">18</span>&gt;`,
);
```

### `Token.fromString()`

Parses a token from its unique string representation. Throws a `SyntaxError` if
an invalid representation is passed.

```ts
import { Token, NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = Token.fromString("9 NativeToken<18>");
assert(eth instanceof NativeToken);
assert.strictEqual(eth.params.decimals, 18n);
```

## `params`

Token's params. It has the same type as the second argument of the Blueprint's
constructor.

```ts
import { ERC20, Token } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20 = Token.fromString("10 ERC20<0x0ABb8fFa90597b00a3E1927d78dbaBe23573ED12, 18>");
assert(erc20 instanceof ERC20);
assert.strictEqual(erc20.params.address, "0x0ABb8fFa90597b00a3E1927d78dbaBe23573ED12");
assert.strictEqual(erc20.params.decimals, 18n);
```

## Fractions

`Fraction` is a helper class which represents a non-negative rational number. It
has two read-only properties: `numerator` and `denominator`. Both of them are
bigints. The `numerator` has to be non-negative and the `denominator` has to be
positive.

## Wei amounts, human-readable amounts

Each token has a wei amount, which is a 256-bit unsigned bigint. It is equal to
the amount of the token that is stored on chain. However, usually it is not easy
for humans to work with wei amounts. Therefore, each token has a wei per unit,
which is a fraction. To calculate a human-readable amount of the token, one has
to divide its wei amount by wei per unit. For example, `10
ERC20<0x0ABb8fFa90597b00a3E1927d78dbaBe23573ED12, 18>` represents a token with
wei per unit of $10^{18}$. The `10` in this format is the human-readable amount.
The wei amount of this token is $10^{19}$.

Currently, wei per unit of all tokens instantiable by this library are integers.
However, it is planned to introduce Blueprints for which this is not the case.

The library provides two helper functions for converting between human-readable
amounts and wei amounts: `weiToString` and `weiFromString`. The former takes
a wei amount as bigint and wei per unit as bigint or `Fraction` and returns
a human-readable amount as string. The latter function does the opposite:
it takes human-readable amount as string and wei per unit as bigint or `Fraction`
and returns the wei amount as bigint.

For a given wei per unit, there exists exactly one format of human-readable
amount accepted by `weiFromString` that returns a given non-negative wei amount
(this is the string returned by `weiToString`). `weiFromString` is not meant to
parse rounded human-provided input.

For ease, the amount associated with a token can be easily recovered with
`Token.prototype.amountString` method.

```ts
import { Fraction, weiToString, weiFromString } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

assert.strictEqual(weiToString(1n, 10n), "0.1");

const six = new Fraction(6n, 1n);
assert.strictEqual(weiToString(2n, six), "~0.333");

// A `weiPerUnit` of half means that only amounts that are even integers are
// representable.
const half = new Fraction(1n, 2n);
assert.strictEqual(weiToString(2n, half), "4");

const two = weiFromString("~0.667", 3n);
assert.strictEqual(two, 2n);
```

## `weiPerUnit`

Each token has a `weiPerUnit` multiplier which depends on its parameters (but
not the amount). It is the number of wei tokens a single token can be split
into. For example, the only parameter of `NativeToken<18>` indicates that it has
18 decimals and a multiplier of $10^{18}$.

A multiplier doesn't have to be a power of 10, or even a whole numer. For
example, take a look at the `basket` token defined in the [defining
tokens](#defining-tokens) section, which has a multiplier of $4.5 \cdot
10^{18}$.

## `amount`

The amount of the token in human-readable terms, as a `Fraction`.

Note that if the `amount` passed into a blueprint's constructor is not divisible
by `weiPerToken`, an error will be thrown. This is because any expressed value
must express a whole number of indivisible token wei. The developer should be
perfectly aware of `weiPerToken` of the tokens they construct, despite the
librarie largely abstracts the internal accounting away.

```ts
import { Fraction, NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = new NativeToken(new Fraction(100n, 200n), {
    decimals: 18n,
});

assert.strictEqual(eth.amountString(), "0.5");

eth.setWeiAmount(2n * 10n ** 18n);
assert.strictEqual(eth.amountString(), "2");
```

## `weiAmount`

The amount of indivisible token units within the defined `Token` instance. A
`bigint`.

Symbolically, `weiAmount = weiPerUnit * amount`.

## `setAmount()`

Sets token's amount. Takes a [`Fraction`](#fractions) or a `bigint`.

```ts
import { Fraction, NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = new NativeToken(1n, {
    decimals: 18n,
});

eth.setAmount(new Fraction(2n, 8n));
assert.strictEqual(eth.amountString(), "0.25");

eth.setAmount(7n);
assert.strictEqual(eth.amountString(), "7");
```

## `setWeiAmount()`

Takes a single bigint – the new token amount in wei.

```ts
import { Fraction, NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = new NativeToken(1n, {
    decimals: 18n,
});

eth.setWeiAmount(2n * 10n ** 18n);
assert.strictEqual(eth.amountString(), "2");
```

## `internalTokenId()`

Returns the token's internal id as an `Uint8Array` of length 32.

## `externalTokenId()`

Returns the token's external id as an `Uint8Array` of length 32.

## `blueprintAddress()`

Returns the Blueprint's smart contract address.

## `copy()`

Copies the token.

```ts
import { ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = new ERC20(20n, {
    address: "0xF85C1127D6157993d492EBEcE36a3b820DAF8fF7",
    decimals: 18n,
});

const eth2 = eth.copy();
assert(eth2 instanceof ERC20);
// Since token's params are immutable, the `params` object is the same (a copy
// is not made).
assert(eth.params === eth2.params);

eth2.setAmount(40n);
assert.strictEqual(eth2.amountString(), "40");
// Original token stays untouched.
assert.strictEqual(eth.amountString(), "20");
```

## Bytes

Some blueprints and oracles take bytes as one of their parameters. Often the
bytes have some special interpretation. For example, a feed id of a
`MultisigOracle` might be a hash of a string. This should be expressed in the
oracle's string representation. To achieve this, those blueprints and oracles
take a `Bytes` object. It is an abstract class that has several subclasses, each
of them corresponding to a different interpretation.

### `RawBytes`

Represents bytes that have no special meaning. The constructor takes either a
hex-encoded buffer as string (without `0x` prefix) or `Uint8Array`.

```ts
import { MultisigOracle, RawBytes } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const feedId = "e53dcc3bd5f13fc11bfa1907103c388b67d7b6018e4c301aa61b3cdafb1452af";

const oracle = new MultisigOracle({
    addresses: ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
    threshold: 1n,
    feedId: new RawBytes(feedId), // `Uint8Array.fromHex(feedId)` also works
});
assert.strictEqual(oracle.toString(), "MultisigOracle<[0xCA2421bE4AA793c9F95faef57811F4eD360f54e1], 1, 0xe53dcc3bd5f13fc11bfa1907103c388b67d7b6018e4c301aa61b3cdafb1452af>");
```

### `StringBytes`

Represents bytes that should be interpreted as a string. The string can contain
only printable ASCII characters (including space) other than `"` and `\`.

```ts
import { HashedBytes, MultisigOracle, StringBytes } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const feedId = "e53dcc3bd5f13fc11bfa1907103c388b67d7b6018e4c301aa61b3cdafb1452af";

const oracle = new MultisigOracle({
    addresses: ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
    threshold: 1n,
    feedId: new HashedBytes(new StringBytes("bitcoin above 100000 on 2027-01-01 00:00:00 UTC")),
});
assert.strictEqual(
    oracle.toString(),
    `MultisigOracle<[0xCA2421bE4AA793c9F95faef57811F4eD360f54e1], 1, keccak256("bitcoin above 100000 on 2027-01-01 00:00:00 UTC")>`,
);
```

### `MapBytes`

Represents bytes that should be interpreted as a JSON-encoded string-to-string
map. Keys and values can contain only printable ASCII characters (including
space) other than `"` and `\`.

```ts
import { MapBytes, WithMetadata, NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

// The `MapBytes` constructor takes `Record<string, string>` or `Map<string, string>`.
const metadata =  new MapBytes({
    user_comment: "I know I'm overexposed but the price is down right now",
});
const token = new WithMetadata(2n, {
    token: new NativeToken(1n, { decimals: 18n }),
    metadata,
});

assert.strictEqual(
    metadata.toString(),
    `{ "user_comment": "I know I'm overexposed but the price is down right now" }`,
);
assert.strictEqual(
    token.toString(),
    `2 WithMetadata<1 NativeToken<18>, { "user_comment": "I know I'm overexposed but the price is down right now" }>`,
);

assert(Object.getPrototypeOf(metadata.map), Map.prototype);
assert.strictEqual(
    metadata.map.get("user_comment"),
    "I know I'm overexposed but the price is down right now",
);
```

### `HashedBytes`

Represents bytes that are Keccak-256 hash of some other bytes. The constructor
takes another `Bytes` object.

```ts
import { HashedBytes, MapBytes, MultisigOracle } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const feedId = "e53dcc3bd5f13fc11bfa1907103c388b67d7b6018e4c301aa61b3cdafb1452af";

const oracle = new MultisigOracle({
    addresses: ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
    threshold: 1n,
    feedId: new HashedBytes(new MapBytes({
        market: "BTC",
        condition: "above 100000",
        time: "2027-01-01 00:00:00 UTC",
    })),
});
assert.strictEqual(
    oracle.toString(),
    `MultisigOracle<[0xCA2421bE4AA793c9F95faef57811F4eD360f54e1], 1, keccak256({ "market": "BTC", "condition": "above 100000", "time": "2027-01-01 00:00:00 UTC" })>`,
);
```
