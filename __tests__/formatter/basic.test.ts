import assert from "node:assert";
import { describe, test } from "vitest";
import { Formatter } from "../../src/main.js";

const formatter = () => {
	return new Formatter({ indentSize: 4 });
};

describe("basic formatter test", () => {
	test("can format plain text", () => {
		const content = "aaa\n";
		const expected = "aaa\n";

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("outputs end with new line", () => {
		const content = "aaa";
		const expected = "aaa\n";

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("can format simple html tag", () => {
		const content = "<html><body></body></html>";
		const expected = ["<html>", "", "<body></body>", "", "</html>", ""].join(
			"\n",
		);

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});
});
