import {
  indentStartTokens,
  indentEndTokens,
  indentElseTokens,
  indentStartOrElseTokens,
  tokenForIndentStartOrElseTokens,
  hasStartAndEndToken,
} from './indent';
import * as util from './util';
import * as vsctm from './vsctm';

const os = require('os');
const beautify = require('js-beautify').html;
const _ = require('lodash');

export default class Formatter {
  constructor(options) {
    this.options = options;
    this.indentCharacter = util.optional(this.options).useTabs ? '\t' : ' ';
    this.indentSize = util.optional(this.options).indentSize || 4;
    this.currentIndentLevel = 0;
    this.shouldBeIndent = false;
    this.stack = [];
    this.result = [];
    this.diffs = [];
  }

  formatContent(content) {
    return util
      .formatAsPhp(content)
      .then(formattedAsPhp => this.formatAsHtml(formattedAsPhp))
      .then(formattedAsHtml => this.formatAsBlade(formattedAsHtml))
      .then(formattedAsBlade => {
        return formattedAsBlade;
      });
  }

  formatAsHtml(data) {
    const options = {
      indent_size: util.optional(this.options).indentSize || 4,
      wrap_line_length: util.optional(this.options).wrapLineLength || 120,
      end_with_newline: util.optional(this.options).endWithNewline || true,
    };

    const formatted = beautify(data, options);

    return Promise.resolve(formatted);
  }

  formatAsBlade(content) {
    const splitedLines = util.splitByLines(content);
    const registry = vsctm.createRegistry(content);

    const formatted = registry
      .loadGrammar('text.html.php.blade')
      .then(grammar => vsctm.tokenizeLines(splitedLines, grammar))
      .then(tokenizedLines =>
        this.formatTokenizedLines(splitedLines, tokenizedLines),
      )
      .catch(err => {
        throw err;
      });

    return formatted;
  }

  formatTokenizedLines(splitedLines, tokenizedLines) {
    for (let i = 0; i < splitedLines.length; i += 1) {
      const originalLine = splitedLines[i];
      const tokenizeLineResult = tokenizedLines[i];
      this.processLine(tokenizeLineResult, originalLine);
    }

    return this.result.join(os.EOL);
  }

  processLine(tokenizeLineResult, originalLine) {
    this.processTokenizeResult(tokenizeLineResult, originalLine);
  }

  processKeyword(token) {
    if (_.includes(indentStartOrElseTokens, token)) {
      if (_.includes(tokenForIndentStartOrElseTokens, _.last(this.stack))) {
        this.currentIndentLevel -= 1;
        this.shouldBeIndent = true;
      }
    }

    if (_.includes(indentStartTokens, token)) {
      if (_.last(this.stack) === '@section' && token === '@section') {
        this.currentIndentLevel -= 1;
        this.shouldBeIndent = true;
      } else {
        this.shouldBeIndent = true;
        this.stack.push(token);
      }
    }

    if (_.includes(indentEndTokens, token)) {
      this.currentIndentLevel -= 1;
      this.shouldBeIndent = false;
      this.stack.pop();
    }

    if (_.includes(indentElseTokens, token)) {
      this.currentIndentLevel -= 1;
      this.shouldBeIndent = true;
    }
  }

  processToken(tokenStruct, token) {
    if (!_.includes(tokenStruct.scopes, 'keyword.blade')) {
      return;
    }

    this.processKeyword(token);
  }

  processTokenizeResult(tokenizeLineResult, originalLine) {
    if (this.shouldBeIndent) {
      this.currentIndentLevel += 1;
      this.shouldBeIndent = false;
    }

    if (hasStartAndEndToken(tokenizeLineResult, originalLine)) {
      this.insertFormattedLineToResult(originalLine);
      return;
    }

    for (let j = 0; j < tokenizeLineResult.tokens.length; j += 1) {
      const tokenStruct = tokenizeLineResult.tokens[j];

      const token = originalLine
        .substring(tokenStruct.startIndex, tokenStruct.endIndex)
        .trim();

      this.processToken(tokenStruct, token);
    }

    if (this.currentIndentLevel < 0) {
      throw Error(
        'Parse error: cannot parse file for some reason.' +
          '(e.g. inline blade comment block,' +
          ' unrecognized token, inline php call)',
      );
    }

    this.insertFormattedLineToResult(originalLine);
  }

  insertFormattedLineToResult(originalLine) {
    const indentWhiteSpace = this.indentCharacter.repeat(
      this.currentIndentLevel * this.indentSize,
    );

    const formattedLine = indentWhiteSpace + originalLine;
    this.result.push(formattedLine);

    if (formattedLine !== originalLine) {
      this.diffs.push({
        original: originalLine,
        formatted: formattedLine,
      });
    }
  }
}
