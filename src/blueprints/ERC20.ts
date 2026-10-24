import { hexToBytes } from "@noble/hashes/utils.js";
import { type Tokenizer, parseAddress, parseInteger, tokenDefinitionParsers } from "../parser.js";
import { validateAddress } from "../utils.js";
import { TokenDefinition } from "./token.js";

export default class ERC20 extends TokenDefinition {
    static override name = "ERC20";

    constructor(readonly address: string, readonly decimals: bigint) {
        // ❯ 10n ** 77n >= 2n ** 256n
        // false
        // ❯ 10n ** 78n >= 2n ** 256n
        // true
        if (decimals < 0n || decimals > 77n) {
            throw new Error("Decimals out of range");
        }

        validateAddress(address);

        super(10n ** decimals);
    }

    protected override calculateInternalTokenId(): Uint8Array {
        const buffer = new Uint8Array(0x20);
        buffer.set(hexToBytes(this.address.slice(2)), 12);
        return buffer;
    }

    override blueprintAddress(): string {
        return "0x01B522c50242747c576717052FBA75e7fA2aa6a8";
    }

    override toString(): string {
        return `ERC20<${this.address}, ${this.decimals}>`;
    }

    override toHTMLString(): string {
        let result = `<span class="bp-blueprint">ERC20</span>&lt;`;
        result += `<span class="bp-address">${this.address}</span>, `;
        result += `<span class="bp-int">${this.decimals}</span>&gt;`;
        return result;
    }
}

function parseERC20(tokenizer: Tokenizer): ERC20 {
    const address = parseAddress(tokenizer, false);
    tokenizer.mustConsume(", ");
    const decimals = parseInteger(tokenizer);
    return new ERC20(address, decimals);
}

tokenDefinitionParsers.set(ERC20.name, parseERC20);
