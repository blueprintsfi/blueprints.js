await Bun.build({
    packages: "external",
    entrypoints: ["src/blueprints.ts"],
    format: "esm",
    outdir: "dist",
});
