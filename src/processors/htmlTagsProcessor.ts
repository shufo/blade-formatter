import detectIndent from "detect-indent";
import beautify from "js-beautify";
import _ from "lodash";
import * as util from "../util";
import { Processor } from "./processor";

export class HtmlTagsProcessor extends Processor {
	private htmlTags: string[] = [];
	private templatingStrings: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveHtmlTags(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreHtmlTags(content);
	}

	private async preserveHtmlTags(content: string): Promise<any> {
		const contentUnformatted = ["textarea", "pre"];

		return _.replace(
			content,
			new RegExp(
				`<(${contentUnformatted.join(
					"|",
				)})\\s{0,1}.*?>.*?<\\/(${contentUnformatted.join("|")})>`,
				"gis",
			),
			(match: string) => this.storeHtmlTags(match),
		);
	}

	private async restoreHtmlTags(content: string): Promise<any> {
		return _.replace(
			content,
			new RegExp(`${this.getHtmlTagsPlaceholder("(\\d+)")}`, "gim"),
			(_match: any, p1: number) => {
				const placeholder = this.getHtmlTagsPlaceholder(p1.toString());
				const matchedLine = content.match(
					new RegExp(`^(.*?)${placeholder}`, "gmi"),
				) ?? [""];
				const indent = detectIndent(matchedLine[0]);

				const options = {
					indent_size: util.optional(this.formatter.options).indentSize || 4,
					wrap_line_length:
						util.optional(this.formatter.options).wrapLineLength || 120,
					wrap_attributes:
						util.optional(this.formatter.options).wrapAttributes || "auto",
					wrap_attributes_min_attrs: util.optional(this.formatter.options)
						.wrapAttributesMinAttrs,
					indent_inner_html:
						util.optional(this.formatter.options).indentInnerHtml || false,
					extra_liners: util.optional(this.formatter.options).extraLiners,
					end_with_newline: false,
					templating: ["php"],
				};

				const matched = this.htmlTags[p1];
				const openingTag = _.first(
					matched.match(/(<(textarea|pre).*?(?<!=)>)(?=.*?<\/\2>)/gis),
				);

				if (openingTag === undefined) {
					return `${this.indentScriptBlock(
						indent,
						beautify.html_beautify(matched, options),
					)}`;
				}

				const restofTag = matched.substring(openingTag.length, matched.length);

				return `${this.indentScriptBlock(
					indent,
					beautify.html_beautify(openingTag, options),
				)}${restofTag}`;
			},
		);
	}

	storeHtmlTags(value: string) {
		return this.getHtmlTagsPlaceholder(
			(this.htmlTags.push(value) - 1).toString(),
		);
	}

	getHtmlTagsPlaceholder(replace: any) {
		return _.replace("<blade___html_tags_#___ />", "#", replace);
	}

	indentScriptBlock(indent: detectIndent.Indent, content: any) {
		if (_.isEmpty(indent.indent)) {
			return content;
		}

		if (util.isInline(content)) {
			return `${content}`;
		}

		const leftIndentAmount = indent.amount;
		const indentLevel = leftIndentAmount / this.formatter.indentSize;
		const prefixSpaces = this.formatter.indentCharacter.repeat(
			indentLevel < 0 ? 0 : indentLevel * this.formatter.indentSize,
		);
		const prefixForEnd = this.formatter.indentCharacter.repeat(
			indentLevel < 0 ? 0 : indentLevel * this.formatter.indentSize,
		);

		const preserved = _.replace(content, /`.*?`/gs, (match: any) =>
			this.storeTemplatingString(match),
		);

		const lines = preserved.split("\n");

		const indented = _.chain(lines)
			.map((line: any, index: any) => {
				if (index === 0) {
					return line;
				}

				if (index === lines.length - 1) {
					return prefixForEnd + line;
				}

				if (_.isEmpty(line)) {
					return line;
				}

				return prefixSpaces + line;
			})
			.value()
			.join("\n");

		return this.restoreTemplatingString(`${indented}`);
	}

	storeTemplatingString(value: any) {
		const index = this.templatingStrings.push(value) - 1;
		return this.getTemplatingStringPlaceholder(index);
	}

	restoreTemplatingString(content: any) {
		return _.replace(
			content,
			new RegExp(`${this.getTemplatingStringPlaceholder("(\\d+)")}`, "gms"),
			(_match: any, p1: any) => this.templatingStrings[p1],
		);
	}

	getTemplatingStringPlaceholder(replace: any) {
		return _.replace("___templating_str_#___", "#", replace);
	}
}
