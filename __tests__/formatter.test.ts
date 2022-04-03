import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { BladeFormatter, Formatter } from '../src/main';
import * as cmd from './support/cmd';
import * as util from './support/util';

const formatter = () => {
  return new Formatter({ indentSize: 4 });
};

describe('formatter', () => {
  test('can format plain text', function () {
    const content = 'aaa\n';
    const expected = 'aaa\n';

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  test('outputs end with new line', function () {
    const content = 'aaa';
    const expected = 'aaa\n';

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  test('can format simple html tag', function () {
    const content = `<html><body></body></html>`;
    const expected = [`<html>`, ``, `<body></body>`, ``, `</html>`, ``].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  test('basic blade directive indent', function () {
    const content = [
      `<section>`,
      `<div>`,
      `@if($user)`,
      `{{ $user->name }}`,
      `@endif`,
      `</div>`,
      `</section>`,
      ``,
    ].join('\n');

    const expected = [
      `<section>`,
      `    <div>`,
      `        @if ($user)`,
      `            {{ $user->name }}`,
      `        @endif`,
      `    </div>`,
      `</section>`,
      ``,
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  test('nested directive indent', function () {
    const content = [
      `<section>`,
      `@foreach($users as $user)`,
      `@if($user)`,
      `{{ $user->name }}`,
      `@endif`,
      `@endforeach`,
      `</section>`,
      ``,
    ].join('\n');

    const expected = [
      `<section>`,
      `    @foreach ($users as $user)`,
      `        @if ($user)`,
      `            {{ $user->name }}`,
      `        @endif`,
      `    @endforeach`,
      `</section>`,
      ``,
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  test('hasSection', function () {
    const content = [
      `<section>`,
      `@hasSection('navigation')`,
      `@if ($user)`,
      `{{ $user->name }}`,
      `@endif`,
      `@endif`,
      `</section>`,
      ``,
    ].join('\n');

    const expected = [
      `<section>`,
      `    @hasSection('navigation')`,
      `        @if ($user)`,
      `            {{ $user->name }}`,
      `        @endif`,
      `    @endif`,
      `</section>`,
      ``,
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  const builtInDirectives = [
    'auth',
    'component',
    'empty',
    'can',
    'canany',
    'cannot',
    'forelse',
    'guest',
    'isset',
    'push',
    'section',
    'slot',
    'unless',
    'verbatim',
    'prepend',
    'error',
  ];

  builtInDirectives.forEach((directive) => {
    test('builtin directive test', () => {
      const content = [
        `<section>`,
        `@${directive}($foo)`,
        `@if ($user)`,
        `{{ $user->name }}`,
        `@endif`,
        `@end${directive}`,
        `</section>`,
        ``,
      ].join('\n');

      const expected = [
        `<section>`,
        `    @${directive}($foo)`,
        `        @if ($user)`,
        `            {{ $user->name }}`,
        `        @endif`,
        `    @end${directive}`,
        `</section>`,
        ``,
      ].join('\n');

      return formatter()
        .formatContent(content)
        .then(function (result: any) {
          assert.equal(result, expected);
        });
    });
  });

  const phpDirectives = ['if', 'while'];

  phpDirectives.forEach((directive) => {
    test('php builtin directive test', () => {
      const content = [
        `<section>`,
        `@${directive}($foo)`,
        `@if ($user)`,
        `{{ $user->name }}`,
        `@endif`,
        `@end${directive}`,
        `</section>`,
        ``,
      ].join('\n');

      const expected = [
        `<section>`,
        `    @${directive} ($foo)`,
        `        @if ($user)`,
        `            {{ $user->name }}`,
        `        @endif`,
        `    @end${directive}`,
        `</section>`,
        ``,
      ].join('\n');

      return formatter()
        .formatContent(content)
        .then(function (result: any) {
          assert.equal(result, expected);
        });
    });
  });

  const tokenWithoutParams = ['auth', 'guest', 'production', 'once'];

  tokenWithoutParams.forEach((directive) => {
    test('token without param directive test', () => {
      const content = [
        `<div>`,
        `@${directive}`,
        `@if ($user)`,
        `{{ $user->name }}`,
        `@endif`,
        `@end${directive}`,
        `</div>`,
        ``,
      ].join('\n');

      const expected = [
        `<div>`,
        `    @${directive}`,
        `        @if ($user)`,
        `            {{ $user->name }}`,
        `        @endif`,
        `    @end${directive}`,
        `</div>`,
        ``,
      ].join('\n');

      return formatter()
        .formatContent(content)
        .then(function (result: any) {
          assert.equal(result, expected);
        });
    });
  });

  test('section directive test', () => {
    const content = [
      `<div>`,
      `@section('foo')`,
      `@section('bar')`,
      `@if($user)`,
      `{{ $user->name }}`,
      `@endif`,
      `@endsection`,
      `</div>`,
      ``,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @section('foo')`,
      `    @section('bar')`,
      `        @if ($user)`,
      `            {{ $user->name }}`,
      `        @endif`,
      `    @endsection`,
      `</div>`,
      ``,
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  test('directive token should case insensitive', () => {
    const content = [
      `<div>`,
      `@Section('foo')`,
      `@section('bar')`,
      `@if($user)`,
      `{{ $user->name }}`,
      `@foreach($users as $user)`,
      `{{ $user->id }}`,
      `@endForeach`,
      `@endIf`,
      `@endSection`,
      `</div>`,
      ``,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @Section('foo')`,
      `    @section('bar')`,
      `        @if ($user)`,
      `            {{ $user->name }}`,
      `            @foreach ($users as $user)`,
      `                {{ $user->id }}`,
      `            @endForeach`,
      `        @endIf`,
      `    @endSection`,
      `</div>`,
      ``,
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  test('multiple section directive test', function () {
    const content = [
      `<div>`,
      `@section('foo')`,
      `@section('bar')`,
      `@section('baz')`,
      `@if($user)`,
      `{{ $user->name }}`,
      `@endif`,
      `@endsection`,
      `</div>`,
      ``,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @section('foo')`,
      `    @section('bar')`,
      `    @section('baz')`,
      `        @if ($user)`,
      `            {{ $user->name }}`,
      `        @endif`,
      `    @endsection`,
      `</div>`,
      ``,
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  test('should not clear inline level directive', () => {
    const content = [`<div>`, `@section foo @endsection`, `</div>`, ``].join('\n');

    const expected = [`<div>`, `    @section foo @endsection`, `</div>`, ``].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  test('should not clear php code inside inline @php directive #3', () => {
    const content = [`<div>`, `@php $bg = rand(1, 13); $bgchange = $bg.".jpg"; @endphp`, `</div>`, ``].join('\n');

    const expected = [
      `<div>`,
      `    @php`,
      `        $bg = rand(1, 13);`,
      `        $bgchange = $bg . '.jpg';`,
      `    @endphp`,
      `</div>`,
      ``,
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  // https://github.com/shufo/blade-formatter/issues/3#issuecomment-552139588
  // eslint-disable-next-line max-len
  test('should indent correctly even if inline directive and div tags are mixed', () => {
    const content = [
      `@section('content')`,
      `    <div class="content-header">`,
      `        <div>@php echo 'FOO'; @endphp</div>`,
      `    </div>`,
      `    <div>@php echo 'FOO'; @endphp</div>`,
      `@endsection`,
      '',
    ].join('\n');

    const expected = [
      `@section('content')`,
      `    <div class="content-header">`,
      `        <div>@php echo 'FOO'; @endphp</div>`,
      `    </div>`,
      `    <div>@php echo 'FOO'; @endphp</div>`,
      `@endsection`,
      '',
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result: any) {
        assert.equal(result, expected);
      });
  });

  // refs: https://github.com/shufo/blade-formatter/issues/48
  test('it should not pad original blankline', async () => {
    const content = [
      `@section('content')`,
      `<div class="content-header">`,
      `<div>@php echo 'FOO'; @endphp</div>`,
      ``, // blankline
      `</div>`,
      `@endsection`,
      '',
    ].join('\n');

    const expected = [
      `@section('content')`,
      `    <div class="content-header">`,
      `        <div>@php echo 'FOO'; @endphp</div>`,
      ``, // should be keep original line
      `    </div>`,
      `@endsection`,
      '',
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then((result: any) => {
        assert.equal(result, expected);
      });
  });

  test('preserve multiline php tag #57', async () => {
    const content = [
      `<?php`,
      `/**`,
      ` * @var \Modules\Common\PageDataBuilderV2\RenderableItems\Card $card`,
      ` */`,
      `?>`,
      `@extends('layouts.mainLayout')`,
      ``,
      `@section('someBlock')`,
      ``,
      `@endsection`,
      '',
    ].join('\n');

    const expected = [
      `<?php`,
      `/**`,
      ` * @var \Modules\Common\PageDataBuilderV2\RenderableItems\Card $card`,
      ` */`,
      `?>`,
      `@extends('layouts.mainLayout')`,
      ``,
      `@section('someBlock')`,
      `@endsection`,
      '',
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then((result: any) => {
        assert.equal(result, expected);
      });
  });

  test('preserve inline php tag #57', async () => {
    const content = [`<body data-app="<?php echo json_encode($array); ?>"`, ''].join('\n');

    const expected = [`<body data-app="<?php echo json_encode($array); ?>"`, ''].join('\n');

    return formatter()
      .formatContent(content)
      .then((result: any) => {
        assert.equal(result, expected);
      });
  });

  test('preserve inline php tag in script', async () => {
    const content = [`<script>`, `    var app = <?php echo json_encode($array); ?>;`, `</script>`, ''].join('\n');

    const expected = [`<script>`, `    var app = <?php echo json_encode($array); ?>;`, `</script>`, ''].join('\n');

    return formatter()
      .formatContent(content)
      .then((result: any) => {
        assert.equal(result, expected);
      });
  });

  test('it should be ignore script tag #4', async () => {
    const content = [
      `<script nonce="{{ Bepsvpt\SecureHeaders\SecureHeaders::nonce() }}">`,
      `    var app = <?php echo json_encode($array); ?>;`,
      `</script>`,
      '',
    ].join('\n');

    const expected = [
      `<script nonce="{{ Bepsvpt\SecureHeaders\SecureHeaders::nonce() }}">`,
      `    var app = <?php echo json_encode($array); ?>;`,
      `</script>`,
      '',
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then((result: any) => {
        assert.equal(result, expected);
      });
  });

  test('should be ignore short tag #56', async () => {
    const content = [`<table>`, `<th><?= $userName ?></th>`, `</table>`, ''].join('\n');

    const expected = [`<table>`, `    <th><?= $userName ?></th>`, `</table>`, ''].join('\n');

    return formatter()
      .formatContent(content)
      .then((result: any) => {
        assert.equal(result, expected);
      });
  });

  test('format API', async () => {
    const content = [`<table>`, `<th><?= $userName ?></th>`, `</table>`, ''].join('\n');

    const expected = [`<table>`, `    <th><?= $userName ?></th>`, `</table>`, ''].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('format API with option', async () => {
    const content = [`<table>`, `<th><?= $userName ?></th>`, `</table>`, ''].join('\n');

    const expected = [`<table>`, `  <th><?= $userName ?></th>`, `</table>`, ''].join('\n');

    return new BladeFormatter({ indentSize: 2 }).format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should remove semicolon in end of line', async () => {
    const content = [
      `{!! strip_tags($header) !!}`,
      ``,
      `{!! strip_tags($slot) !!}`,
      `@isset($subcopy)`,
      `{!! strip_tags($subcopy) !!}`,
      `@endisset`,
      ``,
      `{!! strip_tags($footer); !!}`,
      ``,
    ].join('\n');

    const expected = [
      `{!! strip_tags($header) !!}`,
      ``,
      `{!! strip_tags($slot) !!}`,
      `@isset($subcopy)`,
      `    {!! strip_tags($subcopy) !!}`,
      `@endisset`,
      ``,
      `{!! strip_tags($footer) !!}`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('@for directive should work', async () => {
    const content = [`@for ($i=0;$i<=5;$i++)`, `<div class="foo">`, `</div>`, `@endfor`, ``].join('\n');

    const expected = [`@for ($i = 0; $i <= 5; $i++)`, `    <div class="foo">`, `    </div>`, `@endfor`, ``].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('@foreach directive should work', async () => {
    const content = [`@foreach($users as $user)`, `<div class="foo">`, `</div>`, `@endforeach`, ``].join('\n');

    const expected = [`@foreach ($users as $user)`, `    <div class="foo">`, `    </div>`, `@endforeach`, ``].join(
      '\n',
    );

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('@foreach directive should work with variable key', async () => {
    const content = [`@foreach($users["foo"] as $user)`, `<div class="foo">`, `</div>`, `@endforeach`, ``].join('\n');

    const expected = [
      `@foreach ($users['foo'] as $user)`,
      `    <div class="foo">`,
      `    </div>`,
      `@endforeach`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('@foreach directive should work with children methods', async () => {
    const content = [`@foreach($user->blogs() as $blog)`, `<div class="foo">`, `</div>`, `@endforeach`, ``].join('\n');

    const expected = [
      `@foreach ($user->blogs() as $blog)`,
      `    <div class="foo">`,
      `    </div>`,
      `@endforeach`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('@switch directive should work', async () => {
    const content = [
      `@switch($i)`,
      `@case(1)`,
      `    First case...`,
      `    @break`,
      ``,
      `@case(2)`,
      `    Second case...`,
      `    @break`,
      ``,
      `@case(3)`,
      `@case(4)`,
      `    Third case...`,
      `    @break`,
      ``,
      `@default`,
      `    Default case...`,
      `@endswitch`,
      ``,
    ].join('\n');

    const expected = [
      `@switch($i)`,
      `    @case(1)`,
      `        First case...`,
      `    @break`,
      ``,
      `    @case(2)`,
      `        Second case...`,
      `    @break`,
      ``,
      `    @case(3)`,
      `    @case(4)`,
      `        Third case...`,
      `    @break`,
      ``,
      `    @default`,
      `        Default case...`,
      `@endswitch`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('method call should not indented in blade brackets #2', async () => {
    const content = [`{{ auth()->user()->getSeeding() }}`, ``].join('\n');

    const expected = [
      `{{ auth()->user()->getSeeding() }}`,
      ``,
      /*  */
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('indented call should be inline in blade brackets #2', async () => {
    const content = [`{{ auth()`, `    ->user()`, `    ->getSeeding() }}`, ``].join('\n');

    const expected = [
      `{{ auth()->user()->getSeeding() }}`,
      ``,
      /*  */
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('method call in directive should not be multiline #2', async () => {
    const content = [`@if(auth()->user()->name === 'foo')`, `    <p>bar</p>`, `@endif`, ``].join('\n');

    const expected = [
      `@if (auth()->user()->name === 'foo')`,
      `    <p>bar</p>`,
      `@endif`,
      ``,
      /*  */
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should remain tags even if php tag exists vscode-blade-formattere#2', async () => {
    const content = [
      `<?php`,
      `/* Some comments on this template`,
      ` */`,
      `?>`,
      `<div class="font-ext-links">`,
      `    <a class="btn btn-cta" href="{{ url('download/' . $font->slug) }}" title="Download {{ $font->title }}">`,
      `        <i class="fa fa-fw fa-download"></i>`,
      `        Download`,
      `    </a>`,
      ``,
      `</div>`,
      ``,
    ].join('\n');

    const expected = [
      `<?php`,
      `/* Some comments on this template`,
      ` */`,
      `?>`,
      `<div class="font-ext-links">`,
      `    <a class="btn btn-cta" href="{{ url('download/' . $font->slug) }}" title="Download {{ $font->title }}">`,
      `        <i class="fa fa-fw fa-download"></i>`,
      `        Download`,
      `    </a>`,
      ``,
      `</div>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should not format nbsp', async () => {
    const content = [
      `{{ trans('email.website_title') }}&nbsp;`,
      `<a href="mailto:{{ trans('email.website_url') }}">{{ trans('email.website_url') }}</a>`,
      ``,
    ].join('\n');

    const expected = [
      `{{ trans('email.website_title') }}&nbsp;`,
      `<a href="mailto:{{ trans('email.website_url') }}">{{ trans('email.website_url') }}</a>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should not occurs error with if directive', async () => {
    const content = [`@if($user)`, `    foo`, `@endif`, ``].join('\n');

    const expected = [`@if ($user)`, `    foo`, `@endif`, ``].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should not occurs error on directive inside html tag ', async () => {
    const content = [
      `<body class="hold-transition login-page" @if(config('admin.login_background_image'))style="background: url({{ config('admin.login_background_image') }}) no-repeat;background-size: cover;"`,
      `    @endif>`,
      ``,
    ].join('\n');

    const expected = [
      `<body class=\"hold-transition login-page\"`,
      `    @if (config('admin.login_background_image')) style=\"background: url({{ config('admin.login_background_image') }}) no-repeat;background-size: cover;\" @endif>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should not occurs error even if 3 level nested in directive', async () => {
    const content = [`@if(config('app.foo', env('APP_FOO_BAR')))`, `    foo`, `@endif>`, ``].join('\n');

    const expected = [`@if (config('app.foo', env('APP_FOO_BAR')))`, `    foo`, `@endif>`, ``].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('forelse directive should work', async () => {
    const content = [`@forelse($students as $student)`, `<div>foo</div>`, `@empty`, `empty`, `@endforelse`, ``].join(
      '\n',
    );

    const expected = [
      `@forelse($students as $student)`,
      `    <div>foo</div>`,
      `@empty`,
      `    empty`,
      `@endforelse`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should preserve spaces between directive and parentheses', async () => {
    const content = [`@if($user === 'foo')`, `foo`, `@endif`, ``].join('\n');

    const expected = [`@if ($user === 'foo')`, `    foo`, `@endif`, ``].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should preserve spaces between directive and parentheses (space exists)', async () => {
    const content = [`@foreach ($users as $user)`, `foo`, `@endif`, ``].join('\n');

    const expected = [`@foreach ($users as $user)`, `    foo`, `@endif`, ``].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should keep format even if @include directive exists', async () => {
    const content = [
      `{{ Form::open(['route' => 'withdraw.withdraw', 'method' => 'post', 'id'=>'form01']) }}`,
      `{{ Form::close() }}`,
      ``,
      `@include('common.footer_js')`,
      ``,
    ].join('\n');

    const expected = [
      `{{ Form::open(['route' => 'withdraw.withdraw', 'method' => 'post', 'id' => 'form01']) }}`,
      `{{ Form::close() }}`,
      ``,
      `@include('common.footer_js')`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should keep format with while and section', async () => {
    const content = [
      `@extends('layouts.app')`,
      ``,
      `@section('content')`,
      `@include('partials.page-header')`,
      ``,
      `@if(!have_posts())`,
      `<x-alert type="warning">`,
      `{!! __('Sorry, no results were found.', 'sage') !!}`,
      `</x-alert>`,
      ``,
      `{!! get_search_form(false) !!}`,
      `@endif`,
      ``,
      `@while(have_posts()) @php(the_post())`,
      `@includeFirst(['partials.content-' . get_post_type(), 'partials.content'])`,
      `@endwhile`,
      ``,
      `{!! get_the_posts_navigation() !!}`,
      `@endsection`,
      ``,
      `@section('sidebar')`,
      `@include('partials.sidebar')`,
      `@endsection`,
      ``,
    ].join('\n');

    const expected = [
      `@extends('layouts.app')`,
      ``,
      `@section('content')`,
      `    @include('partials.page-header')`,
      ``,
      `    @if (!have_posts())`,
      `        <x-alert type="warning">`,
      `            {!! __('Sorry, no results were found.', 'sage') !!}`,
      `        </x-alert>`,
      ``,
      `        {!! get_search_form(false) !!}`,
      `    @endif`,
      ``,
      `    @while (have_posts())`,
      `        @php(the_post())`,
      `        @includeFirst(['partials.content-' . get_post_type(), 'partials.content'])`,
      `    @endwhile`,
      ``,
      `    {!! get_the_posts_navigation() !!}`,
      `@endsection`,
      ``,
      `@section('sidebar')`,
      `    @include('partials.sidebar')`,
      `@endsection`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('mixed html tag and directive #5', async () => {
    const content = [
      `@extends('dashboard')`,
      ``,
      `@section('content')`,
      `@if( $member->isAdmin() )`,
      `<div class="focus">`,
      `@endif`,
      `<span>Test!</span>`,
      `@if( $member->isAdmin() )`,
      `</div>`,
      `@endif`,
      `@endsection`,
      ``,
    ].join('\n');

    const expected = [
      `@extends('dashboard')`,
      ``,
      `@section('content')`,
      `    @if ($member->isAdmin())`,
      `        <div class="focus">`,
      `    @endif`,
      `    <span>Test!</span>`,
      `    @if ($member->isAdmin())`,
      `        </div>`,
      `    @endif`,
      `@endsection`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('escaped brace without line return issue shufo/vscode-blade-formatter#12', async () => {
    const content = [
      `{!! Form::open(['method' => 'DELETE', 'route' => ['roles.destroy', $role->id], 'style' => 'display:inline']) !!}`,
      `{!! Form::submit('Delete', ['class' => 'btn btn-danger']) !!}`,
      `{!! Form::close() !!}`,
    ].join('\n');

    const expected = [
      `{!! Form::open(['method' => 'DELETE', 'route' => ['roles.destroy', $role->id], 'style' => 'display:inline']) !!}`,
      `{!! Form::submit('Delete', ['class' => 'btn btn-danger']) !!}`,
      `{!! Form::close() !!}`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('braces without content should not occurs error', async () => {
    const content = [
      `<x-app-layout title="Add new client">`,
      `    <section class="section">`,
      `        {{ }}`,
      `    </section>`,
      `</x-app-layout>`,
    ].join('\n');

    const expected = [
      `<x-app-layout title="Add new client">`,
      `    <section class="section">`,
      `        {{ }}`,
      `    </section>`,
      `</x-app-layout>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('directive in html attribute should not occurs error', async () => {
    const content = [
      `@if (count($topics))`,
      `    <ul class="list-group border-0">`,
      `        @foreach ($topics as $topic)`,
      `            <li class="list-group-item border-right-0 border-left-0 @if ($loop->first) border-top-0 @endif"></li>`,
      `        @endforeach`,
      `    </ul>`,
      `@endif`,
    ].join('\n');

    const expected = [
      `@if (count($topics))`,
      `    <ul class="list-group border-0">`,
      `        @foreach ($topics as $topic)`,
      `            <li`,
      `                class="list-group-item border-right-0 border-left-0 @if ($loop->first) border-top-0 @endif">`,
      `            </li>`,
      `        @endforeach`,
      `    </ul>`,
      `@endif`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should consider directive in html tag', async () => {
    const cmdResult = await cmd.execute(path.resolve('bin', 'blade-formatter'), [
      path.resolve('__tests__', 'fixtures', 'inline_php_tag.blade.php'),
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted_inline_php_tag.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test('should not occurs error on inline if to end directive on long line', async () => {
    const content = [`<div>`, `@if (count($users) && $users->has('friends')) {{ $user->name }} @endif`, `</div>`].join(
      '\n',
    );

    const expected = [
      `<div>`,
      `    @if (count($users) && $users->has('friends'))`,
      `        {{ $user->name }}`,
      `    @endif`,
      `</div>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should format within @php directive', async () => {
    const content = [`    @php`, `    if ($user) {`, `    $user->name = 'foo';`, `    }`, `    @endphp`].join('\n');

    const expected = [
      `    @php`,
      `        if ($user) {`,
      `            $user->name = 'foo';`,
      `        }`,
      `    @endphp`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  const predefinnedConstants = [
    'PHP_VERSION',
    'PHP_RELEASE_VERSION',
    'PHP_VERSION_ID',
    'PHP_OS_FAMILY',
    'PHP_FLOAT_DIG',
  ];

  predefinnedConstants.forEach((constant) => {
    test('should format php predefined constants', async () => {
      const content = [`{{ ${constant} }}`].join('\n');
      const expected = [`{{ ${constant} }}`, ''].join('\n');

      return new BladeFormatter().format(content).then((result: any) => {
        assert.equal(result, expected);
      });
    });
  });

  test('should format null safe operator', async () => {
    const content = [`{{ $entity->executors->first()?->name() }}`].join('\n');

    const expected = [`{{ $entity->executors->first()?->name() }}`, ``].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should format named arguments', async () => {
    const content = [`{{ foo(double_encode:  true) }}`].join('\n');

    const expected = [`{{ foo(double_encode: true) }}`, ``].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should format blade directive in scripts', async () => {
    const content = [
      `    <script>`,
      `        @isset($data['eval_gestionnaire']->project_perception) foo @endisset`,
      `    </script>`,
    ].join('\n');

    const expected = [
      `    <script>`,
      `        @isset($data['eval_gestionnaire']->project_perception)`,
      `            foo`,
      `        @endisset`,
      `    </script>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should format multiple blade directive in script tag', async () => {
    const content = [
      '<script>',
      '   @if ($user)',
      '         let a = 1;',
      ' @else',
      '     let b = 0;',
      '             @endif',
      '',
      '   const a = 0;',
      '',
      '',
      '       @foreach ($users as $user)',
      '           let b = 1;',
      '   @endforeach',
      '</script>',
    ].join('\n');

    const expected = [
      '<script>',
      '    @if ($user)',
      '        let a = 1;',
      '    @else',
      '        let b = 0;',
      '    @endif',
      '',
      '    const a = 0;',
      '',
      '',
      '    @foreach ($users as $user)',
      '        let b = 1;',
      '    @endforeach',
      '</script>',
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should format inline directive in scripts #231', async () => {
    const content = [`<script> @Isset($data['eval_gestionnaire']->project_perception) foo @endisset </script>`].join(
      '\n',
    );

    const expected = [
      `<script>`,
      `    @isset($data['eval_gestionnaire']->project_perception)`,
      `        foo`,
      `    @endisset`,
      `</script>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  const elseEnabledDirectives = ['can', 'canany', 'cannot'];

  elseEnabledDirectives.forEach((directive) => {
    test(`else directives test - ${directive}`, async () => {
      const content = [
        `<section>`,
        `@${directive}(["update",'read'],$user)`,
        `@if ($user)`,
        `{{ $user->name }}`,
        `@endif`,
        `@else${directive}(['delete'], $user)`,
        `foo`,
        `@else`,
        `bar`,
        `@end${directive}`,
        `</section>`,
        ``,
      ].join('\n');

      const expected = [
        `<section>`,
        `    @${directive}(['update', 'read'], $user)`,
        `        @if ($user)`,
        `            {{ $user->name }}`,
        `        @endif`,
        `    @else${directive}(['delete'], $user)`,
        `        foo`,
        `    @else`,
        `        bar`,
        `    @end${directive}`,
        `</section>`,
        ``,
      ].join('\n');

      return formatter()
        .formatContent(content)
        .then(function (result: any) {
          assert.equal(result, expected);
        });
    });
  });

  test('should break chained method in directive', async () => {
    const content = ['@if (auth()', '->user()', "->subscribed('default'))", 'aaa', '@endif'].join('\n');

    const expected = ["@if (auth()->user()->subscribed('default'))", '    aaa', '@endif', ``].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should break chained method in directive 2', async () => {
    const content = ['@foreach (request()->users() as $user)', 'aaa', '@endif'].join('\n');

    const expected = ['@foreach (request()->users() as $user)', '    aaa', '@endif', ``].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('should format inline function directives in scripts', async () => {
    const content = [
      `<script type="text/javascript">`,
      `    const errors = @json($errors -> all("aaa"));`,
      `    console.log(errors, errors.length);`,
      `</script>`,
    ].join('\n');

    const expected = [
      `<script type="text/javascript">`,
      `    const errors = @json($errors->all('aaa'));`,
      `    console.log(errors, errors.length);`,
      `</script>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('forelse inside if directive should work #254', async () => {
    const content = [
      '@if (true)',
      '<table>',
      '@forelse($elems as $elem)',
      '<tr></tr>',
      '@empty',
      '<tr></tr>',
      '@endforelse',
      '</table>',
      '@endif',
    ].join('\n');

    const expected = [
      '@if (true)',
      '    <table>',
      '        @forelse($elems as $elem)',
      '            <tr></tr>',
      '        @empty',
      '            <tr></tr>',
      '        @endforelse',
      '    </table>',
      '@endif',
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('directives with optional endtags', async () => {
    const content = [
      `@extends('layouts.test')`,
      `@section('title', 'This is title')`,
      `@section('content')`,
      `    <div class="someClass">`,
      `        This is content.`,
      `    </div>`,
      `@endsection`,
      ``,
      `@if (true)`,
      `    @push('some-stack', $some->getContent())`,
      `    @section($aSection, $some->content)`,
      `    @push('some-stack')`,
      `        more`,
      `    @endpush`,
      `    @prepend($stack->name, 'here we go')`,
      `@endif`,
      ``,
    ].join('\n');
    return new BladeFormatter().format(content).then((result: any) => {
      assert.equal(result, content);
    });
  });

  test('force expand multilines', async () => {
    const content = [
      '<div id="username" class="min-h-48 flex flex-col justify-center">',
      '@if (Auth::check())',
      '@php($user = Auth::user())',
      '{{ $user->name }}',
      '@endif',
      '</div>',
    ].join('\n');

    const expected = [
      '<div',
      '    id="username"',
      '    class="min-h-48 flex flex-col justify-center"',
      '>',
      '    @if (Auth::check())',
      '        @php($user = Auth::user())',
      '        {{ $user->name }}',
      '    @endif',
      '</div>',
      ``,
    ].join('\n');

    return new BladeFormatter({ wrapAttributes: 'force-expand-multiline' }).format(content).then((result: any) => {
      assert.equal(result, expected);
    });
  });

  test('component attribute name #346', async () => {
    let content = [`<x-button btnClass="XXXXXX" />`].join('\n');
    let expected = [`<x-button btnClass="XXXXXX" />`, ``].join('\n');

    util.doubleFormatCheck(content, expected);

    content = [`<x-button `, `    btnClass="XXXXXX"`, `/>`].join('\n');
    expected = [`<x-button btnClass="XXXXXX" />`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('empty class atrbitue', async () => {
    let content = [`<div class=""></div>`].join('\n');
    let expected = [`<div class=""></div>`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);

    content = [
      `<input class="" type="file" name="product_images[]" multiple />
`,
    ].join('\n');
    expected = [`<input class="" type="file" name="product_images[]" multiple />`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('support laravel-permission directives', async () => {
    const directives = [
      {
        start: '@role',
        end: '@endrole',
      },
      {
        start: '@hasrole',
        end: '@endhasrole',
      },
      {
        start: '@hasanyrole',
        end: '@endhasanyrole',
      },
      {
        start: '@hasallroles',
        end: '@endhasallroles',
      },
      {
        start: '@unlessrole',
        end: '@endunlessrole',
      },
      {
        start: '@hasexactroles',
        end: '@endhasexactroles',
      },
    ];

    directives.forEach(async (target) => {
      const content = [`<div class="">`, `${target.start}('foo')`, `<div>bar</div>`, `${target.end}`, `</div>`].join(
        '\n',
      );
      const expected = [
        `<div class="">`,
        `    ${target.start}('foo')`,
        `        <div>bar</div>`,
        `    ${target.end}`,
        `</div>`,
        ``,
      ].join('\n');

      await util.doubleFormatCheck(content, expected);
    });
  });

  test('@class directive', async () => {
    let content = [`<span @class([ 'p-4' , 'font-bold'=>$isActive])></span>`].join('\n');
    let expected = [`<span @class(['p-4', 'font-bold' => $isActive])></span>`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);

    content = [`<span @class([ 'p-4' , 'font-bold'=>$isActive,`, `    ])></span>`].join('\n');

    expected = [`<span @class(['p-4', 'font-bold' => $isActive])></span>`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);

    content = [
      `<span @class([ 'p-4',`,
      `   'font-bold'=>$isActive,`,
      `   'text-gray-500' => !$isActive,`,
      `   'bg-red' => $hasError,`,
      `])></span>`,
    ].join('\n');

    expected = [
      '<span @class([',
      `    'p-4',`,
      `    'font-bold' => $isActive,`,
      `    'text-gray-500' => !$isActive,`,
      `    'bg-red' => $hasError,`,
      `])></span>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);

    content = [
      '<div>',
      `<span @class([ 'p-4',`,
      `   'font-bold'=>$isActive,`,
      `   'text-gray-500' => !$isActive,`,
      `   'bg-red' => $hasError,`,
      '])></span>',
      `</div>`,
    ].join('\n');

    expected = [
      '<div>',
      `    <span @class([`,
      `        'p-4',`,
      `        'font-bold' => $isActive,`,
      `        'text-gray-500' => !$isActive,`,
      `        'bg-red' => $hasError,`,
      `    ])></span>`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('@button directive', async () => {
    let content = [`@button(['class'=>'btn btn-primary p-btn-wide',])`].join('\n');
    let expected = [`@button(['class' => 'btn btn-primary p-btn-wide'])`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);

    content = [`@button([`, `'class'=>'btn btn-primary p-btn-wide',`, `])`].join('\n');

    expected = [`@button([`, `    'class' => 'btn btn-primary p-btn-wide',`, `])`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);

    content = [`<div>`, `@button(['class' => 'btn btn-primary p-btn-wide',])`, `</div>`].join('\n');

    expected = [`<div>`, `    @button(['class' => 'btn btn-primary p-btn-wide'])`, `</div>`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);

    content = [
      `<div>`,
      `@button([`,
      `'class' => 'btn btn-primary p-btn-wide',`,
      `'text' => 'Save',`,
      `])`,
      `</div>`,
    ].join('\n');

    expected = [
      `<div>`,
      `    @button([`,
      `        'class' => 'btn btn-primary p-btn-wide',`,
      `        'text' => 'Save',`,
      `    ])`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);

    content = [
      `<div>`,
      `<div>`,
      `@button([`,
      `'class' => 'btn btn-primary p-btn-wide',`,
      `'text' => 'Save',`,
      `])`,
      `</div>`,
      `</div>`,
    ].join('\n');

    expected = [
      `<div>`,
      `    <div>`,
      `        @button([`,
      `            'class' => 'btn btn-primary p-btn-wide',`,
      `            'text' => 'Save',`,
      `        ])`,
      `    </div>`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('@forelse-@empty-@endforelse directive in scripts', async () => {
    const content = [
      `<script>`,
      `    var addNewCoin = [`,
      `        @forelse($coins as $coin)`,
      `            {`,
      `                 "id": {{$coin->id }},`,
      `            "name": "{{ $coin->name }}"`,
      `            },`,
      `               @empty`,
      `        @endforelse`,
      `    ];`,
      `</script>`,
    ].join('\n');

    const expected = [
      `<script>`,
      `    var addNewCoin = [`,
      `        @forelse($coins as $coin)`,
      `            {`,
      `            "id": {{ $coin->id }},`,
      `            "name": "{{ $coin->name }}"`,
      `            },`,
      `        @empty`,
      `        @endforelse`,
      `    ];`,
      `</script>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('quoted expression should not adds space', async () => {
    const content = [
      `@foreach ($items as $item)`,
      `    @switch($item->status)`,
      `        @case("status")`,
      `            // Do something`,
      `        @break`,
      `    @endswitch`,
      `@endforeach`,
    ].join('\n');

    const expected = [
      `@foreach ($items as $item)`,
      `    @switch($item->status)`,
      `        @case('status')`,
      `            // Do something`,
      `        @break`,
      `    @endswitch`,
      `@endforeach`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('conditional expression', async () => {
    const content = [
      `@if ($condition < 1)`,
      `    {{-- Do something --}}`,
      `@elseif ($condition <2)`,
      `    {{-- Do something --}}`,
      `@elseif ($condition< 3)`,
      `        {{-- Do something --}}`,
      `@else`,
      `    {{-- Do something --}}`,
      `@endif`,
    ].join('\n');

    const expected = [
      `@if ($condition < 1)`,
      `    {{-- Do something --}}`,
      `@elseif ($condition < 2)`,
      `    {{-- Do something --}}`,
      `@elseif ($condition < 3)`,
      `    {{-- Do something --}}`,
      `@else`,
      `    {{-- Do something --}}`,
      `@endif`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('conditional expression (while)', async () => {
    const content = [`@while ($condition< 1)`, `{{-- Do something --}}`, `@endwhile`].join('\n');

    const expected = [`@while ($condition < 1)`, `    {{-- Do something --}}`, `@endwhile`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('ignore formatting between blade-formatter-disable and blade-formatter-enable', async () => {
    const content = [
      `@if ($condition < 1)`,
      `                {{ $user }}`,
      `    {{-- blade-formatter-disable --}}`,
      `                {{ $foo}}`,
      `    {{-- blade-formatter-enable --}}`,
      `@elseif (!condition())`,
      `          {{ $user }}`,
      `@elseif ($condition < 3)`,
      `              {{ $user }}`,
      `    {{-- blade-formatter-disable --}}`,
      `              {{ $bar}}`,
      `    {{-- blade-formatter-enable --}}`,
      `@endif`,
    ].join('\n');

    const expected = [
      `@if ($condition < 1)`,
      `    {{ $user }}`,
      `    {{-- blade-formatter-disable --}}`,
      `                {{ $foo}}`,
      `    {{-- blade-formatter-enable --}}`,
      `@elseif (!condition())`,
      `    {{ $user }}`,
      `@elseif ($condition < 3)`,
      `    {{ $user }}`,
      `    {{-- blade-formatter-disable --}}`,
      `              {{ $bar}}`,
      `    {{-- blade-formatter-enable --}}`,
      `@endif`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('ignore formatting after blade-formatter-disable-next-line', async () => {
    const content = [
      `<div>`,
      `@if ($condition < 1)`,
      `    {{-- blade-formatter-disable-next-line --}}`,
      `                {{ $user }}`,
      `@elseif ($condition < 3)`,
      `              {{ $user }}`,
      `@endif`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @if ($condition < 1)`,
      `        {{-- blade-formatter-disable-next-line --}}`,
      `                {{ $user }}`,
      `    @elseif ($condition < 3)`,
      `        {{ $user }}`,
      `    @endif`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('ignore formatting entire file if blade-formatter-disable on a first line', async () => {
    const content = [
      `{{-- blade-formatter-disable --}}`,
      `<div>`,
      `{{-- blade-formatter-disable --}}`,
      `                {{ $foo}}`,
      `{{-- blade-formatter-enable --}}`,
      `@if ($condition < 1)`,
      `    {{-- blade-formatter-disable-next-line --}}`,
      `                {{ $user }}`,
      `@elseif ($condition < 3)`,
      `              {{ $user }}`,
      `@endif`,
      `</div>`,
      ``,
    ].join('\n');

    const expected = [
      `{{-- blade-formatter-disable --}}`,
      `<div>`,
      `{{-- blade-formatter-disable --}}`,
      `                {{ $foo}}`,
      `{{-- blade-formatter-enable --}}`,
      `@if ($condition < 1)`,
      `    {{-- blade-formatter-disable-next-line --}}`,
      `                {{ $user }}`,
      `@elseif ($condition < 3)`,
      `              {{ $user }}`,
      `@endif`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('double curly brace expression for js framework', async () => {
    const content = [
      `<user-listing :data="{{ $data }}" :url="'{{ route('admin.users.index') }}'" v-cloak inline-template>`,
      `    <tr v-for="item in items" :key="item.id">`,
      `        <td>@{{ ok? 'YES': 'NO' }}</td>`,
      `        <td>`,
      `        @{{ message.split('').reverse().join('') }}`,
      `        </td>`,
      `        @{{item.roles.map(role=>role.name).join(', ')}}`,
      `    </tr>`,
      `</user-listing>`,
    ].join('\n');

    const expected = [
      `<user-listing :data="{{ $data }}" :url="'{{ route('admin.users.index') }}'" v-cloak inline-template>`,
      `    <tr v-for="item in items" :key="item.id">`,
      `        <td>@{{ ok ? 'YES' : 'NO' }}</td>`,
      `        <td>`,
      `            @{{ message.split('').reverse().join('') }}`,
      `        </td>`,
      `        @{{ item.roles.map(role => role.name).join(', ') }}`,
      `    </tr>`,
      `</user-listing>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('slow without endslot directive https://github.com/shufo/vscode-blade-formatter/issues/304', async () => {
    const content = [
      `@component('components.article.intro')`,
      `    @slot('date', $article->formatDate)`,
      `        @slot('read_mins', $article->readTime)`,
      `            @if ($author)`,
      `                @slot('authors', [['link' => $author_link, 'name' => $author]])`,
      `                @endif`,
      `                @slot('intro_text')`,
      `                    {!! $article->introduction !!}`,
      `                @endslot`,
      `            @endcomponent`,
    ].join('\n');

    const expected = [
      `@component('components.article.intro')`,
      `    @slot('date', $article->formatDate)`,
      `    @slot('read_mins', $article->readTime)`,
      `    @if ($author)`,
      `        @slot('authors', [['link' => $author_link, 'name' => $author]])`,
      `    @endif`,
      `    @slot('intro_text')`,
      `        {!! $article->introduction !!}`,
      `    @endslot`,
      `@endcomponent`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('@permission directive', async () => {
    const content = [
      `@permission('post.edit')`,
      `<button class="btn btn-primary" onclick="editPost({{ $id }})">Edit Post</button>`,
      `@endpermission`,
    ].join('\n');

    const expected = [
      `@permission('post.edit')`,
      `    <button class="btn btn-primary" onclick="editPost({{ $id }})">Edit Post</button>`,
      `@endpermission`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('formatter throws exception on syntax error', async () => {
    const content = [
      `@permission('post.edit')`,
      `<button class="btn btn-primary" onclick="editPost({{ users('foo) }})">Edit Post</button>`,
      `@endpermission`,
    ].join('\n');

    await expect(new BladeFormatter().format(content)).rejects.toThrow('SyntaxError');
  });

  test('inline nested parenthesis #350', async () => {
    const content = [
      `@if ($user)`,
      `    <div>`,
      `    {{ asset(auth()->user()->getUserMedia('first', 'second')) }}`,
      `    {{ asset4(asset1(asset2(asset3(auth()->user($aaaa['bbb'])->aaa("aaa"))))) }}`,
      `    {{ asset(auth()->user($aaaa["bbb"])->aaa('aaa')) }}`,
      `    {{ $user }}`,
      `    {{ auth()->user( ["bar","ccc"])->foo("aaa")  }}`,
      `    {{ asset(auth()->user(['bar', 'ccc'])->tooooooooooooooooooooooooooooooooooolongmethod('aaa')->chained()->tooooooooooooooooooooooooooo()->long()) }}`,
      `    </div>`,
      `@endif`,
    ].join('\n');

    const expected = [
      `@if ($user)`,
      `    <div>`,
      `        {{ asset(auth()->user()->getUserMedia('first', 'second')) }}`,
      `        {{ asset4(asset1(asset2(asset3(auth()->user($aaaa['bbb'])->aaa('aaa'))))) }}`,
      `        {{ asset(auth()->user($aaaa['bbb'])->aaa('aaa')) }}`,
      `        {{ $user }}`,
      `        {{ auth()->user(['bar', 'ccc'])->foo('aaa') }}`,
      `        {{ asset(auth()->user(['bar', 'ccc'])->tooooooooooooooooooooooooooooooooooolongmethod('aaa')->chained()->tooooooooooooooooooooooooooo()->long()) }}`,
      `    </div>`,
      `@endif`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('3 more level nested parenthesis #340', async () => {
    const content = [
      `<div>`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `    foo`,
      `    @endif`,
      `    @if (count($foo->bar(Auth::user($baz->method()), Request::path())) >= 1)`,
      `    foo`,
      `    @endif`,
      `    @foreach (Auth::users($my->users($as->foo)) as $user)`,
      `    foo`,
      `    @endif`,
      `    @isset($user->foo($user->bar($user->baz())))`,
      `    foo`,
      `    @endisset`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `        foo`,
      `    @endif`,
      `    @if (count($foo->bar(Auth::user($baz->method()), Request::path())) >= 1)`,
      `        foo`,
      `    @endif`,
      `    @foreach (Auth::users($my->users($as->foo)) as $user)`,
      `        foo`,
      `    @endif`,
      `    @isset($user->foo($user->bar($user->baz())))`,
      `        foo`,
      `    @endisset`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('it should line break before and after directives', async () => {
    const content = [
      `<div>`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1) foo`,
      `    @endif`,
      `    <div>`,
      `        @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `            foo`,
      `        @endif`,
      `    <div>`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1) foo`,
      `    @endif`,
      `    </div>`,
      `    </div>`,
      `    @foreach ($collection as $item)`,
      `        {{ $item }} @endforeach`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `    foo`,
      ``,
      `    @endif`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1) foo`,
      ``,
      `    @endif`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `    @endif`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `        foo`,
      `    @endif`,
      `    <div>`,
      `        @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `            foo`,
      `        @endif`,
      `        <div>`,
      `            @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `                foo`,
      `            @endif`,
      `        </div>`,
      `    </div>`,
      `    @foreach ($collection as $item)`,
      `        {{ $item }}`,
      `    @endforeach`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `        foo`,
      `    @endif`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `        foo`,
      `    @endif`,
      `    @if (count($foo->bar(Auth::user(), Request::path())) >= 1)`,
      `    @endif`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('complex line break', async () => {
    const content = [
      `<div>`,
      `@if ($user) @if ($condition) aaa @endif`,
      `@endif`,
      `  @can('edit') bbb`,
      `  @endcan`,
      `@auth('user') ccc`,
      `@endauth`,
      `</div>`,
      `<div>`,
      `@section('title') aaa @endsection`,
      `</div>`,
      `<div>@foreach($users as $user) @foreach($shops as $shop) {{ $user["id"] . $shop["id"] }} @endforeach @endforeach</div>`,
      `<div>@if($users) @foreach($shops as $shop) {{ $user["id"] . $shop["id"] }} @endforeach @endif</div>`,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @if ($user)`,
      `        @if ($condition)`,
      `            aaa`,
      `        @endif`,
      `    @endif`,
      `    @can('edit')`,
      `        bbb`,
      `    @endcan`,
      `    @auth('user')`,
      `        ccc`,
      `    @endauth`,
      `</div>`,
      `<div>`,
      `    @section('title')`,
      `        aaa`,
      `    @endsection`,
      `</div>`,
      `<div>`,
      `    @foreach ($users as $user)`,
      `        @foreach ($shops as $shop)`,
      `            {{ $user['id'] . $shop['id'] }}`,
      `        @endforeach`,
      `    @endforeach`,
      `</div>`,
      `<div>`,
      `    @if ($users)`,
      `        @foreach ($shops as $shop)`,
      `            {{ $user['id'] . $shop['id'] }}`,
      `        @endforeach`,
      `    @endif`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('inline @json directive', async () => {
    const content = [
      `<myComponent`,
      `    :prop-data='@json($data['initialEvents'])'>`,
      `foo`,
      `</myComponent>`,
      `<div data-single-quote='@json('string with single quote')'>`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<myComponent :prop-data='@json($data['initialEvents'])'>`,
      `    foo`,
      `</myComponent>`,
      `<div data-single-quote='@json('string with single quote')'>`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('inline @error directive should keep its format', async () => {
    const content = [
      `<span class="text-gray-700 @error('restaurant_id') text-red-500 @enderror">`,
      `    Choose restaurant`,
      `</span>`,
    ].join('\n');

    const expected = [
      `<span class="text-gray-700 @error('restaurant_id') text-red-500 @enderror">`,
      `    Choose restaurant`,
      `</span>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('inline @if-@endif directive should keep its format', async () => {
    const content = [
      `<password-input name="password_confirmation" type="password" @if ('password') error error-message="{{ $message }}" @endif placeholder="password: " outlined>`,
      `</password-input>`,
      `<password-input name="password_confirmation" type="password"`,
      `@if ('password') error error-message="{{ $message }}" @endif placeholder="password: " outlined>`,
      `</password-input>`,
      // multiline directive inside html tag should be formatted into inline
      `<password-input name="password_confirmation" type="password" @if ('password')`,
      `error error-message="{{ $message }}"`,
      `@endif`,
      `placeholder="password: " outlined></password-input>`,
      // multiple directives in html tag
      `<password-input name="password_confirmation" type="password" @if ('password')`,
      `error error-message="{{ $message }}"`,
      `@endif`,
      `@if ('password')`,
      `error error-message="{{ $message }}"`,
      `@endif`,
      `placeholder="パスワード" outlined></password-input>`,
    ].join('\n');

    const expected = [
      `<password-input name="password_confirmation" type="password"`,
      `    @if ('password') error error-message="{{ $message }}" @endif placeholder="password: "`,
      `    outlined>`,
      `</password-input>`,
      `<password-input name="password_confirmation" type="password"`,
      `    @if ('password') error error-message="{{ $message }}" @endif placeholder="password: "`,
      `    outlined>`,
      `</password-input>`,
      `<password-input name="password_confirmation" type="password"`,
      `    @if ('password') error error-message="{{ $message }}" @endif placeholder="password: "`,
      `    outlined></password-input>`,
      `<password-input name="password_confirmation" type="password"`,
      `    @if ('password') error error-message="{{ $message }}" @endif`,
      `    @if ('password') error error-message="{{ $message }}" @endif placeholder="パスワード" outlined>`,
      `</password-input>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('order aware nested directive', async () => {
    const content = [
      `@component('components.elements.button') @slot('href') /plant/details/{{ $plant->system_name }} @endslot @endcomponent`,
      `@section('components.elements.button') @error('href') /plant/details/{{ $plant->system_name }} @enderror @endsection`,
      `@foreach($users as $user) @error('href') {{ $user }} @enderror @endforeach`,
    ].join('\n');

    const expected = [
      `@component('components.elements.button')`,
      `    @slot('href')`,
      `        /plant/details/{{ $plant->system_name }}`,
      `    @endslot`,
      `@endcomponent`,
      `@section('components.elements.button')`,
      `    @error('href')`,
      `        /plant/details/{{ $plant->system_name }}`,
      `    @enderror`,
      `@endsection`,
      `@foreach ($users as $user)`,
      `    @error('href')`,
      `        {{ $user }}`,
      `    @enderror`,
      `@endforeach`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('line break around @case, @break and @default', async () => {
    const content = [
      `@switch($type) @case(1) $a = 3; @break @case(2) @case(3) $a = 4; @break @default $a = null; @endswitch`,
      `<div>`,
      `@switch($type) @case(1) $a = 3; @break @case(2) @case(3) $a = 4; @break @default $a = null; @endswitch`,
      `</div>`,
      `@switch($type) @case(1) $a = 3; @break @case(2) @case(3) $a = 4; @break @default $a = null; @endswitch`,
      `@section('aaa')`,
      `@switch($type)`,
      `@case(1)`,
      `$a = 3;`,
      `@break`,
      ``,
      `@case(2)`,
      `@case(3)`,
      `$a = 4;`,
      `@break`,
      ``,
      `@default`,
      `$a = null;`,
      `@endswitch`,
      `@endsection`,
      `<div>`,
      `@switch($i)`,
      `    @case(1)`,
      `        @switch($j)`,
      `            @case(1)`,
      `                First case...`,
      `            @break`,
      `            @case(2)`,
      `                Second case...`,
      `            @break`,
      `            @default`,
      `                Default case...`,
      `        @endswitch`,
      `    @break`,
      `    @case(2)`,
      `        hogehoge...`,
      `    @break`,
      `@endswitch`,
      `</div>`,
      `@switch($type)`,
      `    @case(1)`,
      `        $a = 3;`,
      `    @break`,
      ``,
      `    @case(2)`,
      `    @case(3)`,
      `        $a = 4;`,
      `    @break`,
      ``,
      `@case(3)`,
      `    $a = 4;`,
      `@break`,
      ``,
      `@default`,
      `    $a = null;`,
      `@endswitch`,
    ].join('\n');

    const expected = [
      `@switch($type)`,
      `    @case(1)`,
      `        $a = 3;`,
      `    @break`,
      ``,
      `    @case(2)`,
      `    @case(3)`,
      `        $a = 4;`,
      `    @break`,
      ``,
      `    @default`,
      `        $a = null;`,
      `@endswitch`,
      `<div>`,
      `    @switch($type)`,
      `        @case(1)`,
      `            $a = 3;`,
      `        @break`,
      ``,
      `        @case(2)`,
      `        @case(3)`,
      `            $a = 4;`,
      `        @break`,
      ``,
      `        @default`,
      `            $a = null;`,
      `    @endswitch`,
      `</div>`,
      `@switch($type)`,
      `    @case(1)`,
      `        $a = 3;`,
      `    @break`,
      ``,
      `    @case(2)`,
      `    @case(3)`,
      `        $a = 4;`,
      `    @break`,
      ``,
      `    @default`,
      `        $a = null;`,
      `@endswitch`,
      `@section('aaa')`,
      `    @switch($type)`,
      `        @case(1)`,
      `            $a = 3;`,
      `        @break`,
      ``,
      `        @case(2)`,
      `        @case(3)`,
      `            $a = 4;`,
      `        @break`,
      ``,
      `        @default`,
      `            $a = null;`,
      `    @endswitch`,
      `@endsection`,
      `<div>`,
      `    @switch($i)`,
      `        @case(1)`,
      `            @switch($j)`,
      `                @case(1)`,
      `                    First case...`,
      `                @break`,
      ``,
      `                @case(2)`,
      `                    Second case...`,
      `                @break`,
      ``,
      `                @default`,
      `                    Default case...`,
      `            @endswitch`,
      `        @break`,
      ``,
      `        @case(2)`,
      `            hogehoge...`,
      `        @break`,
      ``,
      `    @endswitch`,
      `</div>`,
      `@switch($type)`,
      `    @case(1)`,
      `        $a = 3;`,
      `    @break`,
      ``,
      `    @case(2)`,
      `    @case(3)`,
      `        $a = 4;`,
      `    @break`,
      ``,
      `    @case(3)`,
      `        $a = 4;`,
      `    @break`,
      ``,
      `    @default`,
      `        $a = null;`,
      `@endswitch`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('else token auto line breaking', async () => {
    const content = [
      `@if (count($users) === 1)`,
      `    Foo`,
      `@elseif (count($users) > 1)Bar`,
      `@elseif (count($users) > 2)Bar2`,
      `@else Baz@endif`,
      `@can('update') foo @elsecan('read') bar @endcan`,
    ].join('\n');

    const expected = [
      `@if (count($users) === 1)`,
      `    Foo`,
      `@elseif (count($users) > 1)`,
      `    Bar`,
      `@elseif (count($users) > 2)`,
      `    Bar2`,
      `@else`,
      `    Baz`,
      `@endif`,
      `@can('update')`,
      `    foo`,
      `@elsecan('read')`,
      `    bar`,
      `@endcan`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('line breaking with html tag', async () => {
    const content = [
      `<div>`,
      `<div>@can('auth')`,
      `foo @elsecan('aaa') bar @endcan</div>`,
      `<div>@foreach($users as $user)`,
      `{{$user}} bar @endforeach</div></div>`,
      `<p class="@if($verified) mb-6 @endif">@if($user)`,
      `{!!$user!!} @elseif ($authorized) foo @else bar @endif</p>`,
      `<input type="text" />`,
      `<p>@for ($i = 0; $i < 5; $i++)`,
      `aaa`,
      `@endfor</p>`,
      `<p>@if($user)`,
      `{!!$user!!} @elseif ($authorized) foo @else bar @endif`,
      ``,
      `</p>`,
    ].join('\n');

    const expected = [
      `<div>`,
      `    <div>`,
      `        @can('auth')`,
      `            foo`,
      `        @elsecan('aaa')`,
      `            bar`,
      `        @endcan`,
      `    </div>`,
      `    <div>`,
      `        @foreach ($users as $user)`,
      `            {{ $user }} bar`,
      `        @endforeach`,
      `    </div>`,
      `</div>`,
      `<p class="@if ($verified) mb-6 @endif">`,
      `    @if ($user)`,
      `        {!! $user !!}`,
      `    @elseif ($authorized)`,
      `        foo`,
      `    @else`,
      `        bar`,
      `    @endif`,
      `</p>`,
      `<input type="text" />`,
      `<p>`,
      `    @for ($i = 0; $i < 5; $i++)`,
      `        aaa`,
      `    @endfor`,
      `</p>`,
      `<p>`,
      `    @if ($user)`,
      `        {!! $user !!}`,
      `    @elseif ($authorized)`,
      `        foo`,
      `    @else`,
      `        bar`,
      `    @endif`,
      `</p>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('raw php inlined comment #493', async () => {
    const content = [
      `<?php /** foo */ echo 1; ?>`,
      `<?php /** @var \App\Models\Game $game */ ?>`,
      `@foreach ($preview['new'] as $game)`,
      `    <x-game.preview.new :game="$game" />`,
      `@endforeach`,
    ].join('\n');

    const expected = [
      `<?php /** foo */ echo 1; ?>`,
      `<?php /** @var \App\Models\Game $game */ ?>`,
      `@foreach ($preview['new'] as $game)`,
      `    <x-game.preview.new :game="$game" />`,
      `@endforeach`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('sort tailwindcss classs option can work', function () {
    const content = [
      `<div class="justify-center z-50 z-10 z-20 container text-left foo md:text-center">`,
      `</div>`,
    ].join('\n');
    const expected = [
      `<div class="foo container z-50 z-10 z-20 justify-center text-left md:text-center">`,
      `</div>`,
      ``,
    ].join('\n');

    return new Formatter({ sortTailwindcssClasses: true }).formatContent(content).then((result: string) => {
      assert.equal(result, expected);
    });
  });

  test('sort tailwindcss classs with various character', function () {
    const content = [`<div class="m-5 md:tw-mx-[1rem]   tw-mx-1 foo"></div>`].join('\n');
    const expected = [`<div class="md:tw-mx-[1rem] tw-mx-1 foo m-5"></div>`, ``].join('\n');

    return new Formatter({ sortTailwindcssClasses: true }).formatContent(content).then((result: string) => {
      assert.equal(result, expected);
    });
  });

  test('long tailwindcss classs', async () => {
    const content = [
      `<div class="container z-50                                                      z-10 z-20 justify-center text-left foo md:text-center">`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div class="foo container z-50 z-10 z-20 justify-center text-left md:text-center">`,
      `</div>`,
      ``,
    ].join('\n');

    const result = await new Formatter({ sortTailwindcssClasses: true }).formatContent(content);
    assert.equal(result, expected);
    const result2 = await new Formatter({ sortTailwindcssClasses: true }).formatContent(result);
    assert.equal(result2, result);
  });

  test('tailwindcss classs with new line', async () => {
    const content = [
      `<div class="container z-50`,
      `z-10 z-20 justify-center text-left foo md:text-center">`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div class="foo container z-50 z-10 z-20 justify-center text-left md:text-center">`,
      `</div>`,
      ``,
    ].join('\n');

    const result = await new Formatter({ sortTailwindcssClasses: true }).formatContent(content);
    assert.equal(result, expected);
    const result2 = await new Formatter({ sortTailwindcssClasses: true }).formatContent(result);
    assert.equal(result2, result);
  });

  test('@include directive should format its parameter', async () => {
    const content = [
      `@include('parts.partials.buttons.btn-group', ["buttons" => [`,
      `[`,
      `"style" => "link",`,
      `"link" => [`,
      `"title" => "Call to Action",`,
      `"url" => "#",`,
      `"target" => "_self",`,
      `],`,
      `],`,
      `]])`,
      `<div>`,
      `@include('parts.partials.buttons.btn-group', ["buttons" => [`,
      `[`,
      `"style" => "link",`,
      `"link" => [`,
      `"title" => "Call to Action",`,
      `"url" => "#",`,
      `"target" => "_self",`,
      `],`,
      `],`,
      `]])`,
      `</div>`,
    ].join('\n');

    const expected = [
      `@include('parts.partials.buttons.btn-group', [`,
      `    'buttons' => [`,
      `        [`,
      `            'style' => 'link',`,
      `            'link' => [`,
      `                'title' => 'Call to Action',`,
      `                'url' => '#',`,
      `                'target' => '_self',`,
      `            ],`,
      `        ],`,
      `    ],`,
      `])`,
      `<div>`,
      `    @include('parts.partials.buttons.btn-group', [`,
      `        'buttons' => [`,
      `            [`,
      `                'style' => 'link',`,
      `                'link' => [`,
      `                    'title' => 'Call to Action',`,
      `                    'url' => '#',`,
      `                    'target' => '_self',`,
      `                ],`,
      `            ],`,
      `        ],`,
      `    ])`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('@include directive should not add an extra comma on long view name #504', async () => {
    const content = [
      `@include('livewire.cx', ['account' => $account])`,
      `@include('livewire.cx.equipment-list-internal.account', ['account' => $account])`,
      `<div>`,
      `<div>`,
      `<div>`,
      `@include('livewire.cx.equipment-list-internal.account', ['account' => $account])`,
      `</div>`,
      `</div>`,
      `</div>`,
      `<div>`,
      `<div>`,
      `<div>`,
      `<div>`,
      `<div>`,
      `<div>`,
      `@include('livewire.cx.equipment-list-internal.account', ['account' => $account])`,
      `</div>`,
      `</div>`,
      `</div>`,
      `</div>`,
      `</div>`,
      `</div>`,
    ].join('\n');

    const expected = [
      `@include('livewire.cx', ['account' => $account])`,
      `@include('livewire.cx.equipment-list-internal.account', [`,
      `    'account' => $account,`,
      `])`,
      `<div>`,
      `    <div>`,
      `        <div>`,
      `            @include('livewire.cx.equipment-list-internal.account', [`,
      `                'account' => $account,`,
      `            ])`,
      `        </div>`,
      `    </div>`,
      `</div>`,
      `<div>`,
      `    <div>`,
      `        <div>`,
      `            <div>`,
      `                <div>`,
      `                    <div>`,
      `                        @include(`,
      `                            'livewire.cx.equipment-list-internal.account',`,
      `                            ['account' => $account]`,
      `                        )`,
      `                    </div>`,
      `                </div>`,
      `            </div>`,
      `        </div>`,
      `    </div>`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('inline script tag should keep its element #508', async () => {
    const content = [`<p>foo</p><p>bar</p><script>document.write("buz");</script><p>blah</p>`].join('\n');

    const expected = [
      `<p>foo</p>`,
      `<p>bar</p>`,
      `<script>`,
      `    document.write("buz");`,
      `</script>`,
      `<p>blah</p>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('inline @php directive in script tag', async () => {
    const content = [
      `<script>`,
      `@php(     $password_reset_url=View::getSection('password_reset_url') ?? config('adminlte.password_reset_url', 'password/reset', env('test', env('test'))))`,
      `</script>`,
    ].join('\n');

    const expected = [
      `<script>`,
      `    @php($password_reset_url = View::getSection('password_reset_url') ?? config('adminlte.password_reset_url', 'password/reset', env('test', env('test'))))`,
      `</script>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('@checked directive', async () => {
    const content = [
      `<input type="checkbox"`,
      `        name="active"`,
      `        value="active"`,
      `        @checked(old('active',$user->active)) />`,
    ].join('\n');

    const expected = [
      `<input type="checkbox" name="active" value="active" @checked(old('active', $user->active)) />`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('@selected directive', async () => {
    const content = [
      `<select name="version">`,
      `@foreach ($product->versions as $version)`,
      `<option value="{{ $version }}" @selected(old('version')==$version)>`,
      `{{ $version }}`,
      `</option>`,
      `@endforeach`,
      `</select>`,
    ].join('\n');

    const expected = [
      `<select name="version">`,
      `    @foreach ($product->versions as $version)`,
      `        <option value="{{ $version }}" @selected(old('version') == $version)>`,
      `            {{ $version }}`,
      `        </option>`,
      `    @endforeach`,
      `</select>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('@disabled directive', async () => {
    const content = [`<button type="submit" @disabled($errors->isNotEmpty() )>Submit</button>`].join('\n');

    const expected = [`<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('@includeIf, @includeWhen, @includeUnless and @includeFirst directive', async () => {
    const content = [
      `<div>`,
      `@includeIf('livewire.cx.equipment-list-internal.account',['status'=>'complete',`,
      `'foo'=>$user,'bar'=>$bbb,'baz'=>$myVariable])`,
      `</div>`,
      `<div>`,
      `@includeWhen($boolean,'livewire.cx.equipment-list-internal.account',['status'=>'complete',`,
      `'foo'=>$user,'bar'=>$bbb,'baz'=>$myVariable])`,
      `</div>`,
      `<div>`,
      `@includeUnless($boolean,'livewire.cx.equipment-list-internal.account',['status'=>'complete',`,
      `'foo'=>$user,'bar'=>$bbb,'baz'=>$myVariable])`,
      `</div>`,
      `<div>`,
      `@includeFirst(['custom.admin','admin'],['status'=>'complete',`,
      `'foo'=>$user,'bar'=>$bbb,'baz'=>$myVariable])`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @includeIf('livewire.cx.equipment-list-internal.account', [`,
      `        'status' => 'complete',`,
      `        'foo' => $user,`,
      `        'bar' => $bbb,`,
      `        'baz' => $myVariable,`,
      `    ])`,
      `</div>`,
      `<div>`,
      `    @includeWhen($boolean, 'livewire.cx.equipment-list-internal.account', [`,
      `        'status' => 'complete',`,
      `        'foo' => $user,`,
      `        'bar' => $bbb,`,
      `        'baz' => $myVariable,`,
      `    ])`,
      `</div>`,
      `<div>`,
      `    @includeUnless($boolean, 'livewire.cx.equipment-list-internal.account', [`,
      `        'status' => 'complete',`,
      `        'foo' => $user,`,
      `        'bar' => $bbb,`,
      `        'baz' => $myVariable,`,
      `    ])`,
      `</div>`,
      `<div>`,
      `    @includeFirst(`,
      `        ['custom.admin', 'admin'],`,
      `        ['status' => 'complete', 'foo' => $user, 'bar' => $bbb, 'baz' => $myVariable]`,
      `    )`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('long expression blade brace', async () => {
    const content = [
      `<a href="{{ $relatedAuthority->id }}" class="no-border"`,
      `   itemprop="{{ $author->isCorporateBody() ?`,
      `                ($relatedAuthority->isCorporateBody() ? 'knowsAbout' : 'member') :`,
      `                ($relatedAuthority->isCorporateBody() ? 'memberOf' : 'knows') }}">`,
      `    <strong>{{ formatName($relatedAuthority->name) }}</strong>`,
      `    <i class="icon-arrow-right"></i>`,
      `</a><br>`,
    ].join('\n');

    const expected = [
      `<a href="{{ $relatedAuthority->id }}" class="no-border"`,
      `    itemprop="{{ $author->isCorporateBody()`,
      `        ? ($relatedAuthority->isCorporateBody()`,
      `            ? 'knowsAbout'`,
      `            : 'member')`,
      `        : ($relatedAuthority->isCorporateBody()`,
      `            ? 'memberOf'`,
      `            : 'knows') }}">`,
      `    <strong>{{ formatName($relatedAuthority->name) }}</strong>`,
      `    <i class="icon-arrow-right"></i>`,
      `</a><br>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('whitespace sensitive tag should keep its content unformatted', async () => {
    const content = [
      `<div>`,
      `@foreach (config('translatable.locales') as $i => $locale)`,
      `    <div role="tabpanel" class="tab-pane  {{ $i == 0 ? 'active' : '' }}" id="{{ $locale }}">`,
      `        <div class="form-group">`,
      `            <textarea class="form-control wysiwyg" name="{{ $locale }}[content]" rows="8" id="{{ $locale }}[content]"`,
      ` cols="8">`,
      `    {{ old($locale . '[content]', $notice->translateOrNew($locale)->content) }} </textarea>`,
      `        </div>`,
      `    </div>`,
      `@endforeach`,
      `    </div>`,
      `<div>`,
      `<pre>`,
      `aaaa </pre>`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @foreach (config('translatable.locales') as $i => $locale)`,
      `        <div role="tabpanel" class="tab-pane  {{ $i == 0 ? 'active' : '' }}" id="{{ $locale }}">`,
      `            <div class="form-group">`,
      `                <textarea class="form-control wysiwyg" name="{{ $locale }}[content]" rows="8" id="{{ $locale }}[content]"`,
      `                    cols="8">`,
      `    {{ old($locale . '[content]', $notice->translateOrNew($locale)->content) }} </textarea>`,
      `            </div>`,
      `        </div>`,
      `    @endforeach`,
      `</div>`,
      `<div>`,
      `    <pre>`,
      `aaaa </pre>`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('sort blade brace mixes classes', async () => {
    const content = [
      `<div`,
      `    class="px-4 py-5 bg-white sm:p-6 shadow     {{ isset($actions) ? 'sm:rounded-tl-md sm:rounded-tr-md' : 'sm:rounded-md' }} {{ isset($actions) ? 'foo' : 'bar' }}">`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div`,
      `    class="{{ isset($actions) ? 'sm:rounded-tl-md sm:rounded-tr-md' : 'sm:rounded-md' }} {{ isset($actions) ? 'foo' : 'bar' }} bg-white px-4 py-5 shadow sm:p-6">`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected, { sortTailwindcssClasses: true });
  });

  test('string literal with line break in raw php directive', async () => {
    const content = [
      `<div>`,
      `    <div>`,
      `        @php`,
      `            $myvar = "lorem`,
      `        ipsum";`,
      `            $foo = "lorem`,
      ``,
      `multiline`,
      `        ipsum";`,
      `        @endphp`,
      `    </div>`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div>`,
      `    <div>`,
      `        @php`,
      `            $myvar = "lorem`,
      `        ipsum";`,
      `            $foo = "lorem`,
      ``,
      `multiline`,
      `        ipsum";`,
      `        @endphp`,
      `    </div>`,
      `</div>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });

  test('it should not throw exception even if inline component attribute has syntax error', async () => {
    const content = [`<x-h1 :variable1="," />`].join('\n');
    const expected = [`<x-h1 :variable1="," />`, ``].join('\n');

    await util.doubleFormatCheck(content, expected);
    await expect(new BladeFormatter().format(content)).resolves.not.toThrow('SyntaxError');
  });

  test('syntax error on multiline component attribute throws a syntax error', async () => {
    const content = [`<x-h1 :variable1="[`, `    'key1' => 123`, `    'key2' => 'value2',`, `]" />`].join('\n');

    await expect(new BladeFormatter().format(content)).rejects.toThrow('SyntaxError');
  });

  test('directive inside component attribute', async () => {
    const content = [
      `@section('body')`,
      `    <x-alert :live="@env('production')" />`,
      `@endsection`,
      `<x-button ::class="{ danger: [1, 2, 3] }">`,
      `    Submit`,
      `</x-button>`,
    ].join('\n');

    const expected = [
      `@section('body')`,
      `    <x-alert :live="@env('production')" />`,
      `@endsection`,
      `<x-button ::class="{ danger: [1, 2, 3] }">`,
      `    Submit`,
      `</x-button>`,
      ``,
    ].join('\n');

    await util.doubleFormatCheck(content, expected);
  });
});
