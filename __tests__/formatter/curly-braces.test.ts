import { describe, test } from "vitest";
import * as util from "../support/util";

describe("formatter curly braces test", () => {
	test("double curly brace expression for js framework", async () => {
		const content = [
			`<user-listing :data="{{ $data }}" :url="'{{ route('admin.users.index') }}'" v-cloak inline-template>`,
			`    <tr v-for="item in items" :key="item.id">`,
			`        <td>@{{ ok? 'YES': 'NO' }}</td>`,
			"        <td>",
			`        @{{ message.split('').reverse().join('') }}`,
			"        </td>",
			`        @{{item.roles.map(role=>role.name).join(', ')}}`,
			"    </tr>",
			"</user-listing>",
		].join("\n");

		const expected = [
			`<user-listing :data="{{ $data }}" :url="'{{ route('admin.users.index') }}'" v-cloak inline-template>`,
			`    <tr v-for="item in items" :key="item.id">`,
			`        <td>@{{ ok ? 'YES' : 'NO' }}</td>`,
			"        <td>",
			`            @{{ message.split('').reverse().join('') }}`,
			"        </td>",
			`        @{{ item.roles.map(role => role.name).join(', ') }}`,
			"    </tr>",
			"</user-listing>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
