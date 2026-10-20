import assert from "node:assert";
import { describe, test } from "vitest";
import { Formatter } from "../../src/main.js";

const scriptContent = [
	"<script>",
	"btn.addEventListener('click', function() {",
	"    doThing();",
	"});",
	"</script>",
	"",
].join("\n");

describe("jsBeautify option", () => {
	test("forwards js-beautify options to embedded <script> blocks", () => {
		return new Formatter({ jsBeautify: { space_after_anon_function: true } })
			.formatContent(scriptContent)
			.then((result: any) => {
				assert.ok(
					result.includes("function () {"),
					"expected a space after the anonymous function keyword",
				);
				assert.ok(!result.includes("function() {"));
			});
	});

	test("uses js-beautify defaults when the option is omitted", () => {
		return new Formatter({})
			.formatContent(scriptContent)
			.then((result: any) => {
				assert.ok(
					result.includes("function() {"),
					"expected js-beautify's default (no space) to be preserved",
				);
			});
	});
});
