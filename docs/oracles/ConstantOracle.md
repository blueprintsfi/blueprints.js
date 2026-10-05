`ConstantOracle` wraps another oracle and caches its responses. Since normally
there's nothing preventing an oracle from returning different readings for the
same feed id, oftentimes it is needed to wrap it in a `ConstantOracle`.

## Parameters

```ts
import type { Oracle } from "@blueprintsfi/blueprints.js";

type ConstantOracleParams = {
    innerOracle: Oracle;
};
```

`ConstantOracle` takes a single parameter – an oracle to wrap.

## Examples

```ts
import { ConstantOracle, RawBytes, UnsupportedOracle } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const untrustedOracle = new UnsupportedOracle({
    address: "0xBFFeA64641Ba47AD959ae1D53C9c2C24BC5cE4d1",
    feedId: new RawBytes("24e2f8ffb75ed49e89a9a2208f31d4186bf8e50a60c2868ac9073d0ccb69d2dc"),
});

const constantOracle = new ConstantOracle({
    innerOracle: untrustedOracle,
});
assert.strictEqual(
    constantOracle.toString(),
    "ConstantOracle<UnsupportedOracle<0xBFFeA64641Ba47AD959ae1D53C9c2C24BC5cE4d1, 0x24e2f8ffb75ed49e89a9a2208f31d4186bf8e50a60c2868ac9073d0ccb69d2dc>>",
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
- [UnsupportedOracle](/oracles/UnsupportedOracle)
