import _ from "lodash";
import { Processor } from "./processor";

export class IgnoredLinesProcessor extends Processor {
	private ignoredLines: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveIgnoredLines(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreIgnoredLines(content);
	}

	private async preserveIgnoredLines(content: string): Promise<any> {
		return (
			_.chain(content)
				// ignore entire file
				.replace(
					/(^(?<!.+)^{{--\s*blade-formatter-disable\s*--}}.*?)([\r\n]*)$(?![\r\n])/gis,
					(_match: any, p1: any, p2: any) =>
						this.storeIgnoredLines(`${p1}${p2.replace(/^\n/, "")}`),
				)
				// range ignore
				.replace(
					/(?:({{--\s*?blade-formatter-disable\s*?--}}|<!--\s*?prettier-ignore-start\s*?-->|{{--\s*?prettier-ignore-start\s*?--}})).*?(?:({{--\s*?blade-formatter-enable\s*?--}}|<!--\s*?prettier-ignore-end\s*?-->|{{--\s*?prettier-ignore-end\s*?--}}))/gis,
					(match: any) => this.storeIgnoredLines(match),
				)
				// line ignore
				.replace(
					/(?:{{--\s*?blade-formatter-disable-next-line\s*?--}}|{{--\s*?prettier-ignore\s*?--}}|<!--\s*?prettier-ignore\s*?-->)[\r\n]+[^\r\n]+/gis,
					(match: any) => this.storeIgnoredLines(match),
				)
				// ignore Front Matter blocks
				.replace(/^---\r?\n[\s\S]*?\r?\n---(?=(\r?\n))/gis, (match: any) =>
					this.storeIgnoredLines(match),
				)
				.value()
		);
	}

	private async restoreIgnoredLines(content: string): Promise<any> {
		return _.replace(
			content,
			new RegExp(`${this.getIgnoredLinePlaceholder("(\\d+)")}`, "gm"),
			(_match: any, p1: any) => this.ignoredLines[p1],
		);
	}

	private storeIgnoredLines(value: string) {
		return this.getIgnoredLinePlaceholder(this.ignoredLines.push(value) - 1);
	}

	private getIgnoredLinePlaceholder(replace: any) {
		return _.replace("___ignored_line_#___", "#", replace);
	}
}
