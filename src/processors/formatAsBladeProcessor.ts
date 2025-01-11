import _ from "lodash";
import * as util from "../util";
import { Processor } from "./processor";
export class FormatAsBladeProcessor extends Processor {
	async preProcess(content: string): Promise<any> {
		return await util.formatAsBlade(content, this.formatter);
	}

	async postProcess(content: string): Promise<any> {}
}
