import _ from "lodash";
import { Processor } from "./processor";

export class XslotProcessor extends Processor {
	private xSlot: string[] = [];

	async preProcess(content: string): Promise<any> {
		return await this.preserveXslot(content);
	}

	async postProcess(content: string): Promise<any> {
		return await this.restoreXslot(content);
	}

	private async preserveXslot(content: string): Promise<any> {
		return _.replace(
			content,
			/(?<=<\/?)(x-slot:[\w_\\-]+)(?=(?:[^>]*?[^?])?>)/gm,
			(match: string) => this.storeXslot(match),
		);
	}

	private async restoreXslot(content: string): Promise<any> {
		return _.replace(
			content,
			/x-slot\s*--___(\d+)___--/gms,
			(_match: string, p1: number) => this.xSlot[p1],
		).replace(/(?<=<x-slot:[\w\_\-]*)\s+(?=\/?>)/gm, () => "");
	}

	storeXslot(value: string) {
		return this.getXslotPlaceholder((this.xSlot.push(value) - 1).toString());
	}

	getXslotPlaceholder(replace: any) {
		return _.replace("x-slot --___#___--", "#", replace);
	}
}
