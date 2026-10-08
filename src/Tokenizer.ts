export default class Tokenizer {
    constructor(public string: string) {}

    matchString(str: string) {
        if (!this.string.startsWith(str)) return false;

        this.string = this.string.slice(str.length);
        return true;
    }

    mustMatchString(char: string) {
        if (!this.matchString(char)) {
            throw new SyntaxError(`Expected '${char}'`);
        }
    }

    matchRegex(regex: RegExp) {
        const match = this.string.match(regex);
        if (match === null) {
            throw new SyntaxError("Failed to parse token");
        }

        const result = match[0];
        this.string = this.string.slice(result.length);
        return result;
    }

    matchIdentifier() {
        return this.matchRegex(/^[a-zA-Z][a-zA-Z0-9_]*/);
    }

    assertEOF() {
        if (this.string.length !== 0) {
            throw new SyntaxError("Expected EOF");
        }
    }

    until(char: string) {
        const index = this.string.indexOf(char);
        if (index === -1) {
            throw new SyntaxError(`Expected '${char}', got EOF`);
        }

        const result = this.string.slice(0, index);
        this.string = this.string.slice(index + 1);
        return result;
    }
}
