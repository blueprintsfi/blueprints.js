let mask = -1;

document.getElementById("rendered")!.addEventListener("click", (event) => {
    const { target } = event;
    if (!(target instanceof HTMLElement) || (target.tagName !== "VAR")) return;

    event.preventDefault();

    const varName = target.textContent;
    const parentList = target.closest("ol")!;

    let toSet: string | null;
    if ("var" in target.dataset) {
        toSet = null;
        mask |= ~(1 << (31 - Number(target.dataset.var)));
    } else {
        const bit = Math.clz32(mask);
        console.log("remove", bit);
        mask &= ~(1 << (31 - bit));

        toSet = bit.toString();
    }
    console.log((mask >>> 0).toString(2).padStart(32, "0"));

    for (const element of parentList.querySelectorAll("var, .var")) {
        if (element.textContent === varName) {
            if (toSet === null) {
                delete element.dataset.var;
            } else {
                element.dataset.var = toSet;
            }
        }
    }
});
