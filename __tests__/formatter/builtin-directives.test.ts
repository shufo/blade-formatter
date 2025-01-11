import assert from "node:assert";
import { describe, test } from "vitest";
import { BladeFormatter, Formatter } from "../../src/main.js";
import * as util from "../support/util";

const formatter = () => {
	return new Formatter({ indentSize: 4 });
};

describe("formatter builtin directives test", () => {
	const builtInDirectives = [
		"auth",
		"component",
		"empty",
		"can",
		"canany",
		"cannot",
		"forelse",
		"guest",
		"isset",
		"push",
		"section",
		"slot",
		"verbatim",
		"prepend",
		"error",
	];

	for (const directive of builtInDirectives) {
		test(`builtin directive test: ${directive}`, () => {
			const content = [
				"<section>",
				`@${directive}($foo)`,
				"@if ($user)",
				"{{ $user->name }}",
				"@endif",
				`@end${directive}`,
				"</section>",
				"",
			].join("\n");

			const expected = [
				"<section>",
				`    @${directive}($foo)`,
				"        @if ($user)",
				"            {{ $user->name }}",
				"        @endif",
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

	const phpDirectives = ["if", "while"];

	for (const directive of phpDirectives) {
		test("php builtin directive test", () => {
			const content = [
				"<section>",
				`@${directive}($foo)`,
				"@if ($user)",
				"{{ $user->name }}",
				"@endif",
				`@end${directive}`,
				"</section>",
				"",
			].join("\n");

			const expected = [
				"<section>",
				`    @${directive} ($foo)`,
				"        @if ($user)",
				"            {{ $user->name }}",
				"        @endif",
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

	const tokenWithoutParams = ["auth", "guest", "production", "once"];

	for (const directive of tokenWithoutParams) {
		test("token without param directive test", () => {
			const content = [
				"<div>",
				`@${directive}`,
				"@if ($user)",
				"{{ $user->name }}",
				"@endif",
				`@end${directive}`,
				"</div>",
				"",
			].join("\n");

			const expected = [
				"<div>",
				`    @${directive}`,
				"        @if ($user)",
				"            {{ $user->name }}",
				"        @endif",
				`    @end${directive}`,
				"</div>",
				"",
			].join("\n");

			return formatter()
				.formatContent(content)
				.then((result: any) => {
					assert.equal(result, expected);
				});
		});
	}

	test("section directive test", () => {
		const content = [
			"<div>",
			`@section('foo')`,
			`@section('bar')`,
			"@if($user)",
			"{{ $user->name }}",
			"@endif",
			"@endsection",
			"</div>",
			"",
		].join("\n");

		const expected = [
			"<div>",
			`    @section('foo')`,
			`    @section('bar')`,
			"        @if ($user)",
			"            {{ $user->name }}",
			"        @endif",
			"    @endsection",
			"</div>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("directive token should case insensitive", () => {
		const content = [
			"<div>",
			`@Section('foo')`,
			`@section('bar')`,
			"@if($user)",
			"{{ $user->name }}",
			"@foreach($users as $user)",
			"{{ $user->id }}",
			"@endForeach",
			"@endIf",
			"@endSection",
			"</div>",
			"",
		].join("\n");

		const expected = [
			"<div>",
			`    @Section('foo')`,
			`    @section('bar')`,
			"        @if ($user)",
			"            {{ $user->name }}",
			"            @foreach ($users as $user)",
			"                {{ $user->id }}",
			"            @endForeach",
			"        @endIf",
			"    @endSection",
			"</div>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("multiple section directive test", () => {
		const content = [
			"<div>",
			`@section('foo')`,
			`@section('bar')`,
			`@section('baz')`,
			"@if($user)",
			"{{ $user->name }}",
			"@endif",
			"@endsection",
			"</div>",
			"",
		].join("\n");

		const expected = [
			"<div>",
			`    @section('foo')`,
			`    @section('bar')`,
			`    @section('baz')`,
			"        @if ($user)",
			"            {{ $user->name }}",
			"        @endif",
			"    @endsection",
			"</div>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("hasSection", () => {
		const content = [
			"<section>",
			`@hasSection('navigation')`,
			"@if ($user)",
			"{{ $user->name }}",
			"@endif",
			"@endif",
			"</section>",
			"",
		].join("\n");

		const expected = [
			"<section>",
			`    @hasSection('navigation')`,
			"        @if ($user)",
			"            {{ $user->name }}",
			"        @endif",
			"    @endif",
			"</section>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("@for directive should work", async () => {
		const content = [
			"@for ($i=0;$i<=5;$i++)",
			`<div class="foo">`,
			"</div>",
			"@endfor",
			"",
		].join("\n");

		const expected = [
			"@for ($i = 0; $i <= 5; $i++)",
			`    <div class="foo">`,
			"    </div>",
			"@endfor",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("@foreach directive should work", async () => {
		const content = [
			"@foreach($users as $user)",
			`<div class="foo">`,
			"</div>",
			"@endforeach",
			"",
		].join("\n");

		const expected = [
			"@foreach ($users as $user)",
			`    <div class="foo">`,
			"    </div>",
			"@endforeach",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("@foreach directive should work with variable key", async () => {
		const content = [
			`@foreach($users["foo"] as $user)`,
			`<div class="foo">`,
			"</div>",
			"@endforeach",
			"",
		].join("\n");

		const expected = [
			`@foreach ($users['foo'] as $user)`,
			`    <div class="foo">`,
			"    </div>",
			"@endforeach",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("@foreach directive should work with children methods", async () => {
		const content = [
			"@foreach($user->blogs() as $blog)",
			`<div class="foo">`,
			"</div>",
			"@endforeach",
			"",
		].join("\n");

		const expected = [
			"@foreach ($user->blogs() as $blog)",
			`    <div class="foo">`,
			"    </div>",
			"@endforeach",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("@switch directive should work", async () => {
		const content = [
			"@switch($i)",
			"@case(1)",
			"    First case...",
			"    @break",
			"",
			"@case(2)",
			"    Second case...",
			"    @break",
			"",
			"@case(3)",
			"@case(4)",
			"    Third case...",
			"    @break",
			"",
			"@default",
			"    Default case...",
			"@endswitch",
			"",
		].join("\n");

		const expected = [
			"@switch($i)",
			"    @case(1)",
			"        First case...",
			"    @break",
			"",
			"    @case(2)",
			"        Second case...",
			"    @break",
			"",
			"    @case(3)",
			"    @case(4)",
			"        Third case...",
			"    @break",
			"",
			"    @default",
			"        Default case...",
			"@endswitch",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("forelse directive should work", async () => {
		const content = [
			"@forelse($students as $student)",
			"<div>foo</div>",
			"@empty",
			"empty",
			"@endforelse",
			"",
		].join("\n");

		const expected = [
			"@forelse($students as $student)",
			"    <div>foo</div>",
			"@empty",
			"    empty",
			"@endforelse",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should format within @php directive", async () => {
		const content = [
			"    @php",
			"    if ($user) {",
			`    $user->name = 'foo';`,
			"    }",
			"    @endphp",
		].join("\n");

		const expected = [
			"    @php",
			"        if ($user) {",
			`            $user->name = 'foo';`,
			"        }",
			"    @endphp",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("forelse inside if directive should work #254", async () => {
		const content = [
			"@if (true)",
			"<table>",
			"@forelse($elems as $elem)",
			"<tr></tr>",
			"@empty",
			"<tr></tr>",
			"@endforelse",
			"</table>",
			"@endif",
		].join("\n");

		const expected = [
			"@if (true)",
			"    <table>",
			"        @forelse($elems as $elem)",
			"            <tr></tr>",
			"        @empty",
			"            <tr></tr>",
			"        @endforelse",
			"    </table>",
			"@endif",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("directives with optional endtags", async () => {
		const content = [
			`@extends('layouts.test')`,
			`@section('title', 'This is title')`,
			`@section('content')`,
			`    <div class="someClass">`,
			"        This is content.",
			"    </div>",
			"@endsection",
			"",
			"@if (true)",
			`    @push('some-stack', $some->getContent())`,
			"    @section($aSection, $some->content)",
			`    @push('some-stack')`,
			"        more",
			"    @endpush",
			`    @prepend($stack->name, 'here we go')`,
			"@endif",
			"",
		].join("\n");
		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, content);
		});
	});

	test("@class directive", async () => {
		let content = [
			`<span @class([ 'p-4' , 'font-bold'=>$isActive])></span>`,
		].join("\n");
		let expected = [
			`<span @class(['p-4', 'font-bold' => $isActive])></span>`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);

		content = [
			`<span @class([ 'p-4' , 'font-bold'=>$isActive,`,
			"    ])></span>",
		].join("\n");

		expected = [
			`<span @class(['p-4', 'font-bold' => $isActive])></span>`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);

		content = [
			`<span @class([ 'p-4',`,
			`   'font-bold'=>$isActive,`,
			`   'text-gray-500' => !$isActive,`,
			`   'bg-red' => $hasError,`,
			"])></span>",
		].join("\n");

		expected = [
			"<span @class([",
			`    'p-4',`,
			`    'font-bold' => $isActive,`,
			`    'text-gray-500' => !$isActive,`,
			`    'bg-red' => $hasError,`,
			"])></span>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);

		content = [
			"<div>",
			`<span @class([ 'p-4',`,
			`   'font-bold'=>$isActive,`,
			`   'text-gray-500' => !$isActive,`,
			`   'bg-red' => $hasError,`,
			"])></span>",
			"</div>",
		].join("\n");

		expected = [
			"<div>",
			"    <span @class([",
			`        'p-4',`,
			`        'font-bold' => $isActive,`,
			`        'text-gray-500' => !$isActive,`,
			`        'bg-red' => $hasError,`,
			"    ])></span>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("inline @json directive", async () => {
		const content = [
			"<myComponent",
			`    :prop-data='@json($data['initialEvents'])'>`,
			"foo",
			"</myComponent>",
			`<div data-single-quote='@json('string with single quote')'>`,
			"</div>",
		].join("\n");

		const expected = [
			`<myComponent :prop-data='@json($data['initialEvents'])'>`,
			"    foo",
			"</myComponent>",
			`<div data-single-quote='@json('string with single quote')'>`,
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("inline @error directive should keep its format", async () => {
		const content = [
			`<span class="text-gray-700 @error('restaurant_id') text-red-500 @enderror">`,
			"    Choose restaurant",
			"</span>",
		].join("\n");

		const expected = [
			`<span class="text-gray-700 @error('restaurant_id') text-red-500 @enderror">`,
			"    Choose restaurant",
			"</span>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@checked directive", async () => {
		const content = [
			`<input type="checkbox"`,
			`        name="active"`,
			`        value="active"`,
			`        @checked(old('active',$user->active)) />`,
		].join("\n");

		const expected = [
			`<input type="checkbox" name="active" value="active" @checked(old('active', $user->active)) />`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@selected directive", async () => {
		const content = [
			`<select name="version">`,
			"@foreach ($product->versions as $version)",
			`<option value="{{ $version }}" @selected(old('version')==$version)>`,
			"{{ $version }}",
			"</option>",
			"@endforeach",
			"</select>",
		].join("\n");

		const expected = [
			`<select name="version">`,
			"    @foreach ($product->versions as $version)",
			`        <option value="{{ $version }}" @selected(old('version') == $version)>`,
			"            {{ $version }}",
			"        </option>",
			"    @endforeach",
			"</select>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@disabled directive", async () => {
		const content = [
			`<button type="submit" @disabled($errors->isNotEmpty() )>Submit</button>`,
		].join("\n");

		const expected = [
			`<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@includeIf, @includeWhen, @includeUnless and @includeFirst directive", async () => {
		const content = [
			"<div>",
			`@includeIf('livewire.cx.equipment-list-internal.account',['status'=>'complete',`,
			`'foo'=>$user,'bar'=>$bbb,'baz'=>$myVariable])`,
			"</div>",
			"<div>",
			`@includeWhen($boolean,'livewire.cx.equipment-list-internal.account',['status'=>'complete',`,
			`'foo'=>$user,'bar'=>$bbb,'baz'=>$myVariable])`,
			"</div>",
			"<div>",
			`@includeUnless($boolean,'livewire.cx.equipment-list-internal.account',['status'=>'complete',`,
			`'foo'=>$user,'bar'=>$bbb,'baz'=>$myVariable])`,
			"</div>",
			"<div>",
			`@includeFirst(['custom.admin','admin'],['status'=>'complete',`,
			`'foo'=>$user,'bar'=>$bbb,'baz'=>$myVariable])`,
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			`    @includeIf('livewire.cx.equipment-list-internal.account', [`,
			`        'status' => 'complete',`,
			`        'foo' => $user,`,
			`        'bar' => $bbb,`,
			`        'baz' => $myVariable,`,
			"    ])",
			"</div>",
			"<div>",
			`    @includeWhen($boolean, 'livewire.cx.equipment-list-internal.account', [`,
			`        'status' => 'complete',`,
			`        'foo' => $user,`,
			`        'bar' => $bbb,`,
			`        'baz' => $myVariable,`,
			"    ])",
			"</div>",
			"<div>",
			`    @includeUnless($boolean, 'livewire.cx.equipment-list-internal.account', [`,
			`        'status' => 'complete',`,
			`        'foo' => $user,`,
			`        'bar' => $bbb,`,
			`        'baz' => $myVariable,`,
			"    ])",
			"</div>",
			"<div>",
			"    @includeFirst(",
			`        ['custom.admin', 'admin'],`,
			`        ['status' => 'complete', 'foo' => $user, 'bar' => $bbb, 'baz' => $myVariable]`,
			"    )",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@aware directive #576", async () => {
		const content = [
			`@aware(['color'=>'gray'])`,
			"@aware([",
			`    'variant'   => 'primary',`,
			`    'colors'        => [`,
			`        'primary'   =>         'btn-primary',`,
			`      'secondary' =>     'btn-secondary',`,
			`   'danger' => 'btn-danger',`,
			"    ]",
			"])",
		].join("\n");

		const expected = [
			`@aware(['color' => 'gray'])`,
			"@aware([",
			`    'variant' => 'primary',`,
			`    'colors' => [`,
			`        'primary' => 'btn-primary',`,
			`        'secondary' => 'btn-secondary',`,
			`        'danger' => 'btn-danger',`,
			"    ],",
			"])",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@pushonce directive", async () => {
		const content = [
			`@pushOnce('scripts')`,
			"<script>",
			"// Your custom JavaScript...",
			"</script>",
			"@endPushOnce",
		].join("\n");

		const expected = [
			`@pushOnce('scripts')`,
			"    <script>",
			"        // Your custom JavaScript...",
			"    </script>",
			"@endPushOnce",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@prependonce directive", async () => {
		const content = [
			`@prependOnce('scripts')`,
			"<script>",
			"// Your custom JavaScript...",
			"</script>",
			"@endPrependOnce",
		].join("\n");

		const expected = [
			`@prependOnce('scripts')`,
			"    <script>",
			"        // Your custom JavaScript...",
			"    </script>",
			"@endPrependOnce",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("nested hasSection~endif", async () => {
		const content = [
			"<section>",
			`    @hasSection('navigation')`,
			`    @hasSection('techdocs')`,
			"       {{ $user->name }}",
			" @endif",
			"    @endif",
			"</section>",
		].join("\n");

		const expected = [
			"<section>",
			`    @hasSection('navigation')`,
			`        @hasSection('techdocs')`,
			"            {{ $user->name }}",
			"        @endif",
			"    @endif",
			"</section>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@disabled directive with method access https://github.com/shufo/vscode-blade-formatter/issues/429", async () => {
		const content = [
			"@disabled(!auth()->user()->ownsTest($variable)) @if ($this->$variable) ... @else ... @endif",
			"@disabled(!auth()->user()->ownsTest($variable))",
		].join("\n");

		const expected = [
			"@disabled(!auth()->user()->ownsTest($variable)) @if ($this->$variable)",
			"    ...",
			"@else",
			"    ...",
			"@endif",
			"@disabled(!auth()->user()->ownsTest($variable))",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@foreach directive with nested method", async () => {
		const content = [
			"@foreach (auth()->user()->currentxy->shops() as $shop)",
			"foo",
			"@endforeach",
		].join("\n");

		const expected = [
			"@foreach (auth()->user()->currentxy->shops() as $shop)",
			"    foo",
			"@endforeach",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("unless directive with arrowed method", async () => {
		const content = [
			"@unless  (auth()->user()->hasVerifiedEmail())",
			"  <p>Please check and verify your email to access the system</p>",
			"@endunless",
		].join("\n");

		const expected = [
			"@unless (auth()->user()->hasVerifiedEmail())",
			"    <p>Please check and verify your email to access the system</p>",
			"@endunless",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			sortHtmlAttributes: "idiomatic",
		});
	});
});
