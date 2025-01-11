import detectIndent from "detect-indent";
import _ from "lodash";
import { formatPhpComment } from "src/comment";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class PhpBlockProcessor extends Processor {
	private rawBlocks: string[] = [];
	private rawPropsBlocks: string[] = [];
	private stringLiteralInPhp: string[] = [];
	private phpComments: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preservePhpBlock(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreRawPhpBlock(content);
	}

	private async preservePhpBlock(content: string): Promise<any> {
		return this.preserveRawPhpBlock(content);
	}

	async preserveRawPhpBlock(content: any) {
		return _.replace(
			content,
			/(?<!@)@php(.*?)@endphp/gs,
			(match: any, p1: any) => this.storeRawBlock(p1),
		);
	}

	async restoreRawPhpBlock(content: any) {
		return replaceAsync(
			content,
			new RegExp(`${this.getRawPlaceholder("(\\d+)")}`, "gm"),
			async (match: any, p1: number) => {
				let rawBlock = this.rawBlocks[p1];
				const placeholder = this.getRawPlaceholder(p1.toString());
				const matchedLine = content.match(
					new RegExp(`^(.*?)${placeholder}`, "gmi"),
				) ?? [""];
				const indent = detectIndent(matchedLine[0]);

				const isOnSingleLine = util.isInline(rawBlock);
				const isMultipleStatements = await util.isMultilineStatement(
					rawBlock,
					this.formatter,
				);
				if (isOnSingleLine && isMultipleStatements) {
					// multiple statements on a single line
					rawBlock = (
						await util.formatStringAsPhp(
							`<?php\n${rawBlock}\n?>`,
							this.formatter.options,
						)
					).trim();
				} else if (isMultipleStatements) {
					// multiple statments on mult lines

					const indentLevel = indent.amount + this.formatter.indentSize;
					rawBlock = (
						await util.formatStringAsPhp(`<?php${rawBlock}?>`, {
							...this.formatter.options,
							useProjectPrintWidth: true,
							adjustPrintWidthBy: indentLevel,
						})
					).trimEnd();
				} else if (!isOnSingleLine) {
					// single statement on mult lines
					rawBlock = (
						await util.formatStringAsPhp(
							`<?php${rawBlock}?>`,
							this.formatter.options,
						)
					).trimEnd();
				} else {
					// single statement on single line
					rawBlock = `<?php${rawBlock}?>`;
				}

				return _.replace(
					rawBlock,
					/^(\s*)?<\?php(.*?)\?>/gms,
					(_matched: any, _q1: any, q2: any) => {
						if (util.isInline(rawBlock)) {
							return `@php${q2}@endphp`;
						}

						let preserved = this.preserveStringLiteralInPhp(q2);
						preserved = this.preservePhpComment(preserved);
						let indented = util.indentRawBlock(
							indent,
							preserved,
							this.formatter,
						);
						indented = this.restorePhpComment(indented);
						const restored = this.restoreStringLiteralInPhp(indented);

						return `@php${restored}@endphp`;
					},
				);
			},
		);
	}

	storeRawBlock(value: any) {
		return this.getRawPlaceholder(this.rawBlocks.push(value) - 1);
	}

	getRawPlaceholder(replace: any) {
		return _.replace("___raw_block_#___", "#", replace);
	}

	preserveStringLiteralInPhp(content: any) {
		return _.replace(
			content,
			/(\"([^\\]|\\.)*?\"|\'([^\\]|\\.)*?\')/gm,
			(match: string) => `${this.storeStringLiteralInPhp(match)}`,
		);
	}

	storeStringLiteralInPhp(value: any) {
		const index = this.stringLiteralInPhp.push(value) - 1;
		return this.getStringLiteralInPhpPlaceholder(index);
	}

	getStringLiteralInPhpPlaceholder(replace: any) {
		return _.replace("'___php_content_#___'", "#", replace);
	}

	preservePhpComment(content: string) {
		return _.replace(
			content,
			/\/\*(?:[^*]|[\r\n]|(?:\*+(?:[^*\/]|[\r\n])))*\*+\//gi,
			(match: string) => this.storePhpComment(match),
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

	restoreStringLiteralInPhp(content: any) {
		return _.replace(
			content,
			new RegExp(`${this.getStringLiteralInPhpPlaceholder("(\\d+)")}`, "gms"),
			(_match: any, p1: any) => this.stringLiteralInPhp[p1],
		);
	}
}
