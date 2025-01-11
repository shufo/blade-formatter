import _ from "lodash";
import { directivePrefix, indentStartTokensWithoutPrefix } from "src/indent";
import { Processor } from "./processor";

export class InlineDirectiveProcessor extends Processor {
	private inlineDirectives: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveInlineDirective(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreInlineDirective(content);
	}

	private async preserveInlineDirective(content: string): Promise<any> {
		// preserve inline directives inside html tag
		const regex = new RegExp(
			`(<[\\w\\-\\_]+?[^>]*?)${directivePrefix}(${indentStartTokensWithoutPrefix.join(
				"|",
			)})(\\s*?)?(\\([^)]*?\\))?((?:(?!@end\\2).)+)(@end\\2|@endif)(.*?/*>)`,
			"gims",
		);
		const replaced = _.replace(
			content,
			regex,
			(
				_match: string,
				p1: string,
				p2: string,
				p3: string,
				p4: string,
				p5: string,
				p6: string,
				p7: string,
			) => {
				if (p3 === undefined && p4 === undefined) {
					return `${p1}${this.storeInlineDirective(
						`${directivePrefix}${p2.trim()}${p5.trim()} ${p6.trim()}`,
					)}${p7}`;
				}
				if (p3 === undefined) {
					return `${p1}${this.storeInlineDirective(
						`${directivePrefix}${p2.trim()}${p4.trim()}${p5}${p6.trim()}`,
					)}${p7}`;
				}
				if (p4 === undefined) {
					return `${p1}${this.storeInlineDirective(
						`${directivePrefix}${p2.trim()}${p3}${p5.trim()} ${p6.trim()}`,
					)}${p7}`;
				}

				return `${p1}${this.storeInlineDirective(
					`${directivePrefix}${p2.trim()}${p3}${p4.trim()} ${p5.trim()} ${p6.trim()}`,
				)}${p7}`;
			},
		);

		if (regex.test(replaced)) {
			return this.preserveInlineDirective(replaced);
		}

		return replaced;
	}

	private async restoreInlineDirective(content: any) {
		return new Promise((resolve) => resolve(content)).then((res) =>
			_.replace(
				// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
				res,
				new RegExp(`${this.getInlinePlaceholder("(\\d+)")}`, "gms"),
				(_match: any, p1: any) => {
					const matched = this.inlineDirectives[p1];
					return matched;
				},
			),
		);
	}

	storeInlineDirective(value: any) {
		return this.getInlinePlaceholder(
			this.inlineDirectives.push(value) - 1,
			value.length,
		);
	}

	getInlinePlaceholder(replace: any, length = 0) {
		if (length > 0) {
			const template = "___inline_directive_#___";
			const gap = length - template.length;
			return _.replace(
				`___inline_directive_${_.repeat("_", gap > 0 ? gap : 0)}#___`,
				"#",
				replace,
			);
		}

		return _.replace("___inline_directive_+?#___", "#", replace);
	}
}
