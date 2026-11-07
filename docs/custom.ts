declare global {
    interface Map<K, V> {
        getOrInsertComputed(key: K, callback: (key: K) => V): V;
    }
}

if (typeof Map.prototype.getOrInsertComputed !== "function") {
    Object.defineProperty(Map.prototype, "getOrInsertComputed", {
        value: function <K, V>(this: Map<K, V>, key: K, callback: (key: K) => V): V {
            if (this.has(key)) return this.get(key)!;
            const value = callback(key);
            this.set(key, value);
            return value;
        },
        writable: true,
        configurable: true,
    });
}

function isScopeStart(element: Element): boolean {
    return element instanceof HTMLHeadingElement || element.classList.contains("def");
}

function defaultEntry() {
    return { list: [], usedColor: -1 };
}

export default function (url: string, root: HTMLElement): void {
    if (url !== "/grammar") return;

    let map = new Map<string, {
        list: HTMLElement[];
        // `-1` if not highlighted.
        usedColor: number;
    }>();
    let currentMask = { mask: -1 };

    for (const child of root.children) {
        if (isScopeStart(child) && map.size > 0) {
            map = new Map();
            currentMask = { mask: -1 };
        }

        for (const element of child.querySelectorAll("var, .var") as NodeListOf<HTMLElement>) {
            const key = element.textContent.trim();
            const entry = map.getOrInsertComputed(key, defaultEntry);
            const { list } = entry;
            list.push(element);

            const maskRef = currentMask;

            element.addEventListener("click", () => {
                if (entry.usedColor === -1) {
                    const color = Math.clz32(maskRef.mask);
                    const colorStr = color.toString();
                    for (const element of list) element.dataset.var = colorStr;
                    maskRef.mask ^= (1 << (31 - color));
                    entry.usedColor = color;
                } else {
                    for (const element of list) delete element.dataset.var;
                    maskRef.mask ^= (1 << (31 - entry.usedColor));
                    entry.usedColor = -1;
                }
            });
        }
    }
}
