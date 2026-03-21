import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			src: path.resolve(__dirname, "./src"),
		},
	},
	test: {
		testTimeout: 10000,
	},
});
