import {
  indentStartTokens,
  indentEndTokens,
  indentElseTokens,
  indentStartOrElseTokens,
  tokenForIndentStartOrElseTokens,
  hasStartAndEndToken,
  phpKeywordStartTokens,
  phpKeywordEndTokens,
} from './indent';
import * as util from './util';
import * as vsctm from './vsctm';

const os = require('os');
const beautify = require('js-beautify').html;
const _ = require('lodash');
const vscodeTmModule = require('vscode-textmate');
const detectIndent = require('detect-indent');

export default class Formatter {
  constructor(options) {
    this.options = options;
    this.vsctm = util.optional(this.options).vsctm || vscodeTmModule;
    this.oniguruma = util.optional(this.options).oniguruma;
    this.indentCharacter = util.optional(this.options).useTabs ? '\t' : ' ';
    this.indentSize = util.optional(this.options).indentSize || 4;
    this.currentIndentLevel = 0;
    this.shouldBeIndent = false;
    this.isInsideCommentBlock = false;
    this.stack = [];
    this.result = [];
    this.diffs = [];
  }

  formatContent(content) {
    return util
      .formatAsPhp(content)
      .then((formattedAsPhp) => this.formatAsHtml(formattedAsPhp))
      .then((formattedAsHtml) => this.formatAsBlade(formattedAsHtml))
      .then((formattedAsBlade) => {
        return formattedAsBlade;
      });
  }

  formatAsHtml(data) {
    const options = {
      indent_size: util.optional(this.options).indentSize || 4,
      wrap_line_length: util.optional(this.options).wrapLineLength || 120,
      end_with_newline: util.optional(this.options).endWithNewline || true,
    };

    const promise = new Promise((resolve) => resolve(data))
      .then((content) => util.preserveOriginalPhpTagInHtml(content))
      .then((content) => util.preserveDirectives(content))
      .then((preserved) => beautify(preserved, options))
      .then((content) => util.revertDirectives(content, this.options))
      .then((beautified) => util.revertOriginalPhpTagInHtml(beautified));

    return Promise.resolve(promise);
  }

  formatAsBlade(content) {
    const splitedLines = util.splitByLines(content);
    const vsctmModule = new vsctm.VscodeTextmate(this.vsctm, this.oniguruma);
    const registry = vsctmModule.createRegistry(content);

    const formatted = registry
      .loadGrammar('text.html.php.blade')
      .then((grammar) => vsctmModule.tokenizeLines(splitedLines, grammar))
      .then((tokenizedLines) =>
        this.formatTokenizedLines(splitedLines, tokenizedLines),
      )
      .catch((err) => {
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
    if (_.includes(phpKeywordStartTokens, token)) {
      this.stack.push(token);
      return;
    }

    if (_.includes(phpKeywordEndTokens, token)) {
      if (_.last(this.stack) !== '@hassection') {
        this.stack.pop();
        return;
      }
    }

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
    if (
      _.includes(
        tokenStruct.scopes,
        'punctuation.definition.comment.begin.blade',
      )
    ) {
      this.isInsideCommentBlock = true;
    }

    if (
      _.includes(tokenStruct.scopes, 'punctuation.definition.comment.end.blade')
    ) {
      this.isInsideCommentBlock = false;
    }
    if (token === '{{--' || token.includes('{{--')) {
      this.isInsideCommentBlock = true;
    }

    if (token === '--}}' || token.includes('--}}')) {
      this.isInsideCommentBlock = false;
    }

    if (!_.includes(tokenStruct.scopes, 'keyword.blade')) {
      return;
    }

    if (this.isInsideCommentBlock) {
      return;
    }

    this.processKeyword(token.toLowerCase());
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

    this.insertFormattedLineToResult(originalLine);
  }

  insertFormattedLineToResult(originalLine) {
    const originalLineWhitespaces = detectIndent(originalLine).amount;
    const whitespaces =
      originalLineWhitespaces + this.indentSize * this.currentIndentLevel;

    const formattedLine =
      this.indentCharacter.repeat(whitespaces < 0 ? 0 : whitespaces) +
      originalLine.trimLeft();

    // blankline
    if (originalLine.length === 0) {
      this.result.push(originalLine);
    }

    // formatted line
    if (originalLine.length !== 0 && formattedLine.length > 0) {
      this.result.push(formattedLine);
    }

    if (formattedLine !== originalLine) {
      this.diffs.push({
        original: originalLine,
        formatted: formattedLine,
      });
    }
  }
}
