import _ from "lodash";
import { Processor } from "./processor";

export class HtmlAttributesProcessor extends Processor {
	private htmlAttributes: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveHtmlAttributes(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreHtmlAttributes(content);
	}

	private async preserveHtmlAttributes(content: string): Promise<any> {
		return _.replace(
			content,
			/(?<=<[\w\-\.\:\_]+.*\s)(?!x-bind)([^\s\:][^\s\'\"]+\s*=\s*(["'])(?<!\\)[^\2]*?(?<!\\)\2)(?=.*(?<!=)\/?>)/gms,
			(match: string) => `${this.storeHtmlAttribute(match)}`,
		);
	}

	private async restoreHtmlAttributes(content: string): Promise<any> {
		return _.replace(
			content,
			// @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
			new RegExp(`${this.getHtmlAttributePlaceholder("(\\d+)")}`, "gms"),
			(_match: string, p1: number) => this.htmlAttributes[p1],
		);
	}

	storeHtmlAttribute(value: string) {
		const index = this.htmlAttributes.push(value) - 1;

		if (value.length > 0) {
			return this.getHtmlAttributePlaceholder(index.toString(), value.length);
		}

		return this.getHtmlAttributePlaceholder(index.toString(), 0);
	}

	getHtmlAttributePlaceholder(replace: string, length: any) {
		if (length && length > 0) {
			const template = "___attrs_#___";
			const gap = length - template.length;
			return _.replace(
				`___attrs${_.repeat("_", gap > 0 ? gap : 1)}#___`,
				"#",
				replace,
			);
		}

		if (_.isNull(length)) {
			return _.replace("___attrs_#___", "#", replace);
		}

		return _.replace("___attrs_+?#___", "#", replace);
	}
}
