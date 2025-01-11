import detectIndent from "detect-indent";
import _ from "lodash";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class RawBladeBraceProcessor extends Processor {
	private rawBladeBraces: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveRawBladeBrace(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreRawBladeBrace(content);
	}

	private async preserveRawBladeBrace(content: string): Promise<any> {
		return _.replace(content, /\{!!(.*?)!!\}/gs, (_match: any, p1: any) => {
			// if content is blank
			if (p1 === "") {
				return this.storeRawBladeBrace(p1);
			}

			// preserve a space if content contains only space, tab, or new line character
			if (!/\S/.test(p1)) {
				return this.storeRawBladeBrace(" ");
			}

			// any other content
			return this.storeRawBladeBrace(p1.trim());
		});
	}

	private async restoreRawBladeBrace(content: string): Promise<any> {
		return new Promise((resolve) => resolve(content)).then((res) =>
			replaceAsync(
				// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
				res,
				new RegExp(`${this.getRawBladeBracePlaceholder("(\\d+)")}`, "gms"),
				async (_match: any, p1: any) => {
					const placeholder = this.getRawBladeBracePlaceholder(p1);
					const matchedLine = content.match(
						new RegExp(`^(.*?)${placeholder}`, "gmi"),
					) ?? [""];
					const indent = detectIndent(matchedLine[0]);
					const bladeBrace = this.rawBladeBraces[p1];

					if (bladeBrace.trim() === "") {
						return `{!!${bladeBrace}!!}`;
					}

					return util.indentRawPhpBlock(
						indent,
						`{!! ${(
							await util.formatRawStringAsPhp(
								bladeBrace,
								this.formatter.options,
							)
						)
							.replace(/([\n\s]*)->([\n\s]*)/gs, "->")
							.trim()} !!}`,
						this.formatter,
					);
				},
			),
		);
	}

	storeRawBladeBrace(value: any) {
		const index = this.rawBladeBraces.push(value) - 1;
		return this.getRawBladeBracePlaceholder(index);
	}

	getRawBladeBracePlaceholder(replace: any) {
		return _.replace("___raw_blade_brace_#___", "#", replace);
	}
}
