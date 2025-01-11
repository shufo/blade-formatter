import assert from "node:assert";
import { describe, test } from "vitest";
import { Formatter } from "../../src/main.js";

const formatter = () => {
	return new Formatter({ indentSize: 4 });
};

describe("formatter if-else test", () => {
	const elseEnabledDirectives = ["can", "canany", "cannot"];

	for (const directive of elseEnabledDirectives) {
		test(`else directives test - ${directive}`, async () => {
			const content = [
				"<section>",
				`@${directive}(["update",'read'],$user)`,
				"@if ($user)",
				"{{ $user->name }}",
				"@endif",
				`@else${directive}(['delete'], $user)`,
				"foo",
				"@else",
				"bar",
				`@end${directive}`,
				"</section>",
				"",
			].join("\n");

			const expected = [
				"<section>",
				`    @${directive}(['update', 'read'], $user)`,
				"        @if ($user)",
				"            {{ $user->name }}",
				"        @endif",
				`    @else${directive}(['delete'], $user)`,
				"        foo",
				"    @else",
				"        bar",
				`    @end${directive}`,
				"</section>",
				"",
			].join("\n");

			return formatter()
				.formatContent(content)
				.then((result: any) => {
					assert.equal(result, expected);
				});
		});
	}
});
