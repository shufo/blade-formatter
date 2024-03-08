import { describe, expect, test } from "vitest";
import { Formatter } from "../dist/bundle";

describe("import test", () => {
	test("it can format via imported class", async () => {
		const input = ["<html>", "<body>", "<p>foo</p>", "</body>", "</html>"].join(
			"\n",
		);

		const options = {
			indentSize: 2,
			indentInnerHtml: true,
			extraLiners: [],
		};

		const result = await new Formatter(options).formatContent(input);

		const expected = [
			"<html>",
			"  <body>",
			"    <p>foo</p>",
			"  </body>",
			"</html>",
			"",
		].join("\n");

		expect(result).toBe(expected);
	});
});
