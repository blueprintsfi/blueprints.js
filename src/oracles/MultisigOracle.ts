import { keccak_256 } from "@noble/hashes/sha3.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import type { Bytes } from "../bytes.js";
import {
    type AstNodeOracle,
    oracleParsers,
    parseAddress,
    parseBytes,
    parseInteger,
    type Tokenizer,
} from "../parser.js";
import { numberToBytesBE, skipAddressValidation, validateAddress } from "../utils.js";
import Oracle from "./Oracle.js";

export default class MultisigOracle extends Oracle {
    static override name = "MultisigOracle";

    readonly addresses: readonly string[];

    constructor(
        addresses: readonly string[],
        readonly threshold: bigint,
        readonly signedFeed: Bytes,
    ) {
        for (const address of addresses) {
            validateAddress(address);
        }

        if (threshold <= 0n || threshold > BigInt(addresses.length)) {
            throw new Error("Invalid threshold");
        }

        if (signedFeed.length() !== 32) {
            throw new Error("'signedFeed' must be 32 bytes long");
        }

        super();
        this.addresses = addresses.slice();
    }

    protected override calculateFeedId(): Uint8Array {
        const { addresses } = this;
        const numAddresses = addresses.length;

        const multisigBuffer = new Uint8Array(0x20 + numAddresses * 0x20);
        multisigBuffer.set(numberToBytesBE(this.threshold, 0x20));
        for (let i = 0; i < numAddresses; i++) {
            multisigBuffer.set(hexToBytes(addresses[i]!.slice(2)), 0x20 + i * 0x20 + 12);
        }

        const finalBuffer = new Uint8Array(64);
        finalBuffer.set(keccak_256(multisigBuffer));
        finalBuffer.set(this.signedFeed.bytes(), 0x20);

        return keccak_256(finalBuffer);
    }

    override address(): string {
        return "0x9aDCaB3f6904d36E179F0861d0BACBeaE97D87BD";
    }

    override toAst(): AstNodeOracle {
        return {
            type: "oracle",
            payload: {
                oracle: MultisigOracle.name,
                params: [
                    {
                        type: "array",
                        payload: this.addresses.map(address => ({
                            type: "address",
                            payload: address,
                        })),
                    },
                    { type: "integer", payload: this.threshold },
                    this.signedFeed.toAst(),
                ],
            },
        };
    }
}

function parse(tokenizer: Tokenizer): MultisigOracle {
    tokenizer.expectPunctuation("[");
    const addresses: string[] = [];
    if (!tokenizer.consumePunctuation("]")) {
        while (true) {
            addresses.push(parseAddress(tokenizer));
            if (tokenizer.consumePunctuation("]")) break;
            tokenizer.expectPunctuation(", ");
        }
    }
    tokenizer.expectPunctuation(", ");
    const threshold = parseInteger(tokenizer);
    tokenizer.expectPunctuation(", ");
    const feedIdBytes = parseBytes(tokenizer);
    tokenizer.expectPunctuation(">");
    return skipAddressValidation(() => new MultisigOracle(addresses, threshold, feedIdBytes));
}

oracleParsers.set(MultisigOracle.name, parse);
