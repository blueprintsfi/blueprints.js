import { parseOracle, Tokenizer } from "../parser";

export default abstract class Oracle {
    private cachedFeedId: Uint8Array | null = null;

    feedId(): Uint8Array {
        if (this.cachedFeedId !== null) {
            return this.cachedFeedId.slice();
        }
        return (this.cachedFeedId = this.calculateFeedId()).slice();
    }

    protected abstract calculateFeedId(): Uint8Array;
    abstract address(): string;

    static fromString(input: string): Oracle {
        const tokenizer = new Tokenizer(input);
        const oracle = parseOracle(tokenizer);
        tokenizer.ensureEOF();
        return oracle;
    }

    abstract toString(): string;
    abstract toHTMLString(): string;
}
