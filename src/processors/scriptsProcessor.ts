import detectIndent from "detect-indent";
import beautify from "js-beautify";
import _ from "lodash";
import * as util from "../util";
import { Processor } from "./processor";

export class ScriptsProcessor extends Processor {
	private scripts: string[] = [];
	private templatingStrings: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveScripts(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreScripts(content);
	}

	private async preserveScripts(content: string): Promise<any> {
		return _.replace(content, /<script.*?>.*?<\/script>/gis, (match: any) =>
			this.storeScripts(match),
		);
	}

	private async restoreScripts(content: string): Promise<any> {
		return new Promise((resolve) => resolve(content)).then((res) =>
			_.replace(
				// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
				res,
				new RegExp(`${this.getScriptPlaceholder("(\\d+)")}`, "gim"),
				(_match: any, p1: number) => {
					const script = this.scripts[p1];

					const placeholder = this.getScriptPlaceholder(p1);
					const matchedLine = content.match(
						new RegExp(`^(.*?)${placeholder}`, "gmi"),
					) ?? [""];
					const indent = detectIndent(matchedLine[0]);
					const useTabs =
						util.optional(this.formatter.options).useTabs || false;

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
						indent_with_tabs: useTabs,
						end_with_newline: false,
						templating: ["php"],
					};

					if (useTabs) {
						return this.indentScriptBlock(
							indent,
							_.replace(
								beautify.html_beautify(script, options),
								/\t/g,
								"\t".repeat(this.formatter.indentSize),
							),
						);
					}

					return this.indentScriptBlock(
						indent,
						beautify.html_beautify(script, options),
					);
				},
			),
		);
	}

	private indentScriptBlock(indent: detectIndent.Indent, content: any) {
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

	restoreTemplatingString(content: any) {
		return _.replace(
			content,
			new RegExp(`${this.getTemplatingStringPlaceholder("(\\d+)")}`, "gms"),
			(_match: any, p1: any) => this.templatingStrings[p1],
		);
	}

	storeScripts(value: string) {
		const index = this.scripts.push(value) - 1;
		return this.getScriptPlaceholder(index);
	}

	storeTemplatingString(value: any) {
		const index = this.templatingStrings.push(value) - 1;
		return this.getTemplatingStringPlaceholder(index);
	}

	getScriptPlaceholder(replace: any) {
		return _.replace("<blade___scripts_#___ />", "#", replace);
	}

	getTemplatingStringPlaceholder(replace: any) {
		return _.replace("___templating_str_#___", "#", replace);
	}
}
