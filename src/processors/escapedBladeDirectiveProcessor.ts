import _ from "lodash";
import { Processor } from "./processor";

export class EscapedBladeDirectiveProcessor extends Processor {
	private escapedBladeDirectives: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveEscapedBladeDirective(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreEscapedBladeDirective(content);
	}

	private async preserveEscapedBladeDirective(content: string): Promise<any> {
		return _.replace(content, /@@\w*/gim, (match: string) =>
			this.storeEscapedBladeDirective(match),
		);
	}

	private async restoreEscapedBladeDirective(content: string): Promise<any> {
		return new Promise((resolve) => resolve(content)).then((res: any) =>
			_.replace(
				res,
				new RegExp(
					`${this.getEscapedBladeDirectivePlaceholder("(\\d+)")}`,
					"gms",
				),
				(_match: string, p1: number) => this.escapedBladeDirectives[p1],
			),
		);
	}

	storeEscapedBladeDirective(value: string) {
		return this.getEscapedBladeDirectivePlaceholder(
			(this.escapedBladeDirectives.push(value) - 1).toString(),
		);
	}

	getEscapedBladeDirectivePlaceholder(replace: any) {
		return _.replace("___escaped_directive_#___", "#", replace);
	}
}
