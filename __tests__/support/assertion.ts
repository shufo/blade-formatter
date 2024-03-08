import fs from "fs";
import path from "path";
import * as cmd from "./cmd";
import { expect } from "vitest";

export function assertFormatted(file: any) {
	const response = cmd.executeSync(path.resolve("bin", "blade-formatter.js"), [
		file,
		"-c",
	]);

	const output = response.output.join("\n");
	const exitCode = response.status;

	expect(exitCode).toEqual(0);
	expect(output).toMatch("Check formatting...");
	expect(output).toMatch("All matched files are formatted");
}

export function assertNotFormatted(file: any) {
	fs.exists(file, (exists: any) => {
		if (!exists) {
			process.stdout.write("Format target file not found\n");
			process.exit(1);
		}
	});

	const response = cmd.executeSync(path.resolve("bin", "blade-formatter.js"), [
		file,
		"-c",
	]);

	const output = response.output.join("\n");
	const exitCode = response.status;

	expect(exitCode).toEqual(1);
	expect(output).toMatch("Check formatting...");
	expect(output).toMatch("formattable");
}
