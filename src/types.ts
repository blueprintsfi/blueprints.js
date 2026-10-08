import { hexToBytes } from "@noble/hashes/utils.js";
import { addressWithChecksum, Fraction, weiFromString } from "./utils.js";
import Tokenizer from "./Tokenizer.js";
import type { default as Token } from "./blueprints/Token.js";
import type { default as Oracle } from "./oracles/Oracle.js";
import { HashedBytes, MapBytes, RawBytes, StringBytes, type Bytes } from "./bytes.js";

type BlueprintConstructor<T> = {
    new (amount: Fraction | bigint, params: Infer<T>): Token;
    name: string;
    paramsType: T;
};

type OracleConstructor<T> = {
    new (params: Infer<T>): Oracle;
    name: string;
    paramsType: T;
};

function parseMapBytes(tokenizer: Tokenizer) {
    const map = new Map<string, string>();
    if (tokenizer.matchString("}")) {
        return new MapBytes(map);
    }

    while (true) {
        tokenizer.mustMatchString(` "`);
        const key = tokenizer.until(`"`);
        tokenizer.mustMatchString(`: "`);
        const value = tokenizer.until(`"`);
        if (map.has(key)) {
            throw new Error("Duplicated map key");
        }
        map.set(key, value);

        if (tokenizer.matchString(" }")) {
            return new MapBytes(map);
        }
        tokenizer.mustMatchString(",");
    }
}

export interface Type<T> {
    parse(tokenizer: Tokenizer): T;
    stringify(value: T, type: ToStringFormat): string;
    deepCopy(value: T): T;
}

const blueprints = new Map<string, BlueprintConstructor<any>>();
const oracles = new Map<string, OracleConstructor<any>>();

export function registerBlueprint<T>(blueprint: BlueprintConstructor<T>): void {
    blueprints.set(blueprint.name, blueprint);
}

export function registerOracle<T>(oracle: OracleConstructor<T>): void {
    oracles.set(oracle.name, oracle);
}

export type ToStringFormat = "raw" | "html";

export const address: Type<string> = {
    parse(tokenizer) {
        const address = tokenizer.matchRegex(/^0x[0-9a-fA-F]{40}/);
        if (addressWithChecksum(address.toLowerCase()) !== address) {
            throw new SyntaxError("Address has invalid checksum");
        }
        return address;
    },
    stringify(address, type) {
        return type === "raw" ? address : `<span class="bp-address">${address}</span>`;
    },
    deepCopy(value) {
        return value;
    },
};

export const integer: Type<bigint> = {
    parse(tokenizer) {
        return BigInt(tokenizer.matchRegex(/^(0|-?[1-9][0-9]*)/));
    },
    stringify(value, type) {
        return type === "raw" ? value.toString() : `<span class="bp-int">${value}</span>`;
    },
    deepCopy(value) {
        return value;
    },
};

export const bytes: Type<Bytes> = {
    parse(tokenizer) {
        if (tokenizer.matchString("\"")) {
            const string = tokenizer.until("\"");
            return new StringBytes(string);
        }

        if (tokenizer.matchString("{")) {
            return parseMapBytes(tokenizer);
        }

        if (tokenizer.matchString("0")) {
            tokenizer.mustMatchString("x");
            const hex = tokenizer.matchRegex(/^([0-9a-f]{2})*/);
            return new RawBytes(hexToBytes(hex));
        }

        const fn = tokenizer.matchIdentifier();
        tokenizer.mustMatchString("(");

        let result: Bytes;
        switch (fn) {
            case "keccak256": {
                result = new HashedBytes(bytes.parse(tokenizer));
                break;
            }

            default: {
                throw new SyntaxError("Failed to parse bytes");
            }
        }

        tokenizer.mustMatchString(')');
        return result;
    },
    stringify(value, type) {
        return value.toString(type);
    },
    deepCopy(value) {
        return value;
    },
};

export class Array<T> implements Type<T[]> {
    constructor(private subtype: Type<T>) {}

    parse(tokenizer: Tokenizer) {
        tokenizer.mustMatchString("[");
        if (tokenizer.matchString("]")) {
            return [];
        }

        const result: T[] = [];
        while (true) {
            result.push(this.subtype.parse(tokenizer));

            if (tokenizer.matchString("]")) {
                break;
            }
            tokenizer.mustMatchString(",");
            tokenizer.mustMatchString(" ");
        }
        return result;
    }

    stringify(value: T[], type: ToStringFormat) {
        let result = "[";
        for (let i = 0; i < value.length; i++) {
            result += this.subtype.stringify(value[i]!, type);
            if (i < value.length - 1) result += ", ";
        }
        return result + "]";
    }

    deepCopy(value: T[]): T[] {
        const result: T[] = [];
        for (const item of value) {
            result.push(this.subtype.deepCopy(item));
        }
        return result;
    }
}

export type Infer<T> = T extends Type<infer U> ? U : never;

type InferStruct<T> = {
    [K in keyof T]: Infer<T[K]>;
} & {};

export class Struct<T extends Record<string, Type<any>>> implements Type<InferStruct<T>> {
    constructor(private type: T) {}

    parse(tokenizer: Tokenizer, brackets: "<>" | "()" = "()") {
        tokenizer.mustMatchString(brackets[0]!);
        const result = {} as InferStruct<T>;
        let isFirst = true;
        for (const name in this.type) {
            if (!isFirst) {
                tokenizer.mustMatchString(",");
                tokenizer.mustMatchString(" ");
            } else {
                isFirst = false;
            }
            result[name] = this.type[name]!.parse(tokenizer);
        }
        tokenizer.mustMatchString(brackets[1]!);
        return result;
    }

    stringify(value: InferStruct<T>, type: ToStringFormat, brackets: "<>" | "()" = "()") {
        let result = brackets[0]! === "<" && type === "html" ? "&lt;" : brackets[0]!;
        let isFirst = true;
        for (const name in this.type) {
            if (!isFirst) {
                result += ", ";
            } else {
                isFirst = false;
            }

            result += this.type[name]!.stringify(value[name], type);
        }
        return result + (brackets[1]! === ">" && type === "html" ? "&gt;" : brackets[1]!);
    }

    deepCopy(value: InferStruct<T>): InferStruct<T> {
        const result = {} as InferStruct<T>;
        for (const name in this.type) {
            result[name] = this.type[name]!.deepCopy(value[name]);
        }
        return result;
    }
}
type InferUnionInner<T> = {
    [K in keyof T]-?: {
        kind: K;
        value: Infer<T[K]>;
    };
}[keyof T];

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

type InferUnion<T> = Prettify<InferUnionInner<T>>;

export class Union<T extends Record<string, Type<any>>> implements Type<InferUnion<T>> {
    constructor(private type: T) {}

    parse(tokenizer: Tokenizer): InferUnion<T> {
        const kind = tokenizer.matchIdentifier();
        if (!Object.prototype.hasOwnProperty.call(this.type, kind)) {
            throw new SyntaxError(`Unknown union variant: ${kind}`);
        }
        tokenizer.mustMatchString("<");
        const value = this.type[kind]!.parse(tokenizer);
        tokenizer.mustMatchString(">");
        return { kind, value } as InferUnion<T>;
    }

    stringify(value: InferUnion<T>, type: ToStringFormat) {
        const content = this.type[value.kind]!.stringify(value.value, type);
        return type === "html"
            ? `${String(value.kind)}&lt;${content}&gt;`
            : `${String(value.kind)}<${content}>`;
    }

    deepCopy(value: InferUnion<T>): InferUnion<T> {
        return {
            kind: value.kind,
            value: this.type[value.kind]!.deepCopy(value.value),
        } as InferUnion<T>;
    }
}

export const token: Type<Token> = {
    parse(tokenizer: Tokenizer) {
        const amountString = tokenizer.until(" ");

        const blueprintName = tokenizer.matchIdentifier();
        const Blueprint = blueprints.get(blueprintName);
        if (Blueprint === undefined) {
            throw new SyntaxError(`Unknown blueprint: ${blueprintName}`);
        }

        const result = new Blueprint(0n, Blueprint.paramsType.parse(tokenizer, "<>"));
        const amount = weiFromString(amountString, result.weiPerUnit);
        result.setWeiAmount(amount);
        return result;
    },
    stringify(value: Token, type: ToStringFormat, withAmount = true) {
        const { name, paramsType } = value.constructor as BlueprintConstructor<any>;
        const amount = value.amountString();

        let amountStr: string;
        if (!withAmount) {
            amountStr = "";
        } else if (type === "raw") {
            amountStr = `${amount} `;
        } else {
            amountStr = `<span class="bp-amount">${amount}</span> `;
        }
        if (type === "raw") {
            return amountStr + name + paramsType.stringify(value.params as any, type, "<>");
        }

        return `${amountStr}<span class="bp-blueprint">${name}</span>`
            + paramsType.stringify(value.params as any, type, "<>");
    },
    deepCopy(value: Token) {
        return value.copy();
    },
};

export const oracle: Type<Oracle> = {
    parse(tokenizer) {
        const name = tokenizer.matchIdentifier();
        const Oracle = oracles.get(name);
        if (Oracle === undefined) {
            throw new SyntaxError(`Unknown oracle: ${name}`);
        }
        return new Oracle(Oracle.paramsType.parse(tokenizer, "<>"));
    },
    stringify(value, type) {
        const { name, paramsType } = value.constructor as OracleConstructor<any>;
        if (type === "raw") {
            return `${name}${paramsType.stringify(value.params as any, type, "<>")}`;
        }
        return `<span class="bp-oracle">${name}</span>`
            + paramsType.stringify(value.params as any, type, "<>");
    },
    deepCopy(value) {
        const Oracle = value.constructor as OracleConstructor<any>;
        return new Oracle(value.params);
    },
};
