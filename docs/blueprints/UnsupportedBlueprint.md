`UnsupportedBlueprint` represents a token created by an unsupported Blueprint.

## Parameters

```ts
import type { Bytes } from "@blueprintsfi/blueprints.js";

type UnsupportedBlueprintParams = {
    address: string;
    internalTokenId: Bytes;
};
```

An `UnsupportedBlueprint` token always has a multiplier of 1.

## Examples

```ts
import { UnsupportedBlueprint, RawBytes } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const unsupported = new UnsupportedBlueprint(10n, {
    address: "0x77220fDCEA053e572f32067CDb4518E5a5aE448b",
    internalTokenId: new RawBytes("a1e066f16ab48b87476fb6937346ddea2dae353da2c3a8bd4a4366cbcaa74ef0"),
});
assert.strictEqual(
    unsupported.toString(),
    `10 UnsupportedBlueprint<0x77220fDCEA053e572f32067CDb4518E5a5aE448b, 0xa1e066f16ab48b87476fb6937346ddea2dae353da2c3a8bd4a4366cbcaa74ef0>`,
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
