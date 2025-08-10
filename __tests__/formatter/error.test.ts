import Formatter from "src/formatter";
import { describe, expect, test } from "vitest";

describe("formatter alpine test", () => {
	test("should raise error when invalid php version specified", async () => {
		const options = {
			phpVersion: "invalid",
		};

		await expect(
			new Formatter(options).formatContent("<?php echo 'test'; ?>"),
		).rejects.toThrow();
	});

	test("should raise error when invalid php version specified even if noPhpSyntaxCheck passed", async () => {
		const options = {
			phpVersion: "invalid",
			noPhpSyntaxCheck: true,
		};

		await expect(
			new Formatter(options).formatContent("<?php echo 'test'; ?>"),
		).rejects.toThrow();
	});
});
