import assert from "node:assert";
import { describe, test } from "vitest";
import { BladeFormatter } from "../../src/main.js";

describe("formatter mixed content test", () => {
	test("mixed html tag and directive #5", async () => {
		const content = [
			`@extends('dashboard')`,
			"",
			`@section('content')`,
			"@if( $member->isAdmin() )",
			`<div class="focus">`,
			"@endif",
			"<span>Test!</span>",
			"@if( $member->isAdmin() )",
			"</div>",
			"@endif",
			"@endsection",
			"",
		].join("\n");

		const expected = [
			`@extends('dashboard')`,
			"",
			`@section('content')`,
			"    @if ($member->isAdmin())",
			`        <div class="focus">`,
			"    @endif",
			"    <span>Test!</span>",
			"    @if ($member->isAdmin())",
			"        </div>",
			"    @endif",
			"@endsection",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});
});
