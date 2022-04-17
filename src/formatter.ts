/* eslint-disable class-methods-use-this */

import os from 'os';
import beautify from 'js-beautify';
import _ from 'lodash';
import * as vscodeTmModule from 'vscode-textmate';
import detectIndent from 'detect-indent';
import Aigle from 'aigle';
import xregexp from 'xregexp';
import { sortClasses } from '@shufo/tailwindcss-class-sorter';
import { FormatterOption, CLIOption } from './main';
import * as vsctm from './vsctm';
import * as util from './util';
import {
  indentStartTokens,
  indentEndTokens,
  indentElseTokens,
  indentStartOrElseTokens,
  tokenForIndentStartOrElseTokens,
  hasStartAndEndToken,
  phpKeywordStartTokens,
  phpKeywordEndTokens,
  indentStartAndEndTokens,
  inlineFunctionTokens,
  optionalStartWithoutEndTokens,
  conditionalTokens,
  directivePrefix,
  indentStartTokensWithoutPrefix,
} from './indent';
import { nestedParenthesisRegex } from './regex';

export default class Formatter {
  argumentCheck: any;

  bladeBraces: any;

  bladeComments: any;

  bladeDirectives: any;

  classes: any;

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

  scripts: any;

  xData: any;

  xInit: any;

  htmlTags: Array<string>;

  shouldBeIndent: any;

  stack: any;

  templatingStrings: any;

  stringLiteralInPhp: Array<string>;

  componentAttributes: Array<string>;

  vsctm: any;

  wrapAttributes: any;

  wrapLineLength: any;

  constructor(options: any) {
    this.options = options;
    this.vsctm = util.optional(this.options).vsctm || vscodeTmModule;
    this.oniguruma = util.optional(this.options).oniguruma;
    this.indentCharacter = util.optional(this.options).useTabs ? '\t' : ' ';
    this.indentSize = util.optional(this.options).indentSize || 4;
    this.wrapLineLength = util.optional(this.options).wrapLineLength || 120;
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
    this.bladeComments = [];
    this.bladeBraces = [];
    this.rawBladeBraces = [];
    this.scripts = [];
    this.classes = [];
    this.xData = [];
    this.xInit = [];
    this.htmlTags = [];
    this.templatingStrings = [];
    this.stringLiteralInPhp = [];
    this.componentAttributes = [];
    this.result = [];
    this.diffs = [];
  }

  formatContent(content: any) {
    return new Promise((resolve) => resolve(content))
      .then((target) => this.preserveIgnoredLines(target))
      .then((target) => this.preserveCurlyBraceForJS(target))
      .then((target) => this.preserveRawPhpTags(target))
      .then((target) => util.formatAsPhp(target))
      .then((target) => this.preserveBladeComment(target))
      .then((target) => this.preserveBladeBrace(target))
      .then((target) => this.preserveRawBladeBrace(target))
      .then((target) => this.preserveConditions(target))
      .then((target) => this.preserveInlineDirective(target))
      .then((target) => this.preserveInlinePhpDirective(target))
      .then((target) => this.breakLineBeforeAndAfterDirective(target))
      .then((target) => this.preserveBladeDirectivesInScripts(target))
      .then(async (target) => {
        this.bladeDirectives = await this.formatPreservedBladeDirectives(this.bladeDirectives);
        return target;
      })
      .then((target) => this.preserveScripts(target))
      .then((target) => this.sortTailwindcssClasses(target))
      .then((target) => this.preserveComponentAttribute(target))
      .then((target) => this.preserveClass(target))
      .then((target) => this.formatXData(target))
      .then((target) => this.formatXInit(target))
      .then((target) => this.preserveHtmlTags(target))
      .then((target) => this.formatAsHtml(target))
      .then((target) => this.formatAsBlade(target))
      .then((target) => this.restoreHtmlTags(target))
      .then((target) => this.restoreClass(target))
      .then((target) => this.restoreComponentAttribute(target))
      .then((target) => this.restoreXData(target))
      .then((target) => this.restoreXInit(target))
      .then((target) => this.restoreScripts(target))
      .then((target) => this.restoreBladeDirectivesInScripts(target))
      .then((target) => this.restoreInlinePhpDirective(target))
      .then((target) => this.restoreInlineDirective(target))
      .then((target) => this.restoreConditions(target))
      .then((target) => this.restoreRawBladeBrace(target))
      .then((target) => this.restoreBladeBrace(target))
      .then((target) => this.restoreBladeComment(target))
      .then((target) => this.restoreRawPhpTags(target))
      .then((target) => this.restoreCurlyBraceForJS(target))
      .then((target) => this.restoreIgnoredLines(target))
      .then((formattedResult) => util.checkResult(formattedResult));
  }

  formatAsHtml(data: any) {
    const options = {
      indent_size: util.optional(this.options).indentSize || 4,
      wrap_line_length: util.optional(this.options).wrapLineLength || 120,
      wrap_attributes: util.optional(this.options).wrapAttributes || 'auto',
      end_with_newline: util.optional(this.options).endWithNewline || true,
    };

    const promise = new Promise((resolve) => resolve(data))
      .then((content) => this.preservePhpBlock(content))
      .then((content) => util.preserveDirectives(content))
      .then((preserved) => beautify.html_beautify(preserved, options))
      .then((content) => util.revertDirectives(content))
      .then((content) => this.restorePhpBlock(content));

    return Promise.resolve(promise);
  }

  async sortTailwindcssClasses(content: any) {
    if (!this.options.sortTailwindcssClasses) {
      return content;
    }

    return _.replace(content, /\bclass\s*=\s*([\"\'])(.+?)([\"\'])/gis, (_match, p1, p2, p3) => {
      return `class=${p1}${sortClasses(p2)}${p3}`;
    });
  }

  async preserveIgnoredLines(content: any) {
    return _.chain(content)
      .replace(
        /(^(?<!.+)^{{--\s*blade-formatter-disable\s*--}}.*?)([\r\n]*)$(?![\r\n])/gis,
        (_match: any, p1: any, p2: any) => {
          return this.storeIgnoredLines(`${p1}${p2.replace(/^\n/, '')}`);
        },
      )
      .replace(/{{--\s*?blade-formatter-disable\s*?--}}.*?{{--\s*?blade-formatter-enable\s*?--}}/gis, (match: any) =>
        this.storeIgnoredLines(match),
      )
      .replace(/{{--\s*?blade-formatter-disable-next-line\s*?--}}[\r\n]+[^\r\n]+/gis, (match: any) =>
        this.storeIgnoredLines(match),
      )
      .value();
  }

  async preserveCurlyBraceForJS(content: any) {
    return _.replace(content, /@{{(.*?)}}/gs, (match: any, p1: any) => this.storeCurlyBraceForJS(p1));
  }

  async preservePhpBlock(content: any) {
    return this.preserveRawPhpBlock(content).then((target) => this.preservePropsBlock(target));
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

  preserveInlineDirective(content: string): string {
    // preserve inline directives inside html tag
    const regex = new RegExp(
      `(<[\\w]+?[^>]*?)${directivePrefix}(${indentStartTokensWithoutPrefix.join(
        '|',
        // eslint-disable-next-line max-len
      )})(\\s*?)(${nestedParenthesisRegex})(.*?)(@end\\2)(.*?>)`,
      'gims',
    );
    const replaced = _.replace(
      content,
      regex,
      (
        _match: string,
        p1: string,
        p2: string,
        p3: string,
        p4: string,
        p5: string,
        p6: string,
        p7: string,
        p8: string,
      ) => {
        return `${p1}${this.storeInlineDirective(
          `${directivePrefix}${p2.trim()}${p3}${p4.trim()} ${p6.trim()} ${p7.trim()}`,
        )}${p8}`;
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
    return _.replace(content, /<script(.*?)>(.*?)<\/script>/gis, (_match: any, p1: any, p2: any) => {
      const targetTokens = [...indentStartTokens, ...inlineFunctionTokens];
      if (new RegExp(targetTokens.join('|'), 'gmi').test(p2) === false) {
        return `<script${p1}>${p2}</script>`;
      }

      const inlineFunctionDirectives = inlineFunctionTokens.join('|');
      const inlineFunctionRegex = new RegExp(
        // eslint-disable-next-line max-len
        `(?!\\/\\*.*?\\*\\/)(${inlineFunctionDirectives})(\\s*?)${nestedParenthesisRegex}`,
        'gmi',
      );

      // eslint-disable-next-line no-param-reassign
      p2 = _.replace(p2, inlineFunctionRegex, (match: any) =>
        this.storeBladeDirective(util.formatRawStringAsPhp(match)),
      );

      const directives = _.chain(indentStartTokens)
        .without('@switch', '@forelse', '@empty')
        .map((x: any) => _.replace(x, /@/, ''))
        .value();

      _.forEach(directives, (directive: any) => {
        try {
          const recursivelyMatched = xregexp.matchRecursive(p2, `\\@${directive}`, `\\@end${directive}`, 'gmi', {
            valueNames: [null, 'left', 'match', 'right'],
          });
          let output = '';

          if (_.isEmpty(recursivelyMatched)) {
            return;
          }

          _.forEach(recursivelyMatched, (r: any) => {
            output += r.value;
            if (r.name === 'right') {
              if (p2.includes(output)) {
                // eslint-disable-next-line no-param-reassign
                p2 = _.replace(p2, output, this.storeBladeDirective(output));
              }
              output = '';
            }
          });
        } catch (error) {
          throw new Error('directive in scripts parsing error');
        }
      });

      return `<script${p1}>${p2}</script>`;
    });
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
        `(?<=<.*?>)(${_.without(indentStartTokens, '@php').join('|')})(\\s*)${nestedParenthesisRegex}.*?(?=<.*?>)`,
        'gmis',
      ),
      (match) => {
        return `\n${match.trim()}\n`;
      },
    );

    // eslint-disable-next-line
    content = _.replace(
      content,
      new RegExp(`(?<=<.*?>).*?(${_.without(indentEndTokens, '@endphp').join('|')})(?=<.*?>)`, 'gmis'),
      (match) => {
        return `\n${match.trim()}\n`;
      },
    );

    const unbalancedConditions = ['@case', ...indentElseTokens];

    // eslint-disable-next-line
    content = _.replace(
      content,
      new RegExp(`(\\s*?)(${unbalancedConditions.join('|')})(\\s*?)${nestedParenthesisRegex}(\\s*)`, 'gmi'),
      (match) => {
        return `\n${match.trim()}\n`;
        // handle else directive
      },
    );

    // eslint-disable-next-line
    content = _.replace(
      content,
      new RegExp(`\\s*?(?!(${_.without(indentElseTokens, '@else').join('|')}))@else\\s+`, 'gim'),
      (match) => {
        return `\n${match.trim()}\n`;
        // handle case directive
      },
    );

    // eslint-disable-next-line
    content = _.replace(content, /@case\S*?\s*?@case/gim, (match) => {
      // handle unbalanced echos
      return `${match.replace('\n', '')}`;
    });

    const unbalancedEchos = ['@break'];

    _.forEach(unbalancedEchos, (directive) => {
      // eslint-disable-next-line
      content = _.replace(content, new RegExp(`(\\s*?)${directive}\\s*`, 'gmi'), (match) => {
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
              content = _.replace(content, matched.value, this.breakLineBeforeAndAfterDirective(matched.value));
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
            content = _.replace(content, matched.value, replaced);
          }
        }
      } catch (error) {
        // do nothing to ignore unmatched directive pair
      }
    });

    return content;
  }

  async preserveBladeComment(content: any) {
    return _.replace(content, /\{\{--(.*?)--\}\}/gs, (_match: any, p1: any) => this.storeBladeComment(p1));
  }

  async preserveBladeBrace(content: any) {
    return _.replace(content, /\{\{(.*?)\}\}/gs, (_match: any, p1: any) => this.storeBladeBrace(p1, p1.length));
  }

  async preserveRawBladeBrace(content: any) {
    return _.replace(content, /\{!!(.*?)!!\}/gs, (_match: any, p1: any) => this.storeRawBladeBrace(p1));
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

  async preserveRawPhpTags(content: any) {
    return _.replace(content, /<\?php(.*?)\?>/gms, (match: any) => this.storeRawPhpTags(match));
  }

  async preserveScripts(content: any) {
    return _.replace(content, /<script.*?>.*?<\/script>/gis, (match: any) => this.storeScripts(match));
  }

  async preserveClass(content: any) {
    return _.replace(
      content,
      /(\s*)class="(.*?)"(\s*)/gs,
      (_match: any, p1: any, p2: any, p3: any) => `${p1}class="${this.storeClass(p2)}"${p3}`,
    );
  }

  async preserveComponentAttribute(content: string) {
    return _.replace(
      content,
      /(?<=<x-[^<]*?\s):{1,2}(?<!=>)[\w\-_.]*?=(["'])(?!=>)[^]*?\1(?=[^>]*?\/*?>)/gim,
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
    return _.replace(content, /['"].*?['"]/gms, (match: string) => {
      return `${this.storeStringLiteralInPhp(match)}`;
    });
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

  storeBladeComment(value: any) {
    return this.getBladeCommentPlaceholder(this.bladeComments.push(value) - 1);
  }

  storeHtmlTag(value: string) {
    return this.getHtmlTagPlaceholder((this.htmlTags.push(value) - 1).toString());
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

  storeScripts(value: any) {
    const index = this.scripts.push(value) - 1;
    return this.getScriptPlaceholder(index);
  }

  storeClass(value: any) {
    const index = this.classes.push(value) - 1;

    if (value.length > 0) {
      return this.getClassPlaceholder(index, value.length);
    }

    return this.getClassPlaceholder(index, null);
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

  getIgnoredLinePlaceholder(replace: any) {
    return _.replace('___ignored_line_#___', '#', replace);
  }

  getCurlyBraceForJSPlaceholder(replace: any) {
    return _.replace('___js_curly_brace_#___', '#', replace);
  }

  getRawPlaceholder(replace: any) {
    return _.replace('@__raw_block_#__@', '#', replace);
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

  getBladeCommentPlaceholder(replace: any) {
    return _.replace('___blade_comment_#___', '#', replace);
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

  getScriptPlaceholder(replace: any) {
    return _.replace('<blade ___scripts_#___ />', '#', replace);
  }

  getHtmlTagPlaceholder(replace: string) {
    return _.replace('<blade ___html_tags_#___ />', '#', replace);
  }

  getClassPlaceholder(replace: any, length: any) {
    if (length && length > 0) {
      const template = '___class_#___';
      const gap = length - template.length;
      return _.replace(`___class${_.repeat('_', gap > 0 ? gap : 1)}#___`, '#', replace);
    }

    if (_.isNull(length)) {
      return _.replace('___class_#___', '#', replace);
    }

    return _.replace('___class_+?#___', '#', replace);
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

  restoreIgnoredLines(content: any) {
    return _.replace(
      content,
      new RegExp(`${this.getIgnoredLinePlaceholder('(\\d+)')}`, 'gm'),
      (_match: any, p1: any) => {
        return this.ignoredLines[p1];
      },
    );
  }

  restoreCurlyBraceForJS(content: any) {
    return _.replace(
      content,
      new RegExp(`${this.getCurlyBraceForJSPlaceholder('(\\d+)')}`, 'gm'),
      (_match: any, p1: any) => {
        return `@{{ ${beautify.js_beautify(this.curlyBracesWithJSs[p1].trim())} }}`;
      },
    );
  }

  restorePhpBlock(content: any) {
    return this.restoreRawPhpBlock(content).then((target) => this.restoreRawPropsBlock(target));
  }

  async restoreRawPhpBlock(content: any) {
    return _.replace(
      content,
      new RegExp(`^(.*?)${this.getRawPlaceholder('(\\d+)')}`, 'gm'),
      (match: any, p1: any, p2: any) => {
        let rawBlock = this.rawBlocks[p2];

        if (this.isInline(rawBlock) && this.isMultilineStatement(rawBlock)) {
          rawBlock = util.formatStringAsPhp(`<?php\n${rawBlock}\n?>`).trim();
        } else if (rawBlock.split('\n').length > 1) {
          rawBlock = util
            .formatStringAsPhp(`<?php${rawBlock}?>`)
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
            .trimRight('\n');
        } else {
          rawBlock = `<?php${rawBlock}?>`;
        }

        return _.replace(rawBlock, /^(\s*)?<\?php(.*?)\?>/gms, (_matched: any, _q1: any, q2: any) => {
          if (this.isInline(rawBlock)) {
            return `${p1}@php${q2}@endphp`;
          }

          const preserved = this.preserveStringLiteralInPhp(q2);
          const indented = this.indentRawBlock(p1, preserved);
          const restored = this.restoreStringLiteralInPhp(indented);

          return `${_.isEmpty(p1) ? '' : p1}@php${restored}@endphp`;
        });
      },
    );
  }

  async restoreRawPropsBlock(content: any) {
    const regex = this.getRawPropsPlaceholder('(\\d+)');
    return _.replace(
      content,
      new RegExp(regex, 'gms'),
      (_match: any, p1: any) => `@props(${util.formatRawStringAsPhp(this.rawPropsBlocks[p1]).trimRight()})`,
    );
  }

  isInline(content: any) {
    return _.split(content, '\n').length === 1;
  }

  isMultilineStatement(rawBlock: any) {
    return util.formatStringAsPhp(`<?php${rawBlock}?>`).trimRight().split('\n').length > 1;
  }

  indentRawBlock(spaces: any, content: any) {
    if (_.isEmpty(spaces)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${spaces}${content}`;
    }

    const leftIndentAmount = detectIndent(spaces).amount;
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
      .join('\n');
  }

  indentBladeDirectiveBlock(prefix: any, content: any) {
    if (_.isEmpty(prefix)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${prefix}${content}`;
    }

    const leftIndentAmount = detectIndent(prefix).amount;
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

  indentScriptBlock(prefix: any, content: any) {
    if (_.isEmpty(prefix)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${prefix}${content}`;
    }

    const leftIndentAmount = detectIndent(prefix).amount;
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

    return this.restoreTemplatingString(`${prefix}${indented}`);
  }

  indentRawPhpBlock(prefix: any, content: any) {
    if (_.isEmpty(prefix)) {
      return content;
    }

    if (this.isInline(content) && /\s/.test(prefix)) {
      return `${prefix}${content}`;
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

  restoreBladeDirectivesInScripts(content: any) {
    const regex = new RegExp(`^(.*?)${this.getBladeDirectivePlaceholder('(\\d+)')}`, 'gm');

    let result = _.replace(content, regex, (_match: any, p1: any, p2: any) =>
      this.indentBladeDirectiveBlock(p1, this.bladeDirectives[p2]),
    );

    if (regex.test(content)) {
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
      _.replace(
        res,
        new RegExp(`${this.getBladeCommentPlaceholder('(\\d+)')}`, 'gms'),
        (_match: any, p1: any) => `{{-- ${this.bladeComments[p1].trim()} --}}`,
      ),
    );
  }

  restoreBladeBrace(content: any) {
    return new Promise((resolve) => resolve(content)).then((res: any) =>
      _.replace(
        res,
        new RegExp(`(.*?)${this.getBladeBracePlaceholder('(\\d+)')}`, 'gm'),
        (_match: any, p1: any, p2: any) => {
          const bladeBrace = this.bladeBraces[p2];

          if (bladeBrace.trim() === '') {
            return `${p1}{{${bladeBrace}}}`;
          }

          if (this.isInline(bladeBrace)) {
            return `${p1}{{ ${util
              .formatRawStringAsPhp(bladeBrace, 120, false)
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .split('\n')
              .map((line) => line.trim())
              .join('')
              // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
              .trimRight('\n')} }}`;
          }

          return `${p1}{{ ${this.indentRawPhpBlock(
            p1,
            util
              .formatRawStringAsPhp(bladeBrace, 120, true)
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .trim()
              // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
              .trimRight('\n'),
          )} }}`;
        },
      ),
    );
  }

  restoreRawBladeBrace(content: any) {
    return new Promise((resolve) => resolve(content)).then((res) =>
      _.replace(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
        res,
        new RegExp(`${this.getRawBladeBracePlaceholder('(\\d+)')}`, 'gms'),
        (_match: any, p1: any) => {
          const bladeBrace = this.rawBladeBraces[p1];

          if (bladeBrace.trim() === '') {
            return `{!!${bladeBrace}!!}`;
          }

          return `{!! ${util
            .formatRawStringAsPhp(bladeBrace)
            .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
            .trim()
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
            .trimRight('\n')} !!}`;
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
        const matched = this.conditions[p1];
        return util
          .formatRawStringAsPhp(matched)
          .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
          .trimEnd();
      }),
    );
  }

  restoreInlinePhpDirective(content: any) {
    return new Promise((resolve) => resolve(content)).then((res) =>
      _.replace(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
        res,
        new RegExp(`(.*?)${this.getInlinePhpPlaceholder('(\\d+)')}`, 'gm'),
        (_match: any, p1: any, p2: any) => {
          const matched = this.inlinePhpDirectives[p2];

          if (matched.includes('@php')) {
            return `${p1}${util
              .formatRawStringAsPhp(matched)
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .trim()
              // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
              .trimRight('\n')}`;
          }

          if (/(@button|@class|@include)/gi.test(matched)) {
            const formatted = _.replace(matched, /@(button|class|include)(.*)/gis, (match2: any, p3: any, p4: any) => {
              let wrapLength;

              if (['button', 'class'].includes(p3)) {
                wrapLength = 80;
              }

              if (p3 === 'include') {
                const matchedViewName = matched.match(/@include\s*?\(\s*?['"](.*?)['"]\s*?/i);
                const includeViewName: string = _.nth(matchedViewName, 1) ?? '';

                wrapLength = this.wrapLineLength + `func_inline_for_${p3}`.length - p1.length - includeViewName.length;
              }

              const inside = util
                .formatRawStringAsPhp(`func_inline_for_${p3}${p4}`, wrapLength, true)
                .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
                .replace(/,(\s*?\))/gis, (_match5, p5) => p5)
                .trim()
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
                .trimRight('\n');

              if (this.isInline(inside)) {
                return `${this.indentRawPhpBlock(p1, `@${inside}`.replace('func_inline_for_', ''))}`;
              }

              return `${p1}${this.indentRawPhpBlock(p1, `@${inside}`.replace('func_inline_for_', ''))}`;
            });

            return formatted;
          }

          return `${p1}${util.formatRawStringAsPhp(matched).trimEnd()}`;
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

            if (inlinedComment) {
              return matched;
            }

            const result = util
              .formatStringAsPhp(this.rawPhpTags[p1])
              .trim()
              // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
              .trimRight('\n');

            if (this.isInline(result)) {
              return result;
            }

            // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
            const whiteSpaceAhead = res.match(new RegExp(`^(\\s*?)[^\\s]*?${this.getRawPhpTagPlaceholder(p1)}`, 'ms'));

            if (whiteSpaceAhead) {
              return this.indentRawPhpBlock(whiteSpaceAhead[1], result);
            }

            return result;
          } catch (e) {
            return `${this.rawPhpTags[p1]}`;
          }
        },
      ),
    );
  }

  restoreScripts(content: any) {
    return new Promise((resolve) => resolve(content)).then((res) =>
      _.replace(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
        res,
        new RegExp(`^(.*?)${this.getScriptPlaceholder('(\\d+)')}`, 'gim'),
        (_match: any, p1: any, p2: any) => {
          const script = this.scripts[p2];
          const options = {
            indent_size: util.optional(this.options).indentSize || 4,
            wrap_line_length: util.optional(this.options).wrapLineLength || 120,
            wrap_attributes: util.optional(this.options).wrapAttributes || 'auto',
            wrap_attributes_indent_size: p1.length,
            end_with_newline: false,
            templating: ['php'],
          };
          return this.indentScriptBlock(p1, beautify.html_beautify(script, options));
        },
      ),
    );
  }

  async restoreHtmlTags(content: any) {
    return _.replace(
      content,
      new RegExp(`(.*?)${this.getHtmlTagPlaceholder('(\\d+)')}`, 'gim'),
      (_match: any, p1: string, p2: number) => {
        const options = {
          indent_size: util.optional(this.options).indentSize || 4,
          wrap_line_length: util.optional(this.options).wrapLineLength || 120,
          wrap_attributes: util.optional(this.options).wrapAttributes || 'auto',
          wrap_attributes_indent_size: p1.length + (util.optional(this.options).indentSize || 4) * 1,
          end_with_newline: false,
          templating: ['php'],
        };

        return `${p1}${beautify.html_beautify(this.htmlTags[p2], options)}`;
      },
    );
  }

  restoreClass(content: any) {
    return _.replace(
      content,
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      new RegExp(`${this.getClassPlaceholder('(\\d+)')}`, 'gms'),
      (_match: any, p1: any) => this.classes[p1],
    );
  }

  restoreXData(content: any) {
    return _.replace(
      content,
      new RegExp(`^(.*?)${this.getXDataPlaceholder('(\\d+)')}`, 'gm'),
      (_match: any, p1: any, p2: any) => {
        const offsetLine = p1.split('\n').pop();
        const [, offset] = /(\s*)[^\s]+/g.exec(offsetLine) ?? [];

        const lines = this.formatJS(this.xData[p2]).split('\n');

        const indentLevel = offset.length / (this.indentCharacter === '\t' ? 4 : 1);

        const firstLine = lines[0];
        const prefix = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel);
        const offsettedLines = lines.map((line) => prefix + line);
        offsettedLines[0] = firstLine;
        return `${p1}${offsettedLines.join('\n')}`;
      },
    );
  }

  restoreXInit(content: any) {
    return _.replace(
      content,
      new RegExp(`^(.*?)${this.getXInitPlaceholder('(\\d+)')}`, 'gm'),
      (_match: any, p1: any, p2: any) => {
        const offsetLine = p1.split('\n').pop();
        const [, offset] = /(\s*)[^\s]+/g.exec(offsetLine) ?? [];

        const lines = this.formatJS(this.xInit[p2]).split('\n');

        const indentLevel = offset.length / (this.indentCharacter === '\t' ? 4 : 1);

        const firstLine = lines[0];
        const prefix = this.indentCharacter.repeat(indentLevel < 0 ? 0 : indentLevel);
        const offsettedLines = lines.map((line) => prefix + line);
        offsettedLines[0] = firstLine;
        return `${p1}${offsettedLines.join('\n')}`;
      },
    );
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
                return `${p2}${p3}${util.formatRawStringAsPhp(p4, this.wrapLineLength - indent.amount).trimEnd()}`;
              } catch (error) {
                return `${p2}${p3}${p4}`;
              }
            }

            return `${p2}${p3}${util.formatRawStringAsPhp(p4, this.wrapLineLength - indent.amount).trimEnd()}`;
          },
        );

        return `${this.indentComponentAttribute(indent.indent, formatted)}`;
      },
    );
  }

  async formatAsBlade(content: any) {
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

    return this.result.join(os.EOL);
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
