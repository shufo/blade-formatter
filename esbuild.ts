#!/usr/bin/env node

const esbuild = require('esbuild');

// Automatically exclude all node_modules from the bundled version
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const build = async () => {
  const bundleCtx = await esbuild.context({
    entryPoints: ['./src/main.ts'],
    outfile: 'dist/bundle.js',
    bundle: true,
    platform: 'node',
    sourcemap: true,
    target: 'node12',
    minify: true,
    plugins: [
      nodeExternalsPlugin(),
      {
        name: 'watch',
        setup(build) {
          build.onEnd((result) => {
            console.log('===========================================');
            // error if errors array have errors
            if (result.errors.length > 0) {
              console.log(`${new Date().toLocaleString()}: main module build failed.`);
              process.exit(1);
            } else {
              console.log(`${new Date().toLocaleString()}: main module build succeeded.`);
            }
          });
        },
      },
    ],
  });

  const cliCtx = await esbuild.context({
    entryPoints: ['./src/cli.ts'],
    outfile: 'dist/cli-bundle.js',
    bundle: true,
    platform: 'node',
    sourcemap: true,
    target: 'node12',
    minify: true,
    plugins: [
      nodeExternalsPlugin(),
      {
        name: 'watch',
        setup(build) {
          build.onEnd((result) => {
            console.log('===========================================');
            // error if errors array have errors
            if (result.errors.length > 0) {
              console.log(`${new Date().toLocaleString()}: cli module build failed.`);
              process.exit(1);
            } else {
              console.log(`${new Date().toLocaleString()}: cli module build succeeded.`);
            }
          });
        },
      },
    ],
  });

  if (process.env.NODE_ENV === 'production') {
    await bundleCtx.rebuild();
    bundleCtx.dispose();
    await cliCtx.rebuild();
    cliCtx.dispose();
  } else {
    await bundleCtx.watch();
    await cliCtx.watch();
  }
};

build();
