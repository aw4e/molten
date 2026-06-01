import { build } from "esbuild";

await build({
  entryPoints: ["src/server.ts"],
  bundle: true,
  minify: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/server.js",
  // Shim for CJS deps that call require() inside ESM bundle
  banner: {
    js: `import{createRequire}from"module";const require=createRequire(import.meta.url);`,
  },
  // Node built-ins stay external, all npm deps bundled
});

console.log("Build complete: dist/server.js");
