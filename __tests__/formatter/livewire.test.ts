import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter escaped character test", () => {
	test("livewire tag", async () => {
		const content = [
			`<div class="mt-6">`,
			"    @foreach ($this->relations as $k => $relation )",
			`    <div x-show="tab == '#tab{{$k}}'" x-cloak>`,
			`        <livewire:widgets.invoice-document-consumption.card :invoice_document_id="$this->     invoiceDocument->id" />`,
			"    </div>",
			"    @endforeach",
			"</div>",
		].join("\n");

		const expected = [
			`<div class="mt-6">`,
			"    @foreach ($this->relations as $k => $relation)",
			`        <div x-show="tab == '#tab{{ $k }}'" x-cloak>`,
			`            <livewire:widgets.invoice-document-consumption.card :invoice_document_id="$this->invoiceDocument->id" />`,
			"        </div>",
			"    @endforeach",
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
