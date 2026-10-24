`UnsupportedBlueprint` represents a token created by an unsupported Blueprint.

## Parameters

```ts
import { Bytes, TokenDefinition } from "@blueprintsfi/blueprints.js";

declare class UnsupportedBlueprint extends TokenDefinition {
    readonly address: string;
    readonly tokenId: Bytes;
    constructor(address: string, tokenId: Bytes);
}
```

`UnsupportedBlueprint` takes two parameters – the address of the Blueprint and
the internal token id, which must be 32 bytes long.

An `UnsupportedBlueprint` token always has a multiplier of 1.

## Examples

```ts
import { UnsupportedBlueprint, RawBytes } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const unsupported = new UnsupportedBlueprint(
    "0x77220fDCEA053e572f32067CDb4518E5a5aE448b",
    new RawBytes("a1e066f16ab48b87476fb6937346ddea2dae353da2c3a8bd4a4366cbcaa74ef0"),
).withAmount(10n);
assert.strictEqual(
    unsupported.toString(),
    `10 UnsupportedBlueprint<0x77220fDCEA053e572f32067CDb4518E5a5aE448b, 0xa1e066f16ab48b87476fb6937346ddea2dae353da2c3a8bd4a4366cbcaa74ef0>`,
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
