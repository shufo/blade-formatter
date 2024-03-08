import assert from "node:assert";
import path from "node:path";
import { Formatter, type FormatterOption } from "../../../src/main";
import { describe, test } from "vitest";

const formatter = () => {
	return new Formatter({ indentSize: 4 });
};

describe("commonjs", () => {
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
			.then((result: string) => {
				assert.equal(result, expected);
			});
	});

	test("sort tailwindcss classes", () => {
		const content = [
			`<div class="justify-center z-50 z-10 z-20 container foo text-left md:text-center">`,
			"</div>",
		].join("\n");

		const expected = [
			`<div class="foo container z-10 z-20 z-50 justify-center text-left md:text-center">`,
			"</div>",
			"",
		].join("\n");

		const options: FormatterOption = {
			sortTailwindcssClasses: true,
			tailwindcssConfigPath: path.resolve(__dirname, "tailwind.config.js"),
		};

		return new Formatter(options)
			.formatContent(content)
			.then((result: string) => {
				assert.equal(result, expected);
			});
	});
});
