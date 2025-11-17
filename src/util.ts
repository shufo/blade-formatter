import fs from "node:fs";
import os from "node:os";
// @ts-ignore
// eslint-disable-next-line
import phpPlugin from "@prettier/plugin-php/standalone";
import chalk from "chalk";
import detectIndent from "detect-indent";
import beautify from "js-beautify";
/* eslint-disable max-len */
import _ from "lodash";
import * as prettier from "prettier/standalone";
import replaceAsync from "string-replace-async";
import {
	indentStartTokens,
	phpKeywordEndTokens,
	phpKeywordStartTokens,
} from "./indent";
import type { Formatter } from "./main";
import { nestedParenthesisRegex } from "./regex";
import type { EndOfLine } from "./runtimeConfig";
import * as vsctm from "./vsctm";

export const optional = (obj: any) => {
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

// Cached regex patterns for performance
const CACHED_REGEXES = {
	escapedPhpStart: /{!!/g,
	escapedPhpEnd: /!!}/g,
	formattedEscapedPhpStart: /<\?php\s\/\*escaped\*\//g,
	formattedEscapedPhpEnd: /\/\*escaped\*\/\s\?>\n/g,
	semicolonBeforeEscapedEnd1: /;[\n\s]*!!\}/g,
	semicolonBeforeEscapedEnd2: /;[\s\n]*!!}/g,
	semicolonBeforeBladeEnd1: /;[\n\s]*}}/g,
	semicolonBeforeBladeEnd2: /; }}/g,
	semicolonBeforeComment: /; --}}/g,
	phpTagStart: /<\?php/g,
	phpTagEnd: /\?>/g,
	phptagStartComment: /\/\*\*[\s\n]*?phptag_start[\s\n]*?\*\*\//gs,
	endPhptagWithSemicolon: /\/\*\*[\s\n]*?end_phptag[\s\n]*?\*\*\/[\s];\n/g,
	endPhptag: /\/\*\*[\s\n]*?end_phptag[\s\n]*?\*\*\//g,
	arrowOperatorWithSpaces: /([\n\s]*)->([\n\s]*)/gs,
	trailingCommaInParen: /,\)$/,
	// Fixed potential ReDoS: Changed (?:\n\s*)* to (?:\n\s+)? to avoid catastrophic backtracking
	asKeywordWithSpaces: /(?:\n\s+)? as(?= (?:&{0,1}\$[\w]+|list|\[\$[\w]+))/g,
	phpBlockInFormat: /<\?php\s(.*?)(\s*?)\((.*?)\);*\s\?>\n/gs,
};

export async function readFile(path: any) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (error: any, data: any) =>
			error ? reject(error) : resolve(data),
		);
	});
}

export function splitByLines(content: any) {
	if (!content) {
		return "";
	}

	return content.split(/\r\n|\n|\r/);
}

export type FormatPhpOption = {
	noPhpSyntaxCheck?: boolean;
	printWidth?: number;
	trailingCommaPHP?: boolean;
	phpVersion?: string;
	noSingleQuote?: boolean;
};

export const printWidthForInline = 1000;

const defaultFormatPhpOption = {
	noPhpSyntaxCheck: false,
	printWidth: printWidthForInline,
	trailingCommaPHP: true,
	phpVersion: "8.4",
	noSingleQuote: false,
};

export async function formatStringAsPhp(
	content: any,
	params: FormatPhpOption = {},
): Promise<string> {
	const options = {
		...defaultFormatPhpOption,
		...params,
	};

	const adjust = params.adjustPrintWidthBy ?? 0;
	const printWidth = params.useProjectPrintWidth
		? options.printWidth - adjust
		: printWidthForInline;
	try {
		return await prettier.format(content.replace(/\n$/, ""), {
			parser: "php",
			printWidth,
			singleQuote: !options.noSingleQuote,
			// @ts-ignore
			phpVersion: options.phpVersion,
			trailingCommaPHP: options.trailingCommaPHP,
			plugins: [phpPlugin],
		});
	} catch (error: any) {
		if (errorHasPhpVersionError(error)) {
			throw error;
		}

		if (options.noPhpSyntaxCheck) {
			return content;
		}

		throw error;
	}
}

export async function formatRawStringAsPhp(
	content: string,
	params: FormatPhpOption = {},
) {
	const options = {
		...defaultFormatPhpOption,
		...params,
	};

	try {
		return (
			await prettier.format(`<?php echo ${content} ?>`, {
				parser: "php",
				printWidth: options.printWidth,
				singleQuote: !options.noSingleQuote,
				// @ts-ignore
				phpVersion: options.phpVersion,
				trailingCommaPHP: options.trailingCommaPHP,
				plugins: [phpPlugin],
			})
		).replace(/<\?php echo (.*)?\?>/gs, (_match: any, p1: any) =>
			p1.trim().replace(/;\s*$/, ""),
		);
	} catch (error) {
		if (errorHasPhpVersionError(error)) {
			throw error;
		}

		if (options.noPhpSyntaxCheck) {
			return content;
		}

		throw error;
	}
}

function errorHasPhpVersionError(error: any) {
	return error.message.includes(
		"Invalid phpVersion value. Expected one of the following values",
	);
}

export async function getArgumentsCount(
	expression: string,
	options: FormatPhpOption,
) {
	const code = `<?php tmp_func${expression}; ?>`;

	try {
		// @ts-ignore
		// eslint-disable-next-line no-underscore-dangle
		const { ast } = await prettier.__debug.parse(code, {
			parser: "php",
			phpVersion: options.phpVersion,
			plugins: [phpPlugin],
		});

		return ast.children[0].expression.arguments.length || 0;
	} catch (_e) {
		return 0;
	}
}

export function normalizeIndentLevel(length: any) {
	if (length < 0) {
		return 0;
	}

	return length;
}

export function printDiffs(diffs: any) {
	return Promise.all(
		diffs.map(async (diff: any) => {
			process.stdout.write(`path: ${chalk.bold(diff.path)}:${diff.line}\n`);
			process.stdout.write(chalk.red(`--${diff.original}\n`));
			process.stdout.write(chalk.green(`++${diff.formatted}\n`));
		}),
	);
}

export function generateDiff(
	path: any,
	originalLines: any,
	formattedLines: any,
) {
	const diff = originalLines.map((originalLine: any, index: any) => {
		if (!originalLine || originalLine === formattedLines[index]) {
			return null;
		}

		return {
			path,
			line: index + 1,
			original: originalLine,
			formatted: formattedLines[index],
		};
	});

	return diff.filter(item => item !== null);
}

// Cache for directive regex to avoid recompilation
let cachedDirectiveRegex: RegExp | null = null;
let cachedDirectivesKey: string | null = null;

export async function prettifyPhpContentWithUnescapedTags(
	content: string,
	options: FormatPhpOption,
) {
	const directives = _.without(
		indentStartTokens,
		"@switch",
		"@forelse",
		"@php",
	).join("|");

	// Use cached regex if directives haven't changed
	if (cachedDirectivesKey !== directives) {
		cachedDirectiveRegex = new RegExp(
			// eslint-disable-next-line max-len
			`(?!\\/\\*.*?\\*\\/)(${directives})(\\s*?)${nestedParenthesisRegex}`,
			"gmi",
		);
		cachedDirectivesKey = directives;
	}

	return new Promise((resolve) => resolve(content))
		.then((res: any) =>
			replaceAsync(
				res,
				cachedDirectiveRegex!,
				async (_match: any, p1: any, p2: any, p3: any) =>
					(
						await formatStringAsPhp(
							`<?php ${p1.substr("1")}${p2}(${p3}) ?>`,
							options,
						)
					)
						.replace(
							CACHED_REGEXES.phpBlockInFormat,
							(_match2: any, j1: any, j2: any, j3: any) =>
								`@${j1.trim()}${j2}(${j3.trim()})`,
						)
						.replace(CACHED_REGEXES.arrowOperatorWithSpaces, "->")
						.replace(CACHED_REGEXES.trailingCommaInParen, ")")
						.replace(CACHED_REGEXES.asKeywordWithSpaces, " as"),
			),
		)
		.then((res) => formatStringAsPhp(res, options));
}

export async function prettifyPhpContentWithEscapedTags(
	content: string,
	options: FormatPhpOption,
) {
	return new Promise((resolve) => resolve(content))
		.then((res: any) => res.replace(CACHED_REGEXES.escapedPhpStart, "<?php /*escaped*/"))
		.then((res) => res.replace(CACHED_REGEXES.escapedPhpEnd, "/*escaped*/ ?>\n"))
		.then((res) => formatStringAsPhp(res, options))
		.then((res) => res.replace(CACHED_REGEXES.formattedEscapedPhpStart, "{!! "))
		.then((res) => res.replace(CACHED_REGEXES.formattedEscapedPhpEnd, " !!}"));
}

export async function removeSemicolon(content: any) {
	// Batch all replacements to avoid multiple intermediate string allocations
	return content
		.replace(CACHED_REGEXES.semicolonBeforeEscapedEnd1, " !!}")
		.replace(CACHED_REGEXES.semicolonBeforeEscapedEnd2, " !!}")
		.replace(CACHED_REGEXES.semicolonBeforeBladeEnd1, " }}")
		.replace(CACHED_REGEXES.semicolonBeforeBladeEnd2, " }}")
		.replace(CACHED_REGEXES.semicolonBeforeComment, " --}}");
}

export async function formatAsPhp(content: string, options: FormatPhpOption) {
	return prettifyPhpContentWithUnescapedTags(content, options);
}

export async function preserveOriginalPhpTagInHtml(content: any) {
	return content
		.replace(CACHED_REGEXES.phpTagStart, "/** phptag_start **/")
		.replace(CACHED_REGEXES.phpTagEnd, "/** end_phptag **/");
}

export function revertOriginalPhpTagInHtml(content: any) {
	return content
		.replace(CACHED_REGEXES.phptagStartComment, "<?php")
		.replace(CACHED_REGEXES.endPhptagWithSemicolon, "?>;")
		.replace(CACHED_REGEXES.endPhptag, "?>");
}

export function indent(content: any, level: any, options: any) {
	const lines = content.split("\n");
	const ignoreFirstLine = optional(options).ignoreFirstLine || false;
	const indentChar = optional(options).useTabs ? "\t" : " ";
	const indentSize = optional(options).indentSize || 4;
	
	return lines.map((line: any, index: any) => {
		if (!line.match(/\w/)) {
			return line;
		}

		if (ignoreFirstLine && index === 0) {
			return line;
		}

		const originalLineWhitespaces = detectIndent(line).amount;
		const whitespaces = originalLineWhitespaces + indentSize * level;

		if (whitespaces < 0) {
			return line;
		}

		return indentChar.repeat(whitespaces) + line.trimStart();
	}).join("\n");
}

export function unindent(
	_directive: any,
	content: any,
	level: any,
	options: any,
) {
	const lines = content.split("\n");
	const indentChar = optional(options).useTabs ? "\t" : " ";
	const indentSize = optional(options).indentSize || 4;
	
	return lines.map((line: any) => {
		if (!line.match(/\w/)) {
			return line;
		}

		const originalLineWhitespaces = detectIndent(line).amount;
		const whitespaces = originalLineWhitespaces - indentSize * level;

		if (whitespaces < 0) {
			return line;
		}

		return indentChar.repeat(whitespaces) + line.trimStart();
	}).join("\n");
}

// Cache for preserve directives regex patterns
let cachedPreserveStartRegex: RegExp | null = null;
let cachedPreserveEndRegex: RegExp | null = null;
let cachedPreserveStartTokensKey: string | null = null;
let cachedPreserveEndTokensKey: string | null = null;

export function preserveDirectives(content: any) {
	const startTokens = phpKeywordStartTokens.filter(token => token !== "@case");
	const endTokens = phpKeywordEndTokens.filter(token => token !== "@break");
	
	const startTokensKey = startTokens.join("|");
	const endTokensKey = endTokens.join("|");

	// Cache start regex
	if (cachedPreserveStartTokensKey !== startTokensKey) {
		cachedPreserveStartRegex = new RegExp(
			`(${startTokensKey})([\\s]*?)${nestedParenthesisRegex}`,
			"gis",
		);
		cachedPreserveStartTokensKey = startTokensKey;
	}

	// Cache end regex
	if (cachedPreserveEndTokensKey !== endTokensKey) {
		cachedPreserveEndRegex = new RegExp(
			`(?!end=".*)(${endTokensKey})(?!.*")`,
			"gi",
		);
		cachedPreserveEndTokensKey = endTokensKey;
	}

	let result = content.replace(
		cachedPreserveStartRegex!,
		(_match: any, p1: any, p2: any, p3: any) =>
			`<beautifyTag start="${p1}${p2}" exp="^^^${_.escape(p3)}^^^">`,
	);
	
	result = result.replace(
		cachedPreserveEndRegex!,
		(_match: any, p1: any) => `</beautifyTag end="${p1}">`,
	);
	
	return result;
}

// Cache for preserve directives in tag regex
let cachedPreserveInTagRegex: RegExp | null = null;
let cachedPreserveInTagKey: string | null = null;

export function preserveDirectivesInTag(content: any) {
	const startTokensKey = phpKeywordStartTokens.join("|");
	const endTokensKey = phpKeywordEndTokens.join("|");
	const key = `${startTokensKey}:${endTokensKey}`;
	
	if (cachedPreserveInTagKey !== key) {
		cachedPreserveInTagRegex = new RegExp(
			`(<[^>]*?)(${startTokensKey})([\\s]*?)${nestedParenthesisRegex}(.*?)(${endTokensKey})([^>]*?>)`,
			"gis",
		);
		cachedPreserveInTagKey = key;
	}
	
	return content.replace(
		cachedPreserveInTagRegex!,
		(
			_match: any,
			p1: any,
			p2: any,
			p3: any,
			p4: any,
			p5: any,
			p6: any,
			p7: any,
		) =>
			`${p1}|-- start="${p2}${p3}" exp="^^^${p4}^^^" body="^^^${_.escape(
				p5.trim(),
			)}^^^" end="${p6}" --|${p7}`,
	);
}

// Cached regex patterns for revert operations
const REVERT_REGEXES = {
	beautifyTagStart: /<beautifyTag.*?start="(.*?)".*?exp=".*?\^\^\^(.*?)\^\^\^.*?"\s*>/gs,
	beautifyTagEnd: /<\/beautifyTag.*?end="(.*?)"\s*>/gs,
	directiveInTag: /\|--.*?start="(.*?)".*?exp=".*?\^\^\^(.*?)\^\^\^.*?"(.*?)body=".*?\^\^\^(.*?)\^\^\^.*?".*?end="(.*?)".*?--\|/gs,
	directiveEndInTag: /\/-- end="(.*?)"--\//gs,
};

export function revertDirectives(content: any) {
	let result = content.replace(
		REVERT_REGEXES.beautifyTagStart,
		(_match: any, p1: any, p2: any) => `${p1}(${_.unescape(p2)})`,
	);
	
	result = result.replace(
		REVERT_REGEXES.beautifyTagEnd,
		(_match: any, p1: any) => `${p1}`,
	);
	
	return result;
}

export function revertDirectivesInTag(content: any) {
	let result = content.replace(
		REVERT_REGEXES.directiveInTag,
		(_match: any, p1: any, p2: any, _p3: any, p4: any, p5: any) =>
			`${p1.trimStart()}(${p2}) ${_.unescape(p4)} ${p5}`,
	);
	
	result = result.replace(
		REVERT_REGEXES.directiveEndInTag,
		(_match: any, p1: any) => `${p1}`,
	);
	
	return result;
}

export function printDescription() {
	const returnLine = "\n\n";
	process.stdout.write(returnLine);
	process.stdout.write(chalk.bold.green("Fixed: F\n"));
	process.stdout.write(chalk.bold.red("Errors: E\n"));
	process.stdout.write(chalk.bold("Not Changed: ") + chalk.bold.green(".\n"));
}

const escapeTags = [
	"/\\*\\* phptag_start \\*\\*/",
	"/\\*\\* end_phptag \\*\\*/",
	"/\\*escaped\\*/",
	"__BLADE__;",
	"/\\* blade_comment_start \\*/",
	"/\\* blade_comment_end \\*/",
	"/\\*\\*\\*script_placeholder\\*\\*\\*/",
	"blade___non_native_scripts_",
	"blade___scripts_",
	"blade___html_tags_",
	"beautifyTag",
	"@customdirective",
	"@elsecustomdirective",
	"@endcustomdirective",
	"x-slot --___\\d+___--",
	"___attrs_+\\d+___",
];

// Cache for escape tags regex
const escapeTagsRegex = new RegExp(escapeTags.join("|"));

export function checkResult(formatted: any) {
	if (escapeTagsRegex.test(formatted)) {
		throw new Error(
			[
				"Can't format blade: something goes wrong.",
				// eslint-disable-next-line max-len
				"Please check if template is too complicated or not. Or simplify template might solves issue.",
			].join("\n"),
		);
	}

	return formatted;
}

export function escapeReplacementString(string: string) {
	return string.replace(/\$/g, "$$$$");
}

export function debugLog(...content: any) {
	for (const item of content) {
		console.log("------------------- content start -------------------");
		console.log(item);
		console.log("------------------- content end   -------------------");
	}

	return content;
}

export function getEndOfLine(endOfLine?: EndOfLine): string {
	switch (endOfLine) {
		case "LF":
			return "\n";
		case "CRLF":
			return "\r\n";
		default:
			return os.EOL;
	}
}

export function isInline(content: any) {
	return content.split("\n").length === 1;
}

export function indentRawPhpBlock(
	indent: detectIndent.Indent,
	content: any,
	formatter: Formatter,
) {
	if (!indent.indent) {
		return content;
	}

	if (isInline(content)) {
		return `${content}`;
	}

	const leftIndentAmount = indent.amount;
	const indentLevel = leftIndentAmount / formatter.indentSize;
	const prefixSpaces = formatter.indentCharacter.repeat(
		indentLevel < 0 ? 0 : indentLevel * formatter.indentSize,
	);

	const lines = content.split("\n");

	return lines.map((line: any, index: any) => {
		if (index === 0) {
			return line.trim();
		}
		return prefixSpaces + line;
	}).join("\n");
}

export function indentPhpComment(
	indent: detectIndent.Indent,
	content: string,
	formatter: Formatter,
) {
	if (!indent.indent) {
		return content;
	}

	if (isInline(content)) {
		return `${content}`;
	}

	const leftIndentAmount = indent.amount;
	const indentLevel = leftIndentAmount / formatter.indentSize;
	const prefixSpaces = formatter.indentCharacter.repeat(
		indentLevel < 0 ? 0 : indentLevel * formatter.indentSize,
	);

	const lines = content.split("\n");
	let withoutCommentLine = false;

	return lines
		.map((line: string, index: number) => {
			if (index === 0) {
				return line.trim();
			}

			if (!line.trim().startsWith("*")) {
				withoutCommentLine = true;
				return line;
			}

			if (line.trim().endsWith("*/") && withoutCommentLine) {
				return line;
			}

			return prefixSpaces + line;
		})
		.join("\n");
}

export async function formatExpressionInsideBladeDirective(
	matchedExpression: string,
	indent: detectIndent.Indent,
	formatter: Formatter,
	wrapLength: number | undefined = undefined,
) {
	const formatTarget = `func(${matchedExpression})`;
	const formattedExpression = await formatRawStringAsPhp(formatTarget, {
		...formatter.options,
		printWidth: wrapLength ?? formatter.defaultPhpFormatOption.printWidth,
	});

	if (formattedExpression === formatTarget) {
		return matchedExpression;
	}

	let inside = formattedExpression
		.replace(CACHED_REGEXES.arrowOperatorWithSpaces, "->")
		.replace(/(?<!(['"]).*)(?<=\()[\n\s]+?(?=\w)/gm, "")
		.replace(/(.*)],[\n\s]*?\)$/gm, (_match: string, p1: string) => `${p1}]\n)`)
		.replace(/,[\n\s]*?\)/gs, ")")
		.replace(/,(\s*?\))$/gm, (_match, p1) => p1)
		.trim();

	if (formatter.options.useTabs || false) {
		inside = inside.replace(
			/(?<=^ *) {4}/gm,
			"\t".repeat(formatter.indentSize),
		);
	}

	inside = inside.replace(
		/func\((.*)\)/gis,
		(_match: string, p1: string) => p1,
	);
	if (isInline(inside.trim())) {
		inside = inside.trim();
	}

	return indentRawPhpBlock(indent, inside, formatter);
}

export function indentBladeDirectiveBlock(
	indent: detectIndent.Indent,
	content: any,
	formatter: Formatter,
) {
	if (!indent.indent) {
		return content;
	}

	if (isInline(content)) {
		return `${indent.indent}${content}`;
	}

	const leftIndentAmount = indent.amount;
	const indentLevel = leftIndentAmount / formatter.indentSize;
	const prefixSpaces = formatter.indentCharacter.repeat(
		indentLevel < 0 ? 0 : indentLevel * formatter.indentSize,
	);
	const prefixForEnd = formatter.indentCharacter.repeat(
		indentLevel < 0 ? 0 : indentLevel * formatter.indentSize,
	);

	const lines = content.split("\n");

	return lines
		.map((line: any, index: any) => {
			if (index === lines.length - 1) {
				return prefixForEnd + line;
			}

			return prefixSpaces + line;
		})
		.join("\n");
}

export async function isMultilineStatement(
	rawBlock: any,
	formatter: Formatter,
) {
	return (
		(await formatStringAsPhp(`<?php${rawBlock}?>`, formatter.options))
			.trimRight()
			.split("\n").length > 1
	);
}

export function indentRawBlock(
	indent: detectIndent.Indent,
	content: any,
	formatter: Formatter,
) {
	if (isInline(content)) {
		return `${indent.indent}${content}`;
	}

	const leftIndentAmount = indent.amount;
	const indentLevel = leftIndentAmount / formatter.indentSize;
	const prefix = formatter.indentCharacter.repeat(
		indentLevel < 0 ? 0 : (indentLevel + 1) * formatter.indentSize,
	);
	const prefixForEnd = formatter.indentCharacter.repeat(
		indentLevel < 0 ? 0 : indentLevel * formatter.indentSize,
	);

	const lines = content.split("\n");

	return _.chain(lines)
		.map((line: any, index: any) => {
			if (index === 0) {
				return line.trim();
			}

			if (index === lines.length - 1) {
				return prefixForEnd + line;
			}

			if (line.length === 0) {
				return line;
			}

			return prefix + line;
		})
		.join("\n")
		.value();
}

export function indentComponentAttribute(
	prefix: string,
	content: string,
	formatter: Formatter,
) {
	if (_.isEmpty(prefix)) {
		return content;
	}

	if (isInline(content)) {
		return `${content}`;
	}

	if (isInline(content) && /\S/.test(prefix)) {
		return `${content}`;
	}

	const leftIndentAmount = detectIndent(prefix).amount;
	const indentLevel = leftIndentAmount / formatter.indentSize;
	const prefixSpaces = formatter.indentCharacter.repeat(
		indentLevel < 0 ? 0 : indentLevel * formatter.indentSize,
	);

	const lines = content.split("\n");

	return _.chain(lines)
		.map((line: any, index: any) => {
			if (index === 0) {
				return line.trim();
			}

			return prefixSpaces + line;
		})
		.value()
		.join("\n");
}

export function formatAsHtml(data: any, formatter: Formatter) {
	const options = {
		indent_size: optional(formatter.options).indentSize || 4,
		wrap_line_length: optional(formatter.options).wrapLineLength || 120,
		wrap_attributes: optional(formatter.options).wrapAttributes || "auto",
		wrap_attributes_min_attrs: optional(formatter.options)
			.wrapAttributesMinAttrs,
		indent_inner_html: optional(formatter.options).indentInnerHtml || false,
		end_with_newline: optional(formatter.options).endWithNewline || true,
		max_preserve_newlines: optional(formatter.options).noMultipleEmptyLines
			? 1
			: undefined,
		extra_liners: optional(formatter.options).extraLiners,
		css: {
			end_with_newline: false,
		},
		eol: formatter.endOfLine,
	};

	const promise = new Promise((resolve) => resolve(data))
		.then((content) => preserveDirectives(content))
		.then((preserved) => beautify.html_beautify(preserved, options))
		.then((content) => revertDirectives(content));

	return Promise.resolve(promise);
}

export async function formatAsBlade(content: any, formatter: Formatter) {
	// init parameters
	formatter.currentIndentLevel = 0;
	formatter.shouldBeIndent = false;

	const splittedLines = splitByLines(content);

	const vsctmModule = await new vsctm.VscodeTextmate(
		formatter.vsctm,
		formatter.oniguruma,
	);
	const registry = vsctmModule.createRegistry();

	const formatted = registry
		.loadGrammar("text.html.php.blade")
		.then((grammar: any) => vsctmModule.tokenizeLines(splittedLines, grammar))
		.then((tokenizedLines: any) =>
			formatter.formatTokenizedLines(splittedLines, tokenizedLines),
		)
		.catch((err: any) => {
			throw err;
		});

	return formatted;
}

export function formatJS(jsCode: string): string {
	let code: string = jsCode;
	const tempVarStore: any = {
		js: [],
		entangle: [],
	};
	for (const directive of Object.keys(tempVarStore)) {
		code = code.replace(
			new RegExp(
				`@${directive}\\((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))*\\)`,
				"gs",
			),
			(m: any) => {
				const index = tempVarStore[directive].push(m) - 1;
				return getPlaceholder(directive, index, m.length);
			},
		);
	}
	code = beautify.js_beautify(code, { brace_style: "preserve-inline" });

	for (const directive of Object.keys(tempVarStore)) {
		code = code.replace(
			new RegExp(getPlaceholder(directive, "_*(\\d+)"), "gms"),
			(_match: any, p1: any) => tempVarStore[directive][p1],
		);
	}

	return code;
}

export function getPlaceholder(
	attribute: string,
	replace: any,
	length: any = null,
) {
	if (length && length > 0) {
		const template = `___${attribute}_#___`;
		const gap = length - template.length;
		return _.replace(
			`___${attribute}${_.repeat("_", gap > 0 ? gap : 1)}#___`,
			"#",
			replace,
		);
	}

	if (_.isNull(length)) {
		return _.replace(`___${attribute}_#___`, "#", replace);
	}

	return _.replace(`s___${attribute}_+?#___`, "#", replace);
}
