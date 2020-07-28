import Formatter from '../src/formatter';
import { BladeFormatter } from '../src/main';

const assert = require('assert');

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
      `        @if($user)`,
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
      `    @foreach($users as $user)`,
      `        @if($user)`,
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
      `@if($user)`,
      `{{ $user->name }}`,
      `@endif`,
      `@endif`,
      `</section>`,
      ``,
    ].join('\n');

    const expected = [
      `<section>`,
      `    @hasSection('navigation')`,
      `        @if($user)`,
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

  const directives = [
    'auth',
    'component',
    'empty',
    'forelse',
    'guest',
    'if',
    'isset',
    'push',
    'section',
    'slot',
    'unless',
    'verbatim',
    'while',
  ];

  directives.forEach((directive) => {
    test('builtin directive test', () => {
      const content = [
        `<section>`,
        `@${directive}($foo)`,
        `@if($user)`,
        `{{ $user->name }}`,
        `@endif`,
        `@end${directive}`,
        `</section>`,
        ``,
      ].join('\n');

      const expected = [
        `<section>`,
        `    @${directive}($foo)`,
        `        @if($user)`,
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
      `        @if($user)`,
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
      `        @if($user)`,
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
      `    @php $bg = rand(1, 13); $bgchange = $bg.".jpg"; @endphp`,
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
      `@for($i = 0; $i <= 5; $i++)`,
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
      `@foreach($users as $user)`,
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
      `@foreach($users['foo'] as $user)`,
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
      `@foreach($user->blogs() as $blog)`,
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
      `    First case...`,
      `    @break`,
      ``,
      `    @case(2)`,
      `    Second case...`,
      `    @break`,
      ``,
      `    @default`,
      `    Default case...`,
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
      `@if(auth()->user()->name === 'foo')`,
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

    const expected = [`@if($user)`, `    foo`, `@endif`, ``].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });

  test('should not occurs error on directive inside html tag ', async () => {
    const content = [
      `<body class="hold-transition login-page"`,
      `    @if(config('admin.login_background_image'))style="background: url({{ config('admin.login_background_image') }}) no-repeat;background-size: cover;"`,
      `    @endif>`,
      ``,
    ].join('\n');

    const expected = [
      `<body class="hold-transition login-page"`,
      `    @if(config('admin.login_background_image'))style="background: url({{ config('admin.login_background_image') }}) no-repeat;background-size: cover;"`,
      `    @endif>`,
      ``,
    ].join('\n');

    return new BladeFormatter().format(content).then((result) => {
      assert.equal(result, expected);
    });
  });
});
