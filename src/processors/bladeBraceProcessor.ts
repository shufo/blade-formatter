import detectIndent from "detect-indent";
import _ from "lodash";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class BladeBraceProcessor extends Processor {
	private bladeBraces: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveBladeBrace(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreBladeBrace(content);
	}

	private async preserveBladeBrace(content: string): Promise<any> {
		return _.replace(content, /\{\{(.*?)\}\}/gs, (_match: any, p1: any) => {
			// if content is blank
			if (p1 === "") {
				return this.storeBladeBrace(p1, p1.length);
			}

			// preserve a space if content contains only space, tab, or new line character
			if (!/\S/.test(p1)) {
				return this.storeBladeBrace(" ", " ".length);
			}

			// any other content
			return this.storeBladeBrace(p1.trim(), p1.trim().length);
		});
	}

	private async restoreBladeBrace(content: string): Promise<any> {
		return new Promise((resolve) => resolve(content)).then((res: any) =>
			replaceAsync(
				res,
				new RegExp(`${this.getBladeBracePlaceholder("(\\d+)")}`, "gm"),
				async (_match: string, p1: number) => {
					const placeholder = this.getBladeBracePlaceholder(p1.toString());
					const matchedLine = content.match(
						new RegExp(`^(.*?)${placeholder}`, "gmi"),
					) ?? [""];
					const indent = detectIndent(matchedLine[0]);
					const bladeBrace = this.bladeBraces[p1];

					if (bladeBrace.trim() === "") {
						return `{{${bladeBrace}}}`;
					}

					if (util.isInline(bladeBrace)) {
						return `{{ ${(
							await util.formatRawStringAsPhp(bladeBrace, {
								...this.formatter.options,
								trailingCommaPHP: false,
								printWidth: util.printWidthForInline,
							})
						)
							.replace(/([\n\s]*)->([\n\s]*)/gs, "->")
							.split("\n")
							.map((line) => line.trim())
							.join("")
							// @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
							.trimRight("\n")} }}`;
					}

					return `{{ ${util.indentRawPhpBlock(
						indent,
						(
							await util.formatRawStringAsPhp(
								bladeBrace,
								this.formatter.options,
							)
						)
							.replace(/([\n\s]*)->([\n\s]*)/gs, "->")
							.trim()
							.trimEnd(),
						this.formatter,
					)} }}`;
				},
			),
		);
	}

	storeBladeBrace(value: any, length: any) {
		const index = this.bladeBraces.push(value) - 1;
		const brace = "{{  }}";
		return this.getBladeBracePlaceholder(index, length + brace.length);
	}

	getBladeBracePlaceholder(replace: any, length = 0) {
		if (length > 0) {
			const template = "___blade_brace_#___";
			const gap = length - template.length;
			return _.replace(
				`___blade_brace_${_.repeat("_", gap > 0 ? gap : 0)}#___`,
				"#",
				replace,
			);
		}

		return _.replace("___blade_brace_+?#___", "#", replace);
	}
}
