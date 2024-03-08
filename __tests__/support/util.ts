import path from "path";
import fs from "fs-extra";
import { expect } from "vitest";
import { BladeFormatter, CLIOption, FormatterOption } from "../../src/main";
import * as cmd from "./cmd";

export function populateFixtures(targetDir: any) {
	fs.copySync(path.resolve("__tests__", "fixtures"), targetDir);
}

export async function checkIfTemplateIsFormattedTwice(
	input: any,
	target: any,
	options: string[] = [],
) {
	const cmdResult = await cmd.execute(
		path.resolve("bin", "blade-formatter.js"),
		[...options, path.resolve("__tests__", "fixtures", input)],
	);

	const formatted = fs.readFileSync(
		path.resolve("__tests__", "fixtures", target),
	);

	expect(cmdResult).toEqual(formatted.toString("utf-8"));

	const cmdResult2 = await cmd.execute(
		path.resolve("bin", "blade-formatter.js"),
		[...options, path.resolve("__tests__", "fixtures", target)],
	);

	expect(cmdResult2).toEqual(formatted.toString("utf-8"));
}

export async function doubleFormatCheck(
	input: any,
	target: any,
	options: FormatterOption & CLIOption = {},
) {
	const formatter = new BladeFormatter(options);

	const first = await formatter.format(input);

	expect(first).toEqual(target);

	const second = await formatter.format(first);

	expect(second).toEqual(target);
}
