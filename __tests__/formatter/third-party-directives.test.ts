import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter third party directives test", () => {
	test("support laravel-permission directives", async () => {
		const directives = [
			{
				start: "@role",
				end: "@endrole",
			},
			{
				start: "@hasrole",
				end: "@endhasrole",
			},
			{
				start: "@hasanyrole",
				end: "@endhasanyrole",
			},
			{
				start: "@hasallroles",
				end: "@endhasallroles",
			},
			{
				start: "@unlessrole",
				end: "@endunlessrole",
			},
			{
				start: "@hasexactroles",
				end: "@endhasexactroles",
			},
		];

		for (const target of directives) {
			const content = [
				`<div class="">`,
				`${target.start}('foo')`,
				"<div>bar</div>",
				`${target.end}`,
				"</div>",
			].join("\n");
			const expected = [
				`<div class="">`,
				`    ${target.start}('foo')`,
				"        <div>bar</div>",
				`    ${target.end}`,
				"</div>",
				"",
			].join("\n");

			await util.doubleFormatCheck(content, expected);
		}
	});

	test("@permission directive", async () => {
		const content = [
			`@permission('post.edit')`,
			`<button class="btn btn-primary" onclick="editPost({{ $id }})">Edit Post</button>`,
			"@endpermission",
		].join("\n");

		const expected = [
			`@permission('post.edit')`,
			`    <button class="btn btn-primary" onclick="editPost({{ $id }})">Edit Post</button>`,
			"@endpermission",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
