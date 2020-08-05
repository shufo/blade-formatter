[![npm version](https://badge.fury.io/js/blade-formatter.svg)](https://badge.fury.io/js/blade-formatter) [![Actions Status](https://github.com/shufo/blade-formatter/workflows/Node%20CI/badge.svg)](https://github.com/shufo/blade-formatter/actions)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=shufo/blade-formatter)](https://dependabot.com)


# blade-formatter

An opinionated blade template formatter for Laravel that respects readability

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
                @foreach($users as $user)
        <li>
            <img src="{{ asset('img/frontend/icon/branch-arrow.svg') }}" alt="branch_arrow">
            {{ link_to_route("frontend.users.user.show",$users["name"],$users['_id']) }}
        </li>
        @endforeach
      </ul>
      <div class="pf-users-branch__btn">
      @can('create', App\Models\User::class)
            {!! link_to_route("frontend.users.user.create",__('users.create'),[1,2,3],['class' => 'btn']) !!}
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
                    @foreach ($users as $user)
                        <li>
                            <img src="{{ asset('img/frontend/icon/branch-arrow.svg') }}" alt="branch_arrow">
                            {{ link_to_route('frontend.users.user.show', $users['name'], $users['_id']) }}
                        </li>
                    @endforeach
                </ul>
                <div class="pf-users-branch__btn">
                    @can('create', App\Models\User::class)
                        {!! link_to_route('frontend.users.user.create', __('users.create'), [1, 2, 3], ['class' => 'btn']) !!}
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

```bash
$ yarn add --dev blade-formatter
```

global

```bash
$ npm install -g blade-formatter
$ yarn global add blade-formatter
```

docker

```bash
$ docker run -it -v $(pwd):/app -w /app shufo/blade-formatter resources/**/*.blade.php
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
|`--end-with-newline`, `-e`|End output with newline|true|
|`--stdin`|format code provided on `<STDIN>` |false|
|`--help`, `-h`|Show help||
|`--version`, `-v`|Show version||

## API

You can use blade formatter by API as well.

```js
require = require('esm')(module);
const { BladeFormatter } = require('blade-formatter');

const input = `
<html>
  <body>
    <p>foo</p>
  </body>
</html>
`;

const options = {
  indentSize: 2,
};

new BladeFormatter(options).format(input).then((formatted) => {
  console.log(formatted);
});
```

## Extension
- [vscode-blade-formatter](https://github.com/shufo/vscode-blade-formatter) - [VSCode](https://code.visualstudio.com/) Extension

## Contributing

1.  Fork it
2.  Create your feature branch (`git checkout -b my-new-feature`)
3.  Commit your changes (`git commit -am 'Add some feature'`)
4.  Push to the branch (`git push origin my-new-feature`)
5.  Create new Pull Request

## LICENSE

MIT

## Troubleshoot

- If you encounter the error until installation like below

```
$ npm install -g blade-formatter
~~
current user ("nobody") does not have permission to access the dev dir
~~
```

Try set global user as root

```
$ npm -g config set user root
```

## TODO

- [ ] Editable custom directives
- [x] `@for` directive support
- [ ] ignore formatting in blade comment
