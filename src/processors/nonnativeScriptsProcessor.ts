import _ from "lodash";
import { Processor } from "./processor";

export class NonnativeScriptsProcessor extends Processor {
	private nonnativeScripts: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveNonnativeScripts(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreNonnativeScripts(content);
	}

	private async preserveNonnativeScripts(content: string): Promise<any> {
		return _.replace(
			content,
			/<script[^>]*?type=(["'])(?!(text\/javascript|module))[^\1]*?\1[^>]*?>.*?<\/script>/gis,
			(match: string) => this.storeNonnativeScripts(match),
		);
	}

	storeNonnativeScripts(value: string) {
		const index = this.nonnativeScripts.push(value) - 1;
		return this.getNonnativeScriptPlaceholder(index.toString());
	}

	private async restoreNonnativeScripts(content: string): Promise<any> {
		return _.replace(
			content,
			new RegExp(`${this.getNonnativeScriptPlaceholder("(\\d+)")}`, "gmi"),
			(_match: any, p1: number) => `${this.nonnativeScripts[p1]}`,
		);
	}

	private getNonnativeScriptPlaceholder(replace: string) {
		return _.replace("<blade___non_native_scripts_#___ />", "#", replace);
	}
}
