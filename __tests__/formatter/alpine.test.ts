import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter alpine test", () => {
	test("shorthand binding #557", async () => {
		const content = [
			`@section('body')`,
			`    <forms.radios legend="Meeting Schedule" name="meeting_type" value="single" v-model="form.meeting_type"`,
			`        :inline="true"`,
			`        :options="[`,
			`    'single' => ['label' => 'Default'],`,
			`    'series' => ['label' => 'Recurring meeting'],`,
			`    'scheduler' => ['label' => 'Find a meeting date'],`,
			`]" />`,
			"@endsection",
		].join("\n");

		const expected = [
			`@section('body')`,
			`    <forms.radios legend="Meeting Schedule" name="meeting_type" value="single" v-model="form.meeting_type"`,
			`        :inline="true"`,
			`        :options="[`,
			`            'single' => ['label' => 'Default'],`,
			`            'series' => ['label' => 'Recurring meeting'],`,
			`            'scheduler' => ['label' => 'Find a meeting date'],`,
			`        ]" />`,
			"@endsection",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("x-bind binding", async () => {
		const content = [
			`<div x-bind:class="imageLoaded?'blur-none':'blur-3xl'">`,
			"</div>",
		].join("\n");

		const expected = [
			`<div x-bind:class="imageLoaded ? 'blur-none' : 'blur-3xl'">`,
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
