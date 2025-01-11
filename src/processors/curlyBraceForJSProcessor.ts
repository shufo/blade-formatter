import beautify, { type JSBeautifyOptions } from "js-beautify";
import _ from "lodash";
import { Processor } from "./processor";

export class CurlyBraceForJSProcessor extends Processor {
	private curlyBracesWithJSs: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveCurlyBraceForJS(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreCurlyBraceForJS(content);
	}

	private async preserveCurlyBraceForJS(content: string): Promise<any> {
		return _.replace(content, /@{{(.*?)}}/gs, (match: any, p1: any) =>
			this.storeCurlyBraceForJS(p1),
		);
	}

	storeCurlyBraceForJS(value: any) {
		return this.getCurlyBraceForJSPlaceholder(
			this.curlyBracesWithJSs.push(value) - 1,
		);
	}

	getCurlyBraceForJSPlaceholder(replace: any) {
		return _.replace("___js_curly_brace_#___", "#", replace);
	}

	private async restoreCurlyBraceForJS(content: string): Promise<any> {
		return _.replace(
			content,
			new RegExp(`${this.getCurlyBraceForJSPlaceholder("(\\d+)")}`, "gm"),
			(_match: any, p1: any) =>
				`@{{ ${beautify.js_beautify(this.curlyBracesWithJSs[p1].trim())} }}`,
		);
	}
}
