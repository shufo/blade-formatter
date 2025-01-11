import _ from "lodash";
import { nestedParenthesisRegex } from "src/regex";
import { Processor } from "./processor";

export class AdjustSpacesProcessor extends Processor {
	private bladeComments: string[] = [];

	async preProcess(content: string): Promise<any> {}

	async postProcess(content: string): Promise<any> {
		return await this.adjustSpaces(content);
	}

	private async adjustSpaces(content: string): Promise<any> {
		const directivesRequiredSpace = ["@unless"];

		return _.replace(
			content,
			new RegExp(
				`(?<!@)(${directivesRequiredSpace.join(
					"|",
				)})\\s*${nestedParenthesisRegex}`,
				"gi",
			),
			(_matched: string, p1: string, p2: string) => `${p1} (${p2})`,
		);
	}
}
