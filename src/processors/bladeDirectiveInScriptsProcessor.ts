import Aigle from "aigle";
import detectIndent from "detect-indent";
import _ from "lodash";
import {
	indentElseTokens,
	indentEndTokens,
	indentStartOrElseTokens,
	indentStartTokens,
	inlineFunctionTokens,
	phpKeywordStartTokens,
	unbalancedStartTokens,
} from "src/indent";
import { nestedParenthesisRegex } from "src/regex";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class BladeDirectiveInScriptsProcessor extends Processor {
	private bladeDirectives: string[] = [];
	private directivesInScript: string[] = [];
	private rawBlocks: string[] = [];
	private customDirectives: string[] = [];
	private stringLiteralInPhp: string[] = [];

	async preProcess(content: string): Promise<any> {
		const result = await this.preserveBladeDirectiveInScripts(content);

		// format preserved blade directives
		this.bladeDirectives = await this.formatPreservedBladeDirectives(
			this.bladeDirectives,
		);

		return result;
	}

	async postProcess(content: string): Promise<any> {
		const result = await this.restoreBladeDirectiveInScripts(content);

		return result;
	}

	private async preserveBladeDirectiveInScripts(content: string): Promise<any> {
		return _.replace(
			content,
			/(?<=<script[^>]*?(?<!=)>)(.*?)(?=<\/script>)/gis,
			(match: string) => {
				const targetTokens = [...indentStartTokens, ...inlineFunctionTokens];

				if (new RegExp(targetTokens.join("|"), "gmi").test(match) === false) {
					if (/^[\s\n]+$/.test(match)) {
						return match.trim();
					}

					return match;
				}

				const inlineFunctionDirectives = inlineFunctionTokens.join("|");
				const inlineFunctionRegex = new RegExp(
					// eslint-disable-next-line max-len
					`(?!\\/\\*.*?\\*\\/)(${inlineFunctionDirectives})(\\s*?)${nestedParenthesisRegex}`,
					"gmi",
				);
				const endTokens = _.chain(indentEndTokens).without("@endphp");

				let formatted: string = match;

				formatted = _.replace(formatted, inlineFunctionRegex, (matched: any) =>
					this.storeBladeDirective(
						util.formatRawStringAsPhp(matched, {
							...this.formatter.options,
							printWidth: util.printWidthForInline,
						}),
					),
				);

				formatted = _.replace(
					formatted,
					new RegExp(
						`(${indentStartTokens.join("|")})\\s*?${nestedParenthesisRegex}`,
						"gis",
					),
					(matched) =>
						`if ( /*${this.storeBladeDirectiveInScript(matched)}*/ ) {`,
				);

				formatted = _.replace(
					formatted,
					new RegExp(
						`(${[...indentElseTokens, ...indentStartOrElseTokens].join(
							"|",
						)})(?!\\w+?\\s*?\\(.*?\\))`,
						"gis",
					),
					(matched) =>
						`/***script_placeholder***/} /* ${this.storeBladeDirectiveInScript(
							matched,
						)} */ {`,
				);

				formatted = _.replace(
					formatted,
					new RegExp(`(${endTokens.join("|")})`, "gis"),
					(matched) =>
						`/***script_placeholder***/} /*${this.storeBladeDirectiveInScript(
							matched,
						)}*/`,
				);

				formatted = _.replace(
					formatted,
					/(?<!@)@php(.*?)@endphp/gis,
					(_matched: any, p1: any) => this.storeRawBlock(p1),
				);

				// custom directive
				formatted = this.preserveCustomDirectiveInScript(formatted);

				return formatted;
			},
		);
	}

	/**
	 *
	 * @param content string between <script>~</script>
	 * @returns string
	 */
	preserveCustomDirectiveInScript(content: string): string {
		const negativeLookAhead = [
			..._.without(indentStartTokens, "@unless"),
			...indentEndTokens,
			...indentElseTokens,
			...["@unless\\(.*?\\)"],
		].join("|");

		const inlineNegativeLookAhead = [
			..._.without(indentStartTokens, "@unless"),
			...indentEndTokens,
			...indentElseTokens,
			...inlineFunctionTokens,
			...phpKeywordStartTokens,
			...["@unless[a-z]*\\(.*?\\)"],
			...unbalancedStartTokens,
		].join("|");

		const inlineRegex = new RegExp(
			`(?!(${inlineNegativeLookAhead}))(@([a-zA-Z1-9_\\-]+))(?!.*?@end\\3)${nestedParenthesisRegex}.*?(?<!@end\\5)`,
			"gis",
		);

		const regex = new RegExp(
			`(?!(${negativeLookAhead}))(@(unless)*([a-zA-Z1-9_\\-]+))(?!.*?\\2)(\\s|\\(.*?\\))+(.*?)(@end\\4)`,
			"gis",
		);

		let formatted: string;

		// preserve inline directives
		formatted = _.replace(content, inlineRegex, (match: string) =>
			this.storeInlineCustomDirective(match),
		);

		// preserve begin~else~end directives
		formatted = _.replace(
			formatted,
			regex,
			(
				match: string,
				p1: string,
				p2: string,
				p3: string,
				p4: string,
				p5: string,
				p6: string,
				p7: string,
			) => {
				if (indentStartTokens.includes(p2)) {
					return match;
				}

				let result: string = match;

				result = _.replace(
					result,
					new RegExp(`${p2}(${nestedParenthesisRegex})*`, "gim"),
					(beginStr: string) =>
						`if ( /*${this.storeBladeDirectiveInScript(beginStr)}*/ ) {`,
				);

				result = _.replace(
					result,
					new RegExp(`@else${p4}(${nestedParenthesisRegex})*`, "gim"),
					(elseStr: string) =>
						`/***script_placeholder***/} /* ${this.storeBladeDirectiveInScript(
							elseStr,
						)} */ {`,
				);
				result = _.replace(
					result,
					p7,
					(endStr: string) =>
						`/***script_placeholder***/} /*${this.storeBladeDirectiveInScript(
							endStr,
						)}*/`,
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

	private async restoreBladeDirectiveInScripts(content: string): Promise<any> {
		const regex = new RegExp(
			`${this.getBladeDirectivePlaceholder("(\\d+)")}`,
			"gm",
		);

		// restore inline blade directive
		let result = _.replace(content, regex, (_match: any, p1: number) => {
			const placeholder = this.getBladeDirectivePlaceholder(p1.toString());
			const matchedLine = content.match(
				new RegExp(`^(.*?)${placeholder}`, "gmi"),
			) ?? [""];
			const indent = detectIndent(matchedLine[0]);

			return util.indentBladeDirectiveBlock(
				indent,
				this.bladeDirectives[p1],
				this.formatter,
			);
		});

		result = await replaceAsync(
			result,
			/(?<=<script[^>]*?(?<!=)>)(.*?)(?=<\/script>)/gis,
			async (match: string) => {
				let formatted: string = match;

				// restore begin
				formatted = _.replace(
					formatted,
					new RegExp(
						`if \\( \\/\\*(?:(?:${this.getBladeDirectiveInScriptPlaceholder(
							"(\\d+)",
						)}).*?)\\*\\/ \\) \\{`,
						"gis",
					),
					(_match: any, p1: any) => `${this.directivesInScript[p1]}`,
				);

				// restore else
				formatted = _.replace(
					formatted,
					new RegExp(
						`} \\/\\* (?:${this.getBladeDirectiveInScriptPlaceholder(
							"(\\d+)",
						)}) \\*\\/ {(\\s*?\\(___directive_condition_\\d+___\\))?`,
						"gim",
					),
					(_match: any, p1: number, p2: string) => {
						if (_.isUndefined(p2)) {
							return `${this.directivesInScript[p1].trim()}`;
						}

						return `${this.directivesInScript[p1].trim()} ${(p2 ?? "").trim()}`;
					},
				);

				// restore end
				formatted = _.replace(
					formatted,
					new RegExp(
						`} \\/\\*(?:${this.getBladeDirectiveInScriptPlaceholder(
							"(\\d+)",
						)})\\*\\/`,
						"gis",
					),
					(_match: any, p1: any) => `${this.directivesInScript[p1]}`,
				);

				// restore php block
				formatted = await replaceAsync(
					formatted,
					new RegExp(`${this.getRawPlaceholder("(\\d+)")}`, "gm"),
					// eslint-disable-next-line no-shadow
					async (match: any, p1: number) => {
						let rawBlock = this.rawBlocks[p1];
						const placeholder = this.getRawPlaceholder(p1.toString());
						const matchedLine = content.match(
							new RegExp(`^(.*?)${placeholder}`, "gmi"),
						) ?? [""];
						const indent = detectIndent(matchedLine[0]);

						if (
							util.isInline(rawBlock) &&
							(await util.isMultilineStatement(rawBlock, this.formatter))
						) {
							rawBlock = (
								await util.formatStringAsPhp(
									`<?php\n${rawBlock}\n?>`,
									this.formatter.options,
								)
							).trim();
						} else if (rawBlock.split("\n").length > 1) {
							rawBlock = (
								await util.formatStringAsPhp(
									`<?php${rawBlock}?>`,
									this.formatter.options,
								)
							).trim();
						} else {
							rawBlock = `<?php${rawBlock}?>`;
						}

						return _.replace(
							rawBlock,
							/^(\s*)?<\?php(.*?)\?>/gms,
							(_matched: any, _q1: any, q2: any) => {
								if (util.isInline(rawBlock)) {
									return `@php${q2}@endphp`;
								}

								const preserved = this.preserveStringLiteralInPhp(q2);
								const indented = util.indentRawBlock(
									indent,
									preserved,
									this.formatter,
								);
								const restored = this.restoreStringLiteralInPhp(indented);

								return `@php${restored}@endphp`;
							},
						);
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

						const group1 = p1 ?? "";
						const group2 = p2 ?? "";

						return group1 + group2;
					},
				);

				return formatted;
			},
		);

		if (regex.test(result)) {
			result = await this.restoreBladeDirectiveInScripts(result);
		}

		return result;
	}

	storeBladeDirective(value: any) {
		return this.getBladeDirectivePlaceholder(
			this.bladeDirectives.push(value) - 1,
		);
	}

	storeBladeDirectiveInScript(value: string) {
		return this.getBladeDirectiveInScriptPlaceholder(
			(this.directivesInScript.push(value) - 1).toString(),
		);
	}

	getBladeDirectiveInScriptPlaceholder(replace: any) {
		return _.replace("___directives_script_#___", "#", replace);
	}

	getBladeDirectivePlaceholder(replace: any) {
		return _.replace("___blade_directive_#___", "#", replace);
	}

	getInlinePhpPlaceholder(replace: any) {
		return _.replace("___inline_php_directive_#___", "#", replace);
	}

	async formatExpressionInsideBladeDirective(
		matchedExpression: string,
		indent: detectIndent.Indent,
		wrapLength: number | undefined = undefined,
	) {
		const formatTarget = `func(${matchedExpression})`;
		const formattedExpression = await util.formatRawStringAsPhp(formatTarget, {
			...this.formatter.options,
			printWidth:
				wrapLength ?? this.formatter.defaultPhpFormatOption.printWidth,
		});

		if (formattedExpression === formatTarget) {
			return matchedExpression;
		}

		let inside = formattedExpression
			.replace(/([\n\s]*)->([\n\s]*)/gs, "->")
			.replace(/(?<!(['"]).*)(?<=\()[\n\s]+?(?=\w)/gm, "")
			.replace(
				/(.*)],[\n\s]*?\)$/gm,
				(match: string, p1: string) => `${p1}]\n)`,
			)
			.replace(/,[\n\s]*?\)/gs, ")")
			.replace(/,(\s*?\))$/gm, (match, p1) => p1)
			.trim();

		if (this.formatter.options.useTabs || false) {
			inside = _.replace(
				inside,
				/(?<=^ *) {4}/gm,
				"\t".repeat(this.formatter.indentSize),
			);
		}

		inside = inside.replace(
			/func\((.*)\)/gis,
			(match: string, p1: string) => p1,
		);
		if (util.isInline(inside.trim())) {
			inside = inside.trim();
		}

		return util.indentRawPhpBlock(indent, inside, this.formatter);
	}

	storeRawBlock(value: any) {
		return this.getRawPlaceholder(this.rawBlocks.push(value) - 1);
	}

	getRawPlaceholder(replace: any) {
		return _.replace("___raw_block_#___", "#", replace);
	}

	storeInlineCustomDirective(value: string) {
		return this.getInlineCustomDirectivePlaceholder(
			(this.customDirectives.push(value) - 1).toString(),
		);
	}

	getInlineCustomDirectivePlaceholder(replace: string) {
		return _.replace("___inline_cd_#___", "#", replace);
	}

	preserveStringLiteralInPhp(content: any) {
		return _.replace(
			content,
			/(\"([^\\]|\\.)*?\"|\'([^\\]|\\.)*?\')/gm,
			(match: string) => `${this.storeStringLiteralInPhp(match)}`,
		);
	}

	storeStringLiteralInPhp(value: any) {
		const index = this.stringLiteralInPhp.push(value) - 1;
		return this.getStringLiteralInPhpPlaceholder(index);
	}

	getStringLiteralInPhpPlaceholder(replace: any) {
		return _.replace("'___php_content_#___'", "#", replace);
	}

	restoreStringLiteralInPhp(content: any) {
		return _.replace(
			content,
			new RegExp(`${this.getStringLiteralInPhpPlaceholder("(\\d+)")}`, "gms"),
			(_match: any, p1: any) => this.stringLiteralInPhp[p1],
		);
	}

	async formatPreservedBladeDirectives(directives: any) {
		return Aigle.map(directives, async (content: any) => {
			const formattedAsHtml = await util.formatAsHtml(content, this.formatter);
			const formatted = await util.formatAsBlade(
				formattedAsHtml,
				this.formatter,
			);
			return formatted.trimRight("\n");
		});
	}
}
