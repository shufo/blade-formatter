import detectIndent from "detect-indent";
import _ from "lodash";
import {
	cssAtRuleTokens,
	indentElseTokens,
	indentEndTokens,
	indentStartTokens,
	inlineFunctionTokens,
	phpKeywordStartTokens,
	unbalancedStartTokens,
} from "src/indent";
import { nestedParenthesisRegex } from "src/regex";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class CustomDirectiveProcessor extends Processor {
	private customDirectives: string[] = [];
	// Cache for frequently used arrays to avoid recomputing
	private negativeLookAheadCache: string | null = null;
	private inlineNegativeLookAheadCache: string | null = null;

	async preProcess(content: string): Promise<any> {
		return await this.preserveCustomDirective(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreCustomDirective(content);
	}

	private async preserveCustomDirective(content: string): Promise<any> {
		// Cache negative lookaheads to avoid recomputing arrays
		if (!this.negativeLookAheadCache) {
			const tokens = [
				...indentStartTokens.filter(token => token !== "@unless"),
				...indentEndTokens,
				...indentElseTokens,
				"@unless\\(.*?\\)",
			];
			this.negativeLookAheadCache = tokens.join("|");
		}

		if (!this.inlineNegativeLookAheadCache) {
			const tokens = Array.from(new Set([
				...indentStartTokens.filter(token => token !== "@unless" && token !== "@for"),
				...indentEndTokens,
				...indentElseTokens,
				...inlineFunctionTokens,
				...phpKeywordStartTokens.filter(token => token !== "@for"),
				"@unless[a-z]*\\(.*?\\)",
				"@for\\(.*?\\)",
				...unbalancedStartTokens,
				...cssAtRuleTokens,
			]));
			this.inlineNegativeLookAheadCache = tokens.join("|");
		}

		const inlineRegex = new RegExp(
			`(?!(${this.inlineNegativeLookAheadCache}))(@([a-zA-Z1-9_\\-]+))(?!.*?@end\\3)${nestedParenthesisRegex}.*?(?<!@end\\5)`,
			"gis",
		);

		const regex = new RegExp(
			`(?!(${this.negativeLookAheadCache}))(@(unless)*([a-zA-Z1-9_\\-]+))(?!.*?\\2)(\\s|\\(.*?\\))+(.*?)(@end\\4)`,
			"gis",
		);

		let formatted: string;

		// preserve inline directives
		formatted = content.replace(inlineRegex, (match: string) =>
			this.storeInlineCustomDirective(match),
		);

		// preserve begin~else~end directives
		formatted = formatted.replace(
			regex,
			(
				match: string,
				_p1: string,
				p2: string,
				_p3: string,
				p4: string,
				_p5: string,
				_p6: string,
				p7: string,
			) => {
				if (indentStartTokens.includes(p2)) {
					return match;
				}

				let result: string = match;

				// begin directive
				result = result.replace(
					new RegExp(`${p2}(${nestedParenthesisRegex})*`, "gim"),
					(beginStr: string) => this.storeBeginCustomDirective(beginStr),
				);
				// end directive
				result = result.replace(p7, this.storeEndCustomDirective(p7));
				// else directive
				result = result.replace(
					new RegExp(`@else${p4}(${nestedParenthesisRegex})*`, "gim"),
					(elseStr: string) => this.storeElseCustomDirective(elseStr),
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

	private async restoreCustomDirective(content: string): Promise<any> {
		let result = await this.restoreInlineCustomDirective(content);
		result = await this.restoreBeginCustomDirective(result);
		result = await this.restoreElseCustomDirective(result);
		result = await this.restoreEndCustomDirective(result);
		return result;
	}

	async restoreInlineCustomDirective(content: string) {
		return replaceAsync(
			content,
			new RegExp(
				`${this.getInlineCustomDirectivePlaceholder("(\\d+)")}`,
				"gim",
			),
			async (_match: any, p1: number) => {
				const placeholder = this.getInlineCustomDirectivePlaceholder(
					p1.toString(),
				);
				// Use simpler regex escape for placeholder
				const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				const matchedLine = content.match(
					new RegExp(`^(.*?)${escapedPlaceholder}`, "gmi"),
				) ?? [""];
				const indent = detectIndent(matchedLine[0]);

				const matched = `${this.customDirectives[p1]}`;

				return replaceAsync(
					matched,
					/(@[a-zA-Z0-9\-_]+)(.*)/gis,
					async (match2: string, p2: string, p3: string) => {
						try {
							const formatted = (
								await util.formatRawStringAsPhp(`func${p3}`, {
									...this.formatter.options,
									printWidth: util.printWidthForInline,
								})
							)
								.replace(/([\n\s]*)->([\n\s]*)/gs, "->")
								.replace(/,(\s*?\))$/gm, (_m, p4) => p4)
								.trim()
								.substring(4);
							return `${p2}${util.indentComponentAttribute(
								indent.indent,
								formatted,
								this.formatter,
							)}`;
						} catch (_error) {
							return `${match2}`;
						}
					},
				);
			},
		);
	}

	async restoreElseCustomDirective(content: string) {
		return content.replace(
			/@else\(___(\d+)___\)/gim,
			(_match: any, p1: number) => `${this.customDirectives[p1]}`,
		);
	}

	async restoreEndCustomDirective(content: string) {
		return content.replace(
			/@endcustomdirective\(___(\d+)___\)/gim,
			(_match: any, p1: number) => `${this.customDirectives[p1]}`,
		);
	}

	async restoreBeginCustomDirective(content: string) {
		return replaceAsync(
			content,
			new RegExp(
				`@customdirective\\(___(\\d+)___\\)\\s*?(${nestedParenthesisRegex})*`,
				"gim",
			),
			async (_match: any, p1: number) => {
				const placeholder = this.getBeginCustomDirectivePlaceholder(
					p1.toString(),
				);
				const matchedLine = content.match(
					new RegExp(`^(.*?)${_.escapeRegExp(placeholder)}`, "gmi"),
				) ?? [""];

				const indent = detectIndent(matchedLine[0]);
				const matched = `${this.customDirectives[p1]}`;

				return replaceAsync(
					matched,
					/(@[a-zA-Z0-9\-_]+)(.*)/gis,
					async (match2: string, p3: string, p4: string) => {
						try {
							const formatted = (
								await util.formatRawStringAsPhp(`func${p4}`, {
									...this.formatter.options,
									trailingCommaPHP: false,
								})
							)
								.replace(/([\n\s]*)->([\n\s]*)/gs, "->")
								.trim()
								.substring(4);
							return `${p3}${util.indentComponentAttribute(
								indent.indent,
								formatted,
								this.formatter,
							)}`;
						} catch (_error) {
							return `${match2}`;
						}
					},
				);
			},
		);
	}

	storeInlineCustomDirective(value: string) {
		return this.getInlineCustomDirectivePlaceholder(
			(this.customDirectives.push(value) - 1).toString(),
		);
	}

	storeBeginCustomDirective(value: string) {
		return this.getBeginCustomDirectivePlaceholder(
			(this.customDirectives.push(value) - 1).toString(),
		);
	}

	storeEndCustomDirective(value: string) {
		return this.getEndCustomDirectivePlaceholder(
			(this.customDirectives.push(value) - 1).toString(),
		);
	}

	storeElseCustomDirective(value: string) {
		return this.getElseCustomDirectivePlaceholder(
			(this.customDirectives.push(value) - 1).toString(),
		);
	}

	getInlineCustomDirectivePlaceholder(replace: string) {
		return _.replace("___inline_cd_#___", "#", replace);
	}

	getBeginCustomDirectivePlaceholder(replace: string) {
		return _.replace("@customdirective(___#___)", "#", replace);
	}

	getEndCustomDirectivePlaceholder(replace: string) {
		return _.replace("@endcustomdirective(___#___)", "#", replace);
	}

	getElseCustomDirectivePlaceholder(replace: string) {
		return _.replace("@else(___#___)", "#", replace);
	}

	getCustomDirectivePlaceholder(replace: any) {
		return _.replace("___blade_comment_#___", "#", replace);
	}
}
