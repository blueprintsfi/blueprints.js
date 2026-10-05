`UnsupportedOracle` represents an oracle that is not supported.

## Parameters

```ts
import type { Bytes } from "@blueprintsfi/blueprints.js";

type UnsupportedOracleParams = {
    address: string;
    feedId: Bytes;
};
```

`UnsupportedOracle` takes two parameters – the address of the oracle and the
feed id.

## Examples

```ts
import { RawBytes, UnsupportedOracle } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const unsupportedOracle = new UnsupportedOracle({
    address: "0xBFFeA64641Ba47AD959ae1D53C9c2C24BC5cE4d1",
    feedId: new RawBytes("24e2f8ffb75ed49e89a9a2208f31d4186bf8e50a60c2868ac9073d0ccb69d2dc"),
});
assert.strictEqual(
    unsupportedOracle.toString(),
    "UnsupportedOracle<0xBFFeA64641Ba47AD959ae1D53C9c2C24BC5cE4d1, 0x24e2f8ffb75ed49e89a9a2208f31d4186bf8e50a60c2868ac9073d0ccb69d2dc>",
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
