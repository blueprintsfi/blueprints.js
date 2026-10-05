`Basket` wraps several tokens into a single token. This is useful when other
blueprints want a single token input in their construction or for the ease of
transferring standard baskets.

## Parameters

```ts
import type { Token } from "@blueprintsfi/blueprints.js";

type BasketParams = {
    tokens: Token[];
};
```

`Basket` takes a single parameter – an array of positions to wrap. There must be
at least one token and all amounts must be nonzero. The order of tokens does not
affect the token id. More specifically, a canonical form of a basket has amounts
of the same token id added and all ids sorted. Two baskets have the same token
id if and only if their canonical forms consist of the same tokens in the same
ratios. For example, all of the following tokens represent the same position
with the same token id and the same final amounts:

1. `1 Basket<[50 NativeToken<18>, 100
   ERC20<0x7B644715bea2e372f8d84Ae1a69534013E1E17a6, 18>]>`
1. `10 Basket<[5 NativeToken<18>, 10
   ERC20<0x7B644715bea2e372f8d84Ae1a69534013E1E17a6, 18>]>`
1. `5 Basket<[20 ERC20<0x7B644715bea2e372f8d84Ae1a69534013E1E17a6, 18>, 10
   NativeToken<18>]>`
1. `10 Basket<[0.01 NativeToken<20>, 4 NativeToken<18>, 10
   ERC20<0x7B644715bea2e372f8d84Ae1a69534013E1E17a6, 18>]>`

## Examples

```ts
import { Basket, ERC20, NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = new NativeToken(5n, {
    decimals: 18n,
});

const erc20 = new ERC20(10n, {
    address: "0x7B644715bea2e372f8d84Ae1a69534013E1E17a6",
    decimals: 18n,
});

const basket = new Basket(10n, {
    tokens: [eth, erc20],
});
assert.strictEqual(
    basket.toString(),
   "10 Basket<[5 NativeToken<18>, 10 ERC20<0x7B644715bea2e372f8d84Ae1a69534013E1E17a6, 18>]>",
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
