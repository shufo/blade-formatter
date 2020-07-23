const _ = require('lodash');
const fs = require('fs');
const chalk = require('chalk');
const prettier = require('prettier');
const detectIndent = require('detect-indent');
const { indentStartTokens } = require('./indent');

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
  let prettified = _.replace(content, /\{\{([^-].*?)\}\}/gs, (match, p1) => {
    return `<?php /*blade*/ ${p1} /*blade*/ ?>`;
  });

  const directives = _.without(indentStartTokens, '@switch').join('|');

  const directiveRegexes = new RegExp(
    `(?!\\/\\*.*?\\*\\/)(${directives})\\s*?\\((.*?)\\)`,
    'gs',
  );

  prettified = _.replace(prettified, directiveRegexes, (match, p1, p2) => {
    return prettier
      .format(`<?php ${p1.substr('1')}(${p2}) ?>`, {
        parser: 'php',
        singleQuote: true,
        phpVersion: '7.4',
      })
      .replace(/<\?php\s(.*?)\((.*?)\);*\s\?>\n/gs, (match2, j1, j2) => {
        return `@${j1.trim()}(${j2.trim()})`;
      });
  });

  prettified = prettier.format(prettified, {
    parser: 'php',
    printWidth: 1000,
    singleQuote: true,
  });

  prettified = _.replace(
    prettified,
    /<\?php.*?\/\*blade\*\/\s(.*?)\s\/\*blade\*\/.*?\?>/gs,
    (match, p1) => {
      return `{{ ${p1} }}`;
    },
  );

  return prettified;
}

export function prettifyPhpContentWithEscapedTags(content) {
  let prettified = _.replace(content, /{!!/g, '<?php /*escaped*/');
  prettified = _.replace(prettified, /!!}/g, '/*escaped*/ ?>');

  prettified = prettier.format(prettified, {
    parser: 'php',
    printWidth: 1000,
    singleQuote: true,
  });

  prettified = _.replace(prettified, /<\?php\s\/\*escaped\*\//g, '{!! ');
  prettified = _.replace(prettified, /\/\*escaped\*\/\s\?>/g, ' !!}');

  return prettified;
}

export function removeSemicolon(content) {
  let prettified = _.replace(content, /;\n.*!!\}/g, ' !!}');
  prettified = _.replace(prettified, /;.*?!!}/g, ' !!}');
  prettified = _.replace(prettified, /;\n.*}}/g, ' }}');
  prettified = _.replace(prettified, /; }}/g, ' }}');
  prettified = _.replace(prettified, /; --}}/g, ' --}}');

  return prettified;
}

export function formatAsPhp(content) {
  let prettified = prettifyPhpContentWithUnescapedTags(content);
  prettified = prettifyPhpContentWithEscapedTags(prettified);
  prettified = removeSemicolon(prettified);

  return Promise.resolve(prettified);
}

export function preserveOriginalPhpTagInHtml(content) {
  let prettified = _.replace(content, /<\?php/g, '/* <?phptag_start */');
  prettified = _.replace(prettified, /\?>/g, '/* end_phptag?> */');
  prettified = _.replace(prettified, /\{\{--(.*?)--\}\}/gs, (match, p1) => {
    return `<?php /*comment*/ ?>${p1}<?php /*comment*/ ?>`;
  });

  return prettified;
}

export function revertOriginalPhpTagInHtml(content) {
  let prettified = _.replace(content, /\/\* <\?phptag_start \*\//g, '<?php');
  prettified = _.replace(prettified, /\/\* end_phptag\?> \*\/\s;\n/g, '?>;');
  prettified = _.replace(prettified, /\/\* end_phptag\?> \*\//g, '?>');
  prettified = _.replace(
    prettified,
    /<\?php.*?\/\*comment\*\/\s\?>(.*?)<\?php\s\/\*comment\*\/.*?\?>/gs,
    (match, p1) => {
      return `{{--${p1}--}}`;
    },
  );

  return prettified;
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
  return _.replace(
    content,
    /(@foreach[\s]*|@for[\s]*)\((.*?)\)(.*?)(@endforeach|@endfor)/gs,
    (match, p1, p2, p3, p4) => {
      return `<beautify start="${p1}" end="${p4}" exp="^^${p2}^^">\
      ${p3}</beautify>`;
    },
  );
}

export function revertDirectives(content, options) {
  return _.replace(
    content,
    // eslint-disable-next-line max-len
    /<beautify start="(.*?)" end="(.*?)" exp="\^\^(.*?)\^\^">(.*?)<\/beautify>/gs,
    (match, p1, p2, p3, p4) => {
      return `${p1}(${p3})${unindent(p1, p4, 1, options)}${p2}`;
    },
  );
}

export function printDescription() {
  const returnLine = '\n\n';
  process.stdout.write(returnLine);
  process.stdout.write(chalk.bold.green('Fixed: F\n'));
  process.stdout.write(chalk.bold.red('Errors: E\n'));
  process.stdout.write(chalk.bold('Not Changed: ') + chalk.bold.green('.\n'));
}
