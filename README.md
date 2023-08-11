[![npm version](https://badge.fury.io/js/blade-formatter.svg)](https://badge.fury.io/js/blade-formatter)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/shufo/blade-formatter/node.yml)](https://github.com/shufo/blade-formatter/actions?query=workflow%3A%22Node+CI%22)
[![npm](https://img.shields.io/npm/dt/blade-formatter)](https://www.npmjs.com/package/blade-formatter)
![NPM](https://img.shields.io/npm/l/blade-formatter)
[![codecov](https://codecov.io/gh/shufo/blade-formatter/branch/master/graph/badge.svg?token=VC1YYO4T4F)](https://codecov.io/gh/shufo/blade-formatter)

# blade-formatter

An opinionated blade template formatter for Laravel that respects readability

![blade-formatter](https://user-images.githubusercontent.com/1641039/90263225-51f3b280-de8a-11ea-940c-54c3554174d2.png)

This project aims to provide a formatter for blade templates, as there is no official blade template formatter.

[Try the online demo](https://online-blade-formatter.vercel.app/)

## Features

- Automatically Indents markup inside directives

  ![blade-formatter-indent](https://user-images.githubusercontent.com/1641039/125206632-33c54b00-e2c3-11eb-88ee-5a8b2ae306b5.gif)

- Automatically add spacing to blade templating markers

  ![blade-formatter-spacing](https://user-images.githubusercontent.com/1641039/125206634-345de180-e2c3-11eb-9631-016376556dce.gif)

- PHP 8 support (null safe operator, named arguments) 🐘

  ![blade-formatter-php8](https://user-images.githubusercontent.com/1641039/125206633-33c54b00-e2c3-11eb-8bc9-3bae838ccf32.gif)

- PSR-2 support (format inside directives)

  ![blade-formatter-format-in-directive](https://user-images.githubusercontent.com/1641039/125206630-31fb8780-e2c3-11eb-9618-a7092316a203.gif)

- Automatic [Tailwind CSS](https://tailwindcss.com/) Class Sorting. see [Options](#Options)
- [Custom Directive](https://laravel.com/docs/9.x/blade#custom-if-statements) support

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

### yarn

```bash
$ yarn add --dev blade-formatter
```

### global

```bash
$ npm install -g blade-formatter
$ yarn global add blade-formatter
```

### docker

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

```bash
  Options:
      --version                       Show version number  [boolean]
  -c, --check-formatted               Only checks files are formatted or not  [boolean] [default: false]
  -w, --write                         Write to file  [boolean] [default: false]
  -d, --diff                          Show diffs  [boolean] [default: false]
  -e, --end-with-newline              End output with newline  [boolean] [default: true]
      --end-of-line                   End of line character(s). [string] [choices: "LF", "CRLF"]
  -i, --indent-size                   Indentation size  [default: 4]
      --wrap-line-length, --wrap      The length of line wrap size  [default: 120]
      --wrap-attributes, --wrap-atts  The way to wrap attributes.
                                      [auto|force|force-aligned|force-expand-multiline|aligned-multiple|preserve|preserve-aligned]  [string] [default: "auto"]
  -M, --wrap-attributes-min-attrs     Minimum number of html tag attributes for force wrap attribute options. Wrap the first attribute only if 'force-expand-multiline' is specified in wrap attributes  [default: "2"]
  -I, --indent-inner-html             Indent <head> and <body> sections in html.  [boolean] [default: false]
      --sort-tailwindcss-classes      Sort tailwindcss classes  [boolean] [default: false]
      --tailwindcss-config-path       Specify path of tailwind config  [string] [default: null]
      --sort-html-attributes          Sort HTML attributes.  [string] [choices: "none", "alphabetical", "code-guide", "idiomatic", "vuejs", "custom"] [default: none]
      --custom-html-attributes-order  Comma separated custom HTML attributes order. To enable this you must specify sort html attributes option as `custom`. You can use regex for attribute names. [string] [default: null]
      --no-single-quote               Use double quotes instead of single quotes for php expression.  [boolean] [default: false]
  -E, --extra-liners                  Comma separated list of tags that should have an extra newline before them.  [string] [default: "head,body,/html"]
      --no-multiple-empty-lines       Merge multiple blank lines into a single blank line  [boolean] [default: false]
      --no-php-syntax-check           Disable PHP sytnax checking  [boolean] [default: false]
  -p, --progress                      Print progress  [boolean] [default: false]
      --stdin                         format code provided on <STDIN>  [boolean] [default: false]
      --config                        Use this configuration, overriding .bladeformatterrc config options if present  [string] [default: null]
      --ignore-path                   Specify path of ignore file  [string] [default: null]
  -h, --help                          Show help  [boolean]

Examples:
  blade-formatter "resources/views/**/*.blade.php" --write  Format all files in views directory
```

## Configuring blade-formatter

To configure project wide settings, put `.bladeformatterrc.json` or `.bladeformatterrc` in your repository root, blade-formatter will treat them as settings files.

e.g.

```json
{
  "indentSize": 4,
  "wrapAttributes": "auto",
  "wrapLineLength": 120,
  "wrapAttributesMinAttrs": 2,
  "indentInnerHtml": true,
  "endWithNewLine": true,
  "endOfLine": "LF",
  "useTabs": false,
  "sortTailwindcssClasses": true,
  "sortHtmlAttributes": "none",
  "noMultipleEmptyLines": false,
  "noPhpSyntaxCheck": false,
  "noSingleQuote": false,
  "extraLiners": []
}
```

blade-formatter will search up the directory structure until it reaches the root directory.

## Ignore Files

To ignore a specific file, put a `.bladeignore' in the root of your repository and the blade formatter will treat it as an ignored file.

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

To disable formatiing on a specific line, you can use comment in the following format:

```blade
{{-- blade-formatter-disable-next-line --}}
    {{ $foo }}
```

To disable formatting for an entire file, put a `{{-- blade-formatter-disable --}}` comment at the beginning of the file:

```blade
{{-- blade-formatter-disable --}}

{{ $foo }}
```

## API

You can also use the blade formatter via API.

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
  indentSize: 4,
  wrapAttributes: "auto",
  wrapLineLength: 120,
  endWithNewLine: true,
  useTabs: false,
  sortTailwindcssClasses: true,
};

new BladeFormatter(options).format(input).then((formatted) => {
  console.log(formatted);
});
```

### ESModule

```js
import { Formatter } from "blade-formatter";

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
- [null-ls.nvim](https://github.com/jose-elias-alvarez/null-ls.nvim) - Extension by [@jose-elias-alvarez](https://github.com/jose-elias-alvarez)

## Troubleshoot

- If you encounter the following error during installation

```
$ npm install -g blade-formatter
~~
current user ("nobody") does not have permission to access the dev dir
~~
```

Try setting the global user as root

```
$ npm -g config set user root
```

- If you encounter the following message like below when sorting TailwindCss class sorting enabled

```
  message: 'module is not defined in ES module scope\n' +
// or
export default {
^^^^^^
SyntaxError: Unexpected token 'export'
```

then you should check your nodejs module type is matched with `tailwindcss.config.js`.

### ESM

`package.json`

```json
"type": "module"
```

`tailwind.config.js`

```js
export default {
  ~~~
}
```

### CommonJS

`tailwind.config.js`

```js
module.exports = {
  ~~~
}

```

## TODO

- [x] custom directives
- [x] `@for` directive support
- [x] ignore formatting in blade comment
- [x] automatically add new line after directive

## Development

```bash
$ yarn install
$ yarn run watch # watch changes
```

You can use local docker image for development.
It might help if the host OS is not an amd64 architecture.

```bash
$ make build
$ make run example.php
```


## Testing

```bash
$ yarn install
$ yarn run test
```

You can use local docker image for testing.
It might help if the host OS is not an amd64 architecture.

```bash
$ make build
$ make test
$ make debug # attach
```

## Contributing

1.  Fork it
2.  Create your feature branch (`git checkout -b my-new-feature`)
3.  Commit your changes (`git commit -am 'Add some feature'`)
4.  Push to the branch (`git push origin my-new-feature`)
5.  Create new Pull Request

## Contributors

<!-- readme: collaborators,contributors -start -->
<table>
<tr>
    <td align="center">
        <a href="https://github.com/shufo">
            <img src="https://avatars.githubusercontent.com/u/1641039?v=4" width="100;" alt="shufo"/>
            <br />
            <sub><b>Shuhei Hayashibara</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/wheesnoza">
            <img src="https://avatars.githubusercontent.com/u/45123151?v=4" width="100;" alt="wheesnoza"/>
            <br />
            <sub><b>Null</b></sub>
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
        <a href="https://github.com/Dave-iFour">
            <img src="https://avatars.githubusercontent.com/u/110526667?v=4" width="100;" alt="Dave-iFour"/>
            <br />
            <sub><b>Dave</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/notdian">
            <img src="https://avatars.githubusercontent.com/u/4225509?v=4" width="100;" alt="notdian"/>
            <br />
            <sub><b>Null</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/gagansday">
            <img src="https://avatars.githubusercontent.com/u/25811413?v=4" width="100;" alt="gagansday"/>
            <br />
            <sub><b>Gagandeep Singh</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/hjanos1">
            <img src="https://avatars.githubusercontent.com/u/3355793?v=4" width="100;" alt="hjanos1"/>
            <br />
            <sub><b>Janos Horvath</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/joshuachp">
            <img src="https://avatars.githubusercontent.com/u/43700905?v=4" width="100;" alt="joshuachp"/>
            <br />
            <sub><b>Joshua Chapman</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/jtanaka">
            <img src="https://avatars.githubusercontent.com/u/1379640?v=4" width="100;" alt="jtanaka"/>
            <br />
            <sub><b>Jumpei Tanaka</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/ldommer">
            <img src="https://avatars.githubusercontent.com/u/65616313?v=4" width="100;" alt="ldommer"/>
            <br />
            <sub><b>Lennart Dommer</b></sub>
        </a>
    </td></tr>
</table>
<!-- readme: collaborators,contributors -end -->

## LICENSE

MIT
