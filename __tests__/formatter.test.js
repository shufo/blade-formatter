import Formatter from '../src/formatter';

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
    'for',
    'foreach',
    'forelse',
    'guest',
    'if',
    'isset',
    'push',
    'section',
    'slot',
    'switch',
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
});
