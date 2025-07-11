import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter components test", () => {
	test("component attribute name #346", async () => {
		let content = [`<x-button btnClass="XXXXXX" />`].join("\n");
		let expected = [`<x-button btnClass="XXXXXX" />`, ""].join("\n");

		util.doubleFormatCheck(content, expected);

		content = ["<x-button ", `    btnClass="XXXXXX"`, "/>"].join("\n");
		expected = [`<x-button btnClass="XXXXXX" />`, ""].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("directive inside component attribute", async () => {
		const content = [
			`@section('body')`,
			`    <x-alert :live="@env('production')" />`,
			"@endsection",
			`<x-button ::class="{ danger: [1, 2, 3] }">`,
			"    Submit",
			"</x-button>",
		].join("\n");

		const expected = [
			`@section('body')`,
			`    <x-alert :live="@env('production')" />`,
			"@endsection",
			`<x-button ::class="{ danger: [1, 2, 3] }">`,
			"    Submit",
			"</x-button>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("colon prefixed attribute #552", async () => {
		const content = [
			"<x-app-layout>",
			"@if ($user)",
			"Is HR",
			"@endif",
			"</x-app-layout>",
			`<tbody x-data class="divide-y divide-gray-200 bg-gray-50">`,
			`<template x-for="shipment in in_progress" :key="shipment.id" />`,
			"</tbody>",
		].join("\n");

		const expected = [
			"<x-app-layout>",
			"    @if ($user)",
			"        Is HR",
			"    @endif",
			"</x-app-layout>",
			`<tbody x-data class="divide-y divide-gray-200 bg-gray-50">`,
			`    <template x-for="shipment in in_progress" :key="shipment.id" />`,
			"</tbody>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@component directive indentation", async () => {
		const content = [
			"<div>",
			"        <div>",
			`@component('path.to.component', [`,
			`    'title' => 'My title',`,
			`'description' => '',`,
			`    'header' => [`,
			`        'transparent' => true,`,
			"                  ],",
			`  'footer' => [`,
			`        'hide' => true,`,
			"    ],",
			"            ])",
			"    <div>",
			"        some content",
			"            </div>",
			"          @endcomponent",
			"</div>",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    <div>",
			`        @component('path.to.component', [`,
			`            'title' => 'My title',`,
			`            'description' => '',`,
			`            'header' => [`,
			`                'transparent' => true,`,
			"            ],",
			`            'footer' => [`,
			`                'hide' => true,`,
			"            ],",
			"        ])",
			"            <div>",
			"                some content",
			"            </div>",
			"        @endcomponent",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("Without component prefix declared, return syntax incorrect code", async () => {
		const content = ['<foo:button :key="$foo->bar">', "</foo:button>"].join(
			"\n",
		);

		const expected = [
			'<foo:button :key="$foo->bar">',
			"</foo:button>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			componentPrefix: [],
		});
	});

	test("Component prefix option correct format", async () => {
		const content = ['<foo:button :key="$foo->bar">', "</foo:button>"].join(
			"\n",
		);

		const expected = [
			'<foo:button :key="$foo->bar">',
			"</foo:button>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			componentPrefix: ["foo:"],
		});
	});
});
