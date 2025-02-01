/* eslint-disable class-methods-use-this */

import detectIndent from "detect-indent";
import _ from "lodash";
import * as vscodeTmModule from "vscode-textmate";
import constants from "./constants";
import { FormatContentPipeline } from "./formatContentPipeline";
import {
	hasStartAndEndToken,
	indentElseTokens,
	indentEndTokens,
	indentStartAndEndTokens,
	indentStartOrElseTokens,
	indentStartTokens,
	optionalStartWithoutEndTokens,
	phpKeywordEndTokens,
	phpKeywordStartTokens,
	tokenForIndentStartOrElseTokens,
} from "./indent";
import type { BladeFormatterOption, CLIOption, FormatterOption } from "./main";
import * as util from "./util";

export default class Formatter {
	argumentCheck: any;

	currentIndentLevel: number;

	diffs: any;

	indentCharacter: any;

	indentSize: any;

	oniguruma: any;

	options: FormatterOption & CLIOption;

	result: any;

	shouldBeIndent: any;

	stack: any;

	vsctm: any;

	wrapAttributes: any;

	wrapLineLength: any;

	isInsideCommentBlock: boolean;

	defaultPhpFormatOption: util.FormatPhpOption;

	endOfLine: string;

	constructor(options: BladeFormatterOption) {
		this.initializeOptions(options);
		this.initializeProperties();
	}

	initializeOptions(options: BladeFormatterOption) {
		this.options = {
			...{
				noPhpSyntaxCheck: false,
				trailingCommaPHP: !options.noTrailingCommaPhp,
				printWidth: options.wrapLineLength || constants.defaultPrintWidth,
			},
			...options,
		};
		this.vsctm = util.optional(this.options).vsctm || vscodeTmModule;
		this.oniguruma = util.optional(this.options).oniguruma;
		this.indentCharacter = util.optional(this.options).useTabs ? "\t" : " ";
		this.indentSize = util.optional(this.options).indentSize || 4;
		this.wrapLineLength =
			util.optional(this.options).wrapLineLength || constants.defaultPrintWidth;
		this.wrapAttributes = util.optional(this.options).wrapAttributes || "auto";
		this.endOfLine = util.getEndOfLine(util.optional(this.options).endOfLine);
	}

	initializeProperties() {
		this.currentIndentLevel = 0;
		this.shouldBeIndent = false;
		this.isInsideCommentBlock = false;
		this.stack = [];
		this.result = [];
		this.diffs = [];
		this.defaultPhpFormatOption = {
			noPhpSyntaxCheck: this.options.noPhpSyntaxCheck,
			printWidth: this.wrapLineLength,
		};
	}

	async formatContent(content: any) {
		const pipeline = new FormatContentPipeline(this);
		const target = await pipeline.formatContent(content);
		const formattedResult = await util.checkResult(target);
		return formattedResult;
	}

	async formatTokenizedLines(splittedLines: any, tokenizedLines: any) {
		this.result = [];
		this.stack = [];
		for (let i = 0; i < splittedLines.length; i += 1) {
			const originalLine = splittedLines[i];
			const tokenizeLineResult = tokenizedLines[i];
			await this.processLine(tokenizeLineResult, originalLine);
		}

		return this.result.join(this.endOfLine);
	}

	async processLine(tokenizeLineResult: any, originalLine: any) {
		await this.processTokenizeResult(tokenizeLineResult, originalLine);
	}

	async processKeyword(token: string) {
		if (_.includes(phpKeywordStartTokens, token)) {
			if (_.last(this.stack) === "@case" && token === "@case") {
				this.decrementIndentLevel();
			}

			if (token === "@case") {
				this.shouldBeIndent = true;
			}

			this.stack.push(token);
			return;
		}

		// if @break is inside @if, decrement indent after @break
		if (_.last(this.stack) === "@if" && token === "@break") {
			this.shouldBeIndent = false;

			return;
		}

		if (_.includes(phpKeywordEndTokens, token)) {
			if (token === "@break") {
				this.decrementIndentLevel();
				this.stack.pop();
				this.stack.push(token);
				return;
			}

			if (_.last(this.stack) !== "@hassection") {
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
			if (_.last(this.stack) === "@section" && token === "@section") {
				if (this.currentIndentLevel > 0) this.decrementIndentLevel();
				this.shouldBeIndent = true;
				this.stack.push(token);
			} else {
				this.shouldBeIndent = true;
				this.stack.push(token);
			}
		}

		if (_.includes(indentEndTokens, token)) {
			if (token === "@endswitch" && _.last(this.stack) === "@default") {
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

	async processToken(tokenStruct: any, token: string) {
		if (
			_.includes(
				tokenStruct.scopes,
				"punctuation.definition.comment.begin.blade",
			)
		) {
			this.isInsideCommentBlock = true;
		}

		if (this.argumentCheck) {
			const { count, inString, stack, unindentOn } = this.argumentCheck;
			if (!inString && token === ")") {
				stack.push(token);
				count[token] += 1;
				if (count["("] === count[token]) {
					// finished
					const expression = stack.join("");
					const argumentCount = await util.getArgumentsCount(expression);

					if (argumentCount >= unindentOn) {
						this.shouldBeIndent = false;
					}

					this.argumentCheck = false;
				}
				return;
			}

			stack.push(token);

			if (inString === token) {
				this.argumentCheck.inString = false;
			} else if (!inString && (token === '"' || token === "'")) {
				this.argumentCheck.inString = token;
			}

			if (token === "(" && !inString) {
				count[token] += 1;
			}
		}

		if (
			_.includes(tokenStruct.scopes, "punctuation.definition.comment.end.blade")
		) {
			this.isInsideCommentBlock = false;
		}
		if (token === "{{--" || token.includes("{{--")) {
			this.isInsideCommentBlock = true;
		}

		if (token === "--}}" || token.includes("--}}")) {
			this.isInsideCommentBlock = false;
		}

		if (!_.includes(tokenStruct.scopes, "keyword.blade")) {
			return;
		}

		if (this.isInsideCommentBlock) {
			return;
		}

		await this.processKeyword(token.toLowerCase());

		if (
			_.includes(
				Object.keys(optionalStartWithoutEndTokens),
				token.toLowerCase(),
			)
		) {
			this.argumentCheck = {
				// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				unindentOn: optionalStartWithoutEndTokens[token.toLowerCase()],
				stack: [],
				inString: false,
				count: { "(": 0, ")": 0 },
			};
		}
	}

	async processTokenizeResult(tokenizeLineResult: any, originalLine: any) {
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

			const token = originalLine
				.substring(tokenStruct.startIndex, tokenStruct.endIndex)
				.trim();

			// eslint-disable-next-line no-await-in-loop
			await this.processToken(tokenStruct, token);
		}

		this.insertFormattedLineToResult(originalLine);
	}

	insertFormattedLineToResult(originalLine: any) {
		const originalLineWhitespaces = detectIndent(originalLine).amount;
		const whitespaces =
			originalLineWhitespaces + this.indentSize * this.currentIndentLevel;
		const formattedLine =
			this.indentCharacter.repeat(whitespaces < 0 ? 0 : whitespaces) +
			originalLine.trim();

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
}
