import detectIndent from "detect-indent";
import _ from "lodash";
import { inlineFunctionTokens, inlinePhpDirectives } from "src/indent";
import { nestedParenthesisRegex } from "src/regex";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class InlinePhpDirectiveProcessor extends Processor {
	private inlinePhpDirectives: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveInlinePhpDirective(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreInlinePhpDirective(content);
	}

	private async preserveInlinePhpDirective(content: string): Promise<any> {
		return _.replace(
			content,
			// eslint-disable-next-line max-len
			new RegExp(
				`(?!\\/\\*.*?\\*\\/)(${inlineFunctionTokens.join(
					"|",
				)})(\\s*?)${nestedParenthesisRegex}`,
				"gmsi",
			),
			(match: any) => this.storeInlinePhpDirective(match),
		);
	}

	private async restoreInlinePhpDirective(content: string): Promise<any> {
		return new Promise((resolve) => resolve(content)).then((res) =>
			replaceAsync(
				// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
				res,
				new RegExp(`${this.getInlinePhpPlaceholder("(\\d+)")}`, "gm"),
				async (_match: any, p1: any) => {
					const matched = this.inlinePhpDirectives[p1];
					const placeholder = this.getInlinePhpPlaceholder(p1);
					const matchedLine = content.match(
						new RegExp(`^(.*?)${placeholder}`, "gmi"),
					) ?? [""];
					const indent = detectIndent(matchedLine[0]);

					if (matched.includes("@php")) {
						return `${(
							await util.formatRawStringAsPhp(matched, {
								...this.formatter.options,
								printWidth: util.printWidthForInline,
							})
						)
							.replace(/([\n\s]*)->([\n\s]*)/gs, "->")
							.trim()
							// @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
							.trimRight("\n")}`;
					}

					if (new RegExp(inlinePhpDirectives.join("|"), "gi").test(matched)) {
						const formatted = replaceAsync(
							matched,
							new RegExp(
								`(?<=@(${_.map(inlinePhpDirectives, (token) =>
									token.substring(1),
								).join("|")}).*?\\()(.*)(?=\\))`,
								"gis",
							),
							async (match2: any, p3: any, p4: any) => {
								let wrapLength = this.formatter.wrapLineLength;

								if (["button", "class"].includes(p3)) {
									wrapLength = 80;
								}

								if (p3 === "include") {
									wrapLength =
										this.formatter.wrapLineLength -
										"func".length -
										p1.length -
										indent.amount;
								}

								return this.formatExpressionInsideBladeDirective(
									p4,
									indent,
									wrapLength,
								);
							},
						);

						return formatted;
					}

					return `${(
						await util.formatRawStringAsPhp(matched, {
							...this.formatter.options,
							printWidth: util.printWidthForInline,
						})
					).trimEnd()}`;
				},
			),
		);
	}

	storeInlinePhpDirective(value: any) {
		return this.getInlinePhpPlaceholder(
			this.inlinePhpDirectives.push(value) - 1,
		);
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
}
