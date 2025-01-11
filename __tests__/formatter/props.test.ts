import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter props test", () => {
	test("long props", async () => {
		const content = [
			`@props(['name', 'title' => 'Please Confirm', 'message' => 'Are you sure?', 'level' => 'info', 'icon' => 'heroicon-o-question-mark-circle', 'cancelButtonText' => 'No', 'cancelButtonType' => 'muted', 'affirmButtonText' => 'Yes', 'affirmButtonType' => 'success', 'affirmButtonDisabled' => false])`,
		].join("\n");

		const expected = [
			"@props([",
			`    'name',`,
			`    'title' => 'Please Confirm',`,
			`    'message' => 'Are you sure?',`,
			`    'level' => 'info',`,
			`    'icon' => 'heroicon-o-question-mark-circle',`,
			`    'cancelButtonText' => 'No',`,
			`    'cancelButtonType' => 'muted',`,
			`    'affirmButtonText' => 'Yes',`,
			`    'affirmButtonType' => 'success',`,
			`    'affirmButtonDisabled' => false,`,
			"])",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("nested long props", async () => {
		const content = [
			"<div>",
			`@props(['name', 'title' => 'Please Confirm', 'message' => 'Are you sure?', 'level' => 'info', 'icon' => 'heroicon-o-question-mark-circle', 'cancelButtonText' => 'No', 'cancelButtonType' => 'muted', 'affirmButtonText' => 'Yes', 'affirmButtonType' => 'success', 'affirmButtonDisabled' => false])`,
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    @props([",
			`        'name',`,
			`        'title' => 'Please Confirm',`,
			`        'message' => 'Are you sure?',`,
			`        'level' => 'info',`,
			`        'icon' => 'heroicon-o-question-mark-circle',`,
			`        'cancelButtonText' => 'No',`,
			`        'cancelButtonType' => 'muted',`,
			`        'affirmButtonText' => 'Yes',`,
			`        'affirmButtonType' => 'success',`,
			`        'affirmButtonDisabled' => false,`,
			"    ])",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
