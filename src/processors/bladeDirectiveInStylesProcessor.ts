import _ from "lodash";
import {
	cssAtRuleTokens,
	indentElseTokens,
	indentEndTokens,
	indentStartTokens,
} from "src/indent";
import { nestedParenthesisRegex } from "src/regex";
import { Processor } from "./processor";

export class BladeDirectiveInStylesProcessor extends Processor {
	private bladeDirectivesInStyle: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveBladeDirectiveInStyles(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreBladeDirectiveInStyles(content);
	}

	private async preserveBladeDirectiveInStyles(content: string): Promise<any> {
		return _.replace(
			content,
			/(?<=<style[^>]*?(?<!=)>)(.*?)(?=<\/style>)/gis,
			(inside: string) => {
				let result: string = inside;

				const inlineRegex = new RegExp(
					`(?!${["@end", "@else", ...cssAtRuleTokens].join(
						"|",
					)})@(\\w+)\\s*?(?![^\\1]*@end\\1)${nestedParenthesisRegex}`,
					"gmi",
				);

				result = _.replace(
					result,
					inlineRegex,
					(match: string) =>
						`${this.storeBladeDirectiveInStyle(
							match,
						)} {/* inline_directive */}`,
				);

				const customStartRegex = new RegExp(
					`(?!${["@end", "@else", ...cssAtRuleTokens].join(
						"|",
					)})@(\\w+)\\s*?(${nestedParenthesisRegex})`,
					"gmi",
				);

				result = _.replace(
					result,
					customStartRegex,
					(match: string) =>
						`${this.storeBladeDirectiveInStyle(match)} { /*start*/`,
				);

				const startRegex = new RegExp(
					`(${indentStartTokens.join("|")})\\s*?(${nestedParenthesisRegex})`,
					"gmi",
				);

				result = _.replace(
					result,
					startRegex,
					(match: string) =>
						`${this.storeBladeDirectiveInStyle(match)} { /*start*/`,
				);

				const elseRegex = new RegExp(
					`(${["@else\\w+", ...indentElseTokens].join(
						"|",
					)})\\s*?(${nestedParenthesisRegex})?`,
					"gmi",
				);

				result = _.replace(
					result,
					elseRegex,
					(match: string) =>
						`} ${this.storeBladeDirectiveInStyle(match)} { /*else*/`,
				);

				const endRegex = new RegExp(
					`${["@end\\w+", ...indentEndTokens].join("|")}`,
					"gmi",
				);

				result = _.replace(
					result,
					endRegex,
					(match: string) =>
						`} /* ${this.storeBladeDirectiveInStyle(match)} */`,
				);

				return result;
			},
		);
	}

	private async restoreBladeDirectiveInStyles(content: string): Promise<any> {
		return _.replace(
			content,
			/(?<=<style[^>]*?(?<!=)>)(.*?)(?=<\/style>)/gis,
			(inside: string) => {
				let result: string = inside;

				const inlineRegex = new RegExp(
					`${this.getBladeDirectiveInStylePlaceholder(
						"(\\d+)",
					)} {\\s*?\/\\* inline_directive \\*\/\\s*?}`,
					"gmi",
				);

				result = _.replace(
					result,
					inlineRegex,
					(match: string, p1: number) => this.bladeDirectivesInStyle[p1],
				);

				const elseRegex = new RegExp(
					`}\\s*?${this.getBladeDirectiveInStylePlaceholder(
						"(\\d+)",
					)} {\\s*?\/\\*else\\*\/`,
					"gmi",
				);

				result = _.replace(
					result,
					elseRegex,
					(match: string, p1: number) => `${this.bladeDirectivesInStyle[p1]}`,
				);

				const startRegex = new RegExp(
					`${this.getBladeDirectiveInStylePlaceholder(
						"(\\d+)",
					)} {\\s*?\/\\*start\\*\/`,
					"gmi",
				);

				result = _.replace(
					result,
					startRegex,
					(match: string, p1: number) => `${this.bladeDirectivesInStyle[p1]}`,
				);

				const endRegex = new RegExp(
					`}\\s*?\/\\* ${this.getBladeDirectiveInStylePlaceholder(
						"(\\d+)",
					)} \\*\/`,
					"gmi",
				);

				result = _.replace(
					result,
					endRegex,
					(match: string, p1: number) => `${this.bladeDirectivesInStyle[p1]}`,
				);

				return result;
			},
		);
	}

	storeBladeDirectiveInStyle(value: string) {
		return this.getBladeDirectiveInStylePlaceholder(
			(this.bladeDirectivesInStyle.push(value) - 1).toString(),
		);
	}

	getBladeDirectiveInStylePlaceholder(replace: string) {
		return _.replace(".___blade_directive_in_style_#__", "#", replace);
	}
}
