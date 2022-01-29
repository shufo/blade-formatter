#!/usr/bin/env node

const esbuild = require("esbuild");

// Automatically exclude all node_modules from the bundled version
const { nodeExternalsPlugin } = require("esbuild-node-externals");

if (process.env.NODE_ENV === "production") {
  esbuild
    .build({
      entryPoints: ["./src/main.ts"],
      outfile: "dist/bundle.js",
      bundle: true,
      minify: true,
      platform: "node",
      sourcemap: true,
      target: "node12",
      plugins: [nodeExternalsPlugin()],
    })
    .then(() => {
      console.log("===========================================");
      console.log(`${new Date().toLocaleString()}: main module build succeeded.`);
    })
    .catch(() => process.exit(1));

  esbuild
    .build({
      entryPoints: ["./src/cli.ts"],
      outfile: "dist/cli-bundle.js",
      bundle: true,
      minify: true,
      platform: "node",
      sourcemap: true,
      target: "node12",
      plugins: [nodeExternalsPlugin()],
      external: ['./src/worker'],
    })
    .then(() => {
      console.log("===========================================");
      console.log(`${new Date().toLocaleString()}: cli module build succeeded.`);
    })
    .catch(() => process.exit(1));

  return;
}

esbuild
  .build({
    entryPoints: ["./src/main.ts"],
    outfile: "dist/bundle.js",
    bundle: true,
    platform: "node",
    sourcemap: true,
    target: "node12",
    plugins: [nodeExternalsPlugin()],
    external: ['./src/worker'],
    watch: {
      onRebuild(error, result) {
        if (error) console.error("watch build failed:", error);
        else console.log("watch build succeeded:", result);
      },
    },
  })
  .then(() => {
    console.log("===========================================");
    console.log(`${new Date().toLocaleString()}: watching main build...`);
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["./src/cli.ts"],
    outfile: "dist/cli-bundle.js",
    bundle: true,
    platform: "node",
    sourcemap: true,
    target: "node12",
    plugins: [nodeExternalsPlugin()],
    watch: {
      onRebuild(error, result) {
        if (error) console.error("watch build failed:", error);
        else console.log("watch build succeeded:", result);
      },
    },
  })
  .then(() => {
    console.log("===========================================");
    console.log(`${new Date().toLocaleString()}: watching cli build...`);
  })
  .catch(() => process.exit(1));
