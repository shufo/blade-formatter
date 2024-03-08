import path from "path";
import { readdirSync, readFileSync } from "fs";
import * as util from "./support/util";
import { describe, test } from "vitest";

describe("snapshot test", () => {
	const targetDir = path.resolve(__dirname, "./fixtures/snapshots");
	const files = readdirSync(targetDir);

	for (const file of files) {
		test.concurrent(`can format ${path.basename(file)}`, async () => {
			const realPath = path.resolve(targetDir, file);
			const spec = readFileSync(realPath).toString("utf-8");
			const regexp =
				/---+options---+(.*?)---+content---+(.*?)---+expected---+(.*)/gis;
			const [[, optionString, content, expected]] = [...spec.matchAll(regexp)];
			const options = JSON.parse(optionString.trim());

			await util.doubleFormatCheck(
				content.trim(),
				`${expected.trim()}\n`,
				options,
			);
		});
	}
});
