import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter js test", () => {
	test("basic @js directive usage", async () => {
		const content = [`<div x-data="@js($data, JSON_FORCE_OBJECT)"></div>`].join(
			"\n",
		);

		const expected = [
			`<div x-data="@js($data, JSON_FORCE_OBJECT)"></div>`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@js directive in script tag", async () => {
		const content = [
			"<script>",
			"    @foreach ($files as $file)",
			"        addUpload(",
			"            @js($file->id),",
			"            @js($file->name),",
			"            @js($file->hash),",
			"            $('#article_inline_uploads')",
			"        );",
			"    @endforeach",
			"</script>",
		].join("\n");

		const expected = [
			"<script>",
			"    @foreach ($files as $file)",
			"        addUpload(",
			"            @js($file->id),",
			"            @js($file->name),",
			"            @js($file->hash),",
			"            $('#article_inline_uploads')",
			"        );",
			"    @endforeach",
			"</script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
