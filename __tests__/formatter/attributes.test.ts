import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter attributes test", () => {
	test("empty class atrbitue", async () => {
		let content = [`<div class=""></div>`].join("\n");
		let expected = [`<div class=""></div>`, ""].join("\n");

		await util.doubleFormatCheck(content, expected);

		content = [
			`<input class="" type="file" name="product_images[]" multiple />
`,
		].join("\n");
		expected = [
			`<input class="" type="file" name="product_images[]" multiple />`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("keep html attribute indentation", async () => {
		const content = [
			`@component('some.file')`,
			"    <div>",
			`        <input type="text" an-object="{`,
			`            'Some error': 1,`,
			`        }" />`,
			"    </div>",
			"@endcomponent",
		].join("\n");

		const expected = [
			`@component('some.file')`,
			"    <div>",
			`        <input type="text" an-object="{`,
			`            'Some error': 1,`,
			`        }" />`,
			"    </div>",
			"@endcomponent",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
