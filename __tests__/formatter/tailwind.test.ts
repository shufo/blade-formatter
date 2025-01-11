import assert from "node:assert";
import path from "node:path";
import { describe, test } from "vitest";
import { Formatter } from "../../src/main.js";
import * as util from "../support/util";

describe("formatter tailwind test", () => {
	test("sort tailwindcss classs option can work", () => {
		const content = [
			`<div class="justify-center z-10 z-20 z-50 container text-left foo md:text-center">`,
			"</div>",
		].join("\n");
		const expected = [
			`<div class="foo container z-10 z-20 z-50 justify-center text-left md:text-center">`,
			"</div>",
			"",
		].join("\n");

		return new Formatter({ sortTailwindcssClasses: true })
			.formatContent(content)
			.then((result: string) => {
				assert.equal(result, expected);
			});
	});

	test("sort tailwindcss classs with various character", () => {
		const content = [
			`<div class="m-5 md:tw-mx-[1rem]   tw-mx-1 foo"></div>`,
		].join("\n");
		const expected = [
			`<div class="md:tw-mx-[1rem] tw-mx-1 foo m-5"></div>`,
			"",
		].join("\n");

		return new Formatter({ sortTailwindcssClasses: true })
			.formatContent(content)
			.then((result: string) => {
				assert.equal(result, expected);
			});
	});

	test("long tailwindcss classs", async () => {
		const content = [
			`<div class="container z-50                                                      z-10 z-20 justify-center text-left foo md:text-center">`,
			"</div>",
		].join("\n");

		const expected = [
			`<div class="foo container z-10 z-20 z-50 justify-center text-left md:text-center">`,
			"</div>",
			"",
		].join("\n");

		const result = await new Formatter({
			sortTailwindcssClasses: true,
		}).formatContent(content);
		assert.equal(result, expected);
		const result2 = await new Formatter({
			sortTailwindcssClasses: true,
		}).formatContent(result);
		assert.equal(result2, result);
	});

	test("tailwindcss classs with new line", async () => {
		const content = [
			`<div class="container z-50`,
			`z-10 z-20 justify-center text-left foo md:text-center">`,
			"</div>",
		].join("\n");

		const expected = [
			`<div class="foo container z-10 z-20 z-50 justify-center text-left md:text-center">`,
			"</div>",
			"",
		].join("\n");

		const result = await new Formatter({
			sortTailwindcssClasses: true,
		}).formatContent(content);
		assert.equal(result, expected);
		const result2 = await new Formatter({
			sortTailwindcssClasses: true,
		}).formatContent(result);
		assert.equal(result2, result);
	});

	test("inline directive with tailwindcss class sort", async () => {
		const content = [
			`<div class="@auth bg-10 @endauth relative h-10 w-10"></div>`,
			`<div class="relative h-10 w-10 @auth bg-10 @endauth "></div>`,
			`<div class="@auth @endauth relative h-10 w-10"></div>`,
			`<div class="@auth     @endauth relative h-10 w-10"></div>`,
			`<div class="@if (true) bg-neutral-100 @endif relative h-10 w-10"></div>`,
		].join("\n");

		const expected = [
			`<div class="@auth bg-10 @endauth relative h-10 w-10"></div>`,
			`<div class="@auth bg-10 @endauth relative h-10 w-10"></div>`,
			`<div class="@auth @endauth relative h-10 w-10"></div>`,
			`<div class="@auth  @endauth relative h-10 w-10"></div>`,
			`<div class="@if (true) bg-neutral-100 @endif relative h-10 w-10"></div>`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			sortTailwindcssClasses: true,
		});
	});

	test("line breaked inline directive with tailwindcss class sort", async () => {
		const content = [
			"<input",
			"    @unless($hasMask())",
			"",
			`        {{ $applyStateBindingModifiers('wire:model') }}="{{ $getStatePath() }}"`,
			`         type="{{ $getType() }}"`,
			"    @else",
			`        x-data="textInputFormComponent({`,
			`            {{ $hasMask() ? "getMaskOptionsUsing: (IMask) => ({$getJsonMaskConfiguration()})," : null }}`,
			"            state: $wire.{{ $isLazy()",
			`                ? 'entangle(' . $getStatePath() . ').defer'`,
			`                : $applyStateBindingModifiers('entangle(' . $getStatePath() . ')') }},`,
			`           })"`,
			`        type="text"`,
			"        wire:ignore",
			`        @if ($isLazy()) x-on:blur="$wire.$refresh" @endif`,
			"        {{ $getExtraAlpineAttributeBag() }}",
			"    @endunless />",
		].join("\n");

		const expected = [
			"<input",
			"    @unless ($hasMask())",
			"",
			`        {{ $applyStateBindingModifiers('wire:model') }}="{{ $getStatePath() }}"`,
			`         type="{{ $getType() }}"`,
			"    @else",
			`        x-data="textInputFormComponent({`,
			`            {{ $hasMask() ? "getMaskOptionsUsing: (IMask) => ({$getJsonMaskConfiguration()})," : null }}`,
			"            state: $wire.{{ $isLazy()",
			`                ? 'entangle(' . $getStatePath() . ').defer'`,
			`                : $applyStateBindingModifiers('entangle(' . $getStatePath() . ')') }},`,
			`           })"`,
			`        type="text"`,
			"        wire:ignore",
			`        @if ($isLazy()) x-on:blur="$wire.$refresh" @endif`,
			"        {{ $getExtraAlpineAttributeBag() }}",
			"    @endunless />",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			sortHtmlAttributes: "alphabetical",
		});
	});

	test("tailwind config path option", async () => {
		const content = [
			`<div class="xxxl:col-end-8 col-start-2 col-end-11 md:col-end-12 xl:col-end-10">`,
			`    <h1 class="text-white">Random Stuff</h1>`,
			"</div>",
		].join("\n");

		const expected = [
			`<div class="col-start-2 col-end-11 md:col-end-12 xl:col-end-10 xxxl:col-end-8">`,
			`    <h1 class="text-white">Random Stuff</h1>`,
			"</div>",
			"",
		].join("\n");

		const configPath = path.resolve(
			"__tests__",
			"fixtures",
			"tailwind",
			"tailwind.config.example.js",
		);
		await util.doubleFormatCheck(content, expected, {
			sortTailwindcssClasses: true,
			tailwindcssConfigPath: configPath,
		});
	});

	test("tailwind config object option", async () => {
		const content = [
			`<div class="xxxl:col-end-8 col-start-2 col-end-11 md:col-end-12 xl:col-end-10">`,
			`    <h1 class="text-white">Random Stuff</h1>`,
			"</div>",
		].join("\n");

		const expected = [
			`<div class="col-start-2 col-end-11 md:col-end-12 xl:col-end-10 xxxl:col-end-8">`,
			`    <h1 class="text-white">Random Stuff</h1>`,
			"</div>",
			"",
		].join("\n");

		const config = require(
			path.resolve(
				"__tests__",
				"fixtures",
				"tailwind",
				"tailwind.config.example.js",
			),
		);
		await util.doubleFormatCheck(content, expected, {
			sortTailwindcssClasses: true,
			tailwindcssConfig: config,
		});
	});
});
