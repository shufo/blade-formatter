import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter ignore test", () => {
	test("ignore formatting between blade-formatter-disable and blade-formatter-enable", async () => {
		const content = [
			"@if ($condition < 1)",
			"                {{ $user }}",
			"    {{-- blade-formatter-disable --}}",
			"                {{ $foo}}",
			"    {{-- blade-formatter-enable --}}",
			"@elseif (!condition())",
			"          {{ $user }}",
			"@elseif ($condition < 3)",
			"              {{ $user }}",
			"    {{-- blade-formatter-disable --}}",
			"              {{ $bar}}",
			"    {{-- blade-formatter-enable --}}",
			"@endif",
		].join("\n");

		const expected = [
			"@if ($condition < 1)",
			"    {{ $user }}",
			"    {{-- blade-formatter-disable --}}",
			"                {{ $foo}}",
			"    {{-- blade-formatter-enable --}}",
			"@elseif (!condition())",
			"    {{ $user }}",
			"@elseif ($condition < 3)",
			"    {{ $user }}",
			"    {{-- blade-formatter-disable --}}",
			"              {{ $bar}}",
			"    {{-- blade-formatter-enable --}}",
			"@endif",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("ignore formatting after blade-formatter-disable-next-line", async () => {
		const content = [
			"<div>",
			"@if ($condition < 1)",
			"    {{-- blade-formatter-disable-next-line --}}",
			"                {{ $user }}",
			"@elseif ($condition < 3)",
			"              {{ $user }}",
			"@endif",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    @if ($condition < 1)",
			"        {{-- blade-formatter-disable-next-line --}}",
			"                {{ $user }}",
			"    @elseif ($condition < 3)",
			"        {{ $user }}",
			"    @endif",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("ignore formatting entire file if blade-formatter-disable on a first line", async () => {
		const content = [
			"{{-- blade-formatter-disable --}}",
			"<div>",
			"{{-- blade-formatter-disable --}}",
			"                {{ $foo}}",
			"{{-- blade-formatter-enable --}}",
			"@if ($condition < 1)",
			"    {{-- blade-formatter-disable-next-line --}}",
			"                {{ $user }}",
			"@elseif ($condition < 3)",
			"              {{ $user }}",
			"@endif",
			"</div>",
			"",
		].join("\n");

		const expected = [
			"{{-- blade-formatter-disable --}}",
			"<div>",
			"{{-- blade-formatter-disable --}}",
			"                {{ $foo}}",
			"{{-- blade-formatter-enable --}}",
			"@if ($condition < 1)",
			"    {{-- blade-formatter-disable-next-line --}}",
			"                {{ $user }}",
			"@elseif ($condition < 3)",
			"              {{ $user }}",
			"@endif",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("prettier ignore with html and blade comments", async () => {
		const content = [
			"<!-- prettier-ignore-start -->",
			`<div id="foo-bar-baz"          class="bar-foo-baz" title="a sample title" data-foo="bar" data-bar="baz">`,
			"lorem ipsum dolor sit amet",
			"<div>",
			"foo",
			"</div>",
			"</div>",
			"<!-- prettier-ignore-end -->",
			"{{-- prettier-ignore-start --}}",
			`<div id="foo-bar-baz"          class="bar-foo-baz" title="a sample title" data-foo="bar" data-bar="baz">`,
			"lorem ipsum dolor sit amet",
			"<div>",
			"foo",
			"</div>",
			"</div>",
			"{{-- prettier-ignore-end --}}",
			"",
			"<!-- prettier-ignore -->",
			`<span id="foo-bar-baz"          class="bar-foo-baz" title="a sample title" data-foo="bar" data-bar="baz" />`,
			"",
			"{{-- prettier-ignore --}}",
			`<span id="foo-bar-baz"          class="bar-foo-baz" title="a sample title" data-foo="bar" data-bar="baz" />`,
		].join("\n");

		const expected = [
			"<!-- prettier-ignore-start -->",
			`<div id="foo-bar-baz"          class="bar-foo-baz" title="a sample title" data-foo="bar" data-bar="baz">`,
			"lorem ipsum dolor sit amet",
			"<div>",
			"foo",
			"</div>",
			"</div>",
			"<!-- prettier-ignore-end -->",
			"{{-- prettier-ignore-start --}}",
			`<div id="foo-bar-baz"          class="bar-foo-baz" title="a sample title" data-foo="bar" data-bar="baz">`,
			"lorem ipsum dolor sit amet",
			"<div>",
			"foo",
			"</div>",
			"</div>",
			"{{-- prettier-ignore-end --}}",
			"",
			"<!-- prettier-ignore -->",
			`<span id="foo-bar-baz"          class="bar-foo-baz" title="a sample title" data-foo="bar" data-bar="baz" />`,
			"",
			"{{-- prettier-ignore --}}",
			`<span id="foo-bar-baz"          class="bar-foo-baz" title="a sample title" data-foo="bar" data-bar="baz" />`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

  test("prettier ignore within front matter blocks", async () => {
    const content = [
      "---",
      "# prettier-ignore-start",
      "foo: bar",
      "    bar: baz",
      "# prettier-ignore-end",
      "---",
      "",
      "---",
      "foo: bar",
      "# prettier-ignore",
      "    bar: baz",
      "---",
      "",
      "---",
      "foo: bar",
      "    bar: baz",
      "---",
    ].join("\n");

    const expected = [
      "---",
      "# prettier-ignore-start",
      "foo: bar",
      "    bar: baz",
      "# prettier-ignore-end",
      "---",
      "",
      "---",
      "foo: bar",
      "# prettier-ignore",
      "    bar: baz",
      "---",
      "",
      "---",
      "foo: bar",
      "bar: baz",
      "---",
      "",
    ].join("\n");

    await util.doubleFormatCheck(content, expected);
  });
});
