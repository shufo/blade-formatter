import { describe, expect, test } from "vitest";
import { BladeFormatter } from "../../src/main.js";
import * as util from "../support/util";

describe("formatter exception test", () => {
	test("formatter throws exception on syntax error", async () => {
		const content = [
			`@permission('post.edit')`,
			`<button class="btn btn-primary" onclick="editPost({{ users('foo) }})">Edit Post</button>`,
			"@endpermission",
		].join("\n");

		await expect(new BladeFormatter().format(content)).rejects.toThrow(
			"SyntaxError",
		);
	});

	test("it should not throw exception even if inline component attribute has syntax error", async () => {
		const content = [`<x-h1 :variable1="," />`].join("\n");
		const expected = [`<x-h1 :variable1="," />`, ""].join("\n");

		await util.doubleFormatCheck(content, expected);
		await expect(new BladeFormatter().format(content)).resolves.not.toThrow(
			"SyntaxError",
		);
	});

	test("syntax error on multiline component attribute throws a syntax error", async () => {
		const content = [
			`<x-h1 :variable1="[`,
			`    'key1' => 123`,
			`    'key2' => 'value2',`,
			`]" />`,
		].join("\n");

		await expect(new BladeFormatter().format(content)).rejects.toThrow(
			"SyntaxError",
		);
	});

	test("it should throw exception when unclosed parentheses exists", async () => {
		const content = [
			`@section("content"`,
			"  <p>dummy</p>",
			"@endsection",
		].join("\n");

		await expect(new BladeFormatter().format(content)).rejects.toThrow(
			"SyntaxError",
		);
	});
});
