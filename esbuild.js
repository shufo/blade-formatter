#!/usr/bin/env node

import esbuild from "esbuild";

// Automatically exclude all node_modules from the bundled version
import { nodeExternalsPlugin } from "esbuild-node-externals";

const build = async () => {
	const bundleCtx = await esbuild.context({
		entryPoints: ["./src/main.ts"],
		outfile: process.env.ESM_BUILD ? "dist/bundle.js" : "dist/bundle.cjs",
		bundle: true,
		platform: "node",
		sourcemap: true,
		target: "node12",
		format: process.env.ESM_BUILD ? "esm" : "cjs",
		minify: true,
		banner: {
			js: process.env.ESM_BUILD
				? `
        import path from 'path';
        import { fileURLToPath } from 'url';
        import { createRequire as topLevelCreateRequire } from 'module';
        const require = topLevelCreateRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        `
				: ``,
		},
		plugins: [
			nodeExternalsPlugin(),
			{
				name: "watch",
				setup(build) {
					build.onEnd((result) => {
						console.log("===========================================");
						// error if errors array have errors
						if (result.errors.length > 0) {
							console.log(
								`${new Date().toLocaleString()}: main module build failed.`,
							);
							process.exit(1);
						} else {
							console.log(
								`${new Date().toLocaleString()}: main module build succeeded.`,
							);
						}
					});
				},
			},
		],
	});

	const cliCtx = await esbuild.context({
		entryPoints: ["./src/cli.ts"],
		outfile: process.env.ESM_BUILD
			? "dist/cli-bundle.js"
			: "dist/cli-bundle.cjs",
		bundle: true,
		platform: "node",
		sourcemap: true,
		target: "node12",
		format: process.env.ESM_BUILD ? "esm" : "cjs",
		minify: true,
		banner: {
			js: process.env.ESM_BUILD
				? `
        import path from 'path';
        import { fileURLToPath } from 'url';
        import { createRequire as topLevelCreateRequire } from 'module';
        const require = topLevelCreateRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        `
				: ``,
		},
		plugins: [
			nodeExternalsPlugin(),
			{
				name: "watch",
				setup(build) {
					build.onEnd((result) => {
						console.log("===========================================");
						// error if errors array have errors
						if (result.errors.length > 0) {
							console.log(
								`${new Date().toLocaleString()}: cli module build failed.`,
							);
							process.exit(1);
						} else {
							console.log(
								`${new Date().toLocaleString()}: cli module build succeeded.`,
							);
						}
					});
				},
			},
		],
	});

	if (process.env.NODE_ENV === "production") {
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
