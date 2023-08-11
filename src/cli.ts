import chalk from 'chalk';
import concat from 'concat-stream';
import _ from 'lodash';
import { loadWASM } from 'vscode-oniguruma';
import yargs from 'yargs';

import { promises as fs } from 'fs';
import os from 'os';

import { hideBin } from 'yargs/helpers';
import { name, version } from '../package.json';
import { BladeFormatter } from './main';

export default async function cli() {
  // @ts-ignore
  const parsed = await yargs(hideBin(process.argv))
    .usage(
      `${chalk.green(name)} ${version}\nAn opinionated blade template formatter for Laravel. \n\n ${chalk.yellow(
        `Usage:`,
      )} $0 [options] [file glob | ...]`,
    )
    .wrap(null)
    .example('$0 "resources/views/**/*.blade.php" --write', 'Format all files in views directory')
    .option('check-formatted', {
      alias: 'c',
      type: 'boolean',
      description: 'Only checks files are formatted or not',
      default: false,
    })
    .option('write', {
      alias: 'w',
      type: 'boolean',
      description: 'Write to file',
      default: false,
    })
    .option('diff', {
      alias: 'd',
      type: 'boolean',
      description: 'Show diffs',
      default: false,
    })
    .option('end-with-newline', {
      alias: 'e',
      type: 'boolean',
      description: 'End output with newline',
      default: true,
    })
    .option('end-of-line', {
      type: 'string',
      description: 'End of line character(s). [LF|CRLF]',
      default: os.EOL === '\r\n' ? 'CRLF' : 'LF',
    })
    .option('indent-size', {
      alias: 'i',
      type: 'integer',
      description: 'Indentation size',
      default: 4,
    })
    .option('wrap-line-length', {
      alias: 'wrap',
      type: 'integer',
      description: 'The length of line wrap size',
      default: 120,
    })
    .option('wrap-attributes', {
      alias: 'wrap-atts',
      type: 'string',
      description: `The way to wrap attributes.\n[auto|force|force-aligned|force-expand-multiline|aligned-multiple|preserve|preserve-aligned]`,
      default: 'auto',
    })
    .option('wrap-attributes-min-attrs', {
      type: 'integer',
      alias: 'M',
      description: `Minimum number of html tag attributes for force wrap attribute options. Wrap the first attribute only if 'force-expand-multiline' is specified in wrap attributes`,
      default: '2',
    })
    .option('indent-inner-html', {
      alias: 'I',
      type: 'boolean',
      description: 'Indent <head> and <body> sections in html.',
      default: false,
    })
    .option('sort-tailwindcss-classes', {
      alias: 'sort-classes',
      type: 'boolean',
      description: 'Sort tailwindcss classes',
      default: false,
    })
    .option('tailwindcss-config-path', {
      alias: ['tailwindcssConfigPath'],
      type: 'string',
      description: 'Specify path of tailwind config',
      default: null,
    })
    .option('sort-html-attributes', {
      alias: 'sort-attributes',
      type: 'string',
      choices: ['none', 'alphabetical', 'code-guide', 'idiomatic', 'vuejs', 'custom'],
      description: 'Sort HTML attributes.',
      default: 'none',
      defaultDescription: 'none',
    })
    .option('custom-html-attributes-order', {
      type: 'string',
      description:
        'Comma separated custom HTML attributes order. To enable this you must specify sort html attributes option as `custom`. You can use regex for attribute names.',
      default: null,
    })
    .option('no-single-quote', {
      type: 'boolean',
      description: 'Use double quotes instead of single quotes for php expression.',
      default: false,
    })
    .option('single-quote', {
      type: 'boolean',
      description: 'this is a workaround for combine strict && boolean option',
      hidden: true,
      default: true,
    })
    .option('extra-liners', {
      alias: 'E',
      type: 'string',
      description: 'Comma separated list of tags that should have an extra newline before them.',
      default: 'head,body,/html',
      nullable: true,
      coerce(formats) {
        // Make sure we support comma-separated syntax: --extra-liners head,body
        return _.flatten(_.flatten([formats]).map((format) => format.split(',')));
      },
    })
    .option('no-multiple-empty-lines', {
      type: 'boolean',
      description: 'Merge multiple blank lines into a single blank line',
      default: false,
    })
    .option('multiple-empty-lines', {
      type: 'boolean',
      description: 'this is a workaround for combine strict && boolean option',
      hidden: true,
      default: true,
    })
    .option('no-php-syntax-check', {
      type: 'boolean',
      description: 'Disable PHP sytnax checking',
      default: false,
    })
    .option('php-syntax-check', {
      type: 'boolean',
      description: 'this is a workaround for combine strict && boolean option',
      hidden: true,
      default: true,
    })
    .option('progress', {
      alias: 'p',
      type: 'boolean',
      description: 'Print progress',
      default: false,
    })
    .option('stdin', {
      type: 'boolean',
      description: 'format code provided on <STDIN>',
      default: false,
    })
    .option('config', {
      alias: ['runtimeConfigPath'],
      type: 'string',
      description: 'Use this configuration, overriding .bladeformatterrc config options if present',
      default: null,
    })
    .option('ignore-path', {
      alias: ['ignoreFilePath'],
      type: 'string',
      description: 'Specify path of ignore file',
      default: null,
    })
    .help('h')
    .alias('h', 'help')
    .strictOptions()
    .fail((msg, err) => {
      if (err) throw err; // preserve stack
      process.stdout.write(`${chalk.red(`error: `)}${msg}\n\n`);
      process.stdout.write(`${chalk.yellow(`Usage: `)} ${name} [options] [file glob | ...]\n\n`);
      process.stdout.write(`For more information try ${chalk.green(`--help`)}\n`);
      process.exit(1);
    })
    .epilog(`Copyright Shuhei Hayashibara 2022\nFor more information, see https://github.com/shufo/blade-formatter`);

  // @ts-ignore
  // eslint-disable-next-line
  const wasm = await fs.readFile(require.resolve('vscode-oniguruma/release/onig.wasm'));
  await loadWASM(wasm.buffer);

  const options = _.chain(parsed.argv)
    .set('noMultipleEmptyLines', !parsed.argv.multipleEmptyLines)
    .set('noPhpSyntaxCheck', !parsed.argv.phpSyntaxCheck)
    .set('noSingleQuote', !parsed.argv.singleQuote)
    .value();

  if (parsed.argv.stdin) {
    await process.stdin.pipe(
      concat({ encoding: 'string' }, (text: Buffer) =>
        new BladeFormatter(options)
          .format(text)
          .then((result: string | undefined) => {
            if (result !== undefined) {
              process.stdout.write(result);
            }
          })
          .catch((error) => {
            process.stdout.write(`${error.toString()}\n`);
            process.exit(1);
          }),
      ),
    );
    return;
  }

  if (parsed.argv._.length === 0) {
    parsed.showHelp();
    return;
  }

  const formatter = new BladeFormatter(options, parsed.argv._);
  await formatter.formatFromCLI();
}
