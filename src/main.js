import ignore from 'ignore';
import * as util from './util';
import Formatter from './formatter';

const nodepath = require('path');
const fs = require('fs');
const process = require('process');
const chalk = require('chalk');
const glob = require('glob');
const nodeutil = require('util');
const _ = require('lodash');

export class BladeFormatter {
  constructor(options = {}, paths = []) {
    this.paths = paths;
    this.options = options;
    this.targetFiles = [];
    this.errors = [];
    this.diffs = [];
    this.outputs = [];
    this.formattedFiles = [];
    this.ignoreFile = '';
  }

  format(content, opts = {}) {
    const options = this.options || opts;
    return new Formatter(options)
      .formatContent(content)
      .catch((err) => console.log(err));
  }

  async formatFromCLI() {
    await this.readIgnoreFile();
    this.printPreamble();
    await this.processPaths();
    this.printResults();
  }

  async readIgnoreFile() {
    const ignoreFile = '.bladeignore';

    try {
      if (fs.existsSync(ignoreFile)) {
        this.ignoreFile = fs.readFileSync(ignoreFile).toString();
      }
    } catch (err) {
      // do nothing
    }
  }

  async processPaths() {
    await Promise.all(
      _.map(this.paths, async (path) => this.processPath(path)),
    );
  }

  async processPath(path) {
    await BladeFormatter.globFiles(path)
      .then((paths) => _.map(paths, (target) => nodepath.relative('.', target)))
      .then((paths) => this.filterFiles(paths))
      .then(this.fulFillFiles)
      .then((paths) => this.formatFiles(paths));
  }

  static globFiles(path) {
    return new Promise((resolve, reject) => {
      glob(path, (error, matches) =>
        error ? reject(error) : resolve(matches),
      );
    });
  }

  async filterFiles(paths) {
    if (this.ignoreFile === '') {
      return paths;
    }

    const REGEX_FILES_NOT_IN_CURRENT_DIR = new RegExp(/^\.\.*/);
    const filesOutsideTargetDir = _.filter(paths, (path) =>
      REGEX_FILES_NOT_IN_CURRENT_DIR.test(nodepath.relative('.', path)),
    );

    const filesUnderTargetDir = _.xor(paths, filesOutsideTargetDir);

    const filteredFiles = ignore()
      .add(this.ignoreFile)
      .filter(filesUnderTargetDir);

    return _.concat(filesOutsideTargetDir, filteredFiles);
  }

  static fulFillFiles(paths) {
    this.targetFiles.push(paths);

    return Promise.resolve(paths);
  }

  async formatFiles(paths) {
    await Promise.all(_.map(paths, async (path) => this.formatFile(path)));
  }

  async formatFile(path) {
    await util
      .readFile(path)
      .then((data) => {
        return Promise.resolve(data.toString('utf-8'));
      })
      .then((content) => new Formatter(this.options).formatContent(content))
      .then((formatted) => this.checkFormatted(path, formatted))
      .then((formatted) => this.writeToFile(path, formatted))
      .catch((err) => this.handleError(path, err));
  }

  async checkFormatted(path, formatted) {
    this.printFormattedOutput(path, formatted);

    const originalContent = fs.readFileSync(path, 'utf-8');

    const originalLines = util.splitByLines(originalContent);
    const formattedLines = util.splitByLines(formatted);

    const diff = util.generateDiff(path, originalLines, formattedLines);
    this.diffs.push(diff);
    this.outputs.push(formatted);

    if (diff.length > 0) {
      if (this.options.progress || this.options.write) {
        process.stdout.write(chalk.green('F'));
      }

      if (this.options.checkFormatted) {
        process.stdout.write(`${path}\n`);
        process.exitCode = 1;
      }

      this.formattedFiles.push(path);
    }

    if (diff.length === 0) {
      if (this.options.progress || this.options.write) {
        process.stdout.write(chalk.green('.'));
      }
    }

    return Promise.resolve(formatted);
  }

  printFormattedOutput(path, formatted) {
    if (this.options.write || this.options.checkFormatted) {
      return;
    }

    process.stdout.write(`${formatted}`);

    const isLastFile =
      _.last(this.paths) === path || _.last(this.targetFiles) === path;

    if (isLastFile) {
      return;
    }

    // write divider to stdout
    if (this.paths.length > 1 || this.targetFiles.length > 1) {
      process.stdout.write('\n');
    }
  }

  writeToFile(path, content) {
    if (!this.options.write) {
      return;
    }

    if (this.options.checkFormatted) {
      return;
    }

    // preserve original content
    if (content.length === 0 || _.isNull(content) || _.isEmpty(content)) {
      return;
    }

    fs.writeFile(path, content, (err) => {
      if (err) {
        process.stdout.write(`${chalk.red(err.message)}\n`);
        process.exit(1);
      }
    });
  }

  handleError(path, error) {
    if (this.options.progress || this.options.write) {
      process.stdout.write(chalk.red('E'));
    }

    process.exitCode = 1;
    this.errors.push({ path, message: error.message, error });
  }

  printPreamble() {
    if (this.options.checkFormatted) {
      process.stdout.write(`Check formatting... \n`);
    }
  }

  async printResults() {
    this.printDescription();
    this.printDifferences();
    this.printFormattedFiles();
    this.printErrors();
  }

  printDescription() {
    if (!this.options.write) {
      return;
    }

    const returnLine = '\n\n';
    process.stdout.write(returnLine);
    process.stdout.write(chalk.bold.green('Fixed: F\n'));
    process.stdout.write(chalk.bold.red('Errors: E\n'));
    process.stdout.write(chalk.bold('Not Changed: ') + chalk.bold.green('.\n'));
  }

  printFormattedFiles() {
    if (this.formattedFiles.length === 0) {
      if (this.options.checkFormatted) {
        process.stdout.write(
          chalk.bold('\nAll matched files are formatted! \n'),
        );
      }

      return;
    }

    if (!this.options.write) {
      if (this.options.checkFormatted) {
        process.stdout.write(
          `\nAbove file(s) are formattable. Forgot to run formatter? ` +
            `Use ${chalk.bold('--write')} option to overwrite.\n`,
        );
      }

      return;
    }

    process.stdout.write(chalk.bold('\nFormatted Files: \n'));
    _.each(this.formattedFiles, (path) =>
      process.stdout.write(`${chalk.bold(path)}\n`),
    );
  }

  printDifferences() {
    if (!this.options.diff) {
      return;
    }

    process.stdout.write(chalk.bold('\nDifferences: \n\n'));

    if (_.filter(this.diffs, (diff) => diff.length > 0).length === 0) {
      process.stdout.write(chalk('No changes found. \n\n'));

      return;
    }

    _.each(this.diffs, (diff) => util.printDiffs(diff));
  }

  printErrors() {
    if (_.isEmpty(this.errors)) {
      return;
    }

    process.stdout.write(chalk.red.bold('\nErrors: \n\n'));

    _.each(this.errors, (error) =>
      process.stdout.write(`${nodeutil.format(error)}\n`),
    );
  }
}

export default {
  BladeFormatter,
};
