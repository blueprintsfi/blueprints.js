import * as types from "../types.js";

export default abstract class Oracle {
    abstract params: unknown;
    private cachedFeedId: Uint8Array | null = null;

    toString(type: types.ToStringFormat = "raw") {
        return types.oracle.stringify(this, type);
    }

    feedId(): Uint8Array {
        if (this.cachedFeedId !== null) {
            return this.cachedFeedId.slice();
        }
        return (this.cachedFeedId = this.calculateFeedId()).slice();
    }

    protected abstract calculateFeedId(): Uint8Array;
    abstract address(): string;
}
