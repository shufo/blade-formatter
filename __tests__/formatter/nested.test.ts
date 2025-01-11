import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter nested test", () => {
	test("nested unless condition", async () => {
		const content = [
			`<x-panel class="bg-gray-50">`,
			"    <x-content>",
			`    @unless(isset($primaryTicketingLinkData) && $primaryTicketingLinkData['isSoldOut'] && $ticketCount <= 0)`,
			`    @include('events.partials.wanted-tickets-button')`,
			"    @endunless",
			"    </x-content>",
			"</x-panel>",
		].join("\n");

		const expected = [
			`<x-panel class="bg-gray-50">`,
			"    <x-content>",
			`        @unless (isset($primaryTicketingLinkData) && $primaryTicketingLinkData['isSoldOut'] && $ticketCount <= 0)`,
			`            @include('events.partials.wanted-tickets-button')`,
			"        @endunless",
			"    </x-content>",
			"</x-panel>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			wrapAttributes: "force-expand-multiline",
		});
	});

	test("nested @forelse https://github.com/shufo/vscode-blade-formatter/issues/425", async () => {
		const content = [
			"@forelse($users as $user)",
			"@if ($user)",
			"foo",
			"@forelse($users as $user)",
			"  foo",
			"  @empty",
			"  bar",
			"  @endforelse",
			"  @endif",
			"baz",
			"@empty",
			"something goes here",
			"@endforelse",
		].join("\n");

		const expected = [
			"@forelse($users as $user)",
			"    @if ($user)",
			"        foo",
			"        @forelse($users as $user)",
			"            foo",
			"        @empty",
			"            bar",
			"        @endforelse",
			"    @endif",
			"    baz",
			"@empty",
			"    something goes here",
			"@endforelse",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("nested condition", async () => {
		const content = [
			"@if (",
			`    count( auth("     (  )   ")->user()   ->currentXY->shopsXY()`,
			") > 1)",
			`    <span class="ml-24">Test</span>`,
			"@else",
			`    <span class="ml-16">Test</span>`,
			"@endif",
			`@if (foo(count( auth("     (  )   ")->user()   ->currentXY->shopsXY()) > 1))`,
			`    <span class="ml-24">Test</span>`,
			"@else",
			`    <span class="ml-16">Test</span>`,
			"@endif",
			"@if (count(auth()->user()->currentXY->shopsXY()) > 1)",
			`    <span class="ml-24">Test</span>`,
			"@else",
			`    <span class="ml-16">Test</span>`,
			"@endif",
		].join("\n");

		const expected = [
			`@if (count(auth('     (  )   ')->user()->currentXY->shopsXY()) > 1)`,
			`    <span class="ml-24">Test</span>`,
			"@else",
			`    <span class="ml-16">Test</span>`,
			"@endif",
			`@if (foo(count(auth('     (  )   ')->user()->currentXY->shopsXY()) > 1))`,
			`    <span class="ml-24">Test</span>`,
			"@else",
			`    <span class="ml-16">Test</span>`,
			"@endif",
			"@if (count(auth()->user()->currentXY->shopsXY()) > 1)",
			`    <span class="ml-24">Test</span>`,
			"@else",
			`    <span class="ml-16">Test</span>`,
			"@endif",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
