import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter shorthand attributes test", () => {
	test("keep format if shorthand attribute includes arrow operator #998", async () => {
		const content = [
			`<flux:navlist.item icon="home" :href="route('dashboard')" :current="request()->routeIs('dashboard')" wire:navigate>`,
			`    {{ __('Dashboard') }}</flux:navlist.item>`,
		].join("\n");

		const expected = [
			`<flux:navlist.item icon="home" :href="route('dashboard')" :current="request()->routeIs('dashboard')" wire:navigate>`,
			`    {{ __('Dashboard') }}</flux:navlist.item>`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
