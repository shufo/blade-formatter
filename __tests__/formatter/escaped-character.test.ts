import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter escaped character test", () => {
	test("special character in replacement parameter #565", async () => {
		const content = [
			`@section('foo')`,
			"    <script>",
			`        alert('$');`,
			`        alert('$$');`,
			`        alert('$$$');`,
			`        alert('$$$$');`,
			"    </script>",
			"@endsection",
		].join("\n");

		const expected = [
			`@section('foo')`,
			"    <script>",
			`        alert('$');`,
			`        alert('$$');`,
			`        alert('$$$');`,
			`        alert('$$$$');`,
			"    </script>",
			"@endsection",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("dollar sign with nested directive #569", async () => {
		const content = [
			`@section('foo')`,
			"    <script>",
			`        alert('anything as long as the string ends with a dollar sign -> $');`,
			"    </script>",
			"    @if(true)",
			"    foo",
			"    @endif",
			"@endsection",
		].join("\n");

		const expected = [
			`@section('foo')`,
			"    <script>",
			`        alert('anything as long as the string ends with a dollar sign -> $');`,
			"    </script>",
			"    @if (true)",
			"        foo",
			"    @endif",
			"@endsection",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
