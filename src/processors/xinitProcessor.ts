import detectIndent from "detect-indent";
import _ from "lodash";
import * as util from "../util";
import { Processor } from "./processor";

export class XInitProcessor extends Processor {
	private xInit: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveXInit(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreXInit(content);
	}

	private async preserveXInit(content: string): Promise<any> {
		return _.replace(
			content,
			/(\s*)x-init="(.*?)"(\s*)/gs,
			(_match: any, p1: any, p2: any, p3: any) =>
				`${p1}x-init="${this.storeXInit(p2)}"${p3}`,
		);
	}

	private async restoreXInit(content: string): Promise<any> {
		return _.replace(
			content,
			new RegExp(`${this.getXInitPlaceholder("(\\d+)")}`, "gm"),
			(_match: any, p1: number) => {
				const placeholder = this.getXInitPlaceholder(p1.toString());
				const matchedLine = content.match(
					new RegExp(`^(.*?)${placeholder}`, "gmi"),
				) ?? [""];
				const indent = detectIndent(matchedLine[0]);

				const lines = util.formatJS(this.xInit[p1]).split("\n");

				const indentLevel =
					indent.amount / (this.formatter.indentCharacter === "\t" ? 4 : 1);

				const firstLine = lines[0];
				const prefix = this.formatter.indentCharacter.repeat(
					indentLevel < 0 ? 0 : indentLevel,
				);
				const offsettedLines = lines.map((line) => prefix + line);
				offsettedLines[0] = firstLine;
				return `${offsettedLines.join("\n")}`;
			},
		);
	}

	storeXInit(value: string) {
		const index = this.xInit.push(value) - 1;
		return this.getXInitPlaceholder(index);
	}

	getXInitPlaceholder(replace: any) {
		return _.replace("___x_init_#___", "#", replace);
	}
}
