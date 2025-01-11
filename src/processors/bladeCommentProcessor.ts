import _ from "lodash";
import { Processor } from "./processor";

export class BladeCommentProcessor extends Processor {
	private bladeComments: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveBladeComment(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreBladeComment(content);
	}

	private async preserveBladeComment(content: string): Promise<any> {
		return _.replace(content, /\{\{--(.*?)--\}\}/gs, (match: string) =>
			this.storeBladeComment(match),
		);
	}

	private async restoreBladeComment(content: string): Promise<any> {
		return new Promise((resolve) => resolve(content)).then((res: any) =>
			_.replace(
				res,
				new RegExp(`${this.getBladeCommentPlaceholder("(\\d+)")}`, "gms"),
				(_match: any, p1: any) =>
					this.bladeComments[p1]
						.replace(/{{--(?=\S)/g, "{{-- ")
						.replace(/(?<=\S)--}}/g, " --}}"),
			),
		);
	}

	storeBladeComment(value: string) {
		return this.getBladeCommentPlaceholder(this.bladeComments.push(value) - 1);
	}

	getBladeCommentPlaceholder(replace: any) {
		return _.replace("___blade_comment_#___", "#", replace);
	}
}
