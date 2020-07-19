import yargs from 'yargs';
import { BladeFormatter } from './main';

export default async function cli() {
  const argv = await yargs
    .usage('Usage: $0 [options] [file glob | ...]')
    .example(
      '$0 resources/views/**/*.blade.php --overwrite',
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
    .option('progress', {
      alias: 'p',
      type: 'boolean',
      description: 'Print progress',
      default: false,
    })
    .help('h')
    .alias('h', 'help')
    .epilog('Copyright Shuhei Hayashibara 2019').argv;

  if (argv._.length === 0) {
    yargs.showHelp();
  }

  const formatter = new BladeFormatter(argv, argv._);
  await formatter.formatFromCLI();
}
