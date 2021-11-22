/* eslint-disable class-methods-use-this */
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
} from './indent';
import * as util from './util';
import * as vsctm from './vsctm';

const os = require('os');
const beautify = require('js-beautify').html;
const _ = require('lodash');
const vscodeTmModule = require('vscode-textmate');
const detectIndent = require('detect-indent');
const Aigle = require('aigle');
const { matchRecursive } = require('xregexp');

export default class Formatter {
  constructor(options) {
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
    this.rawBlocks = [];
    this.rawPhpTags = [];
    this.inlineDirectives = [];
    this.inlinePhpDirectives = [];
    this.rawPropsBlocks = [];
    this.bladeDirectives = [];
    this.bladeComments = [];
    this.bladeBraces = [];
    this.rawBladeBraces = [];
    this.scripts = [];
    this.classes = [];
    this.templatingStrings = [];
    this.result = [];
    this.diffs = [];
  }

  formatContent(content) {
    return new Promise((resolve) => resolve(content))
      .then((target) => this.preserveRawPhpTags(target))
      .then((target) => util.formatAsPhp(target))
      .then((formattedAsPhp) => this.preserveBladeComment(formattedAsPhp))
      .then((formattedAsPhp) => this.preserveBladeBrace(formattedAsPhp))
      .then((formattedAsPhp) => this.preserveRawBladeBrace(formattedAsPhp))
      .then((formattedAsPhp) => this.preserveInlineDirective(formattedAsPhp))
      .then((formattedAsPhp) => this.preserveInlinePhpDirective(formattedAsPhp))
      .then((formattedAsPhp) =>
        this.preserveBladeDirectivesInScripts(formattedAsPhp),
      )
      .then(async (formattedAsPhp) => {
        this.bladeDirectives = await this.formatPreservedBladeDirectives(
          this.bladeDirectives,
        );
        return formattedAsPhp;
      })
      .then((formattedAsPhp) => this.preserveScripts(formattedAsPhp))
      .then((formattedAsPhp) => this.preserveClass(formattedAsPhp))
      .then((formattedAsPhp) => this.formatAsHtml(formattedAsPhp))
      .then((formattedAsPhp) => this.formatAsBlade(formattedAsPhp))
      .then((formattedAsPhp) => this.restoreClass(formattedAsPhp))
      .then((formattedAsBlade) => this.restoreScripts(formattedAsBlade))
      .then((formattedAsPhp) =>
        this.restoreBladeDirectivesInScripts(formattedAsPhp),
      )
      .then((formattedAsBlade) =>
        this.restoreInlinePhpDirective(formattedAsBlade),
      )
      .then((formattedAsBlade) => this.restoreInlineDirective(formattedAsBlade))
      .then((formattedAsBlade) => this.restoreRawBladeBrace(formattedAsBlade))
      .then((formattedAsBlade) => this.restoreBladeBrace(formattedAsBlade))
      .then((formattedAsBlade) => this.restoreBladeComment(formattedAsBlade))
      .then((target) => this.restoreRawPhpTags(target))
      .then((formattedResult) => util.checkResult(formattedResult));
  }

  formatAsHtml(data) {
    const options = {
      indent_size: util.optional(this.options).indentSize || 4,
      wrap_line_length: util.optional(this.options).wrapLineLength || 120,
      wrap_attributes: util.optional(this.options).wrapAttributes || 'auto',
      end_with_newline: util.optional(this.options).endWithNewline || true,
    };

    const promise = new Promise((resolve) => resolve(data))
      .then((content) => this.preservePhpBlock(content))
      .then((content) => util.preserveDirectives(content))
      .then((preserved) => beautify(preserved, options))
      .then((content) => util.revertDirectives(content, this.options))
      .then((content) => this.restorePhpBlock(content));

    return Promise.resolve(promise);
  }

  async preservePhpBlock(content) {
    return this.preserveRawPhpBlock(content).then((target) => {
      return this.preservePropsBlock(target);
    });
  }

  async preservePropsBlock(content) {
    return _.replace(
      content,
      /@props\(((?:[^\\(\\)]|\([^\\(\\)]*\))*)\)/gs,
      (match, p1) => {
        return this.storeRawPropsBlock(p1);
      },
    );
  }

  async preserveRawPhpBlock(content) {
    return _.replace(content, /(?<!@)@php(.*?)@endphp/gs, (match, p1) => {
      return this.storeRawBlock(p1);
    });
  }

  async preserveInlineDirective(content) {
    const regex = new RegExp(
      `(?!\\/\\*.*?\\*\\/)(${phpKeywordStartTokens.join(
        '|',
        // eslint-disable-next-line max-len
      )}).*(${phpKeywordEndTokens.join('|')})`,
      'gim',
    );
    return _.replace(content, regex, (match) => {
      return this.storeInlineDirective(match);
    });
  }

  async preserveInlinePhpDirective(content) {
    return _.replace(
      content,
      // eslint-disable-next-line max-len
      /(?!\/\*.*?\*\/)(@php|@class|@button)(\s*?)\(((?:[^)(]+|\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)))*\)/gms,
      (match) => {
        return this.storeInlinePhpDirective(match);
      },
    );
  }

  preserveBladeDirectivesInScripts(content) {
    return _.replace(
      content,
      /<script(.*?)>(.*?)<\/script>/gis,
      (_match, p1, p2) => {
        const targetTokens = [...indentStartTokens, ...inlineFunctionTokens];
        if (new RegExp(targetTokens.join('|'), 'gmi').test(p2) === false) {
          return `<script${p1}>${p2}</script>`;
        }

        const inlineFunctionDirectives = inlineFunctionTokens.join('|');
        const inlineFunctionRegex = new RegExp(
          // eslint-disable-next-line max-len
          `(?!\\/\\*.*?\\*\\/)(${inlineFunctionDirectives})(\\s*?)\\(((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))*)\\)`,
          'gmi',
        );

        // eslint-disable-next-line no-param-reassign
        p2 = _.replace(p2, inlineFunctionRegex, (match) => {
          return this.storeBladeDirective(util.formatRawStringAsPhp(match));
        });

        const directives = _.chain(indentStartTokens)
          .without('@switch', '@forelse', '@empty')
          .map((x) => _.replace(x, /@/, ''))
          .value();

        _.forEach(directives, (directive) => {
          try {
            const recursivelyMatched = matchRecursive(
              p2,
              `\\@${directive}`,
              `\\@end${directive}`,
              'gmi',
              {
                valueNames: [null, 'left', 'match', 'right'],
              },
            );
            let output = '';

            if (_.isEmpty(recursivelyMatched)) {
              return;
            }

            _.forEach(recursivelyMatched, (r) => {
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
      },
    );
  }

  async preserveBladeComment(content) {
    return _.replace(content, /\{\{--(.*?)--\}\}/gs, (_match, p1) => {
      return this.storeBladeComment(p1);
    });
  }

  async preserveBladeBrace(content) {
    return _.replace(content, /\{\{(.*?)\}\}/gs, (_match, p1) => {
      return this.storeBladeBrace(p1, p1.length);
    });
  }

  async preserveRawBladeBrace(content) {
    return _.replace(content, /\{!!(.*?)!!\}/gs, (_match, p1) => {
      return this.storeRawBladeBrace(p1);
    });
  }

  async preserveRawPhpTags(content) {
    return _.replace(content, /<\?php(.*?)\?>/gms, (match) => {
      return this.storeRawPhpTags(match);
    });
  }

  async preserveScripts(content) {
    return _.replace(content, /<script.*?>.*?<\/script>/gis, (match) => {
      return this.storeScripts(match);
    });
  }

  async preserveClass(content) {
    return _.replace(
      content,
      /(\s*)class="(.*?)"(\s*)/gs,
      (_match, p1, p2, p3) => {
        return `${p1}class="${this.storeClass(p2)}"${p3}`;
      },
    );
  }

  storeRawBlock(value) {
    return this.getRawPlaceholder(this.rawBlocks.push(value) - 1);
  }

  storeInlineDirective(value) {
    return this.getInlinePlaceholder(this.inlineDirectives.push(value) - 1);
  }

  storeInlinePhpDirective(value) {
    return this.getInlinePhpPlaceholder(
      this.inlinePhpDirectives.push(value) - 1,
    );
  }

  storeRawPropsBlock(value) {
    return this.getRawPropsPlaceholder(this.rawPropsBlocks.push(value) - 1);
  }

  storeBladeDirective(value) {
    return this.getBladeDirectivePlaceholder(
      this.bladeDirectives.push(value) - 1,
    );
  }

  storeBladeComment(value) {
    return this.getBladeCommentPlaceholder(this.bladeComments.push(value) - 1);
  }

  storeBladeBrace(value, length) {
    const index = this.bladeBraces.push(value) - 1;
    const brace = '{{  }}';
    return this.getBladeBracePlaceholder(index, length + brace.length);
  }

  storeRawBladeBrace(value) {
    const index = this.rawBladeBraces.push(value) - 1;
    return this.getRawBladeBracePlaceholder(index);
  }

  storeRawPhpTags(value) {
    const index = this.rawPhpTags.push(value) - 1;
    return this.getRawPhpTagPlaceholder(index);
  }

  storeScripts(value) {
    const index = this.scripts.push(value) - 1;
    return this.getScriptPlaceholder(index);
  }

  storeClass(value) {
    const index = this.classes.push(value) - 1;

    if (value.length > 0) {
      return this.getClassPlaceholder(index, value.length);
    }

    return this.getClassPlaceholder(index, null);
  }

  storeTemplatingString(value) {
    const index = this.templatingStrings.push(value) - 1;
    return this.getTemplatingStringPlaceholder(index);
  }

  getRawPlaceholder(replace) {
    return _.replace('@__raw_block_#__@', '#', replace);
  }

  getInlinePlaceholder(replace) {
    return _.replace('___inline_directive_#___', '#', replace);
  }

  getInlinePhpPlaceholder(replace) {
    return _.replace('___inline_php_directive_#___', '#', replace);
  }

  getRawPropsPlaceholder(replace) {
    return _.replace('@__raw_props_block_#__@', '#', replace);
  }

  getBladeDirectivePlaceholder(replace) {
    return _.replace('___blade_directive_#___', '#', replace);
  }

  getBladeCommentPlaceholder(replace) {
    return _.replace('___blade_comment_#___', '#', replace);
  }

  getBladeBracePlaceholder(replace, length = 0) {
    if (length > 0) {
      const template = '___blade_brace_#___';
      const gap = length - template.length;
      return _.replace(
        `___blade_brace_${_.repeat('_', gap > 0 ? gap : 0)}#___`,
        '#',
        replace,
      );
    }

    return _.replace('___blade_brace_+?#___', '#', replace);
  }

  getRawBladeBracePlaceholder(replace) {
    return _.replace('___raw_blade_brace_#___', '#', replace);
  }

  getRawPhpTagPlaceholder(replace) {
    return _.replace('___raw_php_tag_#___', '#', replace);
  }

  getScriptPlaceholder(replace) {
    return _.replace('___scripts_#___', '#', replace);
  }

  getClassPlaceholder(replace, length) {
    if (length && length > 0) {
      const template = '___class_#___';
      const gap = length - template.length;
      return _.replace(
        `___class${_.repeat('_', gap > 0 ? gap : 1)}#___`,
        '#',
        replace,
      );
    }

    if (_.isNull(length)) {
      return _.replace('___class_#___', '#', replace);
    }

    return _.replace('___class_+?#___', '#', replace);
  }

  getTemplatingStringPlaceholder(replace) {
    return _.replace('___templating_str_#___', '#', replace);
  }

  restorePhpBlock(content) {
    return this.restoreRawPhpBlock(content).then((target) => {
      return this.restoreRawPropsBlock(target);
    });
  }

  async restoreRawPhpBlock(content) {
    return _.replace(
      content,
      new RegExp(`^(.*?)${this.getRawPlaceholder('(\\d+)')}`, 'gm'),
      (match, p1, p2) => {
        let rawBlock = this.rawBlocks[p2];

        if (this.isInline(rawBlock) && this.isMultilineStatement(rawBlock)) {
          rawBlock = util.formatStringAsPhp(`<?php\n${rawBlock}\n?>`).trim();
        } else if (rawBlock.split('\n').length > 1) {
          rawBlock = util
            .formatStringAsPhp(`<?php${rawBlock}?>`)
            .trimRight('\n');
        } else {
          rawBlock = `<?php${rawBlock}?>`;
        }

        return _.replace(
          rawBlock,
          /^(\s*)?<\?php(.*?)\?>/gms,
          (_matched, _q1, q2) => {
            if (this.isInline(rawBlock)) {
              return `${p1}@php${q2}@endphp`;
            }

            return `${_.isEmpty(p1) ? '' : p1}@php${this.indentRawBlock(
              p1,
              q2,
            )}@endphp`;
          },
        );
      },
    );
  }

  async restoreRawPropsBlock(content) {
    const regex = this.getRawPropsPlaceholder('(\\d+)');
    return _.replace(content, new RegExp(regex, 'gms'), (_match, p1) => {
      return `@props(${util
        .formatRawStringAsPhp(this.rawPropsBlocks[p1])
        .trimRight('\n')})`;
    });
  }

  isInline(content) {
    return _.split(content, '\n').length === 1;
  }

  isMultilineStatement(rawBlock) {
    return (
      util.formatStringAsPhp(`<?php${rawBlock}?>`).trimRight('\n').split('\n')
        .length > 1
    );
  }

  indentRawBlock(spaces, content) {
    if (_.isEmpty(spaces)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${spaces}${content}`;
    }

    const leftIndentAmount = detectIndent(spaces).amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefix = this.indentCharacter.repeat(
      indentLevel < 0 ? 0 : (indentLevel + 1) * this.indentSize,
    );
    const prefixForEnd = this.indentCharacter.repeat(
      indentLevel < 0 ? 0 : indentLevel * this.indentSize,
    );

    const lines = content.split('\n');

    return _.chain(lines)
      .map((line, index) => {
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

  indentBladeDirectiveBlock(prefix, content) {
    if (_.isEmpty(prefix)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${prefix}${content}`;
    }

    const leftIndentAmount = detectIndent(prefix).amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefixSpaces = this.indentCharacter.repeat(
      indentLevel < 0 ? 0 : indentLevel * this.indentSize,
    );
    const prefixForEnd = this.indentCharacter.repeat(
      indentLevel < 0 ? 0 : indentLevel * this.indentSize,
    );

    const lines = content.split('\n');

    return _.chain(lines)
      .map((line, index) => {
        if (index === lines.length - 1) {
          return prefixForEnd + line;
        }

        return prefixSpaces + line;
      })
      .value()
      .join('\n');
  }

  indentScriptBlock(prefix, content) {
    if (_.isEmpty(prefix)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${prefix}${content}`;
    }

    const leftIndentAmount = detectIndent(prefix).amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefixSpaces = this.indentCharacter.repeat(
      indentLevel < 0 ? 0 : indentLevel * this.indentSize,
    );
    const prefixForEnd = this.indentCharacter.repeat(
      indentLevel < 0 ? 0 : indentLevel * this.indentSize,
    );

    const preserved = _.replace(content, /`.*?`/gs, (match) => {
      return this.storeTemplatingString(match);
    });

    const lines = preserved.split('\n');

    const indented = _.chain(lines)
      .map((line, index) => {
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

    return this.restoreTemplatingString(indented);
  }

  indentRawPhpBlock(prefix, content) {
    if (_.isEmpty(prefix)) {
      return content;
    }

    if (this.isInline(content)) {
      return `${prefix}${content}`;
    }

    const leftIndentAmount = detectIndent(prefix).amount;
    const indentLevel = leftIndentAmount / this.indentSize;
    const prefixSpaces = this.indentCharacter.repeat(
      indentLevel < 0 ? 0 : indentLevel * this.indentSize,
    );

    const lines = content.split('\n');

    return _.chain(lines)
      .map((line, index) => {
        if (index === 0) {
          return line.trim();
        }

        return prefixSpaces + line;
      })
      .value()
      .join('\n');
  }

  restoreBladeDirectivesInScripts(content) {
    const regex = new RegExp(
      `^(.*?)${this.getBladeDirectivePlaceholder('(\\d+)')}`,
      'gm',
    );

    let result = _.replace(content, regex, (_match, p1, p2) => {
      return this.indentBladeDirectiveBlock(p1, this.bladeDirectives[p2]);
    });

    if (regex.test(content)) {
      result = this.restoreBladeDirectivesInScripts(result);
    }

    return result;
  }

  async formatPreservedBladeDirectives(directives) {
    return Aigle.map(directives, async (content) => {
      const formattedAsHtml = await this.formatAsHtml(content);
      const formatted = await this.formatAsBlade(formattedAsHtml);
      return formatted.trimRight('\n');
    });
  }

  restoreBladeComment(content) {
    return new Promise((resolve) => resolve(content)).then((res) => {
      return _.replace(
        res,
        new RegExp(`${this.getBladeCommentPlaceholder('(\\d+)')}`, 'gms'),
        (_match, p1) => {
          return `{{-- ${this.bladeComments[p1].trim()} --}}`;
        },
      );
    });
  }

  restoreBladeBrace(content) {
    return new Promise((resolve) => resolve(content)).then((res) => {
      return _.replace(
        res,
        new RegExp(`(.*?)${this.getBladeBracePlaceholder('(\\d+)')}`, 'gm'),
        (_match, p1, p2) => {
          const bladeBrace = this.bladeBraces[p2];

          if (bladeBrace.trim() === '') {
            return `${p1}{{${bladeBrace}}}`;
          }

          if (this.isInline(bladeBrace)) {
            return `${p1}{{ ${util
              .formatRawStringAsPhp(bladeBrace)
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .trim()
              .trimRight('\n')} }}`;
          }

          return `${p1}{{ ${this.indentRawPhpBlock(
            p1,
            util
              .formatRawStringAsPhp(bladeBrace)
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .trim()
              .trimRight('\n'),
          )} }}`;
        },
      );
    });
  }

  restoreRawBladeBrace(content) {
    return new Promise((resolve) => resolve(content)).then((res) => {
      return _.replace(
        res,
        new RegExp(`${this.getRawBladeBracePlaceholder('(\\d+)')}`, 'gms'),
        (_match, p1) => {
          const bladeBrace = this.rawBladeBraces[p1];

          if (bladeBrace.trim() === '') {
            return `{!!${bladeBrace}!!}`;
          }

          return `{!! ${util
            .formatRawStringAsPhp(bladeBrace)
            .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
            .trim()
            .trimRight('\n')} !!}`;
        },
      );
    });
  }

  restoreInlineDirective(content) {
    return new Promise((resolve) => resolve(content)).then((res) => {
      return _.replace(
        res,
        new RegExp(`${this.getInlinePlaceholder('(\\d+)')}`, 'gms'),
        (_match, p1) => {
          const matched = this.inlineDirectives[p1];
          return matched;
        },
      );
    });
  }

  restoreInlinePhpDirective(content) {
    return new Promise((resolve) => resolve(content)).then((res) => {
      return _.replace(
        res,
        new RegExp(`(.*?)${this.getInlinePhpPlaceholder('(\\d+)')}`, 'gm'),
        (_match, p1, p2) => {
          const matched = this.inlinePhpDirectives[p2];

          if (matched.includes('@php')) {
            return `${p1}${util
              .formatRawStringAsPhp(matched)
              .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
              .trim()
              .trimRight('\n')}`;
          }

          if (matched.includes('@button')) {
            const formatted = _.replace(
              matched,
              /@(button)(.*)/gis,
              (match2, p3, p4) => {
                const inside = util
                  .formatRawStringAsPhp(`func_inline_for_${p3}${p4}`, 80, true)
                  .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
                  .trim()
                  .trimRight('\n');

                if (this.isInline(inside)) {
                  return `${this.indentRawPhpBlock(
                    p1,
                    `@${inside}`.replace('func_inline_for_', ''),
                  )}`;
                }

                return `${p1}${this.indentRawPhpBlock(
                  p1,
                  `@${inside}`.replace('func_inline_for_', ''),
                )}`;
              },
            );

            return formatted;
          }

          if (matched.includes('@class')) {
            const formatted = _.replace(
              matched,
              /@(class)(.*)/gis,
              (match2, p4, p5) => {
                const inside = util
                  .formatRawStringAsPhp(`func_inline_for_${p4}${p5}`, 80, true)
                  .replace(/([\n\s]*)->([\n\s]*)/gs, '->')
                  .trim()
                  .trimRight('\n');

                if (this.isInline(inside)) {
                  return `${this.indentRawPhpBlock(
                    p1,
                    `@${inside}`.replace('func_inline_for_', ''),
                  )}`;
                }

                return `${p1}${this.indentRawPhpBlock(
                  p1,
                  `@${inside}`.replace('func_inline_for_', ''),
                )}`;
              },
            );

            return formatted;
          }

          return `${p1}${matched}`;
        },
      );
    });
  }

  restoreRawPhpTags(content) {
    return new Promise((resolve) => resolve(content)).then((res) => {
      return _.replace(
        res,
        new RegExp(`${this.getRawPhpTagPlaceholder('(\\d+)')}`, 'gms'),
        (_match, p1) => {
          // const result= this.rawPhpTags[p1];
          try {
            const result = util
              .formatStringAsPhp(this.rawPhpTags[p1])
              .trim()
              .trimRight('\n');

            if (this.isInline(result)) {
              return result;
            }

            const whiteSpaceAhead = res.match(
              new RegExp(
                `^(\\s*?)[^\\s]*?${this.getRawPhpTagPlaceholder(p1)}`,
                'ms',
              ),
            );

            if (whiteSpaceAhead) {
              return this.indentRawPhpBlock(whiteSpaceAhead[1], result);
            }

            return result;
          } catch (e) {
            return `${this.rawPhpTags[p1]}`;
          }
        },
      );
    });
  }

  restoreScripts(content) {
    return new Promise((resolve) => resolve(content)).then((res) => {
      return _.replace(
        res,
        new RegExp(`^(.*?)${this.getScriptPlaceholder('(\\d+)')}`, 'gim'),
        (_match, p1, p2) => {
          const script = this.scripts[p2];
          const options = {
            indent_size: util.optional(this.options).indentSize || 4,
            wrap_line_length: util.optional(this.options).wrapLineLength || 120,
            wrap_attributes:
              util.optional(this.options).wrapAttributes || 'auto',
            wrap_attributes_indent_size: p1.length,
            end_with_newline: false,
            templating: ['php'],
          };
          return this.indentScriptBlock(p1, beautify(script, options));
        },
      );
    });
  }

  restoreClass(content) {
    return _.replace(
      content,
      new RegExp(`${this.getClassPlaceholder('(\\d+)')}`, 'gms'),
      (_match, p1) => {
        return this.classes[p1];
      },
    );
  }

  restoreTemplatingString(content) {
    return _.replace(
      content,
      new RegExp(`${this.getTemplatingStringPlaceholder('(\\d+)')}`, 'gms'),
      (_match, p1) => {
        return this.templatingStrings[p1];
      },
    );
  }

  async formatAsBlade(content) {
    const splitedLines = util.splitByLines(content);
    const vsctmModule = await new vsctm.VscodeTextmate(
      this.vsctm,
      this.oniguruma,
    );
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
    this.result = [];
    this.stack = [];
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
      if (_.last(this.stack) === '@case' && token === '@case') {
        this.currentIndentLevel -= 1;
        return;
      }

      this.stack.push(token);
      return;
    }

    if (_.includes(phpKeywordEndTokens, token)) {
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
        this.currentIndentLevel -= 1;
        this.shouldBeIndent = true;
      }
    }

    if (_.includes(indentStartTokens, token)) {
      if (_.last(this.stack) === '@section' && token === '@section') {
        if (this.currentIndentLevel > 0) this.currentIndentLevel -= 1;
        this.shouldBeIndent = true;
      } else {
        this.shouldBeIndent = true;
        this.stack.push(token);
      }
    }

    if (_.includes(indentEndTokens, token)) {
      if (_.last(this.stack) === '@default') {
        this.currentIndentLevel -= 1;
      }

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

    if (this.argumentCheck) {
      const { count, inString, stack } = this.argumentCheck;
      if (!inString && token === ')') {
        stack.push(token);
        count[token] += 1;
        if (count['('] === count[token]) {
          // finished
          const expression = stack.join('');
          const argumentCount = util.getArgumentsCount(expression);
          if (argumentCount >= this.argumentCheck.unindentOn)
            this.shouldBeIndent = false;
          this.argumentCheck = false;
        }
        return;
      }
      stack.push(token);
      if (inString === token) this.argumentCheck.inString = false;
      else if (!inString && (token === '"' || token === "'"))
        this.argumentCheck.inString = token;
      if (token === '(' && !inString) count[token] += 1;
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
    if (
      _.includes(
        Object.keys(optionalStartWithoutEndTokens),
        token.toLowerCase(),
      )
    ) {
      this.argumentCheck = {
        unindentOn: optionalStartWithoutEndTokens[token.toLowerCase()],
        stack: [],
        inString: false,
        count: { '(': 0, ')': 0 },
      };
    }
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
