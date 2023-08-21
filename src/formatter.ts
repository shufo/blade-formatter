/* eslint-disable class-methods-use-this */

import { sortClasses } from '@shufo/tailwindcss-class-sorter';
import Aigle from 'aigle';
import detectIndent from 'detect-indent';
import { sortAttributes } from 'html-attribute-sorter';
import beautify, { JSBeautifyOptions } from 'js-beautify';
import _ from 'lodash';
import * as vscodeTmModule from 'vscode-textmate';
import xregexp from 'xregexp';
import { formatPhpComment } from './comment';
import constants from './constants';
import {
  conditionalTokens,
  cssAtRuleTokens,
  directivePrefix,
  hasStartAndEndToken,
  indentElseTokens,
  indentEndTokens,
  indentStartAndEndTokens,
  indentStartOrElseTokens,
  indentStartTokens,
  indentStartTokensWithoutPrefix,
  inlineFunctionTokens,
  inlinePhpDirectives,
  optionalStartWithoutEndTokens,
  phpKeywordEndTokens,
  phpKeywordStartTokens,
  tokenForIndentStartOrElseTokens,
  unbalancedStartTokens,
} from './indent';
import { BladeFormatterOption, CLIOption, FormatterOption } from './main';
import { nestedParenthesisRegex } from './regex';
import { SortHtmlAttributes } from './runtimeConfig';
import { adjustSpaces } from './space';
import * as util from './util';
import * as vsctm from './vsctm';

export default class Formatter {
  argumentCheck: any;

  bladeBraces: any;

  bladeComments: any;

  bladeDirectives: any;

  htmlAttributes: Array<string>;

  currentIndentLevel: number;

  diffs: any;

  indentCharacter: any;

  indentSize: any;

  inlineDirectives: any;

  conditions: any;

  inlinePhpDirectives: any;

  isInsideCommentBlock: any;

  oniguruma: any;

  options: FormatterOption & CLIOption;

  rawBladeBraces: any;

  ignoredLines: any;

  curlyBracesWithJSs: any;

  rawBlocks: any;

  rawPhpTags: any;

  rawPropsBlocks: any;

  result: any;

  nonnativeScripts: Array<string>;

  scripts: any;

  xData: Array<string>;

  xInit: Array<string>;

  xSlot: Array<string>;

  htmlTags: Array<string>;

  shouldBeIndent: any;

  stack: any;

  templatingStrings: any;

  stringLiteralInPhp: Array<string>;

  shorthandBindings: Array<string>;

  componentAttributes: Array<string>;

  customDirectives: Array<string>;

  directivesInScript: Array<string>;

  unbalancedDirectives: Array<string>;

  escapedBladeDirectives: Array<string>;

  phpComments: Array<string>;

  vsctm: any;

  wrapAttributes: any;

  wrapLineLength: any;

  defaultPhpFormatOption: util.FormatPhpOption;

  endOfLine: string;

  bladeDirectivesInStyle: Array<string>;

  constructor(options: BladeFormatterOption) {
    this.options = {
      ...{
        noPhpSyntaxCheck: false,
        printWidth: options.wrapLineLength || constants.defaultPrintWidth,
      },
      ...options,
    };
    this.vsctm = util.optional(this.options).vsctm || vscodeTmModule;
    this.oniguruma = util.optional(this.options).oniguruma;
    this.indentCharacter = util.optional(this.options).useTabs ? '\t' : ' ';
    this.indentSize = util.optional(this.options).indentSize || 4;
    this.wrapLineLength = util.optional(this.options).wrapLineLength || constants.defaultPrintWidth;
    this.wrapAttributes = util.optional(this.options).wrapAttributes || 'auto';
    this.currentIndentLevel = 0;
    this.shouldBeIndent = false;
    this.isInsideCommentBlock = false;
    this.stack = [];
    this.ignoredLines = [];
    this.curlyBracesWithJSs = [];
    this.rawBlocks = [];
    this.rawPhpTags = [];
    this.inlineDirectives = [];
    this.conditions = [];
    this.inlinePhpDirectives = [];
    this.rawPropsBlocks = [];
    this.bladeDirectives = [];
    this.bladeDirectivesInStyle = [];
    this.bladeComments = [];
    this.phpComments = [];
    this.bladeBraces = [];
    this.rawBladeBraces = [];
    this.nonnativeScripts = [];
    this.scripts = [];
    this.htmlAttributes = [];
    this.xData = [];
    this.xInit = [];
    this.htmlTags = [];
    this.templatingStrings = [];
    this.stringLiteralInPhp = [];
    this.shorthandBindings = [];
    this.componentAttributes = [];
    this.customDirectives = [];
    this.directivesInScript = [];
    this.unbalancedDirectives = [];
    this.escapedBladeDirectives = [];
    this.xSlot = [];
    this.result = [];
    this.diffs = [];
    this.defaultPhpFormatOption = { noPhpSyntaxCheck: this.options.noPhpSyntaxCheck, printWidth: this.wrapLineLength };
    this.endOfLine = util.getEndOfLine(util.optional(this.options).endOfLine);
  }

  formatContent(content: any) {
    return new Promise((resolve) => resolve(content))
      .then((target) => this.preserveIgnoredLines(target))
      .then((target) => this.preserveNonnativeScripts(target))
      .then((target) => this.preserveCurlyBraceForJS(target))
      .then((target) => this.preserveRawPhpTags(target))
      .then((target) => this.preserveEscapedBladeDirective(target))
      .then((target) => util.formatAsPhp(target, this.options))
      .then((target) => this.preserveBladeComment(target))
      .then((target) => this.preserveBladeBrace(target))
      .then((target) => this.preserveRawBladeBrace(target))
      .then((target) => this.preserveConditions(target))
      .then((target) => this.preserveInlineDirective(target))
      .then((target) => this.preserveInlinePhpDirective(target))
      .then((target) => this.preserveBladeDirectivesInScripts(target))
      .then((target) => this.preserveBladeDirectivesInStyles(target))
      .then((target) => this.preserveCustomDirective(target))
      .then((target) => this.preserveUnbalancedDirective(target))
      .then((target) => this.breakLineBeforeAndAfterDirective(target))
      .then(async (target) => {
        this.bladeDirectives = await this.formatPreservedBladeDirectives(this.bladeDirectives);
        return target;
      })
      .then((target) => this.preserveScripts(target))
      .then((target) => this.sortTailwindcssClasses(target))
      .then((target) => this.formatXInit(target))
      .then((target) => this.formatXData(target))
      .then((target) => this.preserveComponentAttribute(target))
      .then((target) => this.preserveShorthandBinding(target))
      .then((target) => this.sortHtmlAttributes(target))
      .then((target) => this.preservePhpBlock(target))
      .then((target) => this.preserveHtmlAttributes(target))
      .then((target) => this.preserveXslot(target))
      .then((target) => this.preserveHtmlTags(target))
      .then((target) => this.formatAsHtml(target))
      .then((target) => this.formatAsBlade(target))
      .then((target) => this.restoreHtmlTags(target))
      .then((target) => this.restoreXslot(target))
      .then((target) => this.restoreHtmlAttributes(target))
      .then((target) => this.restorePhpBlock(target))
      .then((target) => this.restoreShorthandBinding(target))
      .then((target) => this.restoreComponentAttribute(target))
      .then((target) => this.restoreXData(target))
      .then((target) => this.restoreXInit(target))
      .then((target) => this.restoreScripts(target))
      .then((target) => this.restoreUnbalancedDirective(target))
      .then((target) => this.restoreCustomDirective(target))
      .then((target) => this.restoreBladeDirectivesInStyles(target))
      .then((target) => this.restoreBladeDirectivesInScripts(target))
      .then((target) => this.restoreInlinePhpDirective(target))
      .then((target) => this.restoreInlineDirective(target))
      .then((target) => this.restoreConditions(target))
      .then((target) => this.restoreRawBladeBrace(target))
      .then((target) => this.restoreBladeBrace(target))
      .then((target) => this.restoreBladeComment(target))
      .then((target) => this.restoreEscapedBladeDirective(target))
      .then((target) => this.restoreRawPhpTags(target))
      .then((target) => this.restoreCurlyBraceForJS(target))
      .then((target) => this.restoreNonnativeScripts(target))
      .then((target) => this.restoreIgnoredLines(target))
      .then((target) => adjustSpaces(target))
      .then((formattedResult) => util.checkResult(formattedResult));
  }

  formatAsHtml(data: any) {
    const options = {
      indent_size: util.optional(this.options).indentSize || 4,
      wrap_line_length: util.optional(this.options).wrapLineLength || 120,
      wrap_attributes: util.optional(this.options).wrapAttributes || 'auto',
      wrap_attributes_min_attrs: util.optional(this.options).wrapAttributesMinAttrs,
      indent_inner_html: util.optional(this.options).indentInnerHtml || false,
      end_with_newline: util.optional(this.options).endWithNewline || true,
      max_preserve_newlines: util.optional(this.options).noMultipleEmptyLines ? 1 : undefined,
      extra_liners: util.optional(this.options).extraLiners,
      css: {
        end_with_newline: false,
      },
      eol: this.endOfLine,
    };

    const promise = new Promise((resolve) => resolve(data))
      .then((content) => util.preserveDirectives(content))
      .then((preserved) => beautify.html_beautify(preserved, options))
      .then((content) => util.revertDirectives(content));

    return Promise.resolve(promise);
  }

  async sortTailwindcssClasses(content: any) {
    if (!this.options.sortTailwindcssClasses) {
      return content;
    }

    return _.replace(content, /(?<=\s+(?!:)class\s*=\s*([\"\']))(.*?)(?=\1)/gis, (_match, p1, p2) => {
      if (_.isEmpty(p2)) {
        return p2;
      }

      if (this.options.tailwindcssConfigPath) {
        const options = { tailwindConfigPath: this.options.tailwindcssConfigPath };
        return sortClasses(p2, options);
      }

      if (this.options.tailwindcssConfig) {
        const options: any = { tailwindConfig: this.options.tailwindcssConfig };
        return sortClasses(p2, options);
      }

      return sortClasses(p2);
    });
  }

  async preserveIgnoredLines(content: any) {
    return (
      _.chain(content)
        // ignore entire file
        .replace(
          /(^(?<!.+)^{{--\s*blade-formatter-disable\s*--}}.*?)([\r\n]*)$(?![\r\n])/gis,
          (_match: any, p1: any, p2: any) => this.storeIgnoredLines(`${p1}${p2.replace(/^\n/, '')}`),
        )
        // range ignore
        .replace(
          /(?:({{--\s*?blade-formatter-disable\s*?--}}|<!--\s*?prettier-ignore-start\s*?-->|{{--\s*?prettier-ignore-start\s*?--}})).*?(?:({{--\s*?blade-formatter-enable\s*?--}}|<!--\s*?prettier-ignore-end\s*?-->|{{--\s*?prettier-ignore-end\s*?--}}))/gis,
          (match: any) => this.storeIgnoredLines(match),
        )
        // line ignore
        .replace(
          /(?:{{--\s*?blade-formatter-disable-next-line\s*?--}}|{{--\s*?prettier-ignore\s*?--}}|<!--\s*?prettier-ignore\s*?-->)[\r\n]+[^\r\n]+/gis,
          (match: any) => this.storeIgnoredLines(match),
        )
        .value()
    );
  }

  async preserveCurlyBraceForJS(content: any) {
    return _.replace(content, /@{{(.*?)}}/gs, (match: any, p1: any) => this.storeCurlyBraceForJS(p1));
  }

  async preservePhpBlock(content: any) {
    return this.preserveRawPhpBlock(content);
  }

  async preservePropsBlock(content: any) {
    return _.replace(content, /@props\(((?:[^\\(\\)]|\([^\\(\\)]*\))*)\)/gs, (match: any, p1: any) =>
      this.storeRawPropsBlock(p1),
    );
  }

  async preserveRawPhpBlock(content: any) {
    return _.replace(content, /(?<!@)@php(.*?)@endphp/gs, (match: any, p1: any) => this.storeRawBlock(p1));
  }

  async preserveHtmlTags(content: string) {
    const contentUnformatted = ['textarea', 'pre'];

    return _.replace(
      content,
      new RegExp(`<(${contentUnformatted.join('|')})\\s{0,1}.*?>.*?<\\/(${contentUnformatted.join('|')})>`, 'gis'),
      (match: string) => this.storeHtmlTag(match),
    );
  }

  /**
   * preserve custom directives
   * @param content
   * @returns
   */
  preserveCustomDirective(content: string) {
    const negativeLookAhead = [
      ..._.without(indentStartTokens, '@unless'),
      ...indentEndTokens,
      ...indentElseTokens,
      ...['@unless\\(.*?\\)'],
    ].join('|');

    const inlineNegativeLookAhead = _.chain([
      ..._.without(indentStartTokens, '@unless', '@for'),
      ...indentEndTokens,
      ...indentElseTokens,
      ...inlineFunctionTokens,
      ..._.without(phpKeywordStartTokens, '@for'),
      ...['@unless[a-z]*\\(.*?\\)', '@for\\(.*?\\)'],
      ...unbalancedStartTokens,
      ...cssAtRuleTokens,
    ])
      .uniq()
      .join('|')
      .value();

    const inlineRegex = new RegExp(
      `(?!(${inlineNegativeLookAhead}))(@([a-zA-Z1-9_\\-]+))(?!.*?@end\\3)${nestedParenthesisRegex}.*?(?<!@end\\5)`,
      'gis',
    );

    const regex = new RegExp(
      `(?!(${negativeLookAhead}))(@(unless)*([a-zA-Z1-9_\\-]+))(?!.*?\\2)(\\s|\\(.*?\\))+(.*?)(@end\\4)`,
      'gis',
    );

    let formatted: string;

    // preserve inline directives
    formatted = _.replace(content, inlineRegex, (match: string) => this.storeInlineCustomDirective(match));

    // preserve begin~else~end directives
    formatted = _.replace(
      formatted,
      regex,
      (match: string, p1: string, p2: string, p3: string, p4: string, p5: string, p6: string, p7: string) => {
        if (indentStartTokens.includes(p2)) {
          return match;
        }

        let result: string = match;

        // begin directive
        result = _.replace(result, new RegExp(`${p2}(${nestedParenthesisRegex})*`, 'gim'), (beginStr: string) =>
          this.storeBeginCustomDirective(beginStr),
        );
        // end directive
        result = _.replace(result, p7, this.storeEndCustomDirective(p7));
        // else directive
        result = _.replace(result, new RegExp(`@else${p4}(${nestedParenthesisRegex})*`, 'gim'), (elseStr: string) =>
          this.storeElseCustomDirective(elseStr),
        );

        return result;
      },
    );

    // replace directives recursively
    if (regex.test(formatted)) {
      formatted = this.preserveCustomDirective(formatted);
    }

    return formatted;
  }

  preserveInlineDirective(content: string): string {
    // preserve inline directives inside html tag
    const regex = new RegExp(
      `(<[\\w\\-\\_]+?[^>]*?)${directivePrefix}(${indentStartTokensWithoutPrefix.join(
        '|',
      )})(\\s*?)?(\\([^)]*?\\))?((?:(?!@end\\2).)+)(@end\\2|@endif)(.*?/*>)`,
      'gims',
    );
    const replaced = _.replace(
      content,
      regex,
      (_match: string, p1: string, p2: string, p3: string, p4: string, p5: string, p6: string, p7: string) => {
        if (p3 === undefined && p4 === undefined) {
          return `${p1}${this.storeInlineDirective(`${directivePrefix}${p2.trim()}${p5.trim()} ${p6.trim()}`)}${p7}`;
        }
        if (p3 === undefined) {
          return `${p1}${this.storeInlineDirective(
            `${directivePrefix}${p2.trim()}${p4.trim()}${p5}${p6.trim()}`,
          )}${p7}`;
        }
        if (p4 === undefined) {
          return `${p1}${this.storeInlineDirective(
            `${directivePrefix}${p2.trim()}${p3}${p5.trim()} ${p6.trim()}`,
          )}${p7}`;
        }

        return `${p1}${this.storeInlineDirective(
          `${directivePrefix}${p2.trim()}${p3}${p4.trim()} ${p5.trim()} ${p6.trim()}`,
        )}${p7}`;
      },
    );

    if (regex.test(replaced)) {
      return this.preserveInlineDirective(replaced);
    }

    return replaced;
  }

  async preserveInlinePhpDirective(content: any) {
    return _.replace(
      content,
      // eslint-disable-next-line max-len
      new RegExp(`(?!\\/\\*.*?\\*\\/)(${inlineFunctionTokens.join('|')})(\\s*?)${nestedParenthesisRegex}`, 'gmsi'),
      (match: any) => this.storeInlinePhpDirective(match),
    );
  }

  preserveBladeDirectivesInScripts(content: any) {
    return _.replace(content, /(?<=<script[^>]*?(?<!=)>)(.*?)(?=<\/script>)/gis, (match: string) => {
      const targetTokens = [...indentStartTokens, ...inlineFunctionTokens];

      if (new RegExp(targetTokens.join('|'), 'gmi').test(match) === false) {
        if (/^[\s\n]+$/.test(match)) {
          return match.trim();
        }

        return match;
      }

      const inlineFunctionDirectives = inlineFunctionTokens.join('|');
      const inlineFunctionRegex = new RegExp(
        // eslint-disable-next-line max-len
        `(?!\\/\\*.*?\\*\\/)(${inlineFunctionDirectives})(\\s*?)${nestedParenthesisRegex}`,
        'gmi',
      );
      const endTokens = _.chain(indentEndTokens).without('@endphp');

      let formatted: string = match;

      formatted = _.replace(formatted, inlineFunctionRegex, (matched: any) =>
        this.storeBladeDirective(
          util.formatRawStringAsPhp(matched, { ...this.options, printWidth: util.printWidthForInline }),
        ),
      );

      formatted = _.replace(
        formatted,
        new RegExp(`(${indentStartTokens.join('|')})\\s*?${nestedParenthesisRegex}`, 'gis'),
        (matched) => `if ( /*${this.storeBladeDirectiveInScript(matched)}*/ ) {`,
      );

      formatted = _.replace(
        formatted,
        new RegExp(`(${[...indentElseTokens, ...indentStartOrElseTokens].join('|')})(?!\\w+?\\s*?\\(.*?\\))`, 'gis'),
        (matched) => `/***script_placeholder***/} /* ${this.storeBladeDirectiveInScript(matched)} */ {`,
      );

      formatted = _.replace(
        formatted,
        new RegExp(`(${endTokens.join('|')})`, 'gis'),
        (matched) => `/***script_placeholder***/} /*${this.storeBladeDirectiveInScript(matched)}*/`,
      );

      formatted = _.replace(formatted, /(?<!@)@php(.*?)@endphp/gis, (_matched: any, p1: any) => this.storeRawBlock(p1));

      // custom directive
      formatted = this.preserveCustomDirectiveInScript(formatted);

      return formatted;
    });
  }

  preserveBladeDirectivesInStyles(content: string) {
    return _.replace(content, /(?<=<style[^>]*?(?<!=)>)(.*?)(?=<\/style>)/gis, (inside: string) => {
      let result: string = inside;

      const inlineRegex = new RegExp(
        `(?!${['@end', '@else', ...cssAtRuleTokens].join('|')})@(\\w+)\\s*?(?![^\\1]*@end\\1)${nestedParenthesisRegex}`,
        'gmi',
      );

      result = _.replace(
        result,
        inlineRegex,
        (match: string) => `${this.storeBladeDirectiveInStyle(match)} {/* inline_directive */}`,
      );

      const customStartRegex = new RegExp(
        `(?!${['@end', '@else', ...cssAtRuleTokens].join('|')})@(\\w+)\\s*?(${nestedParenthesisRegex})`,
        'gmi',
      );

      result = _.replace(
        result,
        customStartRegex,
        (match: string) => `${this.storeBladeDirectiveInStyle(match)} { /*start*/`,
      );

      const startRegex = new RegExp(`(${indentStartTokens.join('|')})\\s*?(${nestedParenthesisRegex})`, 'gmi');

      result = _.replace(
        result,
        startRegex,
        (match: string) => `${this.storeBladeDirectiveInStyle(match)} { /*start*/`,
      );

      const elseRegex = new RegExp(
        `(${['@else\\w+', ...indentElseTokens].join('|')})\\s*?(${nestedParenthesisRegex})?`,
        'gmi',
      );

      result = _.replace(
        result,
        elseRegex,
        (match: string) => `} ${this.storeBladeDirectiveInStyle(match)} { /*else*/`,
      );

      const endRegex = new RegExp(`${['@end\\w+', ...indentEndTokens].join('|')}`, 'gmi');

      result = _.replace(result, endRegex, (match: string) => `} /* ${this.storeBladeDirectiveInStyle(match)} */`);

      return result;
    });
  }

  /**
   *
   * @param content string between <script>~</script>
   * @returns string
   */
  preserveCustomDirectiveInScript(content: string): string {
    const negativeLookAhead = [
      ..._.without(indentStartTokens, '@unless'),
      ...indentEndTokens,
      ...indentElseTokens,
      ...['@unless\\(.*?\\)'],
    ].join('|');

    const inlineNegativeLookAhead = [
      ..._.without(indentStartTokens, '@unless'),
      ...indentEndTokens,
      ...indentElseTokens,
      ...inlineFunctionTokens,
      ...phpKeywordStartTokens,
      ...['@unless[a-z]*\\(.*?\\)'],
      ...unbalancedStartTokens,
    ].join('|');

    const inlineRegex = new RegExp(
      `(?!(${inlineNegativeLookAhead}))(@([a-zA-Z1-9_\\-]+))(?!.*?@end\\3)${nestedParenthesisRegex}.*?(?<!@end\\5)`,
      'gis',
    );

    const regex = new RegExp(
      `(?!(${negativeLookAhead}))(@(unless)*([a-zA-Z1-9_\\-]+))(?!.*?\\2)(\\s|\\(.*?\\))+(.*?)(@end\\4)`,
      'gis',
    );

    let formatted: string;

    // preserve inline directives
    formatted = _.replace(content, inlineRegex, (match: string) => this.storeInlineCustomDirective(match));

    // preserve begin~else~end directives
    formatted = _.replace(
      formatted,
      regex,
      (match: string, p1: string, p2: string, p3: string, p4: string, p5: string, p6: string, p7: string) => {
        if (indentStartTokens.includes(p2)) {
          return match;
        }

        let result: string = match;

        result = _.replace(
          result,
          new RegExp(`${p2}(${nestedParenthesisRegex})*`, 'gim'),
          (beginStr: string) => `if ( /*${this.storeBladeDirectiveInScript(beginStr)}*/ ) {`,
        );

        result = _.replace(
          result,
          new RegExp(`@else${p4}(${nestedParenthesisRegex})*`, 'gim'),
          (elseStr: string) => `/***script_placeholder***/} /* ${this.storeBladeDirectiveInScript(elseStr)} */ {`,
        );
        result = _.replace(
          result,
          p7,
          (endStr: string) => `/***script_placeholder***/} /*${this.storeBladeDirectiveInScript(endStr)}*/`,
        );

        return result;
      },
    );

    // replace directives recursively
    if (regex.test(formatted)) {
      formatted = this.preserveCustomDirectiveInScript(formatted);
    }

    return formatted;
  }

  /**
   * Recursively insert line break before and after directives
   * @param content string
   * @returns
   */
  breakLineBeforeAndAfterDirective(content: string): string {
    // handle directive around html tags
    // eslint-disable-next-line
    content = _.replace(
      content,
      new RegExp(
        `(?<=<.*?(?<!=)>)(${_.without(indentStartTokens, '@php').join(
          '|',
        )})(\\s*)${nestedParenthesisRegex}.*?(?=<.*?>)`,
        'gmis',
      ),
      (match) => `\n${match.trim()}\n`,
    );

    // eslint-disable-next-line
    content = _.replace(
      content,
      new RegExp(`(?<=<.*?(?<!=)>).*?(${_.without(indentEndTokens, '@endphp').join('|')})(?=<.*?>)`, 'gmis'),
      (match) => `\n${match.trim()}\n`,
    );

    const unbalancedConditions = ['@case', ...indentElseTokens];

    // eslint-disable-next-line
    content = _.replace(
      content,
      new RegExp(`(\\s*?)(${unbalancedConditions.join('|')})(\\s*?)${nestedParenthesisRegex}(\\s*)`, 'gmi'),
      (match) => `\n${match.trim()}\n`,
      // handle else directive
    );

    // eslint-disable-next-line
    content = _.replace(
      content,
      new RegExp(`\\s*?(?!(${_.without(indentElseTokens, '@else').join('|')}))@else\\s+`, 'gim'),
      (match) => `\n${match.trim()}\n`,
      // handle case directive
    );

    // eslint-disable-next-line
    content = _.replace(content, /@case\S*?\s*?@case/gim, (match) => {
      // handle unbalanced echos
      return `${match.replace('\n', '')}`;
    });

    const unbalancedEchos = ['@break'];

    _.forEach(unbalancedEchos, (directive) => {
      // eslint-disable-next-line
      content = _.replace(content, new RegExp(`(\\s*?)${directive}\\s+`, 'gmi'), (match) => {
        return `\n${match.trim()}\n\n`;
      });
    });

    // other directives
    _.forEach(['@default'], (directive) => {
      // eslint-disable-next-line
      content = _.replace(content, new RegExp(`(\\s*?)${directive}\\s*`, 'gmi'), (match) => {
        return `\n\n${match.trim()}\n`;
      });
    });

    // add line break around balanced directives
    const directives = _.chain(indentStartTokens)
      .map((x: any) => _.replace(x, /@/, ''))
      .value();

    _.forEach(directives, (directive: any) => {
      try {
        const recursivelyMatched = xregexp.matchRecursive(content, `\\@${directive}`, `\\@end${directive}`, 'gmi', {
          valueNames: [null, 'left', 'match', 'right'],
        });

        if (_.isEmpty(recursivelyMatched)) {
          return;
        }

        // eslint-disable-next-line
        for (const matched of recursivelyMatched) {
          if (matched.name === 'match') {
            if (new RegExp(indentStartTokens.join('|')).test(matched.value)) {
              // eslint-disable-next-line
              content = _.replace(
                content,
                matched.value,
                this.breakLineBeforeAndAfterDirective(util.escapeReplacementString(matched.value)),
              );
            }

            const innerRegex = new RegExp(`^(\\s*?)${nestedParenthesisRegex}(.*)`, 'gmis');

            const replaced = _.replace(
              `${matched.value}`,
              innerRegex,
              (_match: string, p1: string, p2: string, p3: string) => {
                if (p3.trim() === '') {
                  return `${p1}(${p2.trim()})\n${p3.trim()}`;
                }

                return `${p1}(${p2.trim()})\n${p3.trim()}\n`;
              },
            );

            // eslint-disable-next-line
            content = _.replace(content, matched.value, util.escapeReplacementString(replaced));
          }
        }
      } catch (error) {
        // do nothing to ignore unmatched directive pair
      }
    });

    return content;
  }

  async preserveEscapedBladeDirective(content: string) {
    return _.replace(content, /@@\w*/gim, (match: string) => this.storeEscapedBladeDirective(match));
  }

  async preserveXslot(content: string) {
    return _.replace(content, /(?<=<\/?)(x-slot:[\w_\\-]+)(?=(?:[^>]*?[^?])?>)/gm, (match: string) =>
      this.storeXslot(match),
    );
  }

  async preserveBladeComment(content: any) {
    return _.replace(content, /\{\{--(.*?)--\}\}/gs, (match: string) => this.storeBladeComment(match));
  }

  preservePhpComment(content: string) {
    return _.replace(content, /\/\*(?:[^*]|[\r\n]|(?:\*+(?:[^*\/]|[\r\n])))*\*+\//gi, (match: string) =>
      this.storePhpComment(match),
    );
  }

  async preserveBladeBrace(content: any) {
    return _.replace(content, /\{\{(.*?)\}\}/gs, (_match: any, p1: any) => {
      // if content is blank
      if (p1 === '') {
        return this.storeBladeBrace(p1, p1.length);
      }

      // preserve a space if content contains only space, tab, or new line character
      if (!/\S/.test(p1)) {
        return this.storeBladeBrace(' ', ' '.length);
      }

      // any other content
      return this.storeBladeBrace(p1.trim(), p1.trim().length);
    });
  }

  async preserveRawBladeBrace(content: any) {
    return _.replace(content, /\{!!(.*?)!!\}/gs, (_match: any, p1: any) => {
      // if content is blank
      if (p1 === '') {
        return this.storeRawBladeBrace(p1);
      }

      // preserve a space if content contains only space, tab, or new line character
      if (!/\S/.test(p1)) {
        return this.storeRawBladeBrace(' ');
      }

      // any other content
      return this.storeRawBladeBrace(p1.trim());
    });
  }

  async preserveConditions(content: any) {
    const regex = new RegExp(
      `(${conditionalTokens.join(
        '|',
        // eslint-disable-next-line max-len
      )})(\\s*?)${nestedParenthesisRegex}`,
      'gi',
    );
    return _.replace(
      content,
      regex,
      (match: any, p1: any, p2: any, p3: any) => `${p1}${p2}(${this.storeConditions(p3)})`,
    );
  }

  /**
   * preserve unbalanced directive like @hasSection
   */
  preserveUnbalancedDirective(content: any) {
    const regex = new RegExp(`((${unbalancedStartTokens.join('|')})(?!.*?\\2)(?:\\s|\\(.*?\\)))+(?=.*?@endif)`, 'gis');

    let replaced: string = _.replace(
      content,
      regex,
      (_match: string, p1: string) => `${this.storeUnbalancedDirective(p1)}`,
    );

    if (regex.test(replaced)) {
      replaced = this.preserveUnbalancedDirective(replaced);
    }

    return replaced;
  }

  async preserveRawPhpTags(content: any) {
    return _.replace(content, /<\?php(.*?)\?>/gms, (match: any) => this.storeRawPhpTags(match));
  }

  async preserveNonnativeScripts(content: string) {
    return _.replace(
      content,
      /<script[^>]*?type=(["'])(?!(text\/javascript|module))[^\1]*?\1[^>]*?>.*?<\/script>/gis,
      (match: string) => this.storeNonnativeScripts(match),
    );
  }

  async preserveScripts(content: any) {
    return _.replace(content, /<script.*?>.*?<\/script>/gis, (match: any) => this.storeScripts(match));
  }

  async preserveHtmlAttributes(content: any) {
    return _.replace(
      content,
      /(?<=<[\w]*?[\s].*?)[\w\-\_\:]+?=(["']).*?(?<!\\)\1(?=.*?(?<!=)>)/gms,
      (match: string) => `${this.storeHtmlAttribute(match)}`,
    );
  }

  async sortHtmlAttributes(content: string) {
    const strategy: SortHtmlAttributes = this.options.sortHtmlAttributes ?? 'none';

    if (!_.isEmpty(strategy) && strategy !== 'none') {
      const regexes = this.options.customHtmlAttributesOrder;

      if (_.isArray(regexes)) {
        return sortAttributes(content, { order: strategy, customRegexes: regexes });
      }

      // when option is string
      const customRegexes = _.chain(regexes).split(',').map(_.trim).value();

      return sortAttributes(content, { order: strategy, customRegexes });
    }

    return content;
  }

  async preserveShorthandBinding(content: string) {
    return _.replace(
      content,
      /(?<=<(?!livewire:)[^<]*?(\s|x-bind)):{1}(?<!=>)[\w\-_.]*?=(["'])(?!=>)[^]*?\2(?=[^>]*?\/*?>)/gim,
      (match: any) => `${this.storeShorthandBinding(match)}`,
    );
  }

  async preserveComponentAttribute(content: string) {
    return _.replace(
      content,
      /(?<=<(x-|livewire:)[^<]*?\s):{1,2}(?<!=>)[\w\-_.]*?=(["'])(?!=>)[^]*?\2(?=[^>]*?\/*?>)/gim,
      (match: any) => `${this.storeComponentAttribute(match)}`,
    );
  }

  async formatXData(content: any) {
    return _.replace(
      content,
      /(\s*)x-data="(.*?)"(\s*)/gs,
      (_match: any, p1: any, p2: any, p3: any) => `${p1}x-data="${this.storeXData(p2)}"${p3}`,
    );
  }

  async formatXInit(content: any) {
    return _.replace(
      content,
      /(\s*)x-init="(.*?)"(\s*)/gs,
      (_match: any, p1: any, p2: any, p3: any) => `${p1}x-init="${this.storeXInit(p2)}"${p3}`,
    );
  }

  preserveStringLiteralInPhp(content: any) {
    return _.replace(
      content,
      /(\"([^\\]|\\.)*?\"|\'([^\\]|\\.)*?\')/gm,
      (match: string) => `${this.storeStringLiteralInPhp(match)}`,
    );
  }

  storeIgnoredLines(value: any) {
    return this.getIgnoredLinePlaceholder(this.ignoredLines.push(value) - 1);
  }

  storeCurlyBraceForJS(value: any) {
    return this.getCurlyBraceForJSPlaceholder(this.curlyBracesWithJSs.push(value) - 1);
  }

  storeRawBlock(value: any) {
    return this.getRawPlaceholder(this.rawBlocks.push(value) - 1);
  }

  storeInlineDirective(value: any) {
    return this.getInlinePlaceholder(this.inlineDirectives.push(value) - 1, value.length);
  }

  storeConditions(value: any) {
    return this.getConditionPlaceholder(this.conditions.push(value) - 1);
  }

  storeInlinePhpDirective(value: any) {
    return this.getInlinePhpPlaceholder(this.inlinePhpDirectives.push(value) - 1);
  }

  storeRawPropsBlock(value: any) {
    return this.getRawPropsPlaceholder(this.rawPropsBlocks.push(value) - 1);
  }

  storeBladeDirective(value: any) {
    return this.getBladeDirectivePlaceholder(this.bladeDirectives.push(value) - 1);
  }

  storeBladeDirectiveInStyle(value: string) {
    return this.getBladeDirectiveInStylePlaceholder((this.bladeDirectivesInStyle.push(value) - 1).toString());
  }

  storeEscapedBladeDirective(value: string) {
    return this.getEscapedBladeDirectivePlaceholder((this.escapedBladeDirectives.push(value) - 1).toString());
  }

  storeXslot(value: string) {
    return this.getXslotPlaceholder((this.xSlot.push(value) - 1).toString());
  }

  storeBladeComment(value: any) {
    return this.getBladeCommentPlaceholder(this.bladeComments.push(value) - 1);
  }

  storePhpComment(value: string) {
    return this.getPhpCommentPlaceholder((this.phpComments.push(value) - 1).toString());
  }

  storeHtmlTag(value: string) {
    return this.getHtmlTagPlaceholder((this.htmlTags.push(value) - 1).toString());
  }

  storeInlineCustomDirective(value: string) {
    return this.getInlineCustomDirectivePlaceholder((this.customDirectives.push(value) - 1).toString());
  }

  storeBeginCustomDirective(value: string) {
    return this.getBeginCustomDirectivePlaceholder((this.customDirectives.push(value) - 1).toString());
  }

  storeElseCustomDirective(value: string) {
    return this.getElseCustomDirectivePlaceholder((this.customDirectives.push(value) - 1).toString());
  }

  storeEndCustomDirective(value: string) {
    return this.getEndCustomDirectivePlaceholder((this.customDirectives.push(value) - 1).toString());
  }

  storeUnbalancedDirective(value: string) {
    return this.getUnbalancedDirectivePlaceholder((this.unbalancedDirectives.push(value) - 1).toString());
  }

  storeBladeBrace(value: any, length: any) {
    const index = this.bladeBraces.push(value) - 1;
    const brace = '{{  }}';
    return this.getBladeBracePlaceholder(index, length + brace.length);
  }

  storeRawBladeBrace(value: any) {
    const index = this.rawBladeBraces.push(value) - 1;
    return this.getRawBladeBracePlaceholder(index);
  }

  storeRawPhpTags(value: any) {
    const index = this.rawPhpTags.push(value) - 1;
    return this.getRawPhpTagPlaceholder(index);
  }

  storeNonnativeScripts(value: string) {
    const index = this.nonnativeScripts.push(value) - 1;
    return this.getNonnativeScriptPlaceholder(index.toString());
  }

  storeScripts(value: any) {
    const index = this.scripts.push(value) - 1;
    return this.getScriptPlaceholder(index);
  }

  storeHtmlAttribute(value: string) {
    const index = this.htmlAttributes.push(value) - 1;

    if (value.length > 0) {
      return this.getHtmlAttributePlaceholder(index.toString(), value.length);
    }

    return this.getHtmlAttributePlaceholder(index.toString(), 0);
  }

  storeShorthandBinding(value: any) {
    const index = this.shorthandBindings.push(value) - 1;

    return this.getShorthandBindingPlaceholder(index.toString(), value.length);
  }

  storeComponentAttribute(value: any) {
    const index = this.componentAttributes.push(value) - 1;

    return this.getComponentAttributePlaceholder(index.toString());
  }

  storeXData(value: any) {
    const index = this.xData.push(value) - 1;
    return this.getXDataPlaceholder(index);
  }

  storeXInit(value: any) {
    const index = this.xInit.push(value) - 1;
    return this.getXInitPlaceholder(index);
  }

  storeTemplatingString(value: any) {
    const index = this.templatingStrings.push(value) - 1;
    return this.getTemplatingStringPlaceholder(index);
  }

  storeStringLiteralInPhp(value: any) {
    const index = this.stringLiteralInPhp.push(value) - 1;
    return this.getStringLiteralInPhpPlaceholder(index);
  }

  storeBladeDirectiveInScript(value: string) {
    return this.getBladeDirectiveInScriptPlaceholder((this.directivesInScript.push(value) - 1).toString());
  }

  getIgnoredLinePlaceholder(replace: any) {
    return _.replace('___ignored_line_#___', '#', replace);
  }

  getCurlyBraceForJSPlaceholder(replace: any) {
    return _.replace('___js_curly_brace_#___', '#', replace);
  }

  getRawPlaceholder(replace: any) {
    return _.replace('___raw_block_#___', '#', replace);
  }

  getInlinePlaceholder(replace: any, length = 0) {
    if (length > 0) {
      const template = '___inline_directive_#___';
      const gap = length - template.length;
      return _.replace(`___inline_directive_${_.repeat('_', gap > 0 ? gap : 0)}#___`, '#', replace);
    }

    return _.replace('___inline_directive_+?#___', '#', replace);
  }

  getConditionPlaceholder(replace: any) {
    return _.replace('___directive_condition_#___', '#', replace);
  }

  getInlinePhpPlaceholder(replace: any) {
    return _.replace('___inline_php_directive_#___', '#', replace);
  }

  getRawPropsPlaceholder(replace: any) {
    return _.replace('@__raw_props_block_#__@', '#', replace);
  }

  getBladeDirectivePlaceholder(replace: any) {
    return _.replace('___blade_directive_#___', '#', replace);
  }

  getBladeDirectiveInStylePlaceholder(replace: string) {
    return _.replace('.___blade_directive_in_style_#__', '#', replace);
  }

  getEscapedBladeDirectivePlaceholder(replace: string) {
    return _.replace('___escaped_directive_#___', '#', replace);
  }

  getXslotPlaceholder(replace: string) {
    return _.replace('x-slot --___#___--', '#', replace);
  }

  getBladeCommentPlaceholder(replace: any) {
    return _.replace('___blade_comment_#___', '#', replace);
  }

  getPhpCommentPlaceholder(replace: string) {
    return _.replace('___php_comment_#___', '#', replace);
  }

  getBladeBracePlaceholder(replace: any, length = 0) {
    if (length > 0) {
      const template = '___blade_brace_#___';
      const gap = length - template.length;
      return _.replace(`___blade_brace_${_.repeat('_', gap > 0 ? gap : 0)}#___`, '#', replace);
    }

    return _.replace('___blade_brace_+?#___', '#', replace);
  }

  getRawBladeBracePlaceholder(replace: any) {
    return _.replace('___raw_blade_brace_#___', '#', replace);
  }

  getRawPhpTagPlaceholder(replace: any) {
    return _.replace('___raw_php_tag_#___', '#', replace);
  }

  getNonnativeScriptPlaceholder(replace: string) {
    return _.replace('<blade___non_native_scripts_#___ />', '#', replace);
  }

  getScriptPlaceholder(replace: any) {
    return _.replace('<blade___scripts_#___ />', '#', replace);
  }

  getHtmlTagPlaceholder(replace: string) {
    return _.replace('<blade___html_tags_#___ />', '#', replace);
  }

  getInlineCustomDirectivePlaceholder(replace: string) {
    return _.replace('___inline_cd_#___', '#', replace);
  }

  getBeginCustomDirectivePlaceholder(replace: string) {
    return _.replace('@customdirective(___#___)', '#', replace);
  }

  getElseCustomDirectivePlaceholder(replace: string) {
    return _.replace('@else(___#___)', '#', replace);
  }

  getEndCustomDirectivePlaceholder(replace: string) {
    return _.replace('@endcustomdirective(___#___)', '#', replace);
  }

  getUnbalancedDirectivePlaceholder(replace: string) {
    return _.replace('@if (unbalanced___#___)', '#', replace);
  }

  getHtmlAttributePlaceholder(replace: string, length: any) {
    if (length && length > 0) {
      const template = '___attrs_#___';
      const gap = length - template.length;
      return _.replace(`___attrs${_.repeat('_', gap > 0 ? gap : 1)}#___`, '#', replace);
    }

    if (_.isNull(length)) {
      return _.replace('___attrs_#___', '#', replace);
    }

    return _.replace('___attrs_+?#___', '#', replace);
  }

  getShorthandBindingPlaceholder(replace: string, length: any = 0) {
    if (length && length > 0) {
      const template = '___short_binding_#___';
      const gap = length - template.length;
      return _.replace(`___short_binding_${_.repeat('_', gap > 0 ? gap : 1)}#___`, '#', replace);
    }
    return _.replace('___short_binding_+?#___', '#', replace);
  }

  getComponentAttributePlaceholder(replace: string) {
    return _.replace('___attribute_#___', '#', replace);
  }

  getXInitPlaceholder(replace: any) {
    return _.replace('___x_init_#___', '#', replace);
  }

  getPlaceholder(attribute: string, replace: any, length: any = null) {
    if (length && length > 0) {
      const template = `___${attribute}_#___`;
      const gap = length - template.length;
      return _.replace(`___${attribute}${_.repeat('_', gap > 0 ? gap : 1)}#___`, '#', replace);
    }

    if (_.isNull(length)) {
      return _.replace(`___${attribute}_#___`, '#', replace);
    }

    return _.replace(`s___${attribute}_+?#___`, '#', replace);
  }

  getXDataPlaceholder(replace: any) {
    return _.replace('___x_data_#___', '#', replace);
  }

  getTemplatingStringPlaceholder(replace: any) {
    return _.replace('___templating_str_#___', '#', replace);
  }

  getStringLiteralInPhpPlaceholder(replace: any) {
    return _.replace("'___php_content_#___'", '#', replace);
  }

  getBladeDirectiveInScriptPlaceholder(replace: any) {
    return _.replace('___directives_script_#___', '#', replace);
  }

  restoreIgnoredLines(content: any) {
    return _.replace(
      content,
      new RegExp(`${this.getIgnoredLinePlaceholder('(\\d+)')}`, 'gm'),
      (_match: any, p1: any) => this.ignoredLines[p1],
    );
  }

  restoreCurlyBraceForJS(content: any) {
    return _.replace(
      content,
      new RegExp(`${this.getCurlyBraceForJSPlaceholder('(\\d+)')}`, 'gm'),
      (_match: any, p1: any) => `@{{ ${beautify.js_beautify(this.curlyBracesWithJSs[p1].trim())} }}`,
    );
  }

  restorePhpBlock(content: any) {
    return this.restoreRawPhpBlock(content).then((target) => this.restoreRawPropsBlock(target));
  }

  async restoreRawPhpBlock(content: any) {
    return _.replace(content, new RegExp(`${this.getRawPlaceholder('(\\d+)')}`, 'gm'), (match: any, p1: number) => {
      let rawBlock = this.rawBlocks[p1];
      const placeholder = this.getRawPlaceholder(p1.toString());
      const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
      const indent = detectIndent(matchedLine[0]);

      if (this.isInline(rawBlock) && this.isMultilineStatement(rawBlock)) {
        rawBlock = util.formatStringAsPhp(`<?php\n${rawBlock}\n?>`, this.options).trim();
      } else if (rawBlock.split('\n').length > 1) {
        rawBlock = util.formatStringAsPhp(`<?php${rawBlock}?>`, this.options).trimRight('\n');
      } else {
        rawBlock = `<?php${rawBlock}?>`;
      }

      return _.replace(rawBlock, /^(\s*)?<\?php(.*?)\?>/gms, (_matched: any, _q1: any, q2: any) => {
        if (this.isInline(rawBlock)) {
          return `@php${q2}@endphp`;
        }

        let preserved = this.preserveStringLiteralInPhp(q2);
        preserved = this.preservePhpComment(preserved);
        let indented = this.indentRawBlock(indent, preserved);
        indented = this.restorePhpComment(indented);
        const restored = this.restoreStringLiteralInPhp(indented);

        return `@php${restored}@endphp`;
      });
    });
  }

  async restoreRawPropsBlock(content: any) {
    const regex = this.getRawPropsPlaceholder('(\\d+)');
    return _.replace(
      content,
      new RegExp(regex, 'gms'),
      (_match: any, p1: any) =>
        `@props(${util
          .formatRawStringAsPhp(this.rawPropsBlocks[p1], {
            ...this.options,
            printWidth: util.printWidthForInline,
          })
          .trimRight()})`,
    );
  }

  isInline(content: any) {
    return _.split(content, '\n').length === 1;
  }

  isMultilineStatement(rawBlock: any) {
    return util.formatStringAsPhp(`<?php${rawBlock}?>`, this.options).trimRight().split('\n').length > 1;
  }

  indentRawBlock(indent: detectIndent.Indent, content: any) {
    if (this.isInline(content)) {
      return `${indent.indent}${content}`;
    }

    const leftIndentAmount = indent.amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefix = this.indentCharacter.repeat(indentLevel < 0 ? 0 : (indentLevel + 1) * this.indentSize);
    const prefixForEnd = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel * this.indentSize);

    const lines = content.split('\n');

    return _.chain(lines)
      .map((line: any, index: any) => {
        if (index === 0) {
          return line.trim();
        }

        if (index === lines.length - 1) {
          return prefixForEnd + line;
        }

        return prefix + line;
      })
      .join('\n')
      .value();
  }

  indentBladeDirectiveBlock(indent: detectIndent.Indent, content: any) {
    if (_.isEmpty(indent.indent)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${indent.indent}${content}`;
    }

    const leftIndentAmount = indent.amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefixSpaces = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel * this.indentSize);
    const prefixForEnd = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel * this.indentSize);

    const lines = content.split('\n');

    return _.chain(lines)
      .map((line: any, index: any) => {
        if (index === lines.length - 1) {
          return prefixForEnd + line;
        }

        return prefixSpaces + line;
      })
      .value()
      .join('\n');
  }

  indentScriptBlock(indent: detectIndent.Indent, content: any) {
    if (_.isEmpty(indent.indent)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${content}`;
    }

    const leftIndentAmount = indent.amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefixSpaces = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel * this.indentSize);
    const prefixForEnd = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel * this.indentSize);

    const preserved = _.replace(content, /`.*?`/gs, (match: any) => this.storeTemplatingString(match));

    const lines = preserved.split('\n');

    const indented = _.chain(lines)
      .map((line: any, index: any) => {
        if (index === 0) {
          return line;
        }

        if (index === lines.length - 1) {
          return prefixForEnd + line;
        }

        if (_.isEmpty(line)) {
          return line;
        }

        return prefixSpaces + line;
      })
      .value()
      .join('\n');

    return this.restoreTemplatingString(`${indented}`);
  }

  indentRawPhpBlock(indent: detectIndent.Indent, content: any) {
    if (_.isEmpty(indent.indent)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${content}`;
    }

    const leftIndentAmount = indent.amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefixSpaces = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel * this.indentSize);

    const lines = content.split('\n');

    return _.chain(lines)
      .map((line: any, index: any) => {
        if (index === 0) {
          return line.trim();
        }

        return prefixSpaces + line;
      })
      .value()
      .join('\n');
  }

  indentComponentAttribute(prefix: string, content: string) {
    if (_.isEmpty(prefix)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${content}`;
    }

    if (this.isInline(content) && /\S/.test(prefix)) {
      return `${content}`;
    }

    const leftIndentAmount = detectIndent(prefix).amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefixSpaces = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel * this.indentSize);

    const lines = content.split('\n');

    return _.chain(lines)
      .map((line: any, index: any) => {
        if (index === 0) {
          return line.trim();
        }

        return prefixSpaces + line;
      })
      .value()
      .join('\n');
  }

  indentPhpComment(indent: detectIndent.Indent, content: string) {
    if (_.isEmpty(indent.indent)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${content}`;
    }

    const leftIndentAmount = indent.amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefixSpaces = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel * this.indentSize);

    const lines = content.split('\n');
    let withoutCommentLine = false;

    return _.chain(lines)
      .map((line: string, index: number) => {
        if (index === 0) {
          return line.trim();
        }

        if (!line.trim().startsWith('*')) {
          withoutCommentLine = true;
          return line;
        }

        if (line.trim().endsWith('*/') && withoutCommentLine) {
          return line;
        }

        return prefixSpaces + line;
      })
      .join('\n')
      .value();
  }

  restoreBladeDirectivesInStyles(content: string) {
    return _.replace(content, /(?<=<style[^>]*?(?<!=)>)(.*?)(?=<\/style>)/gis, (inside: string) => {
      let result: string = inside;

      const inlineRegex = new RegExp(
        `${this.getBladeDirectiveInStylePlaceholder('(\\d+)')} {\\s*?\/\\* inline_directive \\*\/\\s*?}`,
        'gmi',
      );

      result = _.replace(result, inlineRegex, (match: string, p1: number) => this.bladeDirectivesInStyle[p1]);

      const elseRegex = new RegExp(
        `}\\s*?${this.getBladeDirectiveInStylePlaceholder('(\\d+)')} {\\s*?\/\\*else\\*\/`,
        'gmi',
      );

      result = _.replace(result, elseRegex, (match: string, p1: number) => `${this.bladeDirectivesInStyle[p1]}`);

      const startRegex = new RegExp(
        `${this.getBladeDirectiveInStylePlaceholder('(\\d+)')} {\\s*?\/\\*start\\*\/`,
        'gmi',
      );

      result = _.replace(result, startRegex, (match: string, p1: number) => `${this.bladeDirectivesInStyle[p1]}`);

      const endRegex = new RegExp(`}\\s*?\/\\* ${this.getBladeDirectiveInStylePlaceholder('(\\d+)')} \\*\/`, 'gmi');

      result = _.replace(result, endRegex, (match: string, p1: number) => `${this.bladeDirectivesInStyle[p1]}`);

      return result;
    });
  }

  restoreBladeDirectivesInScripts(content: any) {
    const regex = new RegExp(`${this.getBladeDirectivePlaceholder('(\\d+)')}`, 'gm');

    // restore inline blade directive
    let result = _.replace(content, regex, (_match: any, p1: number) => {
      const placeholder = this.getBladeDirectivePlaceholder(p1.toString());
      const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
      const indent = detectIndent(matchedLine[0]);

      return this.indentBladeDirectiveBlock(indent, this.bladeDirectives[p1]);
    });

    result = _.replace(result, /(?<=<script[^>]*?(?<!=)>)(.*?)(?=<\/script>)/gis, (match: string) => {
      let formatted: string = match;

      // restore begin
      formatted = _.replace(
        formatted,
        new RegExp(
          `if \\( \\/\\*(?:(?:${this.getBladeDirectiveInScriptPlaceholder('(\\d+)')}).*?)\\*\\/ \\) \\{`,
          'gis',
        ),
        (_match: any, p1: any) => `${this.directivesInScript[p1]}`,
      );

      // restore else
      formatted = _.replace(
        formatted,
        new RegExp(
          `} \\/\\* (?:${this.getBladeDirectiveInScriptPlaceholder(
            '(\\d+)',
          )}) \\*\\/ {(\\s*?\\(___directive_condition_\\d+___\\))?`,
          'gim',
        ),
        (_match: any, p1: number, p2: string) => {
          if (_.isUndefined(p2)) {
            return `${this.directivesInScript[p1].trim()}`;
          }

          return `${this.directivesInScript[p1].trim()} ${(p2 ?? '').trim()}`;
        },
      );

      // restore end
      formatted = _.replace(
        formatted,
        new RegExp(`} \\/\\*(?:${this.getBladeDirectiveInScriptPlaceholder('(\\d+)')})\\*\\/`, 'gis'),
        (_match: any, p1: any) => `${this.directivesInScript[p1]}`,
      );

      // restore php block
      formatted = _.replace(
        formatted,
        new RegExp(`${this.getRawPlaceholder('(\\d+)')}`, 'gm'),
        // eslint-disable-next-line no-shadow
        (match: any, p1: number) => {
          let rawBlock = this.rawBlocks[p1];
          const placeholder = this.getRawPlaceholder(p1.toString());
          const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
          const indent = detectIndent(matchedLine[0]);

          if (this.isInline(rawBlock) && this.isMultilineStatement(rawBlock)) {
            rawBlock = util.formatStringAsPhp(`<?php\n${rawBlock}\n?>`, this.options).trim();
          } else if (rawBlock.split('\n').length > 1) {
            rawBlock = util.formatStringAsPhp(`<?php${rawBlock}?>`, this.options).trim();
          } else {
            rawBlock = `<?php${rawBlock}?>`;
          }

          return _.replace(rawBlock, /^(\s*)?<\?php(.*?)\?>/gms, (_matched: any, _q1: any, q2: any) => {
            if (this.isInline(rawBlock)) {
              return `@php${q2}@endphp`;
            }

            const preserved = this.preserveStringLiteralInPhp(q2);
            const indented = this.indentRawBlock(indent, preserved);
            const restored = this.restoreStringLiteralInPhp(indented);

            return `@php${restored}@endphp`;
          });
        },
      );

      // delete place holder
      formatted = _.replace(
        formatted,
        /(?<=[\S]+)(\s*?)\/\*\*\*script_placeholder\*\*\*\/(\s)?/gim,
        (_match: any, p1: string, p2: string) => {
          if (p2 !== undefined) {
            return p2;
          }

          const group1 = p1 ?? '';
          const group2 = p2 ?? '';

          return group1 + group2;
        },
      );

      return formatted;
    });

    if (regex.test(result)) {
      result = this.restoreBladeDirectivesInScripts(result);
    }

    return result;
  }

  async formatPreservedBladeDirectives(directives: any) {
    return Aigle.map(directives, async (content: any) => {
      const formattedAsHtml = await this.formatAsHtml(content);
      const formatted = await this.formatAsBlade(formattedAsHtml);
      return formatted.trimRight('\n');
    });
  }

  restoreBladeComment(content: any) {
    return new Promise((resolve) => resolve(content)).then((res: any) =>
      _.replace(res, new RegExp(`${this.getBladeCommentPlaceholder('(\\d+)')}`, 'gms'), (_match: any, p1: any) =>
        this.bladeComments[p1].replace(/{{--(?=\S)/g, '{{-- ').replace(/(?<=\S)--}}/g, ' --}}'),
      ),
    );
  }

  restoreXslot(content: string) {
    return _.replace(content, /x-slot\s*--___(\d+)___--/gms, (_match: string, p1: number) => this.xSlot[p1]).replace(
      /(?<=<x-slot:[\w\_\-]*)\s+(?=\/?>)/gm,
      () => '',
    );
  }

  restorePhpComment(content: string) {
    return _.replace(
      content,
      new RegExp(`${this.getPhpCommentPlaceholder('(\\d+)')};{0,1}`, 'gms'),
      (_match: string, p1: number) => {
        const placeholder = this.getPhpCommentPlaceholder(p1.toString());
        const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
        const indent = detectIndent(matchedLine[0]);
        const formatted = formatPhpComment(this.phpComments[p1]);

        return this.indentPhpComment(indent, formatted);
      },
    );
  }

  async restoreEscapedBladeDirective(content: any) {
    return new Promise((resolve) => resolve(content)).then((res: any) =>
      _.replace(
        res,
        new RegExp(`${this.getEscapedBladeDirectivePlaceholder('(\\d+)')}`, 'gms'),
        (_match: string, p1: number) => this.escapedBladeDirectives[p1],
      ),
    );
  }

  restoreBladeBrace(content: any) {
    return new Promise((resolve) => resolve(content)).then((res: any) =>
      _.replace(res, new RegExp(`${this.getBladeBracePlaceholder('(\\d+)')}`, 'gm'), (_match: string, p1: number) => {
        const placeholder = this.getBladeBracePlaceholder(p1.toString());
        const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
        const indent = detectIndent(matchedLine[0]);
        const bladeBrace = this.bladeBraces[p1];

        if (bladeBrace.trim() === '') {
          return `{{${bladeBrace}}}`;
        }

        if (this.isInline(bladeBrace)) {
          return `{{ ${util
            .formatRawStringAsPhp(bladeBrace, {
              ...this.options,
              trailingCommaPHP: false,
              printWidth: util.printWidthForInline,
            })
            .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
            .split('\n')
            .map((line) => line.trim())
            .join('')
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
            .trimRight('\n')} }}`;
        }

        return `{{ ${this.indentRawPhpBlock(
          indent,
          util
            .formatRawStringAsPhp(bladeBrace, this.options)
            .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
            .trim()
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
            .trimRight('\n'),
        )} }}`;
      }),
    );
  }

  restoreRawBladeBrace(content: any) {
    return new Promise((resolve) => resolve(content)).then((res) =>
      _.replace(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
        res,
        new RegExp(`${this.getRawBladeBracePlaceholder('(\\d+)')}`, 'gms'),
        (_match: any, p1: any) => {
          const placeholder = this.getRawBladeBracePlaceholder(p1);
          const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
          const indent = detectIndent(matchedLine[0]);
          const bladeBrace = this.rawBladeBraces[p1];

          if (bladeBrace.trim() === '') {
            return `{!!${bladeBrace}!!}`;
          }

          return this.indentRawPhpBlock(
            indent,
            `{!! ${util
              .formatRawStringAsPhp(bladeBrace, this.options)
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .trim()} !!}`,
          );
        },
      ),
    );
  }

  restoreInlineDirective(content: any) {
    return new Promise((resolve) => resolve(content)).then((res) =>
      _.replace(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
        res,
        new RegExp(`${this.getInlinePlaceholder('(\\d+)')}`, 'gms'),
        (_match: any, p1: any) => {
          const matched = this.inlineDirectives[p1];
          return matched;
        },
      ),
    );
  }

  restoreConditions(content: any) {
    return new Promise((resolve) => resolve(content)).then((res: any) =>
      _.replace(res, new RegExp(`${this.getConditionPlaceholder('(\\d+)')}`, 'gms'), (_match: any, p1: any) => {
        const placeholder = this.getConditionPlaceholder(p1);
        const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
        const indent = detectIndent(matchedLine[0]);

        const matched = this.conditions[p1];

        return this.formatExpressionInsideBladeDirective(matched, indent);
      }),
    );
  }

  restoreUnbalancedDirective(content: any) {
    return new Promise((resolve) => resolve(content)).then((res: any) =>
      _.replace(res, /@if \(unbalanced___(\d+)___\)/gms, (_match: any, p1: any) => {
        const matched = this.unbalancedDirectives[p1];
        return matched;
      }),
    );
  }

  restoreInlinePhpDirective(content: any) {
    return new Promise((resolve) => resolve(content)).then((res) =>
      _.replace(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
        res,
        new RegExp(`${this.getInlinePhpPlaceholder('(\\d+)')}`, 'gm'),
        (_match: any, p1: any) => {
          const matched = this.inlinePhpDirectives[p1];
          const placeholder = this.getInlinePhpPlaceholder(p1);
          const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
          const indent = detectIndent(matchedLine[0]);

          if (matched.includes('@php')) {
            return `${util
              .formatRawStringAsPhp(matched, { ...this.options, printWidth: util.printWidthForInline })
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .trim()
              // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
              .trimRight('\n')}`;
          }

          if (new RegExp(inlinePhpDirectives.join('|'), 'gi').test(matched)) {
            const formatted = _.replace(
              matched,
              new RegExp(
                `(?<=@(${_.map(inlinePhpDirectives, (token) => token.substring(1)).join('|')}).*?\\()(.*)(?=\\))`,
                'gis',
              ),
              (match2: any, p3: any, p4: any) => {
                let wrapLength = this.wrapLineLength;

                if (['button', 'class'].includes(p3)) {
                  wrapLength = 80;
                }

                if (p3 === 'include') {
                  wrapLength = this.wrapLineLength - `func`.length - p1.length - indent.amount;
                }

                return this.formatExpressionInsideBladeDirective(p4, indent, wrapLength);
              },
            );

            return formatted;
          }

          return `${util
            .formatRawStringAsPhp(matched, { ...this.options, printWidth: util.printWidthForInline })
            .trimEnd()}`;
        },
      ),
    );
  }

  restoreRawPhpTags(content: any) {
    return new Promise((resolve) => resolve(content)).then((res) =>
      _.replace(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
        res,
        new RegExp(`${this.getRawPhpTagPlaceholder('(\\d+)')}`, 'gms'),
        (_match: any, p1: any) => {
          // const result= this.rawPhpTags[p1];
          try {
            const matched = this.rawPhpTags[p1];
            const commentBlockExists = /(?<=<\?php\s*?)\/\*.*?\*\/(?=\s*?\?>)/gim.test(matched);
            const inlinedComment = commentBlockExists && this.isInline(matched);
            const placeholder = this.getRawPhpTagPlaceholder(p1);
            const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
            const indent = detectIndent(matchedLine[0]);

            if (inlinedComment) {
              return matched;
            }

            const result = util.formatStringAsPhp(this.rawPhpTags[p1], this.options).trim().trimRight('\n');

            if (this.isInline(result)) {
              return result;
            }

            let preserved = this.preservePhpComment(result);

            if (indent.indent) {
              preserved = this.indentRawPhpBlock(indent, preserved);
            }

            const restored = this.restorePhpComment(preserved);

            return restored;
          } catch (e) {
            return `${this.rawPhpTags[p1]}`;
          }
        },
      ),
    );
  }

  restoreNonnativeScripts(content: string) {
    return _.replace(
      content,
      new RegExp(`${this.getNonnativeScriptPlaceholder('(\\d+)')}`, 'gmi'),
      (_match: any, p1: number) => `${this.nonnativeScripts[p1]}`,
    );
  }

  restoreScripts(content: any) {
    return new Promise((resolve) => resolve(content)).then((res) =>
      _.replace(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
        res,
        new RegExp(`${this.getScriptPlaceholder('(\\d+)')}`, 'gim'),
        (_match: any, p1: number) => {
          const script = this.scripts[p1];

          const placeholder = this.getScriptPlaceholder(p1);
          const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
          const indent = detectIndent(matchedLine[0]);
          const useTabs = util.optional(this.options).useTabs || false;

          const options = {
            indent_size: util.optional(this.options).indentSize || 4,
            wrap_line_length: util.optional(this.options).wrapLineLength || 120,
            wrap_attributes: util.optional(this.options).wrapAttributes || 'auto',
            wrap_attributes_min_attrs: util.optional(this.options).wrapAttributesMinAttrs,
            indent_inner_html: util.optional(this.options).indentInnerHtml || false,
            extra_liners: util.optional(this.options).extraLiners,
            indent_with_tabs: useTabs,
            end_with_newline: false,
            templating: ['php'],
          };

          if (useTabs) {
            return this.indentScriptBlock(
              indent,
              _.replace(beautify.html_beautify(script, options), /\t/g, '\t'.repeat(this.indentSize)),
            );
          }

          return this.indentScriptBlock(indent, beautify.html_beautify(script, options));
        },
      ),
    );
  }

  async restoreCustomDirective(content: string) {
    return this.restoreInlineCustomDirective(content)
      .then((data: string) => this.restoreBeginCustomDirective(data))
      .then((data: string) => this.restoreElseCustomDirective(data))
      .then((data: string) => this.restoreEndCustomDirective(data));
  }

  async restoreInlineCustomDirective(content: string) {
    return _.replace(
      content,
      new RegExp(`${this.getInlineCustomDirectivePlaceholder('(\\d+)')}`, 'gim'),
      (_match: any, p1: number) => {
        const placeholder = this.getInlineCustomDirectivePlaceholder(p1.toString());
        const matchedLine = content.match(new RegExp(`^(.*?)${_.escapeRegExp(placeholder)}`, 'gmi')) ?? [''];
        const indent = detectIndent(matchedLine[0]);

        const matched = `${this.customDirectives[p1]}`;
        return _.replace(matched, /(@[a-zA-z0-9\-_]+)(.*)/gis, (match2: string, p2: string, p3: string) => {
          try {
            const formatted = util
              .formatRawStringAsPhp(`func${p3}`, {
                ...this.options,
                printWidth: util.printWidthForInline,
              })
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .replace(/,(\s*?\))$/gm, (_m, p4) => p4)
              .trim()
              .substring(4);
            return `${p2}${this.indentComponentAttribute(indent.indent, formatted)}`;
          } catch (error) {
            return `${match2}`;
          }
        });
      },
    );
  }

  async restoreBeginCustomDirective(content: string) {
    return _.replace(
      content,
      new RegExp(`@customdirective\\(___(\\d+)___\\)\\s*?(${nestedParenthesisRegex})*`, 'gim'),
      (_match: any, p1: number) => {
        const placeholder = this.getBeginCustomDirectivePlaceholder(p1.toString());
        const matchedLine = content.match(new RegExp(`^(.*?)${_.escapeRegExp(placeholder)}`, 'gmi')) ?? [''];

        const indent = detectIndent(matchedLine[0]);
        const matched = `${this.customDirectives[p1]}`;

        return _.replace(matched, /(@[a-zA-z0-9\-_]+)(.*)/gis, (match2: string, p3: string, p4: string) => {
          try {
            const formatted = util
              .formatRawStringAsPhp(`func${p4}`, { ...this.options, trailingCommaPHP: false })
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .trim()
              .substring(4);
            return `${p3}${this.indentComponentAttribute(indent.indent, formatted)}`;
          } catch (error) {
            return `${match2}`;
          }
        });
      },
    );
  }

  async restoreElseCustomDirective(content: string) {
    return _.replace(content, /@else\(___(\d+)___\)/gim, (_match: any, p1: number) => `${this.customDirectives[p1]}`);
  }

  async restoreEndCustomDirective(content: string) {
    return _.replace(
      content,
      /@endcustomdirective\(___(\d+)___\)/gim,
      (_match: any, p1: number) => `${this.customDirectives[p1]}`,
    );
  }

  async restoreHtmlTags(content: any) {
    return _.replace(
      content,
      new RegExp(`${this.getHtmlTagPlaceholder('(\\d+)')}`, 'gim'),
      (_match: any, p1: number) => {
        const placeholder = this.getHtmlTagPlaceholder(p1.toString());
        const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
        const indent = detectIndent(matchedLine[0]);

        const options = {
          indent_size: util.optional(this.options).indentSize || 4,
          wrap_line_length: util.optional(this.options).wrapLineLength || 120,
          wrap_attributes: util.optional(this.options).wrapAttributes || 'auto',
          wrap_attributes_min_attrs: util.optional(this.options).wrapAttributesMinAttrs,
          indent_inner_html: util.optional(this.options).indentInnerHtml || false,
          extra_liners: util.optional(this.options).extraLiners,
          end_with_newline: false,
          templating: ['php'],
        };

        const matched = this.htmlTags[p1];
        const openingTag = _.first(matched.match(/(<(textarea|pre).*?(?<!=)>)(?=.*?<\/\2>)/gis));

        if (openingTag === undefined) {
          return `${this.indentScriptBlock(indent, beautify.html_beautify(matched, options))}`;
        }

        const restofTag = matched.substring(openingTag.length, matched.length);

        return `${this.indentScriptBlock(indent, beautify.html_beautify(openingTag, options))}${restofTag}`;
      },
    );
  }

  restoreHtmlAttributes(content: string) {
    return _.replace(
      content,
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      new RegExp(`${this.getHtmlAttributePlaceholder('(\\d+)')}`, 'gms'),
      (_match: string, p1: number) => this.htmlAttributes[p1],
    );
  }

  restoreXData(content: any) {
    return _.replace(content, new RegExp(`${this.getXDataPlaceholder('(\\d+)')}`, 'gm'), (_match: any, p1: any) => {
      const placeholder = this.getXDataPlaceholder(p1.toString());
      const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
      const indent = detectIndent(matchedLine[0]);

      const lines = this.formatJS(this.xData[p1]).split('\n');

      const indentLevel = indent.amount / (this.indentCharacter === '\t' ? 4 : 1);

      const firstLine = lines[0];
      const prefix = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel);
      const offsettedLines = lines.map((line) => prefix + line);
      offsettedLines[0] = firstLine;
      return `${offsettedLines.join('\n')}`;
    });
  }

  restoreXInit(content: any) {
    return _.replace(content, new RegExp(`${this.getXInitPlaceholder('(\\d+)')}`, 'gm'), (_match: any, p1: number) => {
      const placeholder = this.getXInitPlaceholder(p1.toString());
      const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
      const indent = detectIndent(matchedLine[0]);

      const lines = this.formatJS(this.xInit[p1]).split('\n');

      const indentLevel = indent.amount / (this.indentCharacter === '\t' ? 4 : 1);

      const firstLine = lines[0];
      const prefix = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel);
      const offsettedLines = lines.map((line) => prefix + line);
      offsettedLines[0] = firstLine;
      return `${offsettedLines.join('\n')}`;
    });
  }

  restoreTemplatingString(content: any) {
    return _.replace(
      content,
      new RegExp(`${this.getTemplatingStringPlaceholder('(\\d+)')}`, 'gms'),
      (_match: any, p1: any) => this.templatingStrings[p1],
    );
  }

  restoreStringLiteralInPhp(content: any) {
    return _.replace(
      content,
      new RegExp(`${this.getStringLiteralInPhpPlaceholder('(\\d+)')}`, 'gms'),
      (_match: any, p1: any) => this.stringLiteralInPhp[p1],
    );
  }

  restoreComponentAttribute(content: string): string {
    return _.replace(
      content,
      new RegExp(`${this.getComponentAttributePlaceholder('(\\d+)')}`, 'gim'),
      (_match: any, p1: any) => {
        const placeholder = this.getComponentAttributePlaceholder(p1);
        const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
        const indent = detectIndent(matchedLine[0]);

        const matched = this.componentAttributes[p1];
        const formatted = _.replace(
          matched,
          /(:{1,2}.*?=)(["'])(.*?)(?=\2)/gis,
          (match, p2: string, p3: string, p4: string) => {
            if (p4 === '') {
              return match;
            }

            if (p2.startsWith('::')) {
              return `${p2}${p3}${beautify
                .js_beautify(p4, {
                  wrap_line_length: this.wrapLineLength - indent.amount,
                  brace_style: 'preserve-inline',
                })
                .trim()}`;
            }

            if (this.isInline(p4)) {
              try {
                return `${p2}${p3}${util
                  .formatRawStringAsPhp(p4, {
                    ...this.options,
                    printWidth: this.wrapLineLength - indent.amount,
                  })
                  .trimEnd()}`;
              } catch (error) {
                return `${p2}${p3}${p4}`;
              }
            }

            return `${p2}${p3}${util
              .formatRawStringAsPhp(p4, {
                ...this.options,
                printWidth: this.wrapLineLength - indent.amount,
              })
              .trimEnd()}`;
          },
        );

        return `${this.indentComponentAttribute(indent.indent, formatted)}`;
      },
    );
  }

  restoreShorthandBinding(content: any) {
    return _.replace(
      content,
      new RegExp(`${this.getShorthandBindingPlaceholder('(\\d+)')}`, 'gms'),
      (_match: any, p1: any) => {
        const placeholder = this.getShorthandBindingPlaceholder(p1);
        const matchedLine = content.match(new RegExp(`^(.*?)${placeholder}`, 'gmi')) ?? [''];
        const indent = detectIndent(matchedLine[0]);

        const matched = this.shorthandBindings[p1];

        const formatted = _.replace(
          matched,
          /(:{1,2}.*?=)(["'])(.*?)(?=\2)/gis,
          (match, p2: string, p3: string, p4: string) => {
            const beautifyOpts: JSBeautifyOptions = {
              wrap_line_length: this.wrapLineLength - indent.amount,
              brace_style: 'preserve-inline',
            };

            if (p4 === '') {
              return match;
            }

            if (this.isInline(p4)) {
              try {
                return `${p2}${p3}${beautify.js_beautify(p4, beautifyOpts).trimEnd()}`;
              } catch (error) {
                return `${p2}${p3}${p4}`;
              }
            }

            return `${p2}${p3}${beautify.js_beautify(p4, beautifyOpts).trimEnd()}`;
          },
        );

        return `${this.indentComponentAttribute(indent.indent, formatted)}`;
      },
    );
  }

  async formatAsBlade(content: any) {
    // init parameters
    this.currentIndentLevel = 0;
    this.shouldBeIndent = false;

    const splitedLines = util.splitByLines(content);
    const vsctmModule = await new vsctm.VscodeTextmate(this.vsctm, this.oniguruma);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    const registry = vsctmModule.createRegistry(content);

    const formatted = registry
      .loadGrammar('text.html.php.blade')
      .then((grammar: any) => vsctmModule.tokenizeLines(splitedLines, grammar))
      .then((tokenizedLines: any) => this.formatTokenizedLines(splitedLines, tokenizedLines))
      .catch((err: any) => {
        throw err;
      });

    return formatted;
  }

  formatTokenizedLines(splitedLines: any, tokenizedLines: any) {
    this.result = [];
    this.stack = [];
    for (let i = 0; i < splitedLines.length; i += 1) {
      const originalLine = splitedLines[i];
      const tokenizeLineResult = tokenizedLines[i];
      this.processLine(tokenizeLineResult, originalLine);
    }

    return this.result.join(this.endOfLine);
  }

  processLine(tokenizeLineResult: any, originalLine: any) {
    this.processTokenizeResult(tokenizeLineResult, originalLine);
  }

  processKeyword(token: any) {
    if (_.includes(phpKeywordStartTokens, token)) {
      if (_.last(this.stack) === '@case' && token === '@case') {
        this.decrementIndentLevel();
      }

      if (token === '@case') {
        this.shouldBeIndent = true;
      }

      this.stack.push(token);
      return;
    }

    if (_.includes(phpKeywordEndTokens, token)) {
      if (token === '@break') {
        this.decrementIndentLevel();
        this.stack.pop();
        this.stack.push(token);
        return;
      }

      if (_.last(this.stack) !== '@hassection') {
        this.stack.pop();
        return;
      }
    }

    if (_.includes(indentStartAndEndTokens, token)) {
      this.shouldBeIndent = true;
      this.stack.push(token);
    }

    if (_.includes(indentStartOrElseTokens, token)) {
      if (_.includes(tokenForIndentStartOrElseTokens, _.last(this.stack))) {
        this.decrementIndentLevel();
        this.shouldBeIndent = true;
      }
    }

    if (_.includes(indentStartTokens, token)) {
      if (_.last(this.stack) === '@section' && token === '@section') {
        if (this.currentIndentLevel > 0) this.decrementIndentLevel();
        this.shouldBeIndent = true;
        this.stack.push(token);
      } else {
        this.shouldBeIndent = true;
        this.stack.push(token);
      }
    }

    if (_.includes(indentEndTokens, token)) {
      if (token === '@endswitch' && _.last(this.stack) === '@default') {
        this.decrementIndentLevel(2);
        this.shouldBeIndent = false;
        return;
      }

      this.decrementIndentLevel();
      this.shouldBeIndent = false;
      this.stack.pop();
    }

    if (_.includes(indentElseTokens, token)) {
      this.decrementIndentLevel();
      this.shouldBeIndent = true;
    }
  }

  processToken(tokenStruct: any, token: any) {
    if (_.includes(tokenStruct.scopes, 'punctuation.definition.comment.begin.blade')) {
      this.isInsideCommentBlock = true;
    }

    if (this.argumentCheck) {
      const { count, inString, stack } = this.argumentCheck;
      if (!inString && token === ')') {
        stack.push(token);
        count[token] += 1;
        if (count['('] === count[token]) {
          // finished
          const expression = stack.join('');
          const argumentCount = util.getArgumentsCount(expression);
          if (argumentCount >= this.argumentCheck.unindentOn) this.shouldBeIndent = false;
          this.argumentCheck = false;
        }
        return;
      }
      stack.push(token);
      if (inString === token) this.argumentCheck.inString = false;
      else if (!inString && (token === '"' || token === "'")) this.argumentCheck.inString = token;
      if (token === '(' && !inString) count[token] += 1;
    }

    if (_.includes(tokenStruct.scopes, 'punctuation.definition.comment.end.blade')) {
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
    if (_.includes(Object.keys(optionalStartWithoutEndTokens), token.toLowerCase())) {
      this.argumentCheck = {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        unindentOn: optionalStartWithoutEndTokens[token.toLowerCase()],
        stack: [],
        inString: false,
        count: { '(': 0, ')': 0 },
      };
    }
  }

  processTokenizeResult(tokenizeLineResult: any, originalLine: any) {
    if (this.shouldBeIndent) {
      this.incrementIndentLevel();
      this.shouldBeIndent = false;
    }

    if (hasStartAndEndToken(tokenizeLineResult, originalLine)) {
      this.insertFormattedLineToResult(originalLine);
      return;
    }

    for (let j = 0; j < tokenizeLineResult.tokens.length; j += 1) {
      const tokenStruct = tokenizeLineResult.tokens[j];

      const token = originalLine.substring(tokenStruct.startIndex, tokenStruct.endIndex).trim();

      this.processToken(tokenStruct, token);
    }

    this.insertFormattedLineToResult(originalLine);
  }

  insertFormattedLineToResult(originalLine: any) {
    const originalLineWhitespaces = detectIndent(originalLine).amount;
    const whitespaces = originalLineWhitespaces + this.indentSize * this.currentIndentLevel;
    const formattedLine = this.indentCharacter.repeat(whitespaces < 0 ? 0 : whitespaces) + originalLine.trim();

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

  incrementIndentLevel(level = 1) {
    this.currentIndentLevel += level;
  }

  decrementIndentLevel(level = 1) {
    this.currentIndentLevel -= level;
  }

  formatExpressionInsideBladeDirective(
    matchedExpression: string,
    indent: detectIndent.Indent,
    wrapLength: number | undefined = undefined,
  ) {
    const formatTarget = `func(${matchedExpression})`;
    const formattedExpression = util.formatRawStringAsPhp(formatTarget, {
      ...this.options,
      printWidth: wrapLength ?? this.defaultPhpFormatOption.printWidth,
    });

    if (formattedExpression === formatTarget) {
      return matchedExpression;
    }

    let inside = formattedExpression
      .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
      .replace(/(?<!(['"]).*)(?<=\()[\n\s]+?(?=\w)/gm, '')
      .replace(/([^]*)],[\n\s]*?\)$/gm, (match: string, p1: string) => `${p1}]\n)`)
      .replace(/,[\n\s]*?\)/gs, ')')
      .replace(/,(\s*?\))$/gm, (match, p1) => p1)
      .trim();

    if (this.options.useTabs || false) {
      inside = _.replace(inside, /(?<=^ *) {4}/gm, '\t'.repeat(this.indentSize));
    }

    inside = inside.replace(/func\((.*)\)/gis, (match: string, p1: string) => p1);
    if (this.isInline(inside.trim())) {
      inside = inside.trim();
    }

    return this.indentRawPhpBlock(indent, inside);
  }

  formatJS(jsCode: string): string {
    let code: string = jsCode;
    const tempVarStore: any = {
      js: [],
      entangle: [],
    };
    Object.keys(tempVarStore).forEach((directive) => {
      code = code.replace(
        new RegExp(`@${directive}\\((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))*\\)`, 'gs'),
        (m: any) => {
          const index = tempVarStore[directive].push(m) - 1;
          return this.getPlaceholder(directive, index, m.length);
        },
      );
    });
    code = beautify.js_beautify(code, { brace_style: 'preserve-inline' });

    Object.keys(tempVarStore).forEach((directive) => {
      code = code.replace(
        new RegExp(this.getPlaceholder(directive, '_*(\\d+)'), 'gms'),
        (_match: any, p1: any) => tempVarStore[directive][p1],
      );
    });

    return code;
  }
}
