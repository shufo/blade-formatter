[![npm version](https://badge.fury.io/js/blade-formatter.svg)](https://badge.fury.io/js/blade-formatter)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/shufo/blade-formatter/Node%20CI)](https://github.com/shufo/blade-formatter/actions?query=workflow%3A%22Node+CI%22)
[![npm](https://img.shields.io/npm/dt/blade-formatter)](https://www.npmjs.com/package/blade-formatter)
![NPM](https://img.shields.io/npm/l/blade-formatter)

# blade-formatter

An opinionated blade template formatter for Laravel that respects readability

![blade-formatter](https://user-images.githubusercontent.com/1641039/90263225-51f3b280-de8a-11ea-940c-54c3554174d2.png)

This project aims to provide formatter for blade template because there is no official blade template formatter.

[Online Demo](https://online-blade-formatter.vercel.app/)

## Features

- Automatically Indents markup inside directives

  ![blade-formatter-indent](https://user-images.githubusercontent.com/1641039/125206632-33c54b00-e2c3-11eb-88ee-5a8b2ae306b5.gif)

- Automatically add spacing to blade templating markers

  ![blade-formatter-spacing](https://user-images.githubusercontent.com/1641039/125206634-345de180-e2c3-11eb-9631-016376556dce.gif)

- PHP 8 support (null safe operator, named arguments) 🐘

  ![blade-formatter-php8](https://user-images.githubusercontent.com/1641039/125206633-33c54b00-e2c3-11eb-8bc9-3bae838ccf32.gif)

- PSR-2 support (format inside directives)

  ![blade-formatter-format-in-directive](https://user-images.githubusercontent.com/1641039/125206630-31fb8780-e2c3-11eb-9618-a7092316a203.gif)

## Example

### Input

```blade
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

```blade
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

|                             option |                                                                                                                      description | default |
| ---------------------------------: | -------------------------------------------------------------------------------------------------------------------------------: | ------: |
|          `--check-formatted`, `-c` |                                          Only check files are formatted or not. Exit with exit code 1 if files are not formatted |   false |
|                   `--write`, `--w` |                                                                                                                    Write to file |   false |
|                     `--diff`, `-d` |                                                                                                                 Show differences |   false |
|              `--indent-size`, `-i` |                                                                                                                 Indentation size |       4 |
|     `--wrap-line-length`, `--wrap` |                                                                                                     The length of line wrap size |     120 |
| `--wrap-attributes`, `--wrap-atts` | The way to wrap attributes. `[auto\|force\|force-aligned\|force-expand-multiline\|aligned-multiple\|preserve\|preserve-aligned]` |  `auto` |
|         `--end-with-newline`, `-e` |                                                                                                          End output with newline |    true |
|                          `--stdin` |                                                                                                format code provided on `<STDIN>` |   false |
|                     `--help`, `-h` |                                                                                                                        Show help |         |
|                  `--version`, `-v` |                                                                                                                     Show version |         |

## Configuring blade-formatter

To configuring project wide settings, put `.bladeformatterrc.json` or `.bladeformatterrc` to your repository root will blade-formatter treat it as setting files.

e.g.

```json
{
  "indentSize": 4,
  "wrapAttributes": "auto",
  "wrapLineLength": 120,
  "endWithNewLine": true,
  "useTabs": false
}
```

blade-formatter will searches up the directory structure until reaching root directory.

## Ignore Files

To ignore specific file, put `.bladeignore` to your repository root will blade-formatter treat it as ignored files.

e.g.

```gitignore
resources/views/users/index.blade.php
resources/views/products/*
resources/views/books/**/*
```

## Disabling format in file

To disable formatting in your file, you can use blade comments in the following format:

```blade
{{-- blade-formatter-disable --}}
    {{ $foo }}
    {{ $bar }}
{{-- blade-formatter-enable --}}
```

To disable format on a specific line, you can use comment in the following format:

```blade
{{-- blade-formatter-disable-next-line --}}
    {{ $foo }}
```

To disable format in an entire file, put a `{{-- blade-formatter-disable --}}` comment at the top of the file:

```blade
{{-- blade-formatter-disable --}}

{{ $foo }}
```

## API

You can use blade formatter by API as well.

```js
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

### ESModule

```js
import BladeFormatter from "blade-formatter";
const { Formatter } = BladeFormatter;

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

new Formatter(options).formatContent(input).then((formatted) => {
    console.log(formatted);
});
```

## Extensions

- [vscode-blade-formatter](https://github.com/shufo/vscode-blade-formatter) - [VSCode](https://code.visualstudio.com/) Extension
- [coc-blade](https://github.com/yaegassy/coc-blade) - [coc.nvim](https://github.com/neoclide/coc.nvim) Extension by [@yaegassy](https://github.com/yaegassy)
- [prettier-plugin-blade](https://github.com/shufo/prettier-plugin-blade) - Prettier plugin for Blade

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
- [x] ignore formatting in blade comment
- [x] automatically add new line after directive

## Contributors

<!-- readme: collaborators,contributors -start -->
<table>
<tr>
    <td align="center">
        <a href="https://github.com/dianfishekqi">
            <img src="https://avatars.githubusercontent.com/u/4225509?v=4" width="100;" alt="dianfishekqi"/>
            <br />
            <sub><b>Dian Fishekqi</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/shufo">
            <img src="https://avatars.githubusercontent.com/u/1641039?v=4" width="100;" alt="shufo"/>
            <br />
            <sub><b>Shuhei Hayashibara</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/slovenianGooner">
            <img src="https://avatars.githubusercontent.com/u/1257629?v=4" width="100;" alt="slovenianGooner"/>
            <br />
            <sub><b>SlovenianGooner</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/yaegassy">
            <img src="https://avatars.githubusercontent.com/u/188642?v=4" width="100;" alt="yaegassy"/>
            <br />
            <sub><b>Yaegassy</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/schelmo">
            <img src="https://avatars.githubusercontent.com/u/47602?v=4" width="100;" alt="schelmo"/>
            <br />
            <sub><b>Schelmo</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/jtanaka">
            <img src="https://avatars.githubusercontent.com/u/1379640?v=4" width="100;" alt="jtanaka"/>
            <br />
            <sub><b>Jumpei Tanaka</b></sub>
        </a>
    </td></tr>
</table>
<!-- readme: collaborators,contributors -end -->

## Contributing

1.  Fork it
2.  Create your feature branch (`git checkout -b my-new-feature`)
3.  Commit your changes (`git commit -am 'Add some feature'`)
4.  Push to the branch (`git push origin my-new-feature`)
5.  Create new Pull Request

## LICENSE

MIT
