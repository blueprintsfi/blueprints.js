Blueprints is a free and open-source on-chain framework for expressing customized
financial positions, created by parametrizing existing primitives. Examples of
tokens include:
- `1 NativeToken<18>` – can be minted by depositing one native token (e.g. 1
  ETH) and burned to withdraw it,
- `20 ERC20<0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, 18>` – can be minted by
  depositing 20 ERC20 tokens with the given address and burned to withdraw them,
- `0.05 ComposablePrediction<1 NativeToken<18>,
  [(MultisigOracle<[0xD28718f6Ca7398897417eD3aBbD8C2522776E1bf,
  0x663056E2C695Be0d593271513C6a0794Bc7E6E6F,
  0xd162c1Ca3357E4F2624BA0cdC57A8e4471502189], 2,
  keccak256({"market":"BTC","condition":"above 100000","time":"2027-01-01
  00:00:00 UTC"})>, 1, 0)]>` – can be exchanged for `0.05 NativeToken<18>` if at
  least 2 out of 3 signers sign that the specified feed resolves to an integer
  between 1 and infinity (anything but zero),
- `10 WithMetadata<1 NativeToken<18>, {"user_comment":"I know I'm overexposed
  but the price is down right now"}>` – wraps a position together with arbitrary
  bytes without changing the underlying token id.

Although positions expressed by these tokens are vastly different, all of them
share a common interface.

As seen in the latter example, the tokens are composable – one position can be
an argument of another. This allows infinitely intricate positions to be created
from simple primitives.

## Benefits of using Blueprints

- **Time spent on development.** The vast majority of the products can be built
  using existing primitives, there's no need to develop any smart contracts.
- **Money saved on audits.** Auditing smart contracts can be very expensive and
  time-consuming. Blueprints fix that.
- **Security improvement.** Blueprints are extremely simple and concise – so
  much that mistakes are difficult to make. You don't have to risk using novel
  smart contracts.
- **User verifiability.** Users can verify their positions instead of trusting
  new contracts for every new app they're using.
- **Unified liquidity.** Many products use the same positions. On Blueprints,
  they all "talk in the same language", which means that it's possible to
  seamlessly plug in to the ecosystem's liquidity. One user's counterparty can
  be a user of a different product.
- **Extensibility.** To add your own primitive, you only need to write the code
  that describes the position. Everything else (managing balances, transfers,
  approvals, etc.) is already handled.

## Architecture overview

This section provides an overview of the Blueprints architecture. Consult the
[smart contracts' source code][core] for details.

### Blueprints

`NativeToken`, `ERC20`, and `ComposablePrediction` are examples of Blueprints.
Each of them is implemented in a separate smart contract. Anyone can create and
deploy their own Blueprint.

Each smart contract manages its own token space. Tokens minted by a Blueprint
have a 256-bit *internal token id*. The *external token id* is calculated by
hashing the smart contract's address and the internal token id. This assures
that, for example, the `NativeToken` Blueprint cannot mint `ERC20` tokens.

Each Blueprint defines a set of valid actions that can be performed. In
principle, each address should be able to perform the same actions. An action
consists of 4 arrays of tokens.
- `mint` – tokens that are to be minted by the Blueprint and sent to the address
  performing the action,
- `burn` – tokens that are to be taken from the address performing the action
  and burned; these tokens must have been minted by the same Blueprint,
- `give` – tokens that are to be transferred from the Blueprint to the address
  performing the action; these tokens could have been minted by another
  Blueprint,
- `take` – tokens that are to be transferred from the address performing the
  action to the Blueprint; these tokens could have been minted by another
  Blueprint.

For example, the `Basket` Blueprint allows the following actions:
- `take` some tokens and `mint` a token which represents a basket of them,
- `burn` a token representing a basket of tokens and `give` those tokens.

## Blueprint Manager

**Blueprint Manager** is a smart contract which keeps track of balances. Each
address is split into $2^{256}$ subaccounts which is oftentimes helpful.
Blueprint Manager also implements flash accounting – the ability to spend tokens
one will receive *later in the same transaction*.

## Oracles

An oracle feed is defined by the oracle address and a 256-bit feed id. The
interpretation of the feed id is left to the operator of the oracle. A feed
resolves to a 256-bit unsigned integer.

Oracles shouldn't return different readings for the same feed id, but
technically there's nothing preventing them from doing so. If consistent
readings are desired, you can wrap an oracle in a `ConstantOracle`.

[core]: https://github.com/blueprintsfi/core
