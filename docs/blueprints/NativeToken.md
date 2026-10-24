`NativeToken` wraps the chain's native token (e.g. ETH). It can be minted by
depositing the native token and burned to withdraw it.

## Parameters

```ts
import { TokenDefinition } from "@blueprintsfi/blueprints.js";

declare class NativeToken extends TokenDefinition {
    readonly decimals: bigint;
    constructor(decimals: bigint);
}
```

`NativeToken` takes a single parameter – the number of decimals (for example, on
Ethereum it should be set to 18). It must be between 0 and 77. Note that it is
not validated in any other way and does not affect the token id. It only changes
how the amount is displayed.
Setting it incorrectly may be misleading. For example, `1 NativeToken<20>` on
Ethereum represents 100 ETH and not 1 ETH.

## Examples

```ts
import { NativeToken } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const eth = new NativeToken(18n).withAmount(10n);

assert.strictEqual(eth.toString(), "10 NativeToken<18>");
assert.strictEqual(eth.definition.toString(), "NativeToken<18>");
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
