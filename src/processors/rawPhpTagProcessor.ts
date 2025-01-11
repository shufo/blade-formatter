import detectIndent from "detect-indent";
import beautify, { type JSBeautifyOptions } from "js-beautify";
import _ from "lodash";
import { formatPhpComment } from "src/comment";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class RawPhpTagProcessor extends Processor {
	private rawPhpTags: string[] = [];
	private phpComments: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveRawPhpTag(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreRawPhpTag(content);
	}

	private async preserveRawPhpTag(content: string): Promise<any> {
		return _.replace(content, /<\?php(.*?)\?>/gms, (match: any) =>
			this.storeRawPhpTags(match),
		);
	}

	private async restoreRawPhpTag(content: string): Promise<any> {
		return new Promise((resolve) => resolve(content)).then((res) =>
			replaceAsync(
				// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
				res,
				new RegExp(`${this.getRawPhpTagPlaceholder("(\\d+)")}`, "gms"),
				async (_match: any, p1: any) => {
					// const result= this.rawPhpTags[p1];
					try {
						const matched = this.rawPhpTags[p1];
						const commentBlockExists =
							/(?<=<\?php\s*?)\/\*.*?\*\/(?=\s*?\?>)/gim.test(matched);
						const inlinedComment = commentBlockExists && util.isInline(matched);
						const placeholder = this.getRawPhpTagPlaceholder(p1);
						const matchedLine = content.match(
							new RegExp(`^(.*?)${placeholder}`, "gmi"),
						) ?? [""];
						const indent = detectIndent(matchedLine[0]);

						if (inlinedComment) {
							return matched;
						}

						const result = (
							await util.formatStringAsPhp(
								this.rawPhpTags[p1],
								this.formatter.options,
							)
						)
							.trim()
							.trimEnd();

						if (util.isInline(result)) {
							return result;
						}

						let preserved = this.preservePhpComment(result);

						if (indent.indent) {
							preserved = util.indentRawPhpBlock(
								indent,
								preserved,
								this.formatter,
							);
						}

						const restored = this.restorePhpComment(preserved);

						return restored;
					} catch (e) {
						return `${this.rawPhpTags[p1]}`;
					}
				},
			),
		);
	}

	storeRawPhpTags(value: any) {
		const index = this.rawPhpTags.push(value) - 1;
		return this.getRawPhpTagPlaceholder(index);
	}

	getRawPhpTagPlaceholder(replace: any) {
		return _.replace("___raw_php_tag_#___", "#", replace);
	}

	preservePhpComment(content: string) {
		return _.replace(
			content,
			/\/\*(?:[^*]|[\r\n]|(?:\*+(?:[^*\/]|[\r\n])))*\*+\//gi,
			(match: string) => this.storePhpComment(match),
		);
	}

	restorePhpComment(content: string) {
		return _.replace(
			content,
			new RegExp(`${this.getPhpCommentPlaceholder("(\\d+)")};{0,1}`, "gms"),
			(_match: string, p1: number) => {
				const placeholder = this.getPhpCommentPlaceholder(p1.toString());
				const matchedLine = content.match(
					new RegExp(`^(.*?)${placeholder}`, "gmi"),
				) ?? [""];
				const indent = detectIndent(matchedLine[0]);
				const formatted = formatPhpComment(this.phpComments[p1]);

				return util.indentPhpComment(indent, formatted, this.formatter);
			},
		);
	}

	storePhpComment(value: string) {
		return this.getPhpCommentPlaceholder(
			(this.phpComments.push(value) - 1).toString(),
		);
	}

	getPhpCommentPlaceholder(replace: string) {
		return _.replace("___php_comment_#___", "#", replace);
	}
}
