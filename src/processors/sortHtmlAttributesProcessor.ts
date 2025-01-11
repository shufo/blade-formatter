import { sortAttributes } from "html-attribute-sorter";
import _ from "lodash";
import type { SortHtmlAttributes } from "src/runtimeConfig";
import { Processor } from "./processor";

export class SortHtmlAttributesProcessor extends Processor {
	private bladeComments: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.sortHtmlAttribute(content);
	}

	async postProcess(content: string): Promise<any> {}

	private async sortHtmlAttribute(content: string): Promise<any> {
		const strategy: SortHtmlAttributes =
			this.formatter.options.sortHtmlAttributes ?? "none";

		if (!_.isEmpty(strategy) && strategy !== "none") {
			const regexes = this.formatter.options.customHtmlAttributesOrder;

			if (_.isArray(regexes)) {
				return sortAttributes(content, {
					order: strategy,
					customRegexes: regexes,
				});
			}

			// when option is string
			const customRegexes = _.chain(regexes).split(",").map(_.trim).value();

			return sortAttributes(content, { order: strategy, customRegexes });
		}

		return content;
	}
}
