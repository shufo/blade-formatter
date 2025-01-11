import detectIndent from "detect-indent";
import _ from "lodash";
import replaceAsync from "string-replace-async";
import * as util from "../util";
import { Processor } from "./processor";

export class PropsProcessor extends Processor {
	private rawPropsBlocks: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveProps(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreRawPropsBlock(content);
	}

	private async preserveProps(content: string): Promise<any> {
		return _.replace(
			content,
			/@props\(((?:[^\\(\\)]|\([^\\(\\)]*\))*)\)/gs,
			(match: any, p1: any) => this.storeRawPropsBlock(p1),
		);
	}

	async restoreRawPropsBlock(content: any) {
		const regex = this.getRawPropsPlaceholder("(\\d+)");
		return replaceAsync(
			content,
			new RegExp(regex, "gms"),
			async (_match: any, p1: any) => {
				const placeholder = this.getRawPropsPlaceholder(p1.toString());
				const matchedLine = content.match(
					new RegExp(`^(.*?)${placeholder}`, "gmi"),
				) ?? [""];
				const indent = detectIndent(matchedLine[0]);

				const formatted = `@props(${(
					await util.formatRawStringAsPhp(this.rawPropsBlocks[p1], {
						...this.formatter.options,
					})
				).trim()})`;

				return util.indentRawPhpBlock(indent, formatted, this.formatter);
			},
		);
	}

	storeRawPropsBlock(value: any) {
		return this.getRawPropsPlaceholder(this.rawPropsBlocks.push(value) - 1);
	}

	getRawPropsPlaceholder(replace: any) {
		return _.replace("@__raw_props_block_#__@", "#", replace);
	}
}
