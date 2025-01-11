import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter escape test", () => {
	test("escaped blade directive", async () => {
		const content = [
			"<!-- escaped blade directive -->",
			"<div>",
			`@@if("foo")`,
			"@@endif",
			"</div>",
			"<!-- escaped custom blade directive -->",
			"<div>",
			"@@isAdmin",
			"@@endisAdmin",
			`@@escaped("foo")`,
			"@@endescaped",
			"</div>",
		].join("\n");

		const expected = [
			"<!-- escaped blade directive -->",
			"<div>",
			`    @@if("foo")`,
			"    @@endif",
			"</div>",
			"<!-- escaped custom blade directive -->",
			"<div>",
			"    @@isAdmin",
			"    @@endisAdmin",
			`    @@escaped("foo")`,
			"    @@endescaped",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
