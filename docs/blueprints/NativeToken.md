`NativeToken` wraps the chain's native token (e.g. ETH). It can be minted by
depositing the native token and burned to withdraw it.

## Parameters

```ts
type NativeTokenParams = {
    decimals: bigint;
};
```

`NativeToken` takes a single parameter – the number of decimals (for example, on
Ethereum it should be set to 18). Note that it is not validated in any way and
does not affect the token id. It only changes how the amount is displayed.
Setting it incorrectly may be misleading. For example, `1 NativeToken<20>` on
Ethereum represents 100 ETH and not 1 ETH.

## Examples

```ts
import { NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = new NativeToken(10n, {
    decimals: 18n,
});

assert.strictEqual(eth.toString(), "10 NativeToken<18>");
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
