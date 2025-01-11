import assert from "node:assert";
import { describe, test } from "vitest";
import { BladeFormatter } from "../../src/main.js";
import * as util from "../support/util";

describe("formatter php test", () => {
	const predefinedConstants = [
		"PHP_VERSION",
		"PHP_RELEASE_VERSION",
		"PHP_VERSION_ID",
		"PHP_OS_FAMILY",
		"PHP_FLOAT_DIG",
	];

	for (const constant of predefinedConstants) {
		test("should format php predefined constants", async () => {
			const content = [`{{ ${constant} }}`].join("\n");
			const expected = [`{{ ${constant} }}`, ""].join("\n");

			return new BladeFormatter().format(content).then((result: any) => {
				assert.equal(result, expected);
			});
		});
	}

	test("should format null safe operator", async () => {
		const content = ["{{ $entity->executors->first()?->name() }}"].join("\n");

		const expected = ["{{ $entity->executors->first()?->name() }}", ""].join(
			"\n",
		);

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should format named arguments", async () => {
		const content = ["{{ foo(double_encode:  true) }}"].join("\n");

		const expected = ["{{ foo(double_encode: true) }}", ""].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should break chained method in directive", async () => {
		const content = [
			"@if (auth()",
			"->user()",
			"->subscribed('default'))",
			"aaa",
			"@endif",
		].join("\n");

		const expected = [
			"@if (auth()->user()->subscribed('default'))",
			"    aaa",
			"@endif",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should break chained method in directive 2", async () => {
		const content = [
			"@foreach (request()->users() as $user)",
			"aaa",
			"@endif",
		].join("\n");

		const expected = [
			"@foreach (request()->users() as $user)",
			"    aaa",
			"@endif",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("string literal with line break in raw php directive", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        @php",
			`            $myvar = "lorem`,
			`        ipsum";`,
			`            $foo = "lorem`,
			"",
			"multiline",
			`        ipsum";`,
			"        @endphp",
			"    </div>",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    <div>",
			"        @php",
			`            $myvar = "lorem`,
			`        ipsum";`,
			`            $foo = "lorem`,
			"",
			"multiline",
			`        ipsum";`,
			"        @endphp",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("escaped quote in raw php directive #669", async () => {
		const content = [
			"    @php",
			"        if ($condition1) {",
			`            $var1 = '...';`,
			`                         $var2 = '...';`,
			"        } elseif ($condition2) {",
			`            $var1 = '...';`,
			`            $var2 = 'I have a \\' in me';`,
			"        } else {",
			`            $var1 = '...';`,
			`            $var2 = '...';`,
			"        }",
			"    @endphp",
		].join("\n");

		const expected = [
			"    @php",
			"        if ($condition1) {",
			`            $var1 = '...';`,
			`            $var2 = '...';`,
			"        } elseif ($condition2) {",
			`            $var1 = '...';`,
			`            $var2 = 'I have a \\' in me';`,
			"        } else {",
			`            $var1 = '...';`,
			`            $var2 = '...';`,
			"        }",
			"    @endphp",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("html tag in raw php block", async () => {
		const content = [
			"@php",
			`$icon = "<i class='fa fa-check'></i>";`,
			`$icon    = "<i class=\\"fa fa-check\\"></i>";`,
			`$icon       = '<i class="fa fa-check"></i>';`,
			"@endphp",
		].join("\n");

		const expected = [
			"@php",
			`    $icon = "<i class='fa fa-check'></i>";`,
			`    $icon = "<i class=\\"fa fa-check\\"></i>";`,
			`    $icon = '<i class="fa fa-check"></i>';`,
			"@endphp",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("indent inside @php directive", async () => {
		const content = [
			"@php",
			"$a = 1;",
			"$b = 2;",
			"@endphp",
			"<div>",
			"@php",
			"$a = 1;",
			"$b = 2;",
			"@endphp",
			"@php",
			`$icon = "<i class='fa fa-check'></i>";`,
			`$icon = "<i class=\\"fa fa-check\\"></i>";`,
			`$icon = '<i class="fa fa-check"></i>';`,
			"@endphp",
			"</div>",
			"<script>",
			"@php",
			"$a = 1;",
			"$b = 2;",
			"@endphp",
			"</script>",
		].join("\n");

		const expected = [
			"@php",
			"    $a = 1;",
			"    $b = 2;",
			"@endphp",
			"<div>",
			"    @php",
			"        $a = 1;",
			"        $b = 2;",
			"    @endphp",
			"    @php",
			`        $icon = "<i class='fa fa-check'></i>";`,
			`        $icon = "<i class=\\"fa fa-check\\"></i>";`,
			`        $icon = '<i class="fa fa-check"></i>';`,
			"    @endphp",
			"</div>",
			"<script>",
			"    @php",
			"        $a = 1;",
			"        $b = 2;",
			"    @endphp",
			"</script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("multi-line comment in raw php tag", async () => {
		const content = [
			"<div>",
			"    <div <?php /**",
			"    foo",
			"    bar",
			"    */",
			"    ?>></div>",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    <div <?php /**",
			"    foo",
			"    bar",
			"    */",
			"    ?>></div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("fix shufo/prettier-plugin-blade#166", async () => {
		const content = [
			"@php",
			"    /**",
			"     * @var AppModelsUser $user",
			"     * @var AppModelsPost $post",
			"     */",
			"@endphp",
			"<span>{{ $post->title }} by {{ $user->name }}</span>",
		].join("\n");

		const expected = [
			"@php",
			"    /**",
			"     * @var AppModelsUser $user",
			"     * @var AppModelsPost $post",
			"     */",
			"@endphp",
			"<span>{{ $post->title }} by {{ $user->name }}</span>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("raw php comment block", async () => {
		const content = [
			"<div>",
			"    <?php",
			"            /**",
			"                * @var AppModelsUser $user",
			"            * @var AppModelsPost $post",
			"          */",
			"    ?>",
			"    <?php",
			"    /**",
			"            * @var AppModelsUser $user",
			"                * @var AppModelsPost $post",
			"           */",
			"        /**",
			"     * @var AppModelsUser $user",
			"                * @var AppModelsPost $post",
			"     */ echo 1;",
			"    ?>",
			"    <?php",
			"        /**",
			"     * @var AppModelsUser $user",
			"            * @var AppModelsPost $post",
			"     */",
			"    ?>",
			"    <?php",
			"        /**",
			"              AppModelsUser $user",
			"                 AppModelsPost $post",
			"     */",
			"    ?>",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    <?php",
			"    /**",
			"     * @var AppModelsUser $user",
			"     * @var AppModelsPost $post",
			"     */",
			"    ?>",
			"    <?php",
			"    /**",
			"     * @var AppModelsUser $user",
			"     * @var AppModelsPost $post",
			"     */",
			"    /**",
			"     * @var AppModelsUser $user",
			"     * @var AppModelsPost $post",
			"     */ echo 1;",
			"    ?>",
			"    <?php",
			"    /**",
			"     * @var AppModelsUser $user",
			"     * @var AppModelsPost $post",
			"     */",
			"    ?>",
			"    <?php",
			"    /**",
			"              AppModelsUser $user",
			"                 AppModelsPost $post",
			"     */",
			"    ?>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("php directive comment block", async () => {
		const content = [
			"<div>",
			"    @php",
			"            /**",
			"                * @var AppModelsUser $user",
			"            * @var AppModelsPost $post",
			"          */",
			"    @endphp",
			"    @php",
			"    /**",
			"            * @var AppModelsUser $user",
			"                * @var AppModelsPost $post",
			"           */",
			"        /**",
			"     * @var AppModelsUser $user",
			"                * @var AppModelsPost $post",
			"     */ echo 1;",
			"    @endphp",
			"    @php",
			"        /**",
			"     * @var AppModelsUser $user",
			"            * @var AppModelsPost $post",
			"     */",
			"    @endphp",
			"    @php",
			"    /**",
			"              AppModelsUser $user",
			"                 AppModelsPost $post",
			"                          */",
			"    @endphp",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    @php",
			"        /**",
			"         * @var AppModelsUser $user",
			"         * @var AppModelsPost $post",
			"         */",
			"    @endphp",
			"    @php",
			"        /**",
			"         * @var AppModelsUser $user",
			"         * @var AppModelsPost $post",
			"         */",
			"        /**",
			"         * @var AppModelsUser $user",
			"         * @var AppModelsPost $post",
			"         */ echo 1;",
			"    @endphp",
			"    @php",
			"        /**",
			"         * @var AppModelsUser $user",
			"         * @var AppModelsPost $post",
			"         */",
			"    @endphp",
			"    @php",
			"        /**",
			"              AppModelsUser $user",
			"                 AppModelsPost $post",
			"                          */",
			"    @endphp",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@php blocks should wrap long statements (#908)", async () => {
		const content = [
			"@php",
			`$categories = App\\Models\\Category::whereIn('id', $catids)`,
			`->orderBy('description')`,
			`->orderBy('description')`,
			`->orderBy('description')`,
			"->get();",
			"@endphp",
		].join("\n");

		const expected = [
			"@php",
			`    $categories = App\\Models\\Category::whereIn('id', $catids)`,
			`        ->orderBy('description')`,
			`        ->orderBy('description')`,
			`        ->orderBy('description')`,
			"        ->get();",
			"@endphp",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@php blocks should attempt to respect to current indent level", async () => {
		// This statement is 119 chars long and should fit on 1 line w/ the default print width of 120.
		// Once it's indented within the @php block, though, the line will exceed 120, so it should have
		// been indented.
		let content = [
			"@php",
			`$categories = App\\Models\\Category::whereIn('idss', $catids)`,
			`->orderBy('description')`,
			`->orderBy('description')`,
			"->getNone();",
			"@endphp",
		].join("\n");

		let expected = [
			"@php",
			`    $categories = App\\Models\\Category::whereIn('idss', $catids)`,
			`        ->orderBy('description')`,
			`        ->orderBy('description')`,
			"        ->getNone();",
			"@endphp",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);

		// Now wrap the @php in a <div> and make the PHP statement 4 chars shorter to confirm that it
		// still works at higher indent levels.
		content = [
			"<div>",
			"@php",
			`$categories = App\\Models\\Category::whereIn('idss', $catids)`,
			`->orderBy('description')`,
			`->orderBy('description')`,
			"->get();",
			"@endphp",
			"</div>",
		].join("\n");

		expected = [
			"<div>",
			"    @php",
			`        $categories = App\\Models\\Category::whereIn('idss', $catids)`,
			`            ->orderBy('description')`,
			`            ->orderBy('description')`,
			"            ->get();",
			"    @endphp",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@php blocks respect indent level for deeply indented code (issue #915)", async () => {
		const content = [
			"<div>",
			"<div>",
			"<div>",
			"<div>",
			"<div>",
			"<div>",
			"@php",
			"$percent = $item['historical'] ?? null ? round((100 * ($item['today'] - $item['historical'])) / $item['historical']) : null;",
			"",
			"$color = $percent < 0 ? '#8b0000' : '#006400';",
			"@endphp",
			"</div>",
			"</div>",
			"</div>",
			"</div>",
			"</div>",
			"</div>",
		].join("\n");

		// this is slightly different than the code presented in #915 because that
		// code was wrapped to 80 columns, but these tests all use 120
		const expected = [
			"<div>",
			"    <div>",
			"        <div>",
			"            <div>",
			"                <div>",
			"                    <div>",
			"                        @php",
			"                            $percent =",
			"                                $item['historical'] ?? null",
			"                                    ? round((100 * ($item['today'] - $item['historical'])) / $item['historical'])",
			"                                    : null;",
			"",
			"                            $color = $percent < 0 ? '#8b0000' : '#006400';",
			"                        @endphp",
			"                    </div>",
			"                </div>",
			"            </div>",
			"        </div>",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
