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
import type { CLIOption, Formatter, FormatterOption } from "./main";
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
	phpVersion: "8.1",
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
	} catch (error) {
		if (options.noPhpSyntaxCheck === false) {
			throw error;
		}
		return content;
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
		).replace(/<\?php echo (.*)?\?>/gs, (match: any, p1: any) =>
			p1.trim().replace(/;\s*$/, ""),
		);
	} catch (error) {
		if (options.noPhpSyntaxCheck === false) {
			throw error;
		}

		return content;
	}
}

export async function getArgumentsCount(expression: string) {
	const code = `<?php tmp_func${expression}; ?>`;

	try {
		// @ts-ignore
		// eslint-disable-next-line no-underscore-dangle
		const { ast } = await prettier.__debug.parse(code, {
			parser: "php",
			phpVersion: "8.1",
			plugins: [phpPlugin],
		});

		return ast.children[0].expression.arguments.length || 0;
	} catch (e) {
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
		_.map(diffs, async (diff: any) => {
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
	const diff = _.map(originalLines, (originalLine: any, index: any) => {
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

	const directiveRegexes = new RegExp(
		// eslint-disable-next-line max-len
		`(?!\\/\\*.*?\\*\\/)(${directives})(\\s*?)${nestedParenthesisRegex}`,
		"gmi",
	);

	return new Promise((resolve) => resolve(content))
		.then((res: any) =>
			replaceAsync(
				res,
				directiveRegexes,
				async (match: any, p1: any, p2: any, p3: any) =>
					(
						await formatStringAsPhp(
							`<?php ${p1.substr("1")}${p2}(${p3}) ?>`,
							options,
						)
					)
						.replace(
							/<\?php\s(.*?)(\s*?)\((.*?)\);*\s\?>\n/gs,
							(match2: any, j1: any, j2: any, j3: any) =>
								`@${j1.trim()}${j2}(${j3.trim()})`,
						)
						.replace(/([\n\s]*)->([\n\s]*)/gs, "->")
						.replace(/,\)$/, ")")
						.replace(
							/(?:\n\s*)* as(?= (?:&{0,1}\$[\w]+|list|\[\$[\w]+))/g,
							" as",
						),
			),
		)
		.then((res) => formatStringAsPhp(res, options));
}

export async function prettifyPhpContentWithEscapedTags(
	content: string,
	options: FormatPhpOption,
) {
	return new Promise((resolve) => resolve(content))
		.then((res: any) => _.replace(res, /{!!/g, "<?php /*escaped*/"))
		.then((res) => _.replace(res, /!!}/g, "/*escaped*/ ?>\n"))
		.then((res) => formatStringAsPhp(res, options))
		.then((res) => _.replace(res, /<\?php\s\/\*escaped\*\//g, "{!! "))
		.then((res) => _.replace(res, /\/\*escaped\*\/\s\?>\n/g, " !!}"));
}

export async function removeSemicolon(content: any) {
	return new Promise((resolve) => {
		resolve(content);
	})
		.then((res: any) => _.replace(res, /;[\n\s]*!!\}/g, " !!}"))
		.then((res) => _.replace(res, /;[\s\n]*!!}/g, " !!}"))
		.then((res) => _.replace(res, /;[\n\s]*}}/g, " }}"))
		.then((res) => _.replace(res, /; }}/g, " }}"))
		.then((res) => _.replace(res, /; --}}/g, " --}}"));
}

export async function formatAsPhp(content: string, options: FormatPhpOption) {
	return prettifyPhpContentWithUnescapedTags(content, options);
}

export async function preserveOriginalPhpTagInHtml(content: any) {
	return new Promise((resolve) => resolve(content))
		.then((res: any) => _.replace(res, /<\?php/g, "/** phptag_start **/"))
		.then((res) => _.replace(res, /\?>/g, "/** end_phptag **/"));
}

export function revertOriginalPhpTagInHtml(content: any) {
	return new Promise((resolve) => resolve(content))
		.then((res: any) =>
			_.replace(res, /\/\*\*[\s\n]*?phptag_start[\s\n]*?\*\*\//gs, "<?php"),
		)
		.then((res) =>
			_.replace(res, /\/\*\*[\s\n]*?end_phptag[\s\n]*?\*\*\/[\s];\n/g, "?>;"),
		)
		.then((res) =>
			_.replace(res, /\/\*\*[\s\n]*?end_phptag[\s\n]*?\*\*\//g, "?>"),
		);
}

export function indent(content: any, level: any, options: any) {
	const lines = content.split("\n");
	return _.map(lines, (line: any, index: any) => {
		if (!line.match(/\w/)) {
			return line;
		}

		const ignoreFirstLine = optional(options).ignoreFirstLine || false;

		if (ignoreFirstLine && index === 0) {
			return line;
		}

		const originalLineWhitespaces = detectIndent(line).amount;
		const indentChar = optional(options).useTabs ? "\t" : " ";
		const indentSize = optional(options).indentSize || 4;
		const whitespaces = originalLineWhitespaces + indentSize * level;

		if (whitespaces < 0) {
			return line;
		}

		return indentChar.repeat(whitespaces) + line.trimLeft();
	}).join("\n");
}

export function unindent(
	directive: any,
	content: any,
	level: any,
	options: any,
) {
	const lines = content.split("\n");
	return _.map(lines, (line: any) => {
		if (!line.match(/\w/)) {
			return line;
		}

		const originalLineWhitespaces = detectIndent(line).amount;
		const indentChar = optional(options).useTabs ? "\t" : " ";
		const indentSize = optional(options).indentSize || 4;
		const whitespaces = originalLineWhitespaces - indentSize * level;

		if (whitespaces < 0) {
			return line;
		}

		return indentChar.repeat(whitespaces) + line.trimLeft();
	}).join("\n");
}

export function preserveDirectives(content: any) {
	const startTokens = _.without(phpKeywordStartTokens, "@case");
	const endTokens = _.without(phpKeywordEndTokens, "@break");

	return new Promise((resolve) => resolve(content))
		.then((res: any) => {
			const regex = new RegExp(
				`(${startTokens.join("|")})([\\s]*?)${nestedParenthesisRegex}`,
				"gis",
			);
			return _.replace(
				res,
				regex,
				(match: any, p1: any, p2: any, p3: any) =>
					`<beautifyTag start="${p1}${p2}" exp="^^^${_.escape(p3)}^^^">`,
			);
		})
		.then((res: any) => {
			const regex = new RegExp(
				`(?!end=".*)(${endTokens.join("|")})(?!.*")`,
				"gi",
			);
			return _.replace(
				res,
				regex,
				(match: any, p1: any) => `</beautifyTag end="${p1}">`,
			);
		});
}

export function preserveDirectivesInTag(content: any) {
	return new Promise((resolve) => {
		const regex = new RegExp(
			`(<[^>]*?)(${phpKeywordStartTokens.join(
				"|",
			)})([\\s]*?)${nestedParenthesisRegex}(.*?)(${phpKeywordEndTokens.join(
				"|",
			)})([^>]*?>)`,
			"gis",
		);
		resolve(
			_.replace(
				content,
				regex,
				(
					match: any,
					p1: any,
					p2: any,
					p3: any,
					p4: any,
					p5: any,
					p6: any,
					p7: any,
				) =>
					`${p1}|-- start="${p2}${p3}" exp="^^^${p4}^^^" body="^^^${_.escape(
						_.trim(p5),
					)}^^^" end="${p6}" --|${p7}`,
			),
		);
	});
}

export function revertDirectives(content: any) {
	return new Promise((resolve) => resolve(content))
		.then((res: any) =>
			_.replace(
				res,
				/<beautifyTag.*?start="(.*?)".*?exp=".*?\^\^\^(.*?)\^\^\^.*?"\s*>/gs,
				(match: any, p1: any, p2: any) => `${p1}(${_.unescape(p2)})`,
			),
		)
		.then((res) =>
			_.replace(
				res,
				/<\/beautifyTag.*?end="(.*?)"\s*>/gs,
				(match: any, p1: any) => `${p1}`,
			),
		);
}

export function revertDirectivesInTag(content: any) {
	return new Promise((resolve) => resolve(content))
		.then((res: any) =>
			_.replace(
				res,
				/\|--.*?start="(.*?)".*?exp=".*?\^\^\^(.*?)\^\^\^.*?"(.*?)body=".*?\^\^\^(.*?)\^\^\^.*?".*?end="(.*?)".*?--\|/gs,
				(match: any, p1: any, p2: any, p3: any, p4: any, p5: any) =>
					`${_.trimStart(p1)}(${p2}) ${_.unescape(p4)} ${p5}`,
			),
		)
		.then((res) =>
			_.replace(
				res,
				/\/-- end="(.*?)"--\//gs,
				(match: any, p1: any) => `${p1}`,
			),
		);
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

export function checkResult(formatted: any) {
	if (new RegExp(escapeTags.join("|")).test(formatted)) {
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
	_.each(content, (item) => {
		console.log("------------------- content start -------------------");
		console.log(item);
		console.log("------------------- content end   -------------------");
	});

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
	return _.split(content, "\n").length === 1;
}

export function indentRawPhpBlock(
	indent: detectIndent.Indent,
	content: any,
	formatter: Formatter,
) {
	if (_.isEmpty(indent.indent)) {
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

export function indentPhpComment(
	indent: detectIndent.Indent,
	content: string,
	formatter: Formatter,
) {
	if (_.isEmpty(indent.indent)) {
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

	return _.chain(lines)
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
		.join("\n")
		.value();
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
		.replace(/([\n\s]*)->([\n\s]*)/gs, "->")
		.replace(/(?<!(['"]).*)(?<=\()[\n\s]+?(?=\w)/gm, "")
		.replace(/(.*)],[\n\s]*?\)$/gm, (match: string, p1: string) => `${p1}]\n)`)
		.replace(/,[\n\s]*?\)/gs, ")")
		.replace(/,(\s*?\))$/gm, (match, p1) => p1)
		.trim();

	if (formatter.options.useTabs || false) {
		inside = _.replace(
			inside,
			/(?<=^ *) {4}/gm,
			"\t".repeat(formatter.indentSize),
		);
	}

	inside = inside.replace(/func\((.*)\)/gis, (match: string, p1: string) => p1);
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
	if (_.isEmpty(indent.indent)) {
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

	return _.chain(lines)
		.map((line: any, index: any) => {
			if (index === lines.length - 1) {
				return prefixForEnd + line;
			}

			return prefixSpaces + line;
		})
		.value()
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
