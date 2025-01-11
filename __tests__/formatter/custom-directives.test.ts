import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter custom directives test", () => {
	test("@button directive", async () => {
		let content = [`@button(['class'=>'btn btn-primary p-btn-wide',])`].join(
			"\n",
		);
		let expected = [
			`@button(['class' => 'btn btn-primary p-btn-wide'])`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);

		content = [
			"@button([",
			`'class'=>'btn btn-primary p-btn-wide',`,
			"])",
		].join("\n");

		expected = [
			"@button([",
			`    'class' => 'btn btn-primary p-btn-wide',`,
			"])",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);

		content = [
			"<div>",
			`@button(['class' => 'btn btn-primary p-btn-wide',])`,
			"</div>",
		].join("\n");

		expected = [
			"<div>",
			`    @button(['class' => 'btn btn-primary p-btn-wide'])`,
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);

		content = [
			"<div>",
			"@button([",
			`'class' => 'btn btn-primary p-btn-wide',`,
			`'text' => 'Save',`,
			"])",
			"</div>",
		].join("\n");

		expected = [
			"<div>",
			"    @button([",
			`        'class' => 'btn btn-primary p-btn-wide',`,
			`        'text' => 'Save',`,
			"    ])",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);

		content = [
			"<div>",
			"<div>",
			"@button([",
			`'class' => 'btn btn-primary p-btn-wide',`,
			`'text' => 'Save',`,
			"])",
			"</div>",
			"</div>",
		].join("\n");

		expected = [
			"<div>",
			"    <div>",
			"        @button([",
			`            'class' => 'btn btn-primary p-btn-wide',`,
			`            'text' => 'Save',`,
			"        ])",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@set directive #542", async () => {
		const content = [
			`@set($myVariableWithVeryVeryVeryVeryVeryLongName = ($myFirstCondition || $mySecondCondition)?'My text':'My alternative text')`,
		].join("\n");

		const expected = [
			`@set($myVariableWithVeryVeryVeryVeryVeryLongName = $myFirstCondition || $mySecondCondition ? 'My text' : 'My alternative text')`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("line break custom directive", async () => {
		const content = [
			`@disk('local') foo @elsedisk('s3') bar @else baz @enddisk`,
		].join("\n");

		const expected = [
			`@disk('local')`,
			"    foo",
			`@elsedisk('s3')`,
			"    bar",
			"@else",
			"    baz",
			"@enddisk",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("upper case/lower case mixed custom directive", async () => {
		const content = [
			"<div>",
			"@largestFirst(1, 2)",
			"Lorem ipsum",
			"@elseLargestFirst(5, 3)",
			"dolor sit amet",
			"@else",
			"consectetur adipiscing elit",
			"@endLargestFirst",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    @largestFirst(1, 2)",
			"        Lorem ipsum",
			"    @elseLargestFirst(5, 3)",
			"        dolor sit amet",
			"    @else",
			"        consectetur adipiscing elit",
			"    @endLargestFirst",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("custom directive with raw string parameter should be work", async () => {
		const content = ["@popper(This should be work)"].join("\n");
		const expected = ["@popper(This should be work)", ""].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@formField directive", async () => {
		const content = [
			`@formField('input', [`,
			`'name' => 'page_title',`,
			`'label' => 'Page title',`,
			`'maxlength' => 200`,
			"])",
		].join("\n");

		const expected = [
			`@formField('input', [`,
			`    'name' => 'page_title',`,
			`    'label' => 'Page title',`,
			`    'maxlength' => 200,`,
			"])",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("comma should not inserted for lastline of inline custom directive ", async () => {
		const content = [
			"@livewire(",
			`    $block['path'],`,
			"    [",
			`        'componentSettings' => $block['properties'],`,
			`        'componentKey' => $block['key'],`,
			`        'site' => $site ?? null,`,
			`        'post' => $post ?? null,`,
			`        'theme' => $theme,`,
			`        'editing' => false,`,
			`        'preview' => $preview,`,
			"    ],",
			"    key($key)",
			")",
		].join("\n");

		const expected = [
			"@livewire(",
			`    $block['path'],`,
			"    [",
			`        'componentSettings' => $block['properties'],`,
			`        'componentKey' => $block['key'],`,
			`        'site' => $site ?? null,`,
			`        'post' => $post ?? null,`,
			`        'theme' => $theme,`,
			`        'editing' => false,`,
			`        'preview' => $preview,`,
			"    ],",
			"    key($key)",
			")",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
