import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { BladeFormatter } from "../../src/main.js";
import * as cmd from "../support/cmd";
import * as util from "../support/util";

describe("formatter inlined test", () => {
	test("directive in html attribute should not occurs error", async () => {
		const content = [
			"@if (count($topics))",
			`    <ul class="list-group border-0">`,
			"        @foreach ($topics as $topic)",
			`            <li class="list-group-item border-right-0 border-left-0 @if ($loop->first) border-top-0 @endif"></li>`,
			"        @endforeach",
			"    </ul>",
			"@endif",
		].join("\n");

		const expected = [
			"@if (count($topics))",
			`    <ul class="list-group border-0">`,
			"        @foreach ($topics as $topic)",
			"            <li",
			`                class="list-group-item border-right-0 border-left-0 @if ($loop->first) border-top-0 @endif">`,
			"            </li>",
			"        @endforeach",
			"    </ul>",
			"@endif",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should consider directive in html tag", async () => {
		const cmdResult = await cmd.execute(
			path.resolve("bin", "blade-formatter.js"),
			[path.resolve("__tests__", "fixtures", "inline_php_tag.blade.php")],
		);

		const formatted = fs.readFileSync(
			path.resolve(
				"__tests__",
				"fixtures",
				"formatted_inline_php_tag.blade.php",
			),
		);

		expect(cmdResult).toEqual(formatted.toString("utf-8"));
	});

	test("should not occurs error on inline if to end directive on long line", async () => {
		const content = [
			"<div>",
			`@if (count($users) && $users->has('friends')) {{ $user->name }} @endif`,
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			`    @if (count($users) && $users->has('friends'))`,
			"        {{ $user->name }}",
			"    @endif",
			"</div>",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("raw php inlined comment #493", async () => {
		const content = [
			"<?php /** foo */ echo 1; ?>",
			"<?php /** @var AppModelsGame $game */ ?>",
			`@foreach ($preview['new'] as $game)`,
			`    <x-game.preview.new :game="$game" />`,
			"@endforeach",
		].join("\n");

		const expected = [
			"<?php /** foo */ echo 1; ?>",
			"<?php /** @var AppModelsGame $game */ ?>",
			`@foreach ($preview['new'] as $game)`,
			`    <x-game.preview.new :game="$game" />`,
			"@endforeach",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("inline @json directive", async () => {
		const content = [
			`@section('footer')`,
			"    <script>",
			"        Object.assign(lang, @json([",
			`            'name' => __('name'),`,
			`            'current' => __('current'),`,
			"        ]));",
			"    </script>",
			"@endsection",
		].join("\n");

		const expected = [
			`@section('footer')`,
			"    <script>",
			"        Object.assign(lang, @json([",
			`            'name' => __('name'),`,
			`            'current' => __('current'),`,
			"        ]));",
			"    </script>",
			"@endsection",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
