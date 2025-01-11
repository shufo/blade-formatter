import _ from "lodash";
import * as util from "../util";
import { Processor } from "./processor";

export class FormatAsPhpProcessor extends Processor {
	async preProcess(content: string): Promise<any> {
		return await util.formatAsPhp(content, this.formatter.options);
	}

	async postProcess(content: string): Promise<any> {}
}
