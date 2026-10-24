`MultisigOracle` resolves to a value if at least a specified number of signers
sign a message that the given feed should resolve to that value.

## Parameters

```ts
import { Bytes, Oracle } from "@blueprintsfi/blueprints.js";

declare class MultisigOracle extends Oracle {
    readonly addresses: readonly string[];
    readonly threshold: bigint;
    readonly signedFeed: Bytes;
    constructor(addresses: readonly string[], threshold: bigint, signedFeed: Bytes);
}
```

`MultisigOracle` takes 3 parameters – a list of signers, a threshold, and
a signed feed, which must be 32 bytes long.

A signer's address might be in the list more than once. In that case, their
signature will hold proportionally more power over the response. If this is
undesirable, the developer is obliged to check for repetitions when validating a
multisig oracle setup.

Threshold is the number of signers that must agree on a value (by signing a
message) in order for the feed to resolve. It must be greater than 0 and not
greater than the length of the signers array.

The actual feed id is derived by hashing the list of signers, threshold, and the
signed feed.

## Examples

```ts
import { HashedBytes, MapBytes, MultisigOracle } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const multisigOracle = new MultisigOracle(
    [
        "0xD28718f6Ca7398897417eD3aBbD8C2522776E1bf",
        "0x663056E2C695Be0d593271513C6a0794Bc7E6E6F",
        "0xd162c1Ca3357E4F2624BA0cdC57A8e4471502189",
    ],
    2n,
    new HashedBytes(new MapBytes({
        market: "BTC",
        condition: "above 100000",
        date: "2027-01-01 00:00:00 UTC",
    })),
);
assert.strictEqual(
    multisigOracle.toString(),
    `MultisigOracle<[0xD28718f6Ca7398897417eD3aBbD8C2522776E1bf, 0x663056E2C695Be0d593271513C6a0794Bc7E6E6F, 0xd162c1Ca3357E4F2624BA0cdC57A8e4471502189], 2, keccak256({ "market": "BTC", "condition": "above 100000", "date": "2027-01-01 00:00:00 UTC" })>`,
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
