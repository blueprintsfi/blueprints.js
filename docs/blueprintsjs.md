**blueprints.ts** is a free and open-source TypeScript library for working with
Blueprints. It can be installed from npm.

```shell
npm i @blueprintsfi/blueprints.js
```

Note that blueprints.ts does not provide functionality for interacting with the
smart contracts directly.

This page describes the core functionality of the library. Each Blueprint and
Oracle has its own docs page, where you can learn about its parameters.

## Fractions

`Fraction` is a helper class which represents a non-negative rational number. It
has two read-only properties: `numerator` and `denominator`. Both of them are
bigints. The `numerator` has to be non-negative and the `denominator` has to be
positive.

## Wei Amounts, Human-readable Amounts

Each token has a wei amount, which is a 256-bit unsigned bigint. It is equal to
the amount of the token that is stored on chain. However, usually it is not easy
for humans to work with wei amounts. Therefore, each token definition has a
**wei per unit**, which is a positive rational number. To calculate a
human-readable amount of the token, one has to divide its wei amount by wei per
unit. For example, `10 ERC20<0x0ABb8fFa90597b00a3E1927d78dbaBe23573ED12, 18>`
represents a token with wei per unit of $10^{18}$. The `10` in this format is
the human-readable amount. The wei amount of this token is $10^{19}$.

Wei per unit doesn't have to be an integer. Currently, only
[`Prediction`](/blueprints/Prediction) tokens can have non-integer wei per
units.

The library provides two helper functions for converting between human-readable
amounts and wei amounts: `weiToString` and `weiFromString`. The former takes a
wei amount as bigint and wei per unit as bigint or `Fraction` and returns a
human-readable amount as string. The latter function does the opposite: it takes
human-readable amount as string and wei per unit as bigint or `Fraction` and
returns the wei amount as bigint.

For a given wei per unit and non-negative wei amount, there exists exactly one
human-readable string amount accepted by `weiFromString` (this is the string
returned by `weiToString`). `weiFromString` is not meant to parse rounded
human-provided input.

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

## `TokenDefinition`

The `TokenDefinition` abstract class describes a token. It stores the Blueprint
which minted it and its parameters.

### `fromString()`

The `fromString` static method returns a `TokenDefinition` from its string
representation.

```ts
import { TokenDefinition, ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20 = TokenDefinition.fromString("ERC20<0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 18>");
assert(erc20 instanceof ERC20);
assert(erc20 instanceof TokenDefinition);

assert.strictEqual(erc20.address, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
assert.strictEqual(erc20.decimals, 18n);
```

### `toString()`

Returns the token definition's string representation.

```ts
import { TokenDefinition, ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20 = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);
assert.strictEqual(erc20.toString(), "ERC20<0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 18>");
```

### `toHTMLString()`

Returns the token definition's string representation, with certain parts wrapped
in `<span>` tags with different classes:
- `address` – for address literals,
- `int` – for integer literals,
- `bytes` – for bytes literals,
- `string` – for string literals,
- `func` – for function names,
- `amount` – for token amounts,
- `blueprint` – for blueprint names,
- `oracle` – for oracle names.

```ts
import { ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20 = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);
assert.strictEqual(
    erc20.toHTMLString(),
    `<span class="blueprint">ERC20</span>&lt;<span class="address">0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2</span>, <span class="int">18</span>&gt;`,
);
```

### `weiPerUnit`

Returns the token's [wei per unit](#wei-amounts-human-readable-amounts) as
a [`Fraction`](#fractions).

```ts
import { ERC20, Fraction } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20 = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);
const weiPerUnit = erc20.weiPerUnit;
assert(weiPerUnit instanceof Fraction);
assert.strictEqual(weiPerUnit.numerator, 10n ** 18n);
assert.strictEqual(weiPerUnit.denominator, 1n);
```

### `externalTokenId()`

Returns the token's [external ID](/#blueprints) as a `Uint8Array` of length 32.

### `internalTokenId()`

Returns the token's [internal ID](/#blueprints) as a `Uint8Array` of length 32.

### `blueprintAddress()`

Returns the checksummed address of the Blueprint that minted this token.

### `withAmount()`

Attaches an amount to the token and returns a [`Token`](#token). This method
takes a single argument: the [human-readable
amount](#wei-amounts-human-readable-amounts). It can be passed as a
[`Fraction`](#fractions), a `bigint`, or a `string`. If a `string` is passed, it
must be in the strict format accepted by
[`weiFromString`](#wei-amounts-human-readable-amounts).

```ts
import { ERC20, Fraction, Token } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20Definition = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);

const erc20 = erc20Definition.withAmount("15.75");
assert(erc20 instanceof Token);
assert.strictEqual(erc20.definition, erc20Definition);
assert.strictEqual(erc20.weiAmount, 15750000000000000000n);
```

### `withWeiAmount()`

Attaches an amount to the token and returns a [`Token`](#token). This method
takes a single argument: the [wei amount](#wei-amounts-human-readable-amounts)
as a `bigint`.

```ts
import { ERC20, Fraction, Token } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20Definition = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);

const erc20 = erc20Definition.withWeiAmount(15750000000000000000n);
assert(erc20 instanceof Token);
assert.strictEqual(erc20.definition, erc20Definition);
assert.strictEqual(erc20.amountString(), "15.75");
```

## `Token`

The `Token` class represents a token definition (with `TokenDefinition`) and its
amount. The only way to obtain an instance of this class is to use the
[`withAmount()`](#withamount), [`withWeiAmount()`](#withweiamount), or
[`fromString()`](#fromstring-1) methods.

### `fromString()`

The `fromString` static method returns a `Token` from its string representation.

```ts
import { Token, ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20 = Token.fromString("10 ERC20<0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 18>");
assert(erc20 instanceof Token);

assert(erc20.definition instanceof ERC20);
assert.strictEqual(erc20.definition.address, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
assert.strictEqual(erc20.definition.decimals, 18n);

assert.strictEqual(erc20.weiAmount, 10n * 10n ** 18n);
```

### `toString()`

Returns the token's string representation.

```ts
import { TokenDefinition, ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20Definition = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);
const erc20 = erc20Definition.withAmount("15.75");
assert.strictEqual(erc20.toString(), "15.75 ERC20<0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 18>");
```

### `toHTMLString()`

Returns the token's string representation, with certain parts wrapped in
`<span>` tags with different classes. See
[`TokenDefinition.prototype.toHTMLString()`](#tohtmlstring) for details.

```ts
import { ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20Definition = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);
const erc20 = erc20Definition.withAmount(10n);

assert.strictEqual(
    erc20.toHTMLString(),
    `<span class="amount">10</span> <span class="blueprint">ERC20</span>&lt;<span class="address">0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2</span>, <span class="int">18</span>&gt;`,
);
```

### `definition`

The token's [definition](#tokendefinition).

### `amount`

Returns the token's [human-readable amount](#wei-amounts-human-readable-amounts)
as a `Fraction`.

```ts
import { TokenDefinition, ERC20, Fraction } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20Definition = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);
const erc20 = erc20Definition.withAmount("15.75");

assert(erc20.amount instanceof Fraction);
// 63 / 4 = 15.75
assert.strictEqual(erc20.amount.numerator, 63n);
assert.strictEqual(erc20.amount.denominator, 4n);
```

### `weiAmount`

Returns the token's [wei amount](#wei-amounts-human-readable-amounts) as a
`bigint`.

```ts
import { ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20Definition = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);
const erc20 = erc20Definition.withAmount("15.75");

assert.strictEqual(erc20.weiAmount, 1575n * 10n ** 16n);
```

### `amountString()`

Returns the human-readable amount as a string. It is equivalent to calling
`weiToString(token.weiAmount, token.definition.weiPerUnit)`.

```ts
import { ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20Definition = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);
const erc20 = erc20Definition.withWeiAmount(10n ** 19n);

assert.strictEqual(erc20.amountString(), "10");
```

## `Oracle`

The `Oracle` abstract class describes an [oracle feed](/#oracles). A feed is
identified by the oracle's address and a 256-bit feed ID, and resolves to a
256-bit unsigned integer. Each Oracle subclass has its own docs page describing
its parameters.

### `fromString()`

The `fromString` static method returns an `Oracle` from its string
representation. 

```ts
import { Oracle, UnsupportedOracle } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const input = "UnsupportedOracle<0xBFFeA64641Ba47AD959ae1D53C9c2C24BC5cE4d1, 0x24e2f8ffb75ed49e89a9a2208f31d4186bf8e50a60c2868ac9073d0ccb69d2dc>";
const oracle = Oracle.fromString(input);
assert(oracle instanceof UnsupportedOracle);
assert(UnsupportedOracle.prototype instanceof Oracle);

assert.strictEqual(oracle.toString(), input);
assert.strictEqual(oracle.address(), "0xBFFeA64641Ba47AD959ae1D53C9c2C24BC5cE4d1");
assert.strictEqual(oracle.feedId().length, 32);
```

### `toString()`

Returns the oracle feed's string representation, which can be parsed using
`Oracle.fromString()`.

### `toHTMLString()`

Returns the oracle feed's string representation, with certain parts wrapped in
`<span>` tags with different classes. See
[`TokenDefinition.prototype.toHTMLString()`](#tohtmlstring) for details.

### `address()`

Returns the address of the oracle's.

### `feedId()`

Returns the feed ID as a `Uint8Array` of length 32. The ID is calculated from
the oracle's parameters and cached.

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

const oracle = new MultisigOracle(
    ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
    1n,
    new RawBytes(feedId), // `new RawBytes(Uint8Array.fromHex(feedId))` also works
);
assert.strictEqual(oracle.toString(), "MultisigOracle<[0xCA2421bE4AA793c9F95faef57811F4eD360f54e1], 1, 0xe53dcc3bd5f13fc11bfa1907103c388b67d7b6018e4c301aa61b3cdafb1452af>");
```

### `StringBytes`

Represents bytes that should be interpreted as a string. The string can contain
only printable ASCII characters (including space) other than `"` and `\`.

```ts
import { HashedBytes, MultisigOracle, StringBytes } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const feedId = "e53dcc3bd5f13fc11bfa1907103c388b67d7b6018e4c301aa61b3cdafb1452af";

const oracle = new MultisigOracle(
    ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
    1n,
    new HashedBytes(new StringBytes("bitcoin above 100000 on 2027-01-01 00:00:00 UTC")),
);
assert.strictEqual(
    oracle.toString(),
    `MultisigOracle<[0xCA2421bE4AA793c9F95faef57811F4eD360f54e1], 1, keccak256("bitcoin above 100000 on 2027-01-01 00:00:00 UTC")>`,
);
```

### `MapBytes`

Represents bytes that should be interpreted as a tsON-encoded string-to-string
map. Keys and values can contain only printable ASCII characters (including
space) other than `"` and `\`.

```ts
import { MapBytes, WithMetadata, NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

// The `MapBytes` constructor takes `Record<string, string>` or `Map<string, string>`.
const metadata = new MapBytes({
    user_comment: "I know I'm overexposed but the price is down right now",
});
const token = new WithMetadata(new NativeToken(18n).withAmount(1n), metadata).withAmount(2n);

assert.strictEqual(
    metadata.toString(),
    `{ "user_comment": "I know I'm overexposed but the price is down right now" }`,
);
assert.strictEqual(
    token.toString(),
    `2 WithMetadata<1 NativeToken<18>, { "user_comment": "I know I'm overexposed but the price is down right now" }>`,
);

assert.strictEqual(Object.getPrototypeOf(metadata.map), Map.prototype);
assert.strictEqual(
    metadata.map.get("user_comment"),
    "I know I'm overexposed but the price is down right now",
);
```

### `HashedBytes`

Represents bytes that are the Keccak-256 hash of some other bytes. The constructor
takes another `Bytes` object.

```ts
import { HashedBytes, MapBytes, MultisigOracle } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const feedId = "e53dcc3bd5f13fc11bfa1907103c388b67d7b6018e4c301aa61b3cdafb1452af";

const oracle = new MultisigOracle(
    ["0xCA2421bE4AA793c9F95faef57811F4eD360f54e1"],
    1n,
    new HashedBytes(new MapBytes({
        market: "BTC",
        condition: "above 100000",
        time: "2027-01-01 00:00:00 UTC",
    })),
);
assert.strictEqual(
    oracle.toString(),
    `MultisigOracle<[0xCA2421bE4AA793c9F95faef57811F4eD360f54e1], 1, keccak256({ "market": "BTC", "condition": "above 100000", "time": "2027-01-01 00:00:00 UTC" })>`,
);
```
