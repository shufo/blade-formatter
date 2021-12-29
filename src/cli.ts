import yargs from 'yargs';
import concat from 'concat-stream';
import { loadWASM } from 'vscode-oniguruma';

import { promises as fs } from 'fs';

import { hideBin } from 'yargs/helpers';
import { BladeFormatter } from './main';

export default async function cli() {
  // @ts-ignore
  const parsed = await yargs(hideBin(process.argv))
    .usage('Usage: $0 [options] [file glob | ...]')
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
      description: 'The way to wrap attributes',
      default: 'auto',
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
    .help('h')
    .alias('h', 'help')
    .epilog('Copyright Shuhei Hayashibara 2019');

  // @ts-ignore
  // eslint-disable-next-line
  const wasm = await fs.readFile(__non_webpack_require__.resolve('vscode-oniguruma/release/onig.wasm'));
  await loadWASM(wasm.buffer);

  if (parsed.argv.stdin) {
    await process.stdin.pipe(
      concat({ encoding: 'string' }, (text: any) =>
        new BladeFormatter(parsed.argv).format(text).then((result) => process.stdout.write(result)),
      ),
    );
    return;
  }

  if (parsed.argv._.length === 0) {
    parsed.showHelp();
    return;
  }

  const formatter = new BladeFormatter(parsed.argv, parsed.argv._);
  await formatter.formatFromCLI();
}
