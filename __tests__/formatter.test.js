import Formatter from '../src/formatter';
import { BladeFormatter } from '../src/main';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const cmd = require('./support/cmd');

const formatter = () => {
  return new Formatter({ indentSize: 4 });
};

describe('formatter', () => {
  test('can format plain text', function () {
    const content = 'aaa\n';
    const expected = 'aaa\n';

    return formatter()
      .formatContent(content)
      .then(function (result) {
        assert.equal(result, expected);
      });
  });

  test('outputs end with new line', function () {
    const content = 'aaa';
    const expected = 'aaa\n';

    return formatter()
      .formatContent(content)
      .then(function (result) {
        assert.equal(result, expected);
      });
  });

  test('can format simple html tag', function () {
    const content = `<html><body></body></html>`;
    const expected = [`<html>`, ``, `<body></body>`, ``, `</html>`, ``].join(
      '\n',
    );

    return formatter()
      .formatContent(content)
      .then(function (result) {
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
      .then(function (result) {
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
      .then(function (result) {
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
      .then(function (result) {
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
        .then(function (result) {
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
        .then(function (result) {
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
        .then(function (result) {
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
      .then(function (result) {
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
      .then(function (result) {
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
      .then(function (result) {
        assert.equal(result, expected);
      });
  });

  test('should not clear inline level directive', () => {
    const content = [`<div>`, `@section foo @endsection`, `</div>`, ``].join(
      '\n',
    );

    const expected = [
      `<div>`,
      `    @section foo @endsection`,
      `</div>`,
      ``,
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then(function (result) {
        assert.equal(result, expected);
      });
  });

  test('should not clear php code inside inline @php directive #3', () => {
    const content = [
      `<div>`,
      `@php $bg = rand(1, 13); $bgchange = $bg.".jpg"; @endphp`,
      `</div>`,
      ``,
    ].join('\n');

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
      .then(function (result) {
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
      .then(function (result) {
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
      .then((result) => {
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
      `* @var \Modules\Common\PageDataBuilderV2\RenderableItems\Card $card`,
      `*/`,
      `?>`,
      `@extends('layouts.mainLayout')`,
      ``,
      `@section('someBlock')`,
      ``,
      `@endsection`,
      '',
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then((result) => {
        assert.equal(result, expected);
      });
  });

  test('preserve inline php tag #57', async () => {
    const content = [
      `<body data-app="<?php echo json_encode($array); ?>"`,
      '',
    ].join('\n');

    const expected = [
      `<body data-app="<?php echo json_encode($array); ?>"`,
      '',
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then((result) => {
        assert.equal(result, expected);
      });
  });

  test('preserve inline php tag in script', async () => {
    const content = [
      `<script>`,
      `    var app = <?php echo json_encode($array); ?>;`,
      `</script>`,
      '',
    ].join('\n');

    const expected = [
      `<script>`,
      `    var app = <?php echo json_encode($array); ?>;`,
      `</script>`,
      '',
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then((result) => {
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
      .then((result) => {
        assert.equal(result, expected);
      });
  });

  test('should be ignore short tag #56', async () => {
    const content = [
      `<table>`,
      `<th><?= $userName ?></th>`,
      `</table>`,
      '',
    ].join('\n');

    const expected = [
      `<table>`,
      `    <th><?= $userName ?></th>`,
      `</table>`,
      '',
    ].join('\n');

    return formatter()
      .formatContent(content)
      .then((result) => {
        assert.equal(result, expected);
      });
  });

  test('format API', async () => {
    const content = [
      `<table>`,
      `<th><?= $userName ?></th>`,
      `</table>`,
      '',
    ].join('\n');

    const expected = [
      `<table>`,
      `    <th><?= $userName ?></th>`,
      `</table>`,
      '',
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('format API with option', async () => {
    const content = [
      `<table>`,
      `<th><?= $userName ?></th>`,
      `</table>`,
      '',
    ].join('\n');

    const expected = [
      `<table>`,
      `  <th><?= $userName ?></th>`,
      `</table>`,
      '',
    ].join('\n');

    return new BladeFormatter({ indentSize: 2 })
      .format(content)
      .then((result) => {
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

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('@for directive should work', async () => {
    const content = [
      `@for ($i=0;$i<=5;$i++)`,
      `<div class="foo">`,
      `</div>`,
      `@endfor`,
      ``,
    ].join('\n');

    const expected = [
      `@for ($i = 0; $i <= 5; $i++)`,
      `    <div class="foo">`,
      `    </div>`,
      `@endfor`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('@foreach directive should work', async () => {
    const content = [
      `@foreach($users as $user)`,
      `<div class="foo">`,
      `</div>`,
      `@endforeach`,
      ``,
    ].join('\n');

    const expected = [
      `@foreach ($users as $user)`,
      `    <div class="foo">`,
      `    </div>`,
      `@endforeach`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('@foreach directive should work with variable key', async () => {
    const content = [
      `@foreach($users["foo"] as $user)`,
      `<div class="foo">`,
      `</div>`,
      `@endforeach`,
      ``,
    ].join('\n');

    const expected = [
      `@foreach ($users['foo'] as $user)`,
      `    <div class="foo">`,
      `    </div>`,
      `@endforeach`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('@foreach directive should work with children methods', async () => {
    const content = [
      `@foreach($user->blogs() as $blog)`,
      `<div class="foo">`,
      `</div>`,
      `@endforeach`,
      ``,
    ].join('\n');

    const expected = [
      `@foreach ($user->blogs() as $blog)`,
      `    <div class="foo">`,
      `    </div>`,
      `@endforeach`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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
      `    @default`,
      `        Default case...`,
      `@endswitch`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('indented call should be inline in blade brackets #2', async () => {
    const content = [
      `{{ auth()`,
      `    ->user()`,
      `    ->getSeeding() }}`,
      ``,
    ].join('\n');

    const expected = [
      `{{ auth()->user()->getSeeding() }}`,
      ``,
      /*  */
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('method call in directive should not be multiline #2', async () => {
    const content = [
      `@if(auth()->user()->name === 'foo')`,
      `    <p>bar</p>`,
      `@endif`,
      ``,
    ].join('\n');

    const expected = [
      `@if (auth()->user()->name === 'foo')`,
      `    <p>bar</p>`,
      `@endif`,
      ``,
      /*  */
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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
      `*/`,
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

    return new BladeFormatter().format(content).then((result) => {
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

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should not occurs error with if directive', async () => {
    const content = [`@if($user)`, `    foo`, `@endif`, ``].join('\n');

    const expected = [`@if ($user)`, `    foo`, `@endif`, ``].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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
      `<body class="hold-transition login-page" @if (config('admin.login_background_image')) style="background: url({{ config('admin.login_background_image') }}) no-repeat;background-size: cover;" @endif>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should not occurs error even if 3 level nested in directive', async () => {
    const content = [
      `@if(config('app.foo', env('APP_FOO_BAR')))`,
      `    foo`,
      `@endif>`,
      ``,
    ].join('\n');

    const expected = [
      `@if (config('app.foo', env('APP_FOO_BAR')))`,
      `    foo`,
      `@endif>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('forelse directive should work', async () => {
    const content = [
      `@forelse($students as $student)`,
      `<div>foo</div>`,
      `@empty`,
      `empty`,
      `@endforelse`,
      ``,
    ].join('\n');

    const expected = [
      `@forelse($students as $student)`,
      `    <div>foo</div>`,
      `@empty`,
      `    empty`,
      `@endforelse`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should preserve spaces between directive and parentheses', async () => {
    const content = [`@if($user === 'foo')`, `foo`, `@endif`, ``].join('\n');

    const expected = [`@if ($user === 'foo')`, `    foo`, `@endif`, ``].join(
      '\n',
    );

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should preserve spaces between directive and parentheses (space exists)', async () => {
    const content = [`@foreach ($users as $user)`, `foo`, `@endif`, ``].join(
      '\n',
    );

    const expected = [
      `@foreach ($users as $user)`,
      `    foo`,
      `@endif`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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

    return new BladeFormatter().format(content).then((result) => {
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
      `    @while (have_posts()) @php(the_post())`,
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

    return new BladeFormatter().format(content).then((result) => {
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

    return new BladeFormatter().format(content).then((result) => {
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

    return new BladeFormatter().format(content).then((result) => {
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

    return new BladeFormatter().format(content).then((result) => {
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
      `            <li class="list-group-item border-right-0 border-left-0 @if ($loop->first) border-top-0 @endif"></li>`,
      `        @endforeach`,
      `    </ul>`,
      `@endif`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should consider directive in html tag', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'inline_php_tag.blade.php',
        ),
      ],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted_inline_php_tag.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test('should not occurs error on inline if to end directive on long line', async () => {
    const content = [
      `<div>`,
      `@if (count($users) && $users->has('friends')) {{ $user->name }} @endif`,
      `</div>`,
    ].join('\n');

    const expected = [
      `<div>`,
      `    @if (count($users) && $users->has('friends')) {{ $user->name }} @endif`,
      `</div>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should format within @php directive', async () => {
    const content = [
      `    @php`,
      `    if ($user) {`,
      `    $user->name = 'foo';`,
      `    }`,
      `    @endphp`,
    ].join('\n');

    const expected = [
      `    @php`,
      `        if ($user) {`,
      `            $user->name = 'foo';`,
      `        }`,
      `    @endphp`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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

      return new BladeFormatter().format(content).then((result) => {
        assert.equal(result, expected);
      });
    });
  });

  test('should format null safe operator', async () => {
    const content = [`{{ $entity->executors->first()?->name() }}`].join('\n');

    const expected = [`{{ $entity->executors->first()?->name() }}`, ``].join(
      '\n',
    );

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should format named arguments', async () => {
    const content = [`{{ foo(double_encode:  true) }}`].join('\n');

    const expected = [`{{ foo(double_encode: true) }}`, ``].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should format blade directive in scripts', async () => {
    const content = [
      `    <script>`,
      `        @isset($data['eval_gestionnaire']->project_perception) @endisset`,
      `    </script>`,
    ].join('\n');

    const expected = [
      `    <script>`,
      `        @isset($data['eval_gestionnaire']->project_perception) @endisset`,
      ``,
      `    </script>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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
      '',
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
      '',
      '</script>',
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should format inline directive in scripts #231', async () => {
    const content = [
      `<script> @Isset($data['eval_gestionnaire']->project_perception) @endisset </script>`,
    ].join('\n');

    const expected = [
      `<script>`,
      `    @isset($data['eval_gestionnaire']->project_perception) @endisset`,
      ``,
      `</script>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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
        .then(function (result) {
          assert.equal(result, expected);
        });
    });
  });

  test('should break chained method in directive', async () => {
    const content = [
      '@if (auth()',
      '->user()',
      "->subscribed('default'))",
      'aaa',
      '@endif',
    ].join('\n');

    const expected = [
      "@if (auth()->user()->subscribed('default'))",
      '    aaa',
      '@endif',
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should break chained method in directive 2', async () => {
    const content = [
      '@foreach (request()->users() as $user)',
      'aaa',
      '@endif',
    ].join('\n');

    const expected = [
      '@foreach (request()->users() as $user)',
      '    aaa',
      '@endif',
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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
      ``,
      `</script>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
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

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });
});
