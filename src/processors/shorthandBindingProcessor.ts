import detectIndent from "detect-indent";
import type { JSBeautifyOptions } from "js-beautify";
import beautify from "js-beautify";
import _ from "lodash";
import * as util from "../util";
import { Processor } from "./processor";

export class ShorthandBindingProcessor extends Processor {
	private shorthandBindings: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveShorthandBinding(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreShorthandBinding(content);
	}

	private async preserveShorthandBinding(content: string): Promise<any> {
		return _.replace(
			content,
			/(?<=<(?!livewire:)[^<]*?(\s|x-bind)):{1}(?<!=>)[\w\-_.]*?=(["'])(?!=>)[^\2]*?\2(?=[^>]*?\/*?>)/gim,
			(match: any) => `${this.storeShorthandBinding(match)}`,
		);
	}

	private async restoreShorthandBinding(content: string): Promise<any> {
		return _.replace(
			content,
			new RegExp(`${this.getShorthandBindingPlaceholder("(\\d+)")}`, "gms"),
			(_match: any, p1: any) => {
				const placeholder = this.getShorthandBindingPlaceholder(p1);
				const matchedLine = content.match(
					new RegExp(`^(.*?)${placeholder}`, "gmi"),
				) ?? [""];
				const indent = detectIndent(matchedLine[0]);

				const matched = this.shorthandBindings[p1];

				const formatted = _.replace(
					matched,
					/(:{1,2}.*?=)(["'])(.*?)(?=\2)/gis,
					(match, p2: string, p3: string, p4: string) => {
						const beautifyOpts: JSBeautifyOptions = {
							wrap_line_length: this.formatter.wrapLineLength - indent.amount,
							brace_style: "preserve-inline",
						};

						if (p4 === "") {
							return match;
						}

						if (util.isInline(p4)) {
							try {
								return `${p2}${p3}${beautify
									.js_beautify(p4.trim(), beautifyOpts)
									.trim()}`;
							} catch (error) {
								return `${p2}${p3}${p4.trim()}`;
							}
						}

						return `${p2}${p3}${beautify
							.js_beautify(p4.trim(), beautifyOpts)
							.trim()}`;
					},
				);

				return `${util.indentComponentAttribute(indent.indent, formatted, this.formatter)}`;
			},
		);
	}

	storeShorthandBinding(value: string) {
		const index = this.shorthandBindings.push(value) - 1;

		return this.getShorthandBindingPlaceholder(index.toString(), value.length);
	}

	getShorthandBindingPlaceholder(replace: string, length: any = 0) {
		if (length && length > 0) {
			const template = "___short_binding_#___";
			const gap = length - template.length;
			return _.replace(
				`___short_binding_${_.repeat("_", gap > 0 ? gap : 1)}#___`,
				"#",
				replace,
			);
		}
		return _.replace("___short_binding_+?#___", "#", replace);
	}
}
