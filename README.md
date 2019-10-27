[![npm version](https://badge.fury.io/js/blade-formatter.svg)](https://badge.fury.io/js/blade-formatter) [![Actions Status](https://github.com/shufo/blade-formatter/workflows/Node%20CI/badge.svg)](https://github.com/shufo/blade-formatter/actions)


# blade-formatter

An opinionated blade template formatter for Laravel

## Example

### Input

```html
@extends('frontend.layouts.app')
@section('title') foo
@endsection
@section('content')
<section id="content">
<div class="container mod-users-pd-h">
    <div class="pf-user-header">
    <div></div>
    <p>@lang('users.index')</p>
    </div>
        <div class="pf-users-branch">
            <ul class="pf-users-branch__list">
                @foreach($users as $index=>$user)
        <li>
            <img src="{{ asset("img/frontend/icon/branch-arrow.svg") }}" alt="branch_arrow">
            {{ link_to_route('frontend.users.user.show',$users["name"],$users['_id']) }}
        </li>
        @endforeach
      </ul>
      <div class="pf-users-branch__btn">
      @can("create", App\Models\User::class)
            {!! link_to_route('frontend.users.user.create',__('users.create'),[1,2,3,4,5],['class' => 'btn']) !!}
            @endcan
        </div>
  </div>
    </div>
</section>
@endsection
@section('footer')
@stop
```

### Output

```html
@extends('frontend.layouts.app')
@section('title') foo
@endsection
@section('content')
    <section id="content">
        <div class="container mod-users-pd-h">
            <div class="pf-user-header">
                <div></div>
                <p>@lang('users.index')</p>
            </div>
            <div class="pf-users-branch">
                <ul class="pf-users-branch__list">
                    @foreach($users as $index=>$user)
                        <li>
                            <img src="{{ asset('img/frontend/icon/branch-arrow.svg') }}" alt="branch_arrow">
                            {{ link_to_route('frontend.users.user.show', $users['name'], $users['_id']) }}
                        </li>
                    @endforeach
                </ul>
                <div class="pf-users-branch__btn">
                    @can("create", App\Models\User::class)
                        {!! link_to_route('frontend.users.user.create', __('users.create'), [1, 2, 3, 4, 5], ['class' => 'btn'])
                        !!}
                    @endcan
                </div>
            </div>
        </div>
    </section>
@endsection
@section('footer')
@stop
```

## Installation

```
$ npm install --save-dev blade-formatter
$ node_modules/.bin/blade-formatter -h
```

yarn

```
$ yarn add --dev blade-formatter
```

global

```
$ npm install -g blade-formatter
$ yarn global add blade-formatter
```

## Usage

- Basic

```bash
# This outputs formatted result to stdout
$ blade-formatter resources/**/*.blade.php
$ blade-formatter resources/layouts/app.blade.php
```

- Check if template is formatted or not (makes no change)

```bash
$ blade-formatter app/** -d -c
Check formatting...
app/index.blade.php

Above file(s) are formattable. Forgot to run formatter? Use --write option to overwrite.
$ echo $?
1
```

- Format files and overwrite

```bash
$ blade-formatter --write resources/**/*.blade.php
```

- Show diffs

```bash
$ blade-formatter -c -d resources/**/*.blade.php
```

## Options

|option|description|default|
|--:|--:|--:|
|`--check-formatted`, `-c`|Only check files are formatted or not. Exit with exit code 1 if files are not formatted|false|
|`--write`, `--w`|Write to file|false|
|`--diff`, `-d`|Show differences|false|
|`--indent-size`, `-i`|Indentation size|4|
|`--wrap-line-length`, `--wrap`|The length of line wrap size|120|
|`--end-with-newline,`, `-e`|End output with newline|true|
|`--help,`, `-h`|Show help||
|`--version,`, `-v`|Show version||


## Contributing

1.  Fork it
2.  Create your feature branch (`git checkout -b my-new-feature`)
3.  Commit your changes (`git commit -am 'Add some feature'`)
4.  Push to the branch (`git push origin my-new-feature`)
5.  Create new Pull Request

## LICENSE

MIT

## TODO

- [ ] Editable custom directives
