import yargs from 'yargs';
import concat from 'concat-stream';
import { BladeFormatter } from './main';

export default async function cli() {
  const argv = await yargs
    .usage('Usage: $0 [options] [file glob | ...]')
    .example(
      '$0 "resources/views/**/*.blade.php" --write',
      'Format all files in views directory',
    )
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
    .epilog('Copyright Shuhei Hayashibara 2019').argv;

  if (argv.stdin) {
    await process.stdin.pipe(
      concat({ encoding: 'string' }, (text) => {
        return new BladeFormatter(argv)
          .format(text)
          .then((result) => process.stdout.write(result));
      }),
    );
    return;
  }

  if (argv._.length === 0) {
    yargs.showHelp();
  }

  const formatter = new BladeFormatter(argv, argv._);
  await formatter.formatFromCLI();
}
