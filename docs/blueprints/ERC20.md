`ERC20` wraps an ERC20 token. It can be minted by depositing the ERC20
and burned to withdraw it.

## Parameters

```ts
type ERC20Params = {
    address: string;
    decimals: bigint;
};
```

`ERC20` takes two parameters – the address of the ERC20 and its decimals. Note
that the decimals are not validated in any way and do not affect the token id.
It only changes how the amount is displayed. Setting it incorrectly may be
misleading. For example, if an ERC20 with address
`0x7B644715bea2e372f8d84Ae1a69534013E1E17a6` has 18 decimals, then the token `1
ERC20<0x7B644715bea2e372f8d84Ae1a69534013E1E17a6, 20>` with incorrectly set
decimals actually represents 100 tokens, not 1.

## Examples

```ts
import { ERC20 } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const erc20 = new ERC20(10n, {
    address: "0x7B644715bea2e372f8d84Ae1a69534013E1E17a6",
    decimals: 18n,
});

assert.strictEqual(
    erc20.toString(),
    "10 ERC20<0x7B644715bea2e372f8d84Ae1a69534013E1E17a6, 18>",
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
