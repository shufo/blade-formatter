import ignore from 'ignore';

import chalk from 'chalk';
import findConfig from 'find-config';
import fs from 'fs';
import glob from 'glob';
import _ from 'lodash';
import nodepath from 'path';
import process from 'process';
import { Config as TailwindConfig } from 'tailwindcss/types/config';
import nodeutil from 'util';
import FormatError from './errors/formatError';
import Formatter from './formatter';
import {
  EndOfLine,
  RuntimeConfig,
  SortHtmlAttributes,
  WrapAttributes,
  findRuntimeConfig,
  readRuntimeConfig,
} from './runtimeConfig';
import * as util from './util';

export type CLIOption = {
  write?: boolean;
  diff?: boolean;
  checkFormatted?: boolean;
  progress?: boolean;
  ignoreFilePath?: string;
  runtimeConfigPath?: string;
};

export type FormatterOption = {
  indentSize?: number;
  wrapLineLength?: number;
  wrapAttributes?: WrapAttributes;
  wrapAttributesMinAttrs?: number;
  indentInnerHtml?: boolean;
  endWithNewline?: boolean;
  endOfLine?: EndOfLine;
  useTabs?: boolean;
  sortTailwindcssClasses?: true;
  tailwindcssConfigPath?: string;
  tailwindcssConfig?: TailwindConfig;
  sortHtmlAttributes?: SortHtmlAttributes;
  customHtmlAttributesOrder?: string[] | string;
  noMultipleEmptyLines?: boolean;
  noPhpSyntaxCheck?: boolean;
  noSingleQuote?: boolean;
  extraLiners?: string[];
};

export type BladeFormatterOption = CLIOption & FormatterOption;

class BladeFormatter {
  diffs: any;

  errors: any;

  formattedFiles: any;

  ignoreFile: any;

  options: FormatterOption & CLIOption;

  outputs: any;

  currentTargetPath: string;

  paths: any;

  targetFiles: any;

  fulFillFiles: any;

  static targetFiles: any;

  runtimeConfigPath: string | null;

  runtimeConfigCache: RuntimeConfig;

  constructor(options: BladeFormatterOption = {}, paths: any = []) {
    this.currentTargetPath = '.';
    this.paths = paths;
    this.options = options;
    this.targetFiles = [];
    this.errors = [];
    this.diffs = [];
    this.outputs = [];
    this.formattedFiles = [];
    this.ignoreFile = '';
    this.fulFillFiles = [];
    this.targetFiles = [];
    this.runtimeConfigPath = options.runtimeConfigPath ?? null;
    this.runtimeConfigCache = {};
  }

  async format(content: any, opts: BladeFormatterOption = {}) {
    this.options = this.options || opts;
    const target = nodepath.resolve(process.cwd(), 'target');
    await this.readIgnoreFile(target);
    await this.findTailwindConfig(target);
    await this.readRuntimeConfig(target);
    return new Formatter(this.options).formatContent(content).catch((err) => {
      throw new FormatError(err);
    });
  }

  async formatFromCLI() {
    try {
      this.printPreamble();
      await this.readIgnoreFile(process.cwd());
      await this.processPaths();
      this.printResults();
    } catch (error) {
      // do nothing
    }
  }

  // eslint-disable-next-line class-methods-use-this
  fileExists(filepath: string) {
    return fs.promises
      .access(filepath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }

  async readIgnoreFile(filePath: string) {
    const configFilename = '.bladeignore';

    let configFilePath: string | null;
    const worakingDir = nodepath.dirname(filePath);

    if (this.options.ignoreFilePath) {
      configFilePath = this.options.ignoreFilePath;
    } else {
      configFilePath = findConfig(configFilename, { cwd: worakingDir });
    }

    if (!configFilePath) {
      return;
    }

    try {
      this.ignoreFile = (await fs.promises.readFile(configFilePath)).toString();
    } catch (err) {
      // do nothing
    }
  }

  async findTailwindConfig(filePath: string) {
    if (!this.options.sortTailwindcssClasses) {
      return;
    }

    const configFilename = 'tailwind.config.js';

    let configFilePath: string | null | undefined;

    if (this.options.tailwindcssConfigPath) {
      if (this.runtimeConfigPath) {
        const workingDir = nodepath.dirname(this.runtimeConfigPath);
        configFilePath = nodepath.resolve(workingDir, this.options.tailwindcssConfigPath);
      } else if (nodepath.isAbsolute(this.options.tailwindcssConfigPath)) {
        configFilePath = nodepath.resolve(this.options.tailwindcssConfigPath);
      } else {
        configFilePath = nodepath.resolve(this.options.tailwindcssConfigPath);
      }
    } else {
      // lookup tailwind config
      const workingDir = nodepath.dirname(filePath);
      configFilePath = findConfig(configFilename, { cwd: workingDir });
    }

    if (!configFilePath) {
      return;
    }

    this.options.tailwindcssConfigPath = configFilePath;
  }

  async readRuntimeConfig(filePath: string): Promise<RuntimeConfig | undefined> {
    if (_.isEmpty(this.runtimeConfigCache)) {
      this.options = _.merge(this.options, this.runtimeConfigCache);
    }

    let configFile: string | null;

    if (this.options.runtimeConfigPath) {
      configFile = this.options.runtimeConfigPath;
    } else {
      configFile = findRuntimeConfig(filePath);
    }

    if (_.isNull(configFile)) {
      return;
    }

    this.runtimeConfigPath = configFile;

    try {
      const options = await readRuntimeConfig(configFile);

      this.options = _.mergeWith(this.options, options, (obj, src) => {
        if (!_.isNil(src)) {
          return src;
        }

        return obj;
      });

      this.runtimeConfigCache = this.options;

      if (this.options.sortTailwindcssClasses) {
        await this.findTailwindConfig(filePath);
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        process.stdout.write(chalk.red.bold('\nBlade Formatter JSON Syntax Error: \n\n'));
        process.stdout.write(nodeutil.format(error));
        process.exit(1);
      }

      process.stdout.write(chalk.red.bold(`\nBlade Formatter Config Error: ${nodepath.basename(configFile)}\n\n`));
      process.stdout.write(`\`${error.errors[0].instancePath.replace('/', '')}\` ${error.errors[0].message}\n\n`);
      if (error.errors[0].params?.allowedValues) {
        console.log(error.errors[0].params?.allowedValues);
      }
      process.exit(1);
    }
  }

  async processPaths() {
    await Promise.all(_.map(this.paths, async (path: any) => this.processPath(path)));
  }

  async processPath(path: any) {
    await BladeFormatter.globFiles(path)
      .then((paths: any) => _.map(paths, (target: any) => nodepath.relative('.', target)))
      .then((paths) => this.filterFiles(paths))
      .then(this.fulFillFiles)
      .then((paths) => this.formatFiles(paths));
  }

  static globFiles(path: any) {
    return new Promise((resolve, reject) => {
      glob(path, (error: any, matches: any) => (error ? reject(error) : resolve(matches)));
    });
  }

  async filterFiles(paths: any) {
    if (this.ignoreFile === '') {
      return paths;
    }

    const REGEX_FILES_NOT_IN_CURRENT_DIR = /^\.\.*/;
    const filesOutsideTargetDir = _.filter(paths, (path: any) =>
      REGEX_FILES_NOT_IN_CURRENT_DIR.test(nodepath.relative('.', path)),
    );

    const filesUnderTargetDir = _.xor(paths, filesOutsideTargetDir);

    const filteredFiles = ignore().add(this.ignoreFile).filter(filesUnderTargetDir);

    return _.concat(filesOutsideTargetDir, filteredFiles);
  }

  static fulFillFiles(paths: any) {
    this.targetFiles.push(paths);

    return Promise.resolve(paths);
  }

  async formatFiles(paths: any) {
    await Promise.all(_.map(paths, async (path: any) => this.formatFile(path)));
  }

  async formatFile(path: any) {
    await this.findTailwindConfig(path);
    await this.readRuntimeConfig(path);

    await util
      .readFile(path)
      .then((data: any) => Promise.resolve(data.toString('utf-8')))
      .then((content) => new Formatter(this.options).formatContent(content))
      .then((formatted) => this.checkFormatted(path, formatted))
      .then((formatted) => this.writeToFile(path, formatted))
      .catch((err) => {
        this.handleError(path, err);
      });
  }

  async checkFormatted(path: any, formatted: any) {
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

  printFormattedOutput(path: any, formatted: any) {
    if (this.options.write || this.options.checkFormatted) {
      return;
    }

    process.stdout.write(`${formatted}`);

    const isLastFile = _.last(this.paths) === path || _.last(this.targetFiles) === path;

    if (isLastFile) {
      return;
    }

    // write divider to stdout
    if (this.paths.length > 1 || this.targetFiles.length > 1) {
      process.stdout.write('\n');
    }
  }

  writeToFile(path: any, content: any) {
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

    fs.writeFile(path, content, (err: any) => {
      if (err) {
        process.stdout.write(`${chalk.red(err.message)}\n`);
        process.exit(1);
      }
    });
  }

  handleError(path: any, error: any) {
    if (this.options.progress || this.options.write) {
      process.stdout.write(chalk.red('E'));
    }

    process.exitCode = 1;
    this.errors.push({ path, message: error.message, error });
  }

  printPreamble() {
    if (this.options.checkFormatted) {
      process.stdout.write('Check formatting... \n');
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
        process.stdout.write(chalk.bold('\nAll matched files are formatted! \n'));
      }

      return;
    }

    if (!this.options.write) {
      if (this.options.checkFormatted) {
        process.stdout.write(
          '\nAbove file(s) are formattable. Forgot to run formatter? ' +
            `Use ${chalk.bold('--write')} option to overwrite.\n`,
        );
      }

      return;
    }

    process.stdout.write(chalk.bold('\nFormatted Files: \n'));
    _.each(this.formattedFiles, (path: any) => process.stdout.write(`${chalk.bold(path)}\n`));
  }

  printDifferences() {
    if (!this.options.diff) {
      return;
    }

    process.stdout.write(chalk.bold('\nDifferences: \n\n'));

    if (_.filter(this.diffs, (diff: any) => diff.length > 0).length === 0) {
      process.stdout.write(chalk('No changes found. \n\n'));

      return;
    }

    _.each(this.diffs, (diff: any) => util.printDiffs(diff));
  }

  printErrors() {
    if (_.isEmpty(this.errors)) {
      return;
    }

    process.stdout.write(chalk.red.bold('\nErrors: \n\n'));

    _.each(this.errors, (error: any) => process.stdout.write(`${nodeutil.format(error)}\n`));
  }
}

export { BladeFormatter, Formatter };
