import assert from "node:assert";
import { describe, test } from "vitest";
import { BladeFormatter } from "../../src/main.js";

describe("formatter api test", () => {
	test("format API", async () => {
		const content = [
			"<table>",
			"<th><?= $userName ?></th>",
			"</table>",
			"",
		].join("\n");

		const expected = [
			"<table>",
			"    <th><?= $userName ?></th>",
			"</table>",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("format API with option", async () => {
		const content = [
			"<table>",
			"<th><?= $userName ?></th>",
			"</table>",
			"",
		].join("\n");

		const expected = [
			"<table>",
			"  <th><?= $userName ?></th>",
			"</table>",
			"",
		].join("\n");

		return new BladeFormatter({ indentSize: 2 })
			.format(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});
});
