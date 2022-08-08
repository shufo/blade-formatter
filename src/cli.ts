import yargs from 'yargs';
import concat from 'concat-stream';
import { loadWASM } from 'vscode-oniguruma';
import chalk from 'chalk';
import _ from 'lodash';

import { promises as fs } from 'fs';

import { hideBin } from 'yargs/helpers';
import { BladeFormatter } from './main';
import { name, version } from '../package.json';

export default async function cli() {
  // @ts-ignore
  const parsed = await yargs(hideBin(process.argv))
    .usage(
      `${chalk.green(name)} ${version}\nAn opinionated blade template formatter for Laravel. \n\n ${chalk.yellow(
        `Usage:`,
      )} $0 [options] [file glob | ...]`,
    )
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
    .option('sort-tailwindcss-classes', {
      alias: 'sort-classes',
      type: 'boolean',
      description: 'Sort tailwindcss classes',
      default: false,
    })
    .option('sort-html-attributes', {
      alias: 'sort-attributes',
      type: 'string',
      choices: ['none', 'alphabetical', 'code-guide', 'idiomatic', 'vuejs'],
      description: 'Sort HTML attributes.',
      default: 'none',
      defaultDescription: 'none',
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
    .fail(function (msg, err) {
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

  const options = _.set(parsed.argv, 'noMultipleEmptyLines', !parsed.argv.multipleEmptyLines);

  if (parsed.argv.stdin) {
    await process.stdin.pipe(
      concat({ encoding: 'string' }, (text: Buffer) => {
        return new BladeFormatter(options)
          .format(text)
          .then((result: string | undefined) => {
            if (result !== undefined) {
              process.stdout.write(result);
            }
          })
          .catch((error) => {
            process.stdout.write(`${error.toString()}\n`);
            process.exit(1);
          });
      }),
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
