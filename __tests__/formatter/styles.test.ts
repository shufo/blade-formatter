import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter styles test", () => {
	test("css at rule https://github.com/shufo/vscode-blade-formatter/issues/430", async () => {
		const content = [
			`@section('css')`,
			"    <style>",
			"        .card-body+.card-body {",
			"        margin-top: 20px !important;",
			"     padding-top: 20px !important;",
			"   border-top: 1px solid #e3ebf6;",
			"        }",
			"",
			"        @media(max-width:   992px) {",
			"            .remove-border-end-on-mobile {",
			"            border-right: 0 none !important;",
			"            }",
			"",
			"            .remove-border-end-on-mobile .card-body {",
			"border-bottom: 1px solid #e3ebf6;",
			"            padding-bottom: 20px !important;",
			"            }",
			"        }",
			"    </style>",
			"@endsection",
		].join("\n");

		const expected = [
			`@section('css')`,
			"    <style>",
			"        .card-body+.card-body {",
			"            margin-top: 20px !important;",
			"            padding-top: 20px !important;",
			"            border-top: 1px solid #e3ebf6;",
			"        }",
			"",
			"        @media(max-width: 992px) {",
			"            .remove-border-end-on-mobile {",
			"                border-right: 0 none !important;",
			"            }",
			"",
			"            .remove-border-end-on-mobile .card-body {",
			"                border-bottom: 1px solid #e3ebf6;",
			"                padding-bottom: 20px !important;",
			"            }",
			"        }",
			"    </style>",
			"@endsection",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
