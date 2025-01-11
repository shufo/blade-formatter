import beautify from "js-beautify";
import _ from "lodash";
import * as util from "../util";
import { Processor } from "./processor";

export class FormatAsHtmlProcessor extends Processor {
	async preProcess(content: string): Promise<any> {
		return await this.formatAsHtml(content);
	}

	async postProcess(content: string): Promise<any> {}

	private async formatAsHtml(content: string): Promise<any> {
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
			end_with_newline:
				util.optional(this.formatter.options).endWithNewline || true,
			max_preserve_newlines: util.optional(this.formatter.options)
				.noMultipleEmptyLines
				? 1
				: undefined,
			extra_liners: util.optional(this.formatter.options).extraLiners,
			css: {
				end_with_newline: false,
			},
			eol: this.formatter.endOfLine,
		};

		const promise = new Promise((resolve) => resolve(content))
			.then((content) => util.preserveDirectives(content))
			.then((preserved) => beautify.html_beautify(preserved, options))
			.then((content) => util.revertDirectives(content));

		return Promise.resolve(promise);
	}
}
