import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter multi-line string literals test", () => {
	test("blade brace keeps its content", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        {{ __('First part of a long sentence that the author wrapped by hand,",
			"    second part of the sentence,",
			"                    third part of the sentence.') }}",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("raw blade brace keeps the content of a double-quoted string", async () => {
		const content = [
			"<div>",
			"    <div>",
			'        {!! __("Raw {$name} first part,',
			'            raw second part.") !!}',
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("include directive argument keeps its content", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        @include('partials.card', [",
			"            'description' => 'First part of a long description,",
			"                second part of the description.',",
			"        ])",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("string in a nested php tag keeps its content", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        <?php",
			"        $label = 'First part of a label,",
			"            second part of the label.';",
			"        ?>",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("heredoc in a nested php tag is indented with the block", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        <?php",
			"        $x = <<<EOT",
			"        First part of a heredoc,",
			"        second part of the heredoc.",
			"        EOT;",
			"        ?>",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("backtick string in a nested php tag keeps its content", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        <?php",
			"        $x = `ls",
			"            -la`;",
			"        ?>",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("custom directive argument keeps its content", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        @mydirective('First part of an argument,",
			"            second part of the argument.')",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("custom directive argument in a script keeps its content", async () => {
		const content = [
			"<div>",
			"    <script>",
			"        @mydirective('First part of an argument,",
			"            second part of the argument.')",
			"    </script>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("component attribute keeps its content", async () => {
		const content = [
			"<div>",
			"    <div>",
			`        <x-card :title="__('First part of a title,`,
			`            second part of the title.')" />`,
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("livewire component attribute keeps its content", async () => {
		const content = [
			"<div>",
			"    <div>",
			`        <livewire:card :title="__('First part of a title,`,
			`            second part of the title.')" />`,
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});
});
