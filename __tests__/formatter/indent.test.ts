import assert from "node:assert";
import { describe, test } from "vitest";
import { Formatter } from "../../src/main.js";

const formatter = () => {
	return new Formatter({ indentSize: 4 });
};

describe("indent formatter test", () => {
	test("basic blade directive indent", () => {
		const content = [
			"<section>",
			"<div>",
			"@if($user)",
			"{{ $user->name }}",
			"@endif",
			"</div>",
			"</section>",
			"",
		].join("\n");

		const expected = [
			"<section>",
			"    <div>",
			"        @if ($user)",
			"            {{ $user->name }}",
			"        @endif",
			"    </div>",
			"</section>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("nested directive indent", () => {
		const content = [
			"<section>",
			"@foreach($users as $user)",
			"@if($user)",
			"{{ $user->name }}",
			"@endif",
			"@endforeach",
			"</section>",
			"",
		].join("\n");

		const expected = [
			"<section>",
			"    @foreach ($users as $user)",
			"        @if ($user)",
			"            {{ $user->name }}",
			"        @endif",
			"    @endforeach",
			"</section>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});
});
