import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter multi-line string literals test", () => {
	test("heredoc in a nested php tag is indented with the block", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        <?php",
			"        $x = <<<EOT",
			"        First part of a heredoc,",
			"        second part of the heredoc.",
			"        EOT;",
			"        ?>",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});

	test("backtick string in a nested php tag keeps its content", async () => {
		const content = [
			"<div>",
			"    <div>",
			"        <?php",
			"        $x = `ls",
			"            -la`;",
			"        ?>",
			"    </div>",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, content);
	});
});
