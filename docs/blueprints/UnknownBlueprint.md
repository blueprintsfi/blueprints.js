`UnknownBlueprint` represents a token whose Blueprint address and internal token
id are unknown, but the external token id is known.

## Parameters

```ts
import type { Bytes } from "@blueprintsfi/blueprints.js";

type UnknownBlueprintParams = {
    externalTokenId: Bytes;
};
```

An `UnknownBlueprint` token always has a multiplier of 1. `blueprintAddress()`
and `internalTokenId()` methods always throw an error.

## Examples

```ts
import { UnknownBlueprint, RawBytes } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const unknown = new UnknownBlueprint(10n, {
    externalTokenId: new RawBytes("c4cbd148f21c6f5da9317a86f6ed034661c1826f1d28c7e30a19dfed49a1fa12"),
});
assert.strictEqual(
    unknown.toString(),
   "10 UnknownBlueprint<0xc4cbd148f21c6f5da9317a86f6ed034661c1826f1d28c7e30a19dfed49a1fa12>",
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
