import detectIndent from "detect-indent";
import beautify from "js-beautify";
import _ from "lodash";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class ComponentAttributeProcessor extends Processor {
	private componentAttributes: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveComponentAttribute(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreComponentAttribute(content);
	}

	private async preserveComponentAttribute(content: string): Promise<any> {
		const prefixes =
			Array.isArray(this.formatter.options.componentPrefix) &&
			this.formatter.options.componentPrefix.length > 0
				? this.formatter.options.componentPrefix
				: ["x-", "livewire:"];
		const regex = new RegExp(
			`(?<=<(${prefixes.join(
				"|",
			)})[^<]*?\\s):{1,2}(?<!=>)[\\w\-_.]*?=(["'])(?!=>)[^\\2]*?\\2(?=[^>]*?\/*?>)`,
			"gim",
		);
		return _.replace(
			content,
			regex,
			(match: any) => `${this.storeComponentAttribute(match)}`,
		);
	}

	private async restoreComponentAttribute(content: string): Promise<any> {
		return replaceAsync(
			content,
			new RegExp(`${this.getComponentAttributePlaceholder("(\\d+)")}`, "gim"),
			async (_match: any, p1: any) => {
				const placeholder = this.getComponentAttributePlaceholder(p1);
				const matchedLine = content.match(
					new RegExp(`^(.*?)${placeholder}`, "gmi"),
				) ?? [""];
				const indent = detectIndent(matchedLine[0]);

				const matched = this.componentAttributes[p1];
				const formatted = await replaceAsync(
					matched,
					/(:{1,2}.*?=)(["'])(.*?)(?=\2)/gis,
					async (match, p2: string, p3: string, p4: string) => {
						if (p4 === "") {
							return match;
						}

						if (matchedLine[0].startsWith("<livewire")) {
							return `${p2}${p3}${p4}`;
						}

						if (p2.startsWith("::")) {
							return `${p2}${p3}${beautify
								.js_beautify(p4, {
									wrap_line_length:
										this.formatter.wrapLineLength - indent.amount,
									brace_style: "preserve-inline",
								})
								.trim()}`;
						}

						if (util.isInline(p4)) {
							try {
								return `${p2}${p3}${(
									await util.formatRawStringAsPhp(p4, {
										...this.formatter.options,
										printWidth: this.formatter.wrapLineLength - indent.amount,
									})
								).trimEnd()}`;
							} catch (error) {
								return `${p2}${p3}${p4}`;
							}
						}

						return `${p2}${p3}${(
							await util.formatRawStringAsPhp(p4, {
								...this.formatter.options,
								printWidth: this.formatter.wrapLineLength - indent.amount,
							})
						).trimEnd()}`;
					},
				);

				return `${util.indentComponentAttribute(indent.indent, formatted, this.formatter)}`;
			},
		);
	}

	storeComponentAttribute(value: string) {
		const index = this.componentAttributes.push(value) - 1;

		return this.getComponentAttributePlaceholder(index.toString());
	}

	getComponentAttributePlaceholder(replace: any) {
		return _.replace("___attribute_#___", "#", replace);
	}
}
