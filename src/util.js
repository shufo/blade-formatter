const _ = require('lodash');
const fs = require('fs');
const chalk = require('chalk');
const prettier = require('prettier');

export const optional = (obj) => {
  const chain = {
    get() {
      return null;
    },
  };

  if (_.isUndefined(obj) || _.isNull(obj)) {
    return chain;
  }

  return obj;
};

export async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (error, data) => (error ? reject(error) : resolve(data)));
  });
}

export function splitByLines(content) {
  if (!content) {
    return '';
  }

  return content.split(/\r\n|\n|\r/);
}

export function normalizeIndentLevel(length) {
  if (length < 0) {
    return 0;
  }

  return length;
}

export function printDiffs(diffs) {
  return Promise.all(
    _.map(diffs, async (diff) => {
      console.log(`path: ${chalk.bold(diff.path)}:${diff.line}`);
      console.log(chalk.red(`--${diff.original}`));
      console.log(chalk.green(`++${diff.formatted}`));
    }),
  );
}

export function generateDiff(path, originalLines, formattedLines) {
  const diff = _.map(originalLines, (originalLine, index) => {
    if (_.isEmpty(originalLine)) {
      return null;
    }

    if (originalLine === formattedLines[index]) {
      return null;
    }

    return {
      path,
      line: index + 1,
      original: originalLine,
      formatted: formattedLines[index],
    };
  });

  return _.without(diff, null);
}

export function prettifyPhpContentWithUnescapedTags(content) {
  let prettified = _.replace(content, /\{\{--/g, '<?php //');
  prettified = _.replace(prettified, /--\}\}/g, '// ?>');
  prettified = _.replace(prettified, /\{\{/g, '<?php ');
  prettified = _.replace(prettified, /\}\}/g, ' ?>');

  prettified = prettier.format(prettified, {
    parser: 'php',
    printWidth: 1000,
    singleQuote: true,
  });

  prettified = _.replace(prettified, /<\?php\s\/\//g, '{{--');
  prettified = _.replace(prettified, /\/\/\s\?>/g, '--}}');
  prettified = _.replace(prettified, /<\?php\s/g, '{{ ');
  prettified = _.replace(prettified, /\s\?>/g, ' }}');

  return prettified;
}

export function prettifyPhpContentWithEscapedTags(content) {
  let prettified = _.replace(content, /{!!/g, '<?php ');
  prettified = _.replace(prettified, /!!}/g, ' ?>');

  prettified = prettier.format(prettified, {
    parser: 'php',
    printWidth: 1000,
    singleQuote: true,
  });

  prettified = _.replace(prettified, /<\?php\s/g, '{!! ');
  prettified = _.replace(prettified, /\s\?>/g, ' !!}');
  return prettified;
}

export function removeSemicolon(content) {
  let prettified = _.replace(content, /;\s\}\}/g, ' }}');
  prettified = _.replace(prettified, /;\s!!\}/g, ' !!}');

  return prettified;
}

export function formatAsPhp(content) {
  let prettified = prettifyPhpContentWithUnescapedTags(content);
  prettified = prettifyPhpContentWithEscapedTags(prettified);
  prettified = removeSemicolon(prettified);

  return Promise.resolve(prettified);
}

export function printDescription() {
  const returnLine = '\n\n';
  process.stdout.write(returnLine);
  process.stdout.write(chalk.bold.green('Fixed: F\n'));
  process.stdout.write(chalk.bold.red('Errors: E\n'));
  process.stdout.write(chalk.bold('Not Changed: ') + chalk.bold.green('.\n'));
}
