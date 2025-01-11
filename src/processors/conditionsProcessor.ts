import detectIndent from "detect-indent";
import _ from "lodash";
import { conditionalTokens } from "src/indent";
import { nestedParenthesisRegex } from "src/regex";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class ConditionsProcessor extends Processor {
	private conditions: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveConditions(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreConditions(content);
	}

	private async preserveConditions(content: string): Promise<any> {
		const regex = new RegExp(
			`(${conditionalTokens.join(
				"|",
				// eslint-disable-next-line max-len
			)})(\\s*?)${nestedParenthesisRegex}`,
			"gi",
		);
		return _.replace(
			content,
			regex,
			(match: any, p1: any, p2: any, p3: any) =>
				`${p1}${p2}(${this.storeConditions(p3)})`,
		);
	}

	private async restoreConditions(content: string): Promise<any> {
		return new Promise((resolve) => resolve(content)).then((res: any) =>
			replaceAsync(
				res,
				new RegExp(`${this.getConditionsPlaceholder("(\\d+)")}`, "gms"),
				async (_match: any, p1: any) => {
					const placeholder = this.getConditionsPlaceholder(p1);
					const matchedLine = content.match(
						new RegExp(`^(.*?)${placeholder}`, "gmi"),
					) ?? [""];
					const indent = detectIndent(matchedLine[0]);

					const matched = this.conditions[p1];

					return util.formatExpressionInsideBladeDirective(
						matched,
						indent,
						this.formatter,
					);
				},
			),
		);
	}

	storeConditions(value: any) {
		return this.getConditionsPlaceholder(this.conditions.push(value) - 1);
	}

	getConditionsPlaceholder(replace: any) {
		return _.replace("___directive_condition_#___", "#", replace);
	}
}
