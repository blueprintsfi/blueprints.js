import { rename } from "node:fs/promises";

await Bun.build({
    packages: "external",
    entrypoints: ["src/blueprints.ts"],
    format: "cjs",
    outdir: "dist",
    minify: true,
});

await rename("dist/blueprints.js", "dist/blueprints.cjs");

await Bun.build({
    packages: "external",
    entrypoints: ["src/blueprints.ts"],
    format: "esm",
    outdir: "dist",
    minify: true,
});
