/* eslint-disable max-len */
const _ = require('lodash');
const fs = require('fs');
const chalk = require('chalk');
const prettier = require('prettier');
const detectIndent = require('detect-indent');
const {
  indentStartTokens,
  phpKeywordStartTokens,
  phpKeywordEndTokens,
} = require('./indent');

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

export function formatStringAsPhp(content) {
  return prettier.format(content.replace(/\n$/, ''), {
    parser: 'php',
    printWidth: 1000,
    singleQuote: true,
    phpVersion: '7.4',
  });
}

export function formatRawStringAsPhp(content) {
  return prettier
    .format(`<?php echo ${content} ?>`, {
      parser: 'php',
      printWidth: 1000,
      singleQuote: true,
      phpVersion: '7.4',
    })
    .replace(/<\?php echo (.*)?\?>/gs, (match, p1) => {
      return p1.trim().replace(/;\s*$/, '');
    });
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
      process.stdout.write(`path: ${chalk.bold(diff.path)}:${diff.line}\n`);
      process.stdout.write(chalk.red(`--${diff.original}\n`));
      process.stdout.write(chalk.green(`++${diff.formatted}\n`));
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

export async function prettifyPhpContentWithUnescapedTags(content) {
  const directives = _.without(indentStartTokens, '@switch', '@forelse').join(
    '|',
  );

  const directiveRegexes = new RegExp(
    // eslint-disable-next-line max-len
    `(?!\\/\\*.*?\\*\\/)(${directives})(\\s*?)\\(((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))*)\\)`,
    'gmi',
  );

  return new Promise((resolve) => resolve(content))
    .then((res) =>
      _.replace(res, directiveRegexes, (match, p1, p2, p3) => {
        return formatStringAsPhp(`<?php ${p1.substr('1')}${p2}(${p3}) ?>`)
          .replace(
            /<\?php\s(.*?)(\s*?)\((.*?)\);*\s\?>\n/gs,
            (match2, j1, j2, j3) => {
              return `@${j1.trim()}${j2}(${j3.trim()})`;
            },
          )
          .replace(/([\n\s]*)->([\n\s]*)/gs, '->');
      }),
    )
    .then((res) => formatStringAsPhp(res));
}

export async function prettifyPhpContentWithEscapedTags(content) {
  return new Promise((resolve) => resolve(content))
    .then((res) => _.replace(res, /{!!/g, '<?php /*escaped*/'))
    .then((res) => _.replace(res, /!!}/g, '/*escaped*/ ?>\n'))
    .then((res) => formatStringAsPhp(res))
    .then((res) => _.replace(res, /<\?php\s\/\*escaped\*\//g, '{!! '))
    .then((res) => _.replace(res, /\/\*escaped\*\/\s\?>\n/g, ' !!}'));
}

export async function removeSemicolon(content) {
  return new Promise((resolve) => {
    resolve(content);
  })
    .then((res) => _.replace(res, /;[\n\s]*!!\}/g, ' !!}'))
    .then((res) => _.replace(res, /;[\s\n]*!!}/g, ' !!}'))
    .then((res) => _.replace(res, /;[\n\s]*}}/g, ' }}'))
    .then((res) => _.replace(res, /; }}/g, ' }}'))
    .then((res) => _.replace(res, /; --}}/g, ' --}}'));
}

export async function formatAsPhp(content) {
  return prettifyPhpContentWithUnescapedTags(content);
}

export async function preserveOriginalPhpTagInHtml(content) {
  return new Promise((resolve) => resolve(content))
    .then((res) => _.replace(res, /<\?php/g, '/** phptag_start **/'))
    .then((res) => _.replace(res, /\?>/g, '/** end_phptag **/'));
}

export function revertOriginalPhpTagInHtml(content) {
  return new Promise((resolve) => resolve(content))
    .then((res) =>
      _.replace(res, /\/\*\*[\s\n]*?phptag_start[\s\n]*?\*\*\//gs, '<?php'),
    )
    .then((res) =>
      _.replace(res, /\/\*\*[\s\n]*?end_phptag[\s\n]*?\*\*\/[\s];\n/g, '?>;'),
    )
    .then((res) =>
      _.replace(res, /\/\*\*[\s\n]*?end_phptag[\s\n]*?\*\*\//g, '?>'),
    );
}

export function indent(content, level, options) {
  const lines = content.split('\n');
  return _.map(lines, (line, index) => {
    if (!line.match(/\w/)) {
      return line;
    }

    const ignoreFirstLine = optional(options).ignoreFirstLine || false;

    if (ignoreFirstLine && index === 0) {
      return line;
    }

    const originalLineWhitespaces = detectIndent(line).amount;
    const indentChar = optional(options).useTabs ? '\t' : ' ';
    const indentSize = optional(options).indentSize || 4;
    const whitespaces = originalLineWhitespaces + indentSize * level;

    if (whitespaces < 0) {
      return line;
    }

    return indentChar.repeat(whitespaces) + line.trimLeft();
  }).join('\n');
}

export function unindent(directive, content, level, options) {
  const lines = content.split('\n');
  return _.map(lines, (line) => {
    if (!line.match(/\w/)) {
      return line;
    }

    const originalLineWhitespaces = detectIndent(line).amount;
    const indentChar = optional(options).useTabs ? '\t' : ' ';
    const indentSize = optional(options).indentSize || 4;
    const whitespaces = originalLineWhitespaces - indentSize * level;

    if (whitespaces < 0) {
      return line;
    }

    return indentChar.repeat(whitespaces) + line.trimLeft();
  }).join('\n');
}

export function preserveDirectives(content) {
  return new Promise((resolve) => resolve(content))
    .then((res) => {
      const regex = new RegExp(
        `(${phpKeywordStartTokens.join(
          '|',
        )})([\\s]*?)\\(((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))*)\\)`,
        'gis',
      );
      return _.replace(res, regex, (match, p1, p2, p3) => {
        return `<beautifyTag start="${p1}${p2}" exp="^^^${p3}^^^">`;
      });
    })
    .then((res) => {
      const regex = new RegExp(
        `(?!end=".*)(${phpKeywordEndTokens.join('|')})(?!.*")`,
        'gi',
      );
      return _.replace(res, regex, (match, p1) => {
        return `</beautifyTag end="${p1}">`;
      });
    });
}

export function preserveDirectivesInTag(content) {
  return new Promise((resolve) => resolve(content)).then((res) => {
    const regex = new RegExp(
      `(<[^>]*?)(${phpKeywordStartTokens.join(
        '|',
      )})([\\s]*?)\\(((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))*)\\)(.*?)(${phpKeywordEndTokens.join(
        '|',
      )})([^>]*?>)`,
      'gis',
    );
    return _.replace(res, regex, (match, p1, p2, p3, p4, p5, p6, p7) => {
      return `${p1}|-- start="${p2}${p3}" exp="^^^${p4}^^^" body="^^^${_.escape(
        _.trim(p5),
      )}^^^" end="${p6}" --|${p7}`;
    });
  });
}

export function revertDirectives(content) {
  return new Promise((resolve) => resolve(content))
    .then((res) => {
      return _.replace(
        res,
        /<beautifyTag.*?start="(.*?)".*?exp=".*?\^\^\^(.*?)\^\^\^.*?">/gs,
        (match, p1, p2) => {
          return `${p1}(${p2})`;
        },
      );
    })
    .then((res) => {
      return _.replace(res, /<\/beautifyTag.*?end="(.*?)">/gs, (match, p1) => {
        return `${p1}`;
      });
    });
}

export function revertDirectivesInTag(content) {
  return new Promise((resolve) => resolve(content))
    .then((res) => {
      return _.replace(
        res,
        /\|--.*?start="(.*?)".*?exp=".*?\^\^\^(.*?)\^\^\^.*?"(.*?)body=".*?\^\^\^(.*?)\^\^\^.*?".*?end="(.*?)".*?--\|/gs,
        (match, p1, p2, p3, p4, p5) => {
          return `${_.trimStart(p1)}(${p2}) ${_.unescape(p4)} ${p5}`;
        },
      );
    })
    .then((res) => {
      return _.replace(res, /\/-- end="(.*?)"--\//gs, (match, p1) => {
        return `${p1}`;
      });
    });
}
export function printDescription() {
  const returnLine = '\n\n';
  process.stdout.write(returnLine);
  process.stdout.write(chalk.bold.green('Fixed: F\n'));
  process.stdout.write(chalk.bold.red('Errors: E\n'));
  process.stdout.write(chalk.bold('Not Changed: ') + chalk.bold.green('.\n'));
}

const escapeTags = [
  '/\\*\\* phptag_start \\*\\*/',
  '/\\*\\* end_phptag \\*\\*/',
  '/\\*escaped\\*/',
  '__BLADE__;',
  '/\\* blade_comment_start \\*/',
  '/\\* blade_comment_end \\*/',
  'beautifyTag',
];

export function checkResult(formatted) {
  if (new RegExp(escapeTags.join('|')).test(formatted)) {
    throw new Error(
      [
        `Can't format blade: something goes wrong.`,
        // eslint-disable-next-line max-len
        `Please check if template is too complicated or not. Or simplify template might solves issue.`,
      ].join('\n'),
    );
  }

  return formatted;
}

export function debugLog(content) {
  console.log('content start');
  console.log(content);
  console.log('content end');

  return content;
}
