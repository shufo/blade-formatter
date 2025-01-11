import { sortClasses } from "@shufo/tailwindcss-class-sorter";
import _ from "lodash";
import { Processor } from "./processor";

export class SortTailwindClassesProcessor extends Processor {
	async preProcess(content: string): Promise<any> {
		return await this.sortTailwindClasses(content);
	}

	async postProcess(content: string): Promise<any> {}

	private async sortTailwindClasses(content: string): Promise<any> {
		if (!this.formatter.options.sortTailwindcssClasses) {
			return content;
		}

		return _.replace(
			content,
			/(?<=\s+(?!:)class\s*=\s*([\"\']))(.*?)(?=\1)/gis,
			(_match, p1, p2) => {
				if (_.isEmpty(p2)) {
					return p2;
				}

				if (this.formatter.options.tailwindcssConfigPath) {
					const options = {
						tailwindConfigPath: this.formatter.options.tailwindcssConfigPath,
					};
					return sortClasses(p2, options);
				}

				if (this.formatter.options.tailwindcssConfig) {
					const options: any = {
						tailwindConfig: this.formatter.options.tailwindcssConfig,
					};
					return sortClasses(p2, options);
				}

				return sortClasses(p2);
			},
		);
	}
}
