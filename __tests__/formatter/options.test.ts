import assert from "node:assert";
import { describe, expect, test } from "vitest";
import { BladeFormatter } from "../../src/main.js";
import * as util from "../support/util";

describe("formatter options test", () => {
	test("force expand multilines", async () => {
		const content = [
			'<div id="username" class="min-h-48 flex flex-col justify-center">',
			"@if (Auth::check())",
			"@php($user = Auth::user())",
			"{{ $user->name }}",
			"@endif",
			"</div>",
		].join("\n");

		const expected = [
			"<div",
			'    id="username"',
			'    class="min-h-48 flex flex-col justify-center"',
			">",
			"    @if (Auth::check())",
			"        @php($user = Auth::user())",
			"        {{ $user->name }}",
			"    @endif",
			"</div>",
			"",
		].join("\n");

		return new BladeFormatter({ wrapAttributes: "force-expand-multiline" })
			.format(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("textarea wrapping https://github.com/shufo/vscode-blade-formatter/issues/414", async () => {
		const content = [
			`<body class="bg-background font-sans text-sm text-gray-900"`,
			`      class="bg-background font-sans text-sm text-gray-900">`,
			`    <form action="#"`,
			`          method="POST"`,
			`          class="space-y-4 py-6">`,
			"        ...",
			"        <!-- Idea Description -->",
			"        <div>",
			`            <textarea class="good-rounded good-border w-full bg-gray-100 px-4 py-2 text-sm"`,
			`                      name="idea_description"`,
			`                      id="idea-description"`,
			`                      cols="30"`,
			`                      rows="4"`,
			`                      data="{'aa' => '123'}" x-foo="good-rounded good-border w-full bg-gray-100 px-4 py-2 text-sm" x-bar="321"`,
			`            data-x="aa123">               </textarea>`,
			"        </div>",
			"    </form>",
			"</body>",
		].join("\n");

		const alignedMultipleExpected = [
			`<body class="bg-background font-sans text-sm text-gray-900" class="bg-background font-sans text-sm text-gray-900">`,
			`    <form action="#" method="POST" class="space-y-4 py-6">`,
			"        ...",
			"        <!-- Idea Description -->",
			"        <div>",
			`            <textarea class="good-rounded good-border w-full bg-gray-100 px-4 py-2 text-sm" name="idea_description"`,
			`                      id="idea-description" cols="30" rows="4" data="{'aa' => '123'}"`,
			`                      x-foo="good-rounded good-border w-full bg-gray-100 px-4 py-2 text-sm" x-bar="321" data-x="aa123">               </textarea>`,
			"        </div>",
			"    </form>",
			"</body>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, alignedMultipleExpected, {
			wrapAttributes: "aligned-multiple",
		});

		const forceAlignedExpected = [
			`<body class="bg-background font-sans text-sm text-gray-900"`,
			`      class="bg-background font-sans text-sm text-gray-900">`,
			`    <form action="#"`,
			`          method="POST"`,
			`          class="space-y-4 py-6">`,
			"        ...",
			"        <!-- Idea Description -->",
			"        <div>",
			`            <textarea class="good-rounded good-border w-full bg-gray-100 px-4 py-2 text-sm"`,
			`                      name="idea_description"`,
			`                      id="idea-description"`,
			`                      cols="30"`,
			`                      rows="4"`,
			`                      data="{'aa' => '123'}"`,
			`                      x-foo="good-rounded good-border w-full bg-gray-100 px-4 py-2 text-sm"`,
			`                      x-bar="321"`,
			`                      data-x="aa123">               </textarea>`,
			"        </div>",
			"    </form>",
			"</body>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, forceAlignedExpected, {
			wrapAttributes: "force-aligned",
		});
	});

	test("no multiple empty lines formatter option", async () => {
		// prettier-ignore
		const content = ["foo", "", "", "bar", "", "", "", "baz"].join("\n");

		// prettier-ignore
		const expected = ["foo", "", "bar", "", "baz", ""].join("\n");

		await util.doubleFormatCheck(content, expected, {
			noMultipleEmptyLines: true,
		});
	});

	test("disable no multiple empty lines formatter option", async () => {
		// prettier-ignore
		const content = ["foo", "", "", "bar", "", "", "", "baz"].join("\n");

		// prettier-ignore
		const expected = ["foo", "", "", "bar", "", "", "", "baz", ""].join("\n");

		await util.doubleFormatCheck(content, expected, {
			noMultipleEmptyLines: false,
		});
	});

	test("it should use tabs inside script tag if useTabs option passed", async () => {
		const content = [
			"<script>",
			"    function addCol() {",
			`        $.post('budget.ajaxColumn', {`,
			`            '_token': '{{ csrf_token() }}'`,
			"        }, function(data) {",
			`            $('.budget-lanes').append('test');`,
			"        }).fail(function(jqXHR, textStatus) {",
			`            alert('An error occurred. Please try again.')`,
			"        })",
			"    }",
			"</script>",
		].join("\n");

		const expected = [
			"<script>",
			"				function addCol() {",
			`								$.post('budget.ajaxColumn', {`,
			`												'_token': '{{ csrf_token() }}'`,
			"								}, function(data) {",
			`												$('.budget-lanes').append('test');`,
			"								}).fail(function(jqXHR, textStatus) {",
			`												alert('An error occurred. Please try again.')`,
			"								})",
			"				}",
			"</script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, { useTabs: true });
	});

	test("it should order html attributes if --sort-html-attributes option passed", async () => {
		const content = [
			`<div name="myname" aria-disabled="true" id="myid" class="myclass" src="other">`,
			"foo",
			"</div>",
		].join("\n");

		const expected = [
			`<div class="myclass" id="myid" name="myname" aria-disabled="true" src="other">`,
			"    foo",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			sortHtmlAttributes: "idiomatic",
		});
	});

	test("it should use tab for indent inside inline directive", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        <div @class([",
			`            'some class',`,
			`            'some other class',`,
			`            'another class',`,
			`            'some class',`,
			`            'some other class',`,
			`            'another class',`,
			"        ])></div>",
			"    </div>",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"	<div>",
			"		<div @class([",
			`			'some class',`,
			`			'some other class',`,
			`			'another class',`,
			`			'some class',`,
			`			'some other class',`,
			`			'another class',`,
			"		])></div>",
			"	</div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			useTabs: true,
			indentSize: 1,
		});

		const expected2 = [
			"<div>",
			"		<div>",
			"				<div @class([",
			`						'some class',`,
			`						'some other class',`,
			`						'another class',`,
			`						'some class',`,
			`						'some other class',`,
			`						'another class',`,
			"				])></div>",
			"		</div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected2, {
			useTabs: true,
			indentSize: 2,
		});
	});

	test("no php syntax check option", async () => {
		const content = [
			`{{ 'john' |ucfirst | substr:0,1 }}`,
			"@if (foo)",
			"foo",
			"@endif",
		].join("\n");

		const expected = [
			`{{ 'john' |ucfirst | substr:0,1 }}`,
			"@if (foo)",
			"    foo",
			"@endif",
			"",
		].join("\n");

		const options = { noPhpSyntaxCheck: true };
		await util.doubleFormatCheck(content, expected, options);
		await expect(
			new BladeFormatter(options).format(content),
		).resolves.not.toThrow("SyntaxError");
	});

	test("no php syntax check option with multi-lined inline directive", async () => {
		const content = [
			`@include('components.artwork_grid_item', [`,
			`    'item' => $item,`,
			`    'isotope_item_selector_class' => 'item',`,
			`    'class_names' => 'col-xs-6 px-5',`,
			`    'hide_dating' => true`,
			`    'hide_zoom' => true,`,
			"])",
		].join("\n");

		const expected = [
			`@include('components.artwork_grid_item', [`,
			`    'item' => $item,`,
			`    'isotope_item_selector_class' => 'item',`,
			`    'class_names' => 'col-xs-6 px-5',`,
			`    'hide_dating' => true`,
			`    'hide_zoom' => true,`,
			"])",
			"",
		].join("\n");

		const options = { noPhpSyntaxCheck: true };
		await util.doubleFormatCheck(content, expected, options);
	});

	test("customs html attributes order option", async () => {
		const content = [
			`<div name="myname" aria-disabled="true" id="myid" class="myclass" src="other">`,
			"foo",
			"</div>",
		].join("\n");

		const expected = [
			`<div id="myid" aria-disabled="true" src="other" class="myclass" name="myname">`,
			"    foo",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			sortHtmlAttributes: "custom",
			customHtmlAttributesOrder: ["id", "aria-.+", "src", "class"],
		});
	});

	test("--end-of-line option", async () => {
		const content = [
			`<div name="myname" aria-disabled="true" id="myid" class="myclass" src="other">`,
			"foo",
			"</div>",
		].join("\n");

		const expected = [
			`<div name="myname" aria-disabled="true" id="myid" class="myclass" src="other">`,
			"    foo",
			"</div>",
			"",
		].join("\r\n");

		await util.doubleFormatCheck(content, expected, {
			endOfLine: "CRLF",
		});
	});

	test("wrapAttributesMinAttrs option", async () => {
		const content = [
			`<div name="myname" aria-disabled="true" id="myid" class="myclass" src="other">`,
			"foo",
			"</div>",
		].join("\n");

		const expected = [
			"<div",
			`    name="myname"`,
			`    aria-disabled="true"`,
			`    id="myid"`,
			`    class="myclass"`,
			`    src="other"`,
			">",
			"    foo",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			wrapAttributesMinAttrs: 0,
			wrapAttributes: "force-expand-multiline",
		});
	});

	test("script tag with wrapAttributesMinAttrs option", async () => {
		const content = [
			`@push('scripts')`,
			"    <script>",
			`        $("#table-kategori").DataTable({});`,
			"    </script>",
			"@endpush",
		].join("\n");

		const expected = [
			`@push('scripts')`,
			"    <script>",
			`        $("#table-kategori").DataTable({});`,
			"    </script>",
			"@endpush",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			wrapAttributesMinAttrs: 0,
			wrapAttributes: "force-expand-multiline",
		});
	});

	test("nonnative script tag with wrapAttributesMinAttrs option", async () => {
		const content = [
			`@push('scripts')`,
			`    <script type="template">`,
			"        <div></div>",
			"    </script>",
			"@endpush",
		].join("\n");

		const expected = [
			`@push('scripts')`,
			`    <script type="template">`,
			"        <div></div>",
			"    </script>",
			"@endpush",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			wrapAttributesMinAttrs: 0,
			wrapAttributes: "force-expand-multiline",
		});
	});

	test("content sensitive html tag with wrapAttributesMinAttrs option", async () => {
		const content = [
			"<textarea>",
			"foo",
			"</textarea>",
			"<pre>",
			"bar",
			"</pre>",
		].join("\n");

		const expected = [
			"<textarea>",
			"foo",
			"</textarea>",
			"<pre>",
			"bar",
			"</pre>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			wrapAttributesMinAttrs: 0,
			wrapAttributes: "force-expand-multiline",
		});
	});

	test("extra liners option", async () => {
		const content = [
			"<html>",
			"<head>",
			`@section('header')`,
			"<title>",
			"foo",
			"</title>",
			"@endsection",
			"</head>",
			"<body>",
			`<button className="prettier-class" id="prettier-id" onClick={this.handleClick}>`,
			"Click Here",
			"</button>",
			"</body>",
			"</html>",
		].join("\n");

		const expected = [
			"<html>",
			"<head>",
			`    @section('header')`,
			"        <title>",
			"            foo",
			"        </title>",
			"    @endsection",
			"</head>",
			"<body>",
			`    <button className="prettier-class" id="prettier-id" onClick={this.handleClick}>`,
			"        Click Here",
			"    </button>",
			"</body>",
			"</html>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			extraLiners: [],
		});
	});
});
