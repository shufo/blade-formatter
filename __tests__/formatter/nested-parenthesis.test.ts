import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter nested parenthesis test", () => {
	test("inline nested parenthesis #350", async () => {
		const content = [
			"@if ($user)",
			"    <div>",
			`    {{ asset(auth()->user()->getUserMedia('first', 'second')) }}`,
			`    {{ asset4(asset1(asset2(asset3(auth()->user($aaaa['bbb'])->aaa("aaa"))))) }}`,
			`    {{ asset(auth()->user($aaaa["bbb"])->aaa('aaa')) }}`,
			"    {{ $user }}",
			`    {{ auth()->user( ["bar","ccc"])->foo("aaa")  }}`,
			`    {{ asset(auth()->user(['bar', 'ccc'])->tooooooooooooooooooooooooooooooooooolongmethod('aaa')->chained()->tooooooooooooooooooooooooooo()->long()) }}`,
			"    </div>",
			"@endif",
		].join("\n");

		const expected = [
			"@if ($user)",
			"    <div>",
			`        {{ asset(auth()->user()->getUserMedia('first', 'second')) }}`,
			`        {{ asset4(asset1(asset2(asset3(auth()->user($aaaa['bbb'])->aaa('aaa'))))) }}`,
			`        {{ asset(auth()->user($aaaa['bbb'])->aaa('aaa')) }}`,
			"        {{ $user }}",
			`        {{ auth()->user(['bar', 'ccc'])->foo('aaa') }}`,
			`        {{ asset(auth()->user(['bar', 'ccc'])->tooooooooooooooooooooooooooooooooooolongmethod('aaa')->chained()->tooooooooooooooooooooooooooo()->long()) }}`,
			"    </div>",
			"@endif",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("3 more level nested parenthesis #340", async () => {
		const content = [
			"<div>",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"    foo",
			"    @endif",
			"    @if (count($foo->bar(Auth::user($baz->method()), Request::path())) >= 1)",
			"    foo",
			"    @endif",
			"    @foreach (Auth::users($my->users($as->foo)) as $user)",
			"    foo",
			"    @endif",
			"    @isset($user->foo($user->bar($user->baz())))",
			"    foo",
			"    @endisset",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"        foo",
			"    @endif",
			"    @if (count($foo->bar(Auth::user($baz->method()), Request::path())) >= 1)",
			"        foo",
			"    @endif",
			"    @foreach (Auth::users($my->users($as->foo)) as $user)",
			"        foo",
			"    @endif",
			"    @isset($user->foo($user->bar($user->baz())))",
			"        foo",
			"    @endisset",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
