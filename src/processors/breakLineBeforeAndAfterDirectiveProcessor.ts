import _ from "lodash";
import {
	indentElseTokens,
	indentEndTokens,
	indentStartTokens,
} from "src/indent";
import { nestedParenthesisRegex } from "src/regex";
import XRegExp from "xregexp";
import * as util from "../util";
import { Processor } from "./processor";

export class BreakLineBeforeAndAfterDirectiveProcessor extends Processor {
	private bladeComments: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.breakLineBeforeAndAfterDirective(content);
	}

	async postProcess(content: string): Promise<any> {}

	breakLineBeforeAndAfterDirective(content: string): string {
		// handle directive around html tags
		let formattedContent = _.replace(
			content,
			new RegExp(
				`(?<=<.*?(?<!=)>)(${_.without(indentStartTokens, "@php").join(
					"|",
				)})(\\s*)${nestedParenthesisRegex}.*?(?=<.*?>)`,
				"gmis",
			),
			(match) => `\n${match.trim()}\n`,
		);

		// eslint-disable-next-line
		formattedContent = _.replace(
			formattedContent,
			new RegExp(
				`(?<=<.*?(?<!=)>).*?(${_.without(indentEndTokens, "@endphp").join(
					"|",
				)})(?=<.*?>)`,
				"gmis",
			),
			(match) => `\n${match.trim()}\n`,
		);

		const unbalancedConditions = ["@case", ...indentElseTokens];

		formattedContent = _.replace(
			formattedContent,
			new RegExp(
				`(\\s*?)(${unbalancedConditions.join(
					"|",
				)})(\\s*?)${nestedParenthesisRegex}(\\s*)`,
				"gmi",
			),
			(match) => `\n${match.trim()}\n`,
			// handle else directive
		);

		formattedContent = _.replace(
			formattedContent,
			new RegExp(
				`\\s*?(?!(${_.without(indentElseTokens, "@else").join("|")}))@else\\s+`,
				"gim",
			),
			(match) => `\n${match.trim()}\n`,
			// handle case directive
		);

		formattedContent = _.replace(
			formattedContent,
			/@case\S*?\s*?@case/gim,
			(match) => {
				// handle unbalanced echos
				return `${match.replace("\n", "")}`;
			},
		);

		const unbalancedEchos = ["@break"];

		_.forEach(unbalancedEchos, (directive) => {
			formattedContent = _.replace(
				formattedContent,
				new RegExp(`(\\s*?)${directive}\\s+`, "gmi"),
				(match) => {
					return `\n${match.trim()}\n\n`;
				},
			);
		});

		// other directives
		_.forEach(["@default"], (directive) => {
			formattedContent = _.replace(
				formattedContent,
				new RegExp(`(\\s*?)${directive}\\s*`, "gmi"),
				(match) => {
					return `\n\n${match.trim()}\n`;
				},
			);
		});

		// add line break around balanced directives
		const directives = _.chain(indentStartTokens)
			.map((x: any) => _.replace(x, /@/, ""))
			.value();

		_.forEach(directives, (directive: any) => {
			try {
				const recursivelyMatched = XRegExp.matchRecursive(
					formattedContent,
					`\\@${directive}`,
					`\\@end${directive}`,
					"gmi",
					{
						valueNames: [null, "left", "match", "right"],
					},
				);

				if (_.isEmpty(recursivelyMatched)) {
					return;
				}

				for (const matched of recursivelyMatched) {
					if (matched.name === "match") {
						if (new RegExp(indentStartTokens.join("|")).test(matched.value)) {
							formattedContent = _.replace(
								formattedContent,
								matched.value,
								this.breakLineBeforeAndAfterDirective(
									util.escapeReplacementString(matched.value),
								),
							);
						}

						const innerRegex = new RegExp(
							`^(\\s*?)${nestedParenthesisRegex}(.*)`,
							"gmis",
						);

						const replaced = _.replace(
							`${matched.value}`,
							innerRegex,
							(_match: string, p1: string, p2: string, p3: string) => {
								if (p3.trim() === "") {
									return `${p1}(${p2.trim()})\n${p3.trim()}`;
								}

								return `${p1}(${p2.trim()})\n${p3.trim()}\n`;
							},
						);

						formattedContent = _.replace(
							formattedContent,
							matched.value,
							util.escapeReplacementString(replaced),
						);
					}
				}
			} catch (error) {
				// do nothing to ignore unmatched directive pair
			}
		});

		return formattedContent;
	}
}
