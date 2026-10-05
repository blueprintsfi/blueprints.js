`WithMetadata` attaches arbitrary bytes to a token without changing the wrapped
token's blueprint address, internal token id, or external token id. This is
useful when an application wants to store app-specific data about a position.

## Parameters

```ts
import type { Token } from "@blueprintsfi/blueprints.js";

type WithMetadataParams = {
    token: Token;
    metadata: Bytes;
};
```

`WithMetadata` takes two parameters:

- the wrapped token,
- arbitrary metadata bytes.

The wrapped token also determines the multiplier of the `WithMetadata` token, so
the outer amount is expressed in the same units. The metadata is ignored when
computing the token ids.

## Examples

```ts
import { MapBytes, NativeToken, WithMetadata } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const position = new WithMetadata(2n, {
    token: new NativeToken(1n, { decimals: 18n }),
    metadata: new MapBytes({
        user_comment: "I know I'm overexposed but the price is down right now",
    }),
});

assert.strictEqual(
    position.toString(),
    `2 WithMetadata<1 NativeToken<18>, {"user_comment":"I know I'm overexposed but the price is down right now"}>`,
);
assert.strictEqual(
    position.externalTokenId().toHex(),
    position.params.token.externalTokenId().toHex(),
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
