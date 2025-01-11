import assert from "node:assert";
import { describe, expect, test } from "vitest";
import { BladeFormatter, Formatter } from "../../src/main.js";
import * as util from "../support/util";

const formatter = () => {
	return new Formatter({ indentSize: 4 });
};

describe("formatter behaviour test", () => {
	test("should not clear inline level directive", () => {
		const content = ["<div>", "@section foo @endsection", "</div>", ""].join(
			"\n",
		);

		const expected = [
			"<div>",
			"    @section foo @endsection",
			"</div>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("should not clear php code inside inline @php directive #3", () => {
		const content = [
			"<div>",
			`@php $bg = rand(1, 13); $bgchange = $bg.".jpg"; @endphp`,
			"</div>",
			"",
		].join("\n");

		const expected = [
			"<div>",
			"    @php",
			"        $bg = rand(1, 13);",
			`        $bgchange = $bg . '.jpg';`,
			"    @endphp",
			"</div>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	// https://github.com/shufo/blade-formatter/issues/3#issuecomment-552139588
	// eslint-disable-next-line max-len
	test("should indent correctly even if inline directive and div tags are mixed", () => {
		const content = [
			`@section('content')`,
			`    <div class="content-header">`,
			`        <div>@php echo 'FOO'; @endphp</div>`,
			"    </div>",
			`    <div>@php echo 'FOO'; @endphp</div>`,
			"@endsection",
			"",
		].join("\n");

		const expected = [
			`@section('content')`,
			`    <div class="content-header">`,
			`        <div>@php echo 'FOO'; @endphp</div>`,
			"    </div>",
			`    <div>@php echo 'FOO'; @endphp</div>`,
			"@endsection",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	// refs: https://github.com/shufo/blade-formatter/issues/48
	test("it should not pad original blankline", async () => {
		const content = [
			`@section('content')`,
			`<div class="content-header">`,
			`<div>@php echo 'FOO'; @endphp</div>`,
			"", // blankline
			"</div>",
			"@endsection",
			"",
		].join("\n");

		const expected = [
			`@section('content')`,
			`    <div class="content-header">`,
			`        <div>@php echo 'FOO'; @endphp</div>`,
			"", // should be keep original line
			"    </div>",
			"@endsection",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("preserve multiline php tag #57", async () => {
		const content = [
			"<?php",
			"/**",
			" * @var ModulesCommonPageDataBuilderV2RenderableItemsCard $card",
			" */",
			"?>",
			`@extends('layouts.mainLayout')`,
			"",
			`@section('someBlock')`,
			"",
			"@endsection",
			"",
		].join("\n");

		const expected = [
			"<?php",
			"/**",
			" * @var ModulesCommonPageDataBuilderV2RenderableItemsCard $card",
			" */",
			"?>",
			`@extends('layouts.mainLayout')`,
			"",
			`@section('someBlock')`,
			"@endsection",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("preserve inline php tag #57", async () => {
		const content = [
			`<body data-app="<?php echo json_encode($array); ?>"`,
			"",
		].join("\n");

		const expected = [
			`<body data-app="<?php echo json_encode($array); ?>"`,
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("preserve inline php tag in script", async () => {
		const content = [
			"<script>",
			"    var app = <?php echo json_encode($array); ?>;",
			"</script>",
			"",
		].join("\n");

		const expected = [
			"<script>",
			"    var app = <?php echo json_encode($array); ?>;",
			"</script>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("it should be ignore script tag #4", async () => {
		const content = [
			`<script nonce="{{ Bepsvpt\SecureHeaders\SecureHeaders::nonce() }}">`,
			"    var app = <?php echo json_encode($array); ?>;",
			"</script>",
			"",
		].join("\n");

		const expected = [
			`<script nonce="{{ Bepsvpt\SecureHeaders\SecureHeaders::nonce() }}">`,
			"    var app = <?php echo json_encode($array); ?>;",
			"</script>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("should be ignore short tag #56", async () => {
		const content = [
			"<table>",
			"<th><?= $userName ?></th>",
			"</table>",
			"",
		].join("\n");

		const expected = [
			"<table>",
			"    <th><?= $userName ?></th>",
			"</table>",
			"",
		].join("\n");

		return formatter()
			.formatContent(content)
			.then((result: any) => {
				assert.equal(result, expected);
			});
	});

	test("should remove semicolon in end of line", async () => {
		const content = [
			"{!! strip_tags($header) !!}",
			"",
			"{!! strip_tags($slot) !!}",
			"@isset($subcopy)",
			"{!! strip_tags($subcopy) !!}",
			"@endisset",
			"",
			"{!! strip_tags($footer); !!}",
			"",
		].join("\n");

		const expected = [
			"{!! strip_tags($header) !!}",
			"",
			"{!! strip_tags($slot) !!}",
			"@isset($subcopy)",
			"    {!! strip_tags($subcopy) !!}",
			"@endisset",
			"",
			"{!! strip_tags($footer) !!}",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("method call should not indented in blade brackets #2", async () => {
		const content = ["{{ auth()->user()->getSeeding() }}", ""].join("\n");

		const expected = [
			"{{ auth()->user()->getSeeding() }}",
			"",
			/*  */
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("indented call should be inline in blade brackets #2", async () => {
		const content = [
			"{{ auth()",
			"    ->user()",
			"    ->getSeeding() }}",
			"",
		].join("\n");

		const expected = [
			"{{ auth()->user()->getSeeding() }}",
			"",
			/*  */
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("method call in directive should not be multiline #2", async () => {
		const content = [
			`@if(auth()->user()->name === 'foo')`,
			"    <p>bar</p>",
			"@endif",
			"",
		].join("\n");

		const expected = [
			`@if (auth()->user()->name === 'foo')`,
			"    <p>bar</p>",
			"@endif",
			"",
			/*  */
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should remain tags even if php tag exists vscode-blade-formattere#2", async () => {
		const content = [
			"<?php",
			"/* Some comments on this template",
			" */",
			"?>",
			`<div class="font-ext-links">`,
			`    <a class="btn btn-cta" href="{{ url('download/' . $font->slug) }}" title="Download {{ $font->title }}">`,
			`        <i class="fa fa-fw fa-download"></i>`,
			"        Download",
			"    </a>",
			"",
			"</div>",
			"",
		].join("\n");

		const expected = [
			"<?php",
			"/* Some comments on this template",
			" */",
			"?>",
			`<div class="font-ext-links">`,
			`    <a class="btn btn-cta" href="{{ url('download/' . $font->slug) }}" title="Download {{ $font->title }}">`,
			`        <i class="fa fa-fw fa-download"></i>`,
			"        Download",
			"    </a>",
			"",
			"</div>",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should not format nbsp", async () => {
		const content = [
			`{{ trans('email.website_title') }}&nbsp;`,
			`<a href="mailto:{{ trans('email.website_url') }}">{{ trans('email.website_url') }}</a>`,
			"",
		].join("\n");

		const expected = [
			`{{ trans('email.website_title') }}&nbsp;`,
			`<a href="mailto:{{ trans('email.website_url') }}">{{ trans('email.website_url') }}</a>`,
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should not occurs error with if directive", async () => {
		const content = ["@if($user)", "    foo", "@endif", ""].join("\n");

		const expected = ["@if ($user)", "    foo", "@endif", ""].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should not occurs error on directive inside html tag ", async () => {
		const content = [
			`<body class="hold-transition login-page" @if(config('admin.login_background_image'))style="background: url({{ config('admin.login_background_image') }}) no-repeat;background-size: cover;"`,
			"    @endif>",
			"",
		].join("\n");

		const expected = [
			`<body class=\"hold-transition login-page\"`,
			`    @if (config('admin.login_background_image')) style=\"background: url({{ config('admin.login_background_image') }}) no-repeat;background-size: cover;\" @endif>`,
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should not occurs error even if 3 level nested in directive", async () => {
		const content = [
			`@if(config('app.foo', env('APP_FOO_BAR')))`,
			"    foo",
			"@endif>",
			"",
		].join("\n");

		const expected = [
			`@if (config('app.foo', env('APP_FOO_BAR')))`,
			"    foo",
			"@endif>",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should preserve spaces between directive and parentheses", async () => {
		const content = [`@if($user === 'foo')`, "foo", "@endif", ""].join("\n");

		const expected = [`@if ($user === 'foo')`, "    foo", "@endif", ""].join(
			"\n",
		);

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should preserve spaces between directive and parentheses (space exists)", async () => {
		const content = ["@foreach ($users as $user)", "foo", "@endif", ""].join(
			"\n",
		);

		const expected = [
			"@foreach ($users as $user)",
			"    foo",
			"@endif",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should keep format even if @include directive exists", async () => {
		const content = [
			`{{ Form::open(['route' => 'withdraw.withdraw', 'method' => 'post', 'id'=>'form01']) }}`,
			"{{ Form::close() }}",
			"",
			`@include('common.footer_js')`,
			"",
		].join("\n");

		const expected = [
			`{{ Form::open(['route' => 'withdraw.withdraw', 'method' => 'post', 'id' => 'form01']) }}`,
			"{{ Form::close() }}",
			"",
			`@include('common.footer_js')`,
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should keep format with while and section", async () => {
		const content = [
			`@extends('layouts.app')`,
			"",
			`@section('content')`,
			`@include('partials.page-header')`,
			"",
			"@if(!have_posts())",
			`<x-alert type="warning">`,
			`{!! __('Sorry, no results were found.', 'sage') !!}`,
			"</x-alert>",
			"",
			"{!! get_search_form(false) !!}",
			"@endif",
			"",
			"@while(have_posts()) @php(the_post())",
			`@includeFirst(['partials.content-' . get_post_type(), 'partials.content'])`,
			"@endwhile",
			"",
			"{!! get_the_posts_navigation() !!}",
			"@endsection",
			"",
			`@section('sidebar')`,
			`@include('partials.sidebar')`,
			"@endsection",
			"",
		].join("\n");

		const expected = [
			`@extends('layouts.app')`,
			"",
			`@section('content')`,
			`    @include('partials.page-header')`,
			"",
			"    @if (!have_posts())",
			`        <x-alert type="warning">`,
			`            {!! __('Sorry, no results were found.', 'sage') !!}`,
			"        </x-alert>",
			"",
			"        {!! get_search_form(false) !!}",
			"    @endif",
			"",
			"    @while (have_posts())",
			"        @php(the_post())",
			`        @includeFirst(['partials.content-' . get_post_type(), 'partials.content'])`,
			"    @endwhile",
			"",
			"    {!! get_the_posts_navigation() !!}",
			"@endsection",
			"",
			`@section('sidebar')`,
			`    @include('partials.sidebar')`,
			"@endsection",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("quoted expression should not adds space", async () => {
		const content = [
			"@foreach ($items as $item)",
			"    @switch($item->status)",
			`        @case("status")`,
			"            // Do something",
			"        @break",
			"    @endswitch",
			"@endforeach",
		].join("\n");

		const expected = [
			"@foreach ($items as $item)",
			"    @switch($item->status)",
			`        @case('status')`,
			"            // Do something",
			"        @break",
			"    @endswitch",
			"@endforeach",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("conditional expression", async () => {
		const content = [
			"@if ($condition < 1)",
			"    {{-- Do something --}}",
			"@elseif ($condition <2)",
			"    {{-- Do something --}}",
			"@elseif ($condition< 3)",
			"        {{-- Do something --}}",
			"@else",
			"    {{-- Do something --}}",
			"@endif",
		].join("\n");

		const expected = [
			"@if ($condition < 1)",
			"    {{-- Do something --}}",
			"@elseif ($condition < 2)",
			"    {{-- Do something --}}",
			"@elseif ($condition < 3)",
			"    {{-- Do something --}}",
			"@else",
			"    {{-- Do something --}}",
			"@endif",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("conditional expression (while)", async () => {
		const content = [
			"@while ($condition< 1)",
			"{{-- Do something --}}",
			"@endwhile",
		].join("\n");

		const expected = [
			"@while ($condition < 1)",
			"    {{-- Do something --}}",
			"@endwhile",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("inline @if-@endif directive should keep its format", async () => {
		const content = [
			`<password-input name="password_confirmation" type="password" @if ('password') error error-message="{{ $message }}" @endif placeholder="password: " outlined>`,
			"</password-input>",
			`<password-input name="password_confirmation" type="password"`,
			`@if ('password') error error-message="{{ $message }}" @endif placeholder="password: " outlined>`,
			"</password-input>",
			// multiline directive inside html tag should be formatted into inline
			`<password-input name="password_confirmation" type="password" @if ('password')`,
			`error error-message="{{ $message }}"`,
			"@endif",
			`placeholder="password: " outlined></password-input>`,
			// multiple directives in html tag
			`<password-input name="password_confirmation" type="password" @if ('password')`,
			`error error-message="{{ $message }}"`,
			"@endif",
			`@if ('password')`,
			`error error-message="{{ $message }}"`,
			"@endif",
			`placeholder="パスワード" outlined></password-input>`,
		].join("\n");

		const expected = [
			`<password-input name="password_confirmation" type="password"`,
			`    @if ('password') error error-message="{{ $message }}" @endif placeholder="password: " outlined>`,
			"</password-input>",
			`<password-input name="password_confirmation" type="password"`,
			`    @if ('password') error error-message="{{ $message }}" @endif placeholder="password: " outlined>`,
			"</password-input>",
			`<password-input name="password_confirmation" type="password"`,
			`    @if ('password') error error-message="{{ $message }}" @endif placeholder="password: "`,
			"    outlined></password-input>",
			`<password-input name="password_confirmation" type="password"`,
			`    @if ('password') error error-message="{{ $message }}" @endif`,
			`    @if ('password') error error-message="{{ $message }}" @endif placeholder="パスワード"`,
			"    outlined></password-input>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("order aware nested directive", async () => {
		const content = [
			`@component('components.elements.button') @slot('href') /plant/details/{{ $plant->system_name }} @endslot @endcomponent`,
			`@section('components.elements.button') @error('href') /plant/details/{{ $plant->system_name }} @enderror @endsection`,
			`@foreach($users as $user) @error('href') {{ $user }} @enderror @endforeach`,
		].join("\n");

		const expected = [
			`@component('components.elements.button')`,
			`    @slot('href')`,
			"        /plant/details/{{ $plant->system_name }}",
			"    @endslot",
			"@endcomponent",
			`@section('components.elements.button')`,
			`    @error('href')`,
			"        /plant/details/{{ $plant->system_name }}",
			"    @enderror",
			"@endsection",
			"@foreach ($users as $user)",
			`    @error('href')`,
			"        {{ $user }}",
			"    @enderror",
			"@endforeach",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@include directive should format its parameter", async () => {
		const content = [
			`@include('parts.partials.buttons.btn-group', ["buttons" => [`,
			"[",
			`"style" => "link",`,
			`"link" => [`,
			`"title" => "Call to Action",`,
			`"url" => "#",`,
			`"target" => "_self",`,
			"],",
			"],",
			"]])",
			"<div>",
			`@include('parts.partials.buttons.btn-group', ["buttons" => [`,
			"[",
			`"style" => "link",`,
			`"link" => [`,
			`"title" => "Call to Action",`,
			`"url" => "#",`,
			`"target" => "_self",`,
			"],",
			"],",
			"]])",
			"</div>",
		].join("\n");

		const expected = [
			`@include('parts.partials.buttons.btn-group', [`,
			`    'buttons' => [`,
			"        [",
			`            'style' => 'link',`,
			`            'link' => [`,
			`                'title' => 'Call to Action',`,
			`                'url' => '#',`,
			`                'target' => '_self',`,
			"            ],",
			"        ],",
			"    ],",
			"])",
			"<div>",
			`    @include('parts.partials.buttons.btn-group', [`,
			`        'buttons' => [`,
			"            [",
			`                'style' => 'link',`,
			`                'link' => [`,
			`                    'title' => 'Call to Action',`,
			`                    'url' => '#',`,
			`                    'target' => '_self',`,
			"                ],",
			"            ],",
			"        ],",
			"    ])",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("@include directive should not add an extra comma on long view name #504", async () => {
		const content = [
			`@include('livewire.cx', ['account' => $account])`,
			`@include('livewire.cx.equipment-list-internal.account', ['account' => $account])`,
			"<div>",
			"<div>",
			"<div>",
			`@include('livewire.cx.equipment-list-internal.account', ['account' => $account])`,
			"</div>",
			"</div>",
			"</div>",
			"<div>",
			"<div>",
			"<div>",
			"<div>",
			"<div>",
			"<div>",
			`@include('livewire.cx.equipment-list-internal.account', ['account' => $account])`,
			"</div>",
			"</div>",
			"</div>",
			"</div>",
			"</div>",
			"</div>",
		].join("\n");

		const expected = [
			`@include('livewire.cx', ['account' => $account])`,
			`@include('livewire.cx.equipment-list-internal.account', ['account' => $account])`,
			"<div>",
			"    <div>",
			"        <div>",
			`            @include('livewire.cx.equipment-list-internal.account', ['account' => $account])`,
			"        </div>",
			"    </div>",
			"</div>",
			"<div>",
			"    <div>",
			"        <div>",
			"            <div>",
			"                <div>",
			"                    <div>",
			`                        @include('livewire.cx.equipment-list-internal.account', ['account' => $account])`,
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

	test("whitespace sensitive tag should keep its content unformatted", async () => {
		const content = [
			"<div>",
			`@foreach (config('translatable.locales') as $i => $locale)`,
			`    <div role="tabpanel" class="tab-pane  {{ $i == 0 ? 'active' : '' }}" id="{{ $locale }}">`,
			`        <div class="form-group">`,
			`            <textarea class="form-control wysiwyg" name="{{ $locale }}[content]" rows="8" id="{{ $locale }}[content]"`,
			` cols="8">`,
			`    {{ old($locale . '[content]', $notice->translateOrNew($locale)->content) }} </textarea>`,
			"        </div>",
			"    </div>",
			"@endforeach",
			"    </div>",
			"<div>",
			"<pre>",
			"aaaa </pre>",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			`    @foreach (config('translatable.locales') as $i => $locale)`,
			`        <div role="tabpanel" class="tab-pane  {{ $i == 0 ? 'active' : '' }}" id="{{ $locale }}">`,
			`            <div class="form-group">`,
			`                <textarea class="form-control wysiwyg" name="{{ $locale }}[content]" rows="8" id="{{ $locale }}[content]"`,
			`                    cols="8">`,
			`    {{ old($locale . '[content]', $notice->translateOrNew($locale)->content) }} </textarea>`,
			"            </div>",
			"        </div>",
			"    @endforeach",
			"</div>",
			"<div>",
			"    <pre>",
			"aaaa </pre>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("inline directive should format its inside expression", async () => {
		const content = [`@lang("foo"     )`].join("\n");

		const expected = [`@lang('foo')`, ""].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("long inline directive should format its inside expression", async () => {
		const content = [
			`<div>@lang(["foo"=>123,"entangle_state1"=>123,      "entangle_state2" => 124, "entangle_state3" => 125, "entangle_state4" => 126, "entangle_state5" => 127, "entangle_state6" => 128])</div>`,
		].join("\n");

		const expected = [
			`<div>@lang(['foo' => 123, 'entangle_state1' => 123, 'entangle_state2' => 124, 'entangle_state3' => 125, 'entangle_state4' => 126, 'entangle_state5' => 127, 'entangle_state6' => 128])</div>`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("inline directive passed multiple argument should not throws Exception", async () => {
		const content = ["@instanceof($user, App\\User::class)"].join("\n");

		await expect(new BladeFormatter().format(content)).resolves.not.toThrow(
			"Error",
		);
	});

	test("it should not throws Exception even if custom directive unmatched", async () => {
		const content = [`@unlessdisk('local')`, "  foo", "@endunless"].join("\n");

		await expect(new BladeFormatter().format(content)).resolves.not.toThrow(
			"Error",
		);
	});

	test("it should not time out on @isset~@endif directive in html tag #585", async () => {
		const content = [
			`<input type="text" name="{{ 'flow_locales['.$index.'][title]' }}"`,
			`    @isset($flow->locale) value="{{ $flow->locale['title'] }}" @endif>`,
		].join("\n");

		const expected = [
			`<input type="text" name="{{ 'flow_locales[' . $index . '][title]' }}"`,
			`    @isset($flow->locale) value="{{ $flow->locale['title'] }}" @endif>`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("it should keep format even if sort target class string is empty", async () => {
		const content = [
			`<div class="">`,
			"    @php",
			"        switch ($color) {",
			`            case 'white':`,
			`                $colorClasses = 'bg-white';`,
			"                break;",
			"        }",
			"    @endphp",
			"</div>",
		].join("\n");

		const expected = [
			`<div class="">`,
			"    @php",
			"        switch ($color) {",
			`            case 'white':`,
			`                $colorClasses = 'bg-white';`,
			"                break;",
			"        }",
			"    @endphp",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("it should not match x-bind:class sort class regex", async () => {
		const content = [
			`<div x-bind:class="{ 'mb-3 pb-3 border-b-2 border-light-gray': what }" @class([`,
			`                 'flex w-full items-center',`,
			"                      $boxClasses,",
			"                            ])>",
			"</div>",
		].join("\n");

		const expected = [
			`<div x-bind:class="{ 'mb-3 pb-3 border-b-2 border-light-gray': what }" @class(['flex w-full items-center', $boxClasses])>`,
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			sortTailwindcssClasses: true,
		});
	});

	test("it should not be stuck even if equal character exists https://github.com/shufo/vscode-blade-formatter/issues/474", async () => {
		const content = [
			"<div>",
			"<table>",
			"<tr>",
			"@if ($potRR == true)",
			`                                <td wire:key='{{ $this->getRandomStr() }}'>`,
			"                                    -",
			"                                </td>",
			"                            @else",
			"                                @if ($tasks->isNotEmpty())",
			`                                @foreach ($tasks->where('id', '=', 1) as $task)`,
			"                                <p>dd</p>",
			"                                @endforeach",
			"                                @else",
			`                                    <td wire:key='{{ $this->getRandomStr() }}'`,
			`                                        wire:click='openAssignTaskModal({{ $pot->id }})'>`,
			"                                        -",
			"                                    </td>",
			"                                @endif",
			"                            @endif",
			"</tr>",
			"</table>",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    <table>",
			"        <tr>",
			"            @if ($potRR == true)",
			`                <td wire:key='{{ $this->getRandomStr() }}'>`,
			"                    -",
			"                </td>",
			"            @else",
			"                @if ($tasks->isNotEmpty())",
			`                    @foreach ($tasks->where('id', '=', 1) as $task)`,
			"                        <p>dd</p>",
			"                    @endforeach",
			"                @else",
			`                    <td wire:key='{{ $this->getRandomStr() }}' wire:click='openAssignTaskModal({{ $pot->id }})'>`,
			"                        -",
			"                    </td>",
			"                @endif",
			"            @endif",
			"        </tr>",
			"    </table>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("it should not timeout even if there is a quote in php expression", async () => {
		const content = [
			"@php",
			`// if breadcrumbs aren't defined in the CrudController, use the default breadcrumbs`,
			"$breadcrumbs = $breadcrumbs ?? $defaultBreadcrumbs;",
			"@endphp",
		].join("\n");

		const expected = [
			"@php",
			`    // if breadcrumbs aren't defined in the CrudController, use the default breadcrumbs`,
			"    $breadcrumbs = $breadcrumbs ?? $defaultBreadcrumbs;",
			"@endphp",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
