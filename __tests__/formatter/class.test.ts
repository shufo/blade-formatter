import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter class test", () => {
	test("new class without parenthesis", async () => {
		const content = [
			`@props([`,
			`'fileExtensions' => new AllowedExtensionsFilePolicy()->get(),`,
			`])`,
		].join("\n");
		const expected = [
			`@props([`,
			`    'fileExtensions' => new AllowedExtensionsFilePolicy()->get(),`,
			`])`,
			``,
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("new class with parenthesis if phpVersion specified below 8.4", async () => {
		const content = [
			`@props([`,
			`'fileExtensions' => new AllowedExtensionsFilePolicy()->get(),`,
			`])`,
		].join("\n");
		const expected = [
			`@props([`,
			`    'fileExtensions' => (new AllowedExtensionsFilePolicy())->get(),`,
			`])`,
			``,
		].join("\n");

		await util.doubleFormatCheck(content, expected, { phpVersion: "8.2" });
	});
});
