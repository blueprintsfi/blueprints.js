`WithMetadata` attaches arbitrary bytes to a token without changing the wrapped
token's blueprint address, internal token id, or external token id. This is
useful when an application wants to store app-specific data about a position.

## Parameters

```ts
import { Bytes, Token, TokenDefinition } from "@blueprintsfi/blueprints.js";

declare class WithMetadata extends TokenDefinition {
    readonly token: Token;
    readonly metadata: Bytes;
    constructor(token: Token, metadata: Bytes);
}
```

`WithMetadata` takes two parameters the wrapped token, and arbitrary metadata
bytes.

The [wei per unit](../blueprintsjs#wei-amounts-human-readable-amounts) is
defined as the wei amount of wrapped token.

## Examples

```ts
import { MapBytes, NativeToken, WithMetadata } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const position = new WithMetadata(
    new NativeToken(18n).withAmount(1n),
    new MapBytes({
        user_comment: "I know I'm overexposed but the price is down right now",
    }),
).withAmount(2n);

assert.strictEqual(
    position.toString(),
    `2 WithMetadata<1 NativeToken<18>, { "user_comment": "I know I'm overexposed but the price is down right now" }>`,
);
assert.strictEqual(
    position.definition.externalTokenId().toHex(),
    new NativeToken(18n).externalTokenId().toHex(),
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
