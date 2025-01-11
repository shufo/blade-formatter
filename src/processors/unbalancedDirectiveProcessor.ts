import _ from "lodash";
import { unbalancedStartTokens } from "src/indent";
import { Processor } from "./processor";

export class UnbalancedDirectiveProcessor extends Processor {
	private unbalancedDirectives: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveUnbalancedDirective(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreUnbalancedDirective(content);
	}

	private async preserveUnbalancedDirective(content: any): Promise<any> {
		const regex = new RegExp(
			`((${unbalancedStartTokens.join(
				"|",
			)})(?!.*?\\2)(?:\\s|\\(.*?\\)))+(?=.*?@endif)`,
			"gis",
		);

		let replaced: string = _.replace(
			content,
			regex,
			(_match: string, p1: string) => `${this.storeUnbalancedDirective(p1)}`,
		);

		if (regex.test(replaced)) {
			replaced = await this.preserveUnbalancedDirective(replaced);
		}

		return replaced;
	}

	private async restoreUnbalancedDirective(content: string): Promise<any> {
		return new Promise((resolve) => resolve(content)).then((res: any) =>
			_.replace(
				res,
				/@if \(unbalanced___(\d+)___\)/gms,
				(_match: any, p1: any) => {
					const matched = this.unbalancedDirectives[p1];
					return matched;
				},
			),
		);
	}

	storeUnbalancedDirective(value: string) {
		return this.getUnbalancedDirectivePlaceholder(
			(this.unbalancedDirectives.push(value) - 1).toString(),
		);
	}

	getUnbalancedDirectivePlaceholder(replace: string) {
		return _.replace("@if (unbalanced___#___)", "#", replace);
	}
}
