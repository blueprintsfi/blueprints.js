import Token from "./blueprints/Token.js";
import NativeToken, { type NativeTokenParams } from "./blueprints/NativeToken.js";
import ERC20, { type ERC20Params } from "./blueprints/ERC20.js";
import Basket, { type BasketParams } from "./blueprints/Basket.js";
import ComposablePrediction, {
    type ComposablePredictionParams,
} from "./blueprints/ComposablePrediction.js";
import WithMetadata, { type WithMetadataParams } from "./blueprints/WithMetadata.js";
import UnsupportedBlueprint, {
    type UnsupportedBlueprintParams,
} from "./blueprints/UnsupportedBlueprint.js";
import UnknownBlueprint, { type UnknownBlueprintParams } from "./blueprints/UnknownBlueprint.js";

export {
    Token,
    NativeToken, type NativeTokenParams,
    ERC20, type ERC20Params,
    Basket, type BasketParams,
    ComposablePrediction, type ComposablePredictionParams,
    WithMetadata, type WithMetadataParams,
    UnsupportedBlueprint, type UnsupportedBlueprintParams,
    UnknownBlueprint, type UnknownBlueprintParams,
};

import Oracle from "./oracles/Oracle.js";
import ConstantOracle, { type ConstantOracleParams } from "./oracles/ConstantOracle.js";
import MultisigOracle, { type MultisigOracleParams } from "./oracles/MultisigOracle.js";
import UnsupportedOracle, { type UnsupportedOracleParams } from "./oracles/UnsupportedOracle.js";

export {
    Oracle,
    ConstantOracle, type ConstantOracleParams,
    MultisigOracle, type MultisigOracleParams,
    UnsupportedOracle, type UnsupportedOracleParams,
};

export function yesToken(collateral: Token, oracle: Oracle): ComposablePrediction {
    return new ComposablePrediction(1n, {
        collateral,
        constraints: [{ oracle, startRange: 1n, endRange: 0n }],
    });
}

export function noToken(collateral: Token, oracle: Oracle): ComposablePrediction {
    return new ComposablePrediction(1n, {
        collateral,
        constraints: [{ oracle, startRange: 0n, endRange: 1n }],
    });
}

export function isBinaryPrediction(token: Token): token is ComposablePrediction {
    if (!(token instanceof ComposablePrediction)) return false;

    const { constraints } = token.params;
    if (constraints.length !== 1) return false;

    const { startRange, endRange } = constraints[0]!;
    return (startRange === 0n && endRange === 1n) || (startRange === 1n && endRange === 0n);
}

export function isYesToken(token: Token): token is ComposablePrediction {
    return isBinaryPrediction(token) && token.params.constraints[0]!.startRange === 1n;
}

export function isNoToken(token: Token): token is ComposablePrediction {
    return isBinaryPrediction(token) && token.params.constraints[0]!.startRange === 0n;
}

export { Fraction, addressWithChecksum, weiFromString, weiToString } from "./utils.js";
export { Bytes, RawBytes, StringBytes, MapBytes, HashedBytes } from "./bytes.js";
