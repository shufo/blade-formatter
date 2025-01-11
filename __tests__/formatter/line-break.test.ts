import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter line break test", () => {
	test("it should line break before and after directives", async () => {
		const content = [
			"<div>",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1) foo",
			"    @endif",
			"    <div>",
			"        @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"            foo",
			"        @endif",
			"    <div>",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1) foo",
			"    @endif",
			"    </div>",
			"    </div>",
			"    @foreach ($collection as $item)",
			"        {{ $item }} @endforeach",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"    foo",
			"",
			"    @endif",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1) foo",
			"",
			"    @endif",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"    @endif",
			"</div>",
		].join("\n");

		const expected = [
			"<div>",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"        foo",
			"    @endif",
			"    <div>",
			"        @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"            foo",
			"        @endif",
			"        <div>",
			"            @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"                foo",
			"            @endif",
			"        </div>",
			"    </div>",
			"    @foreach ($collection as $item)",
			"        {{ $item }}",
			"    @endforeach",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"        foo",
			"    @endif",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"        foo",
			"    @endif",
			"    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)",
			"    @endif",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("complex line break", async () => {
		const content = [
			"<div>",
			"@if ($user) @if ($condition) aaa @endif",
			"@endif",
			`  @can('edit') bbb`,
			"  @endcan",
			`@auth('user') ccc`,
			"@endauth",
			"</div>",
			"<div>",
			`@section('title') aaa @endsection`,
			"</div>",
			`<div>@foreach($users as $user) @foreach($shops as $shop) {{ $user["id"] . $shop["id"] }} @endforeach @endforeach</div>`,
			`<div>@if($users) @foreach($shops as $shop) {{ $user["id"] . $shop["id"] }} @endforeach @endif</div>`,
		].join("\n");

		const expected = [
			"<div>",
			"    @if ($user)",
			"        @if ($condition)",
			"            aaa",
			"        @endif",
			"    @endif",
			`    @can('edit')`,
			"        bbb",
			"    @endcan",
			`    @auth('user')`,
			"        ccc",
			"    @endauth",
			"</div>",
			"<div>",
			`    @section('title')`,
			"        aaa",
			"    @endsection",
			"</div>",
			"<div>",
			"    @foreach ($users as $user)",
			"        @foreach ($shops as $shop)",
			`            {{ $user['id'] . $shop['id'] }}`,
			"        @endforeach",
			"    @endforeach",
			"</div>",
			"<div>",
			"    @if ($users)",
			"        @foreach ($shops as $shop)",
			`            {{ $user['id'] . $shop['id'] }}`,
			"        @endforeach",
			"    @endif",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("line break around @case, @break and @default", async () => {
		const content = [
			"@switch($type) @case(1) $a = 3; @break @case(2) @case(3) $a = 4; @break @default $a = null; @endswitch",
			"<div>",
			"@switch($type) @case(1) $a = 3; @break @case(2) @case(3) $a = 4; @break @default $a = null; @endswitch",
			"</div>",
			"@switch($type) @case(1) $a = 3; @break @case(2) @case(3) $a = 4; @break @default $a = null; @endswitch",
			`@section('aaa')`,
			"@switch($type)",
			"@case(1)",
			"$a = 3;",
			"@break",
			"",
			"@case(2)",
			"@case(3)",
			"$a = 4;",
			"@break",
			"",
			"@default",
			"$a = null;",
			"@endswitch",
			"@endsection",
			"<div>",
			"@switch($i)",
			"    @case(1)",
			"        @switch($j)",
			"            @case(1)",
			"                First case...",
			"            @break",
			"            @case(2)",
			"                Second case...",
			"            @break",
			"            @default",
			"                Default case...",
			"        @endswitch",
			"    @break",
			"    @case(2)",
			"        hogehoge...",
			"    @break",
			"@endswitch",
			"</div>",
			"@switch($type)",
			"    @case(1)",
			"        $a = 3;",
			"    @break",
			"",
			"    @case(2)",
			"    @case(3)",
			"        $a = 4;",
			"    @break",
			"",
			"@case(3)",
			"    $a = 4;",
			"@break",
			"",
			"@default",
			"    $a = null;",
			"@endswitch",
		].join("\n");

		const expected = [
			"@switch($type)",
			"    @case(1)",
			"        $a = 3;",
			"    @break",
			"",
			"    @case(2)",
			"    @case(3)",
			"        $a = 4;",
			"    @break",
			"",
			"    @default",
			"        $a = null;",
			"@endswitch",
			"<div>",
			"    @switch($type)",
			"        @case(1)",
			"            $a = 3;",
			"        @break",
			"",
			"        @case(2)",
			"        @case(3)",
			"            $a = 4;",
			"        @break",
			"",
			"        @default",
			"            $a = null;",
			"    @endswitch",
			"</div>",
			"@switch($type)",
			"    @case(1)",
			"        $a = 3;",
			"    @break",
			"",
			"    @case(2)",
			"    @case(3)",
			"        $a = 4;",
			"    @break",
			"",
			"    @default",
			"        $a = null;",
			"@endswitch",
			`@section('aaa')`,
			"    @switch($type)",
			"        @case(1)",
			"            $a = 3;",
			"        @break",
			"",
			"        @case(2)",
			"        @case(3)",
			"            $a = 4;",
			"        @break",
			"",
			"        @default",
			"            $a = null;",
			"    @endswitch",
			"@endsection",
			"<div>",
			"    @switch($i)",
			"        @case(1)",
			"            @switch($j)",
			"                @case(1)",
			"                    First case...",
			"                @break",
			"",
			"                @case(2)",
			"                    Second case...",
			"                @break",
			"",
			"                @default",
			"                    Default case...",
			"            @endswitch",
			"        @break",
			"",
			"        @case(2)",
			"            hogehoge...",
			"        @break",
			"",
			"    @endswitch",
			"</div>",
			"@switch($type)",
			"    @case(1)",
			"        $a = 3;",
			"    @break",
			"",
			"    @case(2)",
			"    @case(3)",
			"        $a = 4;",
			"    @break",
			"",
			"    @case(3)",
			"        $a = 4;",
			"    @break",
			"",
			"    @default",
			"        $a = null;",
			"@endswitch",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("else token auto line breaking", async () => {
		const content = [
			"@if (count($users) === 1)",
			"    Foo",
			"@elseif (count($users) > 1)Bar",
			"@elseif (count($users) > 2)Bar2",
			"@else Baz@endif",
			`@can('update') foo @elsecan('read') bar @endcan`,
		].join("\n");

		const expected = [
			"@if (count($users) === 1)",
			"    Foo",
			"@elseif (count($users) > 1)",
			"    Bar",
			"@elseif (count($users) > 2)",
			"    Bar2",
			"@else",
			"    Baz",
			"@endif",
			`@can('update')`,
			"    foo",
			`@elsecan('read')`,
			"    bar",
			"@endcan",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("line breaking with html tag", async () => {
		const content = [
			"<div>",
			`<div>@can('auth')`,
			`foo @elsecan('aaa') bar @endcan</div>`,
			"<div>@foreach($users as $user)",
			"{{$user}} bar @endforeach</div></div>",
			`<p class="@if($verified) mb-6 @endif">@if($user)`,
			"{!!$user!!} @elseif ($authorized) foo @else bar @endif</p>",
			`<input type="text" />`,
			"<p>@for ($i = 0; $i < 5; $i++)",
			"aaa",
			"@endfor</p>",
			"<p>@if($user)",
			"{!!$user!!} @elseif ($authorized) foo @else bar @endif",
			"",
			"</p>",
		].join("\n");

		const expected = [
			"<div>",
			"    <div>",
			`        @can('auth')`,
			"            foo",
			`        @elsecan('aaa')`,
			"            bar",
			"        @endcan",
			"    </div>",
			"    <div>",
			"        @foreach ($users as $user)",
			"            {{ $user }} bar",
			"        @endforeach",
			"    </div>",
			"</div>",
			`<p class="@if ($verified) mb-6 @endif">`,
			"    @if ($user)",
			"        {!! $user !!}",
			"    @elseif ($authorized)",
			"        foo",
			"    @else",
			"        bar",
			"    @endif",
			"</p>",
			`<input type="text" />`,
			"<p>",
			"    @for ($i = 0; $i < 5; $i++)",
			"        aaa",
			"    @endfor",
			"</p>",
			"<p>",
			"    @if ($user)",
			"        {!! $user !!}",
			"    @elseif ($authorized)",
			"        foo",
			"    @else",
			"        bar",
			"    @endif",
			"</p>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("preserve line break of multi-line comment", async () => {
		const content = [
			"{{-- ",
			"foo",
			"--}}",
			"",
			"bar",
			"",
			"{{--",
			"baz",
			"--}}",
		].join("\n");

		const expected = [
			"{{-- ",
			"foo",
			"--}}",
			"",
			"bar",
			"",
			"{{--",
			"baz",
			"--}}",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
