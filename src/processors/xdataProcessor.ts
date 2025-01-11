import detectIndent from "detect-indent";
import _ from "lodash";
import * as util from "../util";
import { Processor } from "./processor";

export class XDataProcessor extends Processor {
	private xData: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveXData(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreXData(content);
	}

	private async preserveXData(content: string): Promise<any> {
		return _.replace(
			content,
			/(\s*)x-data="(.*?)"(\s*)/gs,
			(_match: any, p1: any, p2: any, p3: any) =>
				`${p1}x-data="${this.storeXData(p2)}"${p3}`,
		);
	}

	private async restoreXData(content: string): Promise<any> {
		return _.replace(
			content,
			new RegExp(`${this.getXDataPlaceholder("(\\d+)")}`, "gm"),
			(_match: any, p1: any) => {
				const placeholder = this.getXDataPlaceholder(p1.toString());
				const matchedLine = content.match(
					new RegExp(`^(.*?)${placeholder}`, "gmi"),
				) ?? [""];
				const indent = detectIndent(matchedLine[0]);

				const lines = util.formatJS(this.xData[p1]).split("\n");

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

	storeXData(value: string) {
		const index = this.xData.push(value) - 1;
		return this.getXDataPlaceholder(index);
	}

	getXDataPlaceholder(replace: any) {
		return _.replace("___x_data_#___", "#", replace);
	}
}
