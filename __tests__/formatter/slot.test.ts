import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter slot test", () => {
	test("slot without endslot directive https://github.com/shufo/vscode-blade-formatter/issues/304", async () => {
		const content = [
			`@component('components.article.intro')`,
			`    @slot('date', $article->formatDate)`,
			`        @slot('read_mins', $article->readTime)`,
			"            @if ($author)",
			`                @slot('authors', [['link' => $author_link, 'name' => $author]])`,
			"                @endif",
			`                @slot('intro_text')`,
			"                    {!! $article->introduction !!}",
			"                @endslot",
			"            @endcomponent",
		].join("\n");

		const expected = [
			`@component('components.article.intro')`,
			`    @slot('date', $article->formatDate)`,
			`    @slot('read_mins', $article->readTime)`,
			"    @if ($author)",
			`        @slot('authors', [['link' => $author_link, 'name' => $author]])`,
			"    @endif",
			`    @slot('intro_text')`,
			"        {!! $article->introduction !!}",
			"    @endslot",
			"@endcomponent",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("unmatched x-slot close tag", async () => {
		const content = [
			"<x-alert>",
			`    <x-slot:title name="f>oo"`,
			`value="bar">`,
			"        Foo bar",
			"    </x-slot>",
			`          <x-slot name="foo">`,
			"           Foo bar",
			"    </x-slot:title>",
			"          <x-slot:title>",
			"        Foo bar",
			"    </x-slot:title>",
			"        <x-slot:foo>",
			"        Foo bar",
			"              <x-slot:bar>",
			"            Foo bar",
			"            </x-slot>",
			"            Foo bar",
			"        </x-slot>",
			"      </x-alert>",
		].join("\n");

		const expected = [
			"<x-alert>",
			`    <x-slot:title name="f>oo" value="bar">`,
			"        Foo bar",
			"    </x-slot>",
			`    <x-slot name="foo">`,
			"        Foo bar",
			"    </x-slot:title>",
			"    <x-slot:title>",
			"        Foo bar",
			"    </x-slot:title>",
			"    <x-slot:foo>",
			"        Foo bar",
			"        <x-slot:bar>",
			"            Foo bar",
			"        </x-slot>",
			"        Foo bar",
			"    </x-slot>",
			"</x-alert>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
