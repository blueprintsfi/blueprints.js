`MultisigOracle` resolves to a value if at least a specified number of signers
sign a message that the given feed should resolve to that value.

## Parameters

```ts
import type { Bytes } from "@blueprintsfi/blueprints.js";

type MultisigOracleParams = {
    addresses: string[];
    threshold: bigint;
    feedId: Bytes;
};
```

`MultisigOracle` takes 3 parameters – a list of signers, a threshold, and a feed
id.

A signer's address might be in the list more than once. In that case, their
signature will hold proportionally more power over the response. If this is
undesirable, the developer is obliged to check for repetitions when validating a
multisig oracle setup.

Threshold is the number of signers that must agree on a value (by signing a
message) in order for the feed to resolve. It must be greater than 0 and not
greater than the length of the signers array.

The actual feed id is derived by hashing the list of signers, threshold, and the
feed id parameter.

## Examples

```ts
import { HashedBytes, MapBytes, MultisigOracle } from "@blueprintsfi/blueprints.js";
import assert from "node:assert";

const multisigOracle = new MultisigOracle({
    addresses: [
        "0xD28718f6Ca7398897417eD3aBbD8C2522776E1bf",
        "0x663056E2C695Be0d593271513C6a0794Bc7E6E6F",
        "0xd162c1Ca3357E4F2624BA0cdC57A8e4471502189",
    ],
    threshold: 2n,
    feedId: new HashedBytes(new MapBytes({
        market: "BTC",
        condition: "above 100000",
        date: "2027-01-01",
    })),
});
assert.strictEqual(
    multisigOracle.toString(),
    `MultisigOracle<[0xD28718f6Ca7398897417eD3aBbD8C2522776E1bf, 0x663056E2C695Be0d593271513C6a0794Bc7E6E6F, 0xd162c1Ca3357E4F2624BA0cdC57A8e4471502189], 2, keccak256({"market":"BTC","condition":"above 100000","date":"2027-01-01"})>`,
);
```

## See also

- [Intro](/)
- [blueprints.js](/blueprintsjs)
