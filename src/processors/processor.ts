import type Formatter from "src/formatter";

export abstract class Processor {
	constructor(protected formatter: Formatter) {}

	abstract preProcess(content: string): Promise<any>;
	abstract postProcess(content: string): Promise<any>;
}
