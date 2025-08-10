import assert from "node:assert";
import { describe, expect, test } from "vitest";
import { BladeFormatter } from "../../src/main.js";
import * as util from "../support/util";

describe("formatter scripts test", () => {
	test("should format blade directive in scripts", async () => {
		const content = [
			"    <script>",
			`        @isset($data['eval_gestionnaire']->project_perception) foo @endisset`,
			"    </script>",
		].join("\n");

		const expected = [
			"    <script>",
			`        @isset($data['eval_gestionnaire']->project_perception)`,
			"            foo",
			"        @endisset",
			"    </script>",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should format multiple blade directive in script tag", async () => {
		const content = [
			"<script>",
			"   @if ($user)",
			"         let a = 1;",
			" @else",
			"     let b = 0;",
			"             @endif",
			"",
			"   const a = 0;",
			"",
			"",
			"       @foreach ($users as $user)",
			"           let b = 1;",
			"   @endforeach",
			"</script>",
		].join("\n");

		const expected = [
			"<script>",
			"    @if ($user)",
			"        let a = 1;",
			"    @else",
			"        let b = 0;",
			"    @endif",
			"",
			"    const a = 0;",
			"",
			"",
			"    @foreach ($users as $user)",
			"        let b = 1;",
			"    @endforeach",
			"</script>",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should format inline directive in scripts #231", async () => {
		const content = [
			`<script> @Isset($data['eval_gestionnaire']->project_perception) foo @endisset </script>`,
		].join("\n");

		const expected = [
			"<script>",
			`    @isset($data['eval_gestionnaire']->project_perception)`,
			"        foo",
			"    @endisset",
			"</script>",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("should format inline function directives in scripts", async () => {
		const content = [
			`<script type="text/javascript">`,
			`    const errors = @json($errors -> all("aaa"));`,
			"    console.log(errors, errors.length);",
			"</script>",
		].join("\n");

		const expected = [
			`<script type="text/javascript">`,
			`    const errors = @json($errors->all('aaa'));`,
			"    console.log(errors, errors.length);",
			"</script>",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("@forelse-@empty-@endforelse directive in scripts", async () => {
		const content = [
			"<script>",
			"    var addNewCoin = [",
			"        @forelse($coins as $coin)",
			"            {",
			`                 "id": {{$coin->id }},`,
			`            "name": "{{ $coin->name }}"`,
			"            },",
			"               @empty",
			"        @endforelse",
			"    ];",
			"</script>",
		].join("\n");

		const expected = [
			"<script>",
			"    var addNewCoin = [",
			"        @forelse($coins as $coin)",
			"            {",
			`                "id": {{ $coin->id }},`,
			`                "name": "{{ $coin->name }}"`,
			"            },",
			"        @empty",
			"        @endforelse",
			"    ];",
			"</script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("inline script tag should keep its element #508", async () => {
		const content = [
			`<p>foo</p><p>bar</p><script>document.write("buz");</script><p>blah</p>`,
		].join("\n");

		const expected = [
			"<p>foo</p>",
			"<p>bar</p>",
			"<script>",
			`    document.write("buz");`,
			"</script>",
			"<p>blah</p>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("inline @php directive in script tag", async () => {
		const content = [
			"<script>",
			`@php(     $password_reset_url=View::getSection('password_reset_url') ?? config('adminlte.password_reset_url', 'password/reset', env('test', env('test'))))`,
			"</script>",
		].join("\n");

		const expected = [
			"<script>",
			`    @php($password_reset_url = View::getSection('password_reset_url') ?? config('adminlte.password_reset_url', 'password/reset', env('test', env('test'))))`,
			"</script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("nested directive in script tag", async () => {
		const content = [
			"<script>",
			"    var addNewCoin = [",
			"        @forelse($coins as $coin)",
			"            {",
			`                "id": {{ $coin->id }},`,
			`                "name": "{{ $coin->name }}"`,
			"            },",
			"                @empty",
			"        @if ($user)",
			"            {",
			`                "id": {{ $coin->id }},`,
			`              "name": "{{ $coin->name }}"`,
			"                },",
			"            @else",
			"            aaa",
			"@if($foo)",
			"array.push([",
			`"foo",`,
			`"bar",`,
			`"zzz"`,
			"]);",
			"@endif",
			"            @endif",
			"        @endforelse",
			"",
			"        @if ($user) @elseif",
			"            aaa",
			"        @endif",
			"        @empty($aaa)",
			"    aaa",
			"    @endempty",
			"        @empty($aaa)",
			"    @endempty",
			"    ];",
			"</script>",
		].join("\n");

		const expected = [
			"<script>",
			"    var addNewCoin = [",
			"        @forelse($coins as $coin)",
			"            {",
			`                "id": {{ $coin->id }},`,
			`                "name": "{{ $coin->name }}"`,
			"            },",
			"        @empty",
			"            @if ($user)",
			"                {",
			`                    "id": {{ $coin->id }},`,
			`                    "name": "{{ $coin->name }}"`,
			"                },",
			"            @else",
			"                aaa",
			"                @if ($foo)",
			"                    array.push([",
			`                        "foo",`,
			`                        "bar",`,
			`                        "zzz"`,
			"                    ]);",
			"                @endif",
			"            @endif",
			"        @endforelse",
			"",
			"        @if ($user) @elseif",
			"            aaa",
			"        @endif",
			"        @empty($aaa)",
			"            aaa",
			"        @endempty",
			"        @empty($aaa)",
			"        @endempty",
			"    ];",
			"</script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("custom directive in script tag", async () => {
		const content = [
			`<script src="http://<unknown>/">`,
			"    // nested custom directives",
			`    @unlessdisk('local')`,
			`    @unlessdisk('s3')`,
			`    @unlessdisk('gcp')`,
			`const a = arr.push(["1","2",{a: 1}]);`,
			"  @else",
			"  const a = [1,2,3];",
			"    @enddisk",
			`    console.log("foo");`,
			"    @enddisk",
			`                 console.log("baz");`,
			"    @enddisk",
			"",
			"    // inlined custom directives",
			`    @disk("local")       console.log('local');`,
			` @elsedisk("s3")   console.log('s3');`,
			`    @else console.log('other storage');`,
			"    @enddisk",
			"</script>",
		].join("\n");

		const expected = [
			`<script src="http://<unknown>/">`,
			"    // nested custom directives",
			`    @unlessdisk('local')`,
			`        @unlessdisk('s3')`,
			`            @unlessdisk('gcp')`,
			`                const a = arr.push(["1", "2", {`,
			"                    a: 1",
			"                }]);",
			"            @else",
			"                const a = [1, 2, 3];",
			"            @enddisk",
			`            console.log("foo");`,
			"        @enddisk",
			`        console.log("baz");`,
			"    @enddisk",
			"",
			"    // inlined custom directives",
			`    @disk("local")`,
			`        console.log('local');`,
			`    @elsedisk("s3")`,
			`        console.log('s3');`,
			"    @else",
			`        console.log('other storage');`,
			"    @enddisk",
			"</script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("arrow identifier in tag", async () => {
		const content = [
			`<script src="aaa => 1" >`,
			"const a = 1;",
			"const b  = 2;",
			"</script>",
		].join("\n");
		const expected = [
			`<script src="aaa => 1">`,
			"    const a = 1;",
			"    const b = 2;",
			"</script>",
			"",
		].join("\n");
		await util.doubleFormatCheck(content, expected);
	});

	test("script tag indentation with multiline attribute", async () => {
		const content = [
			"<script",
			`src="{{ asset('js/chat.js') }}"`,
			"defer",
			"></script>",
		].join("\n");
		const expected = [
			"<script",
			`    src="{{ asset('js/chat.js') }}"`,
			"    defer",
			"></script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			wrapAttributes: "force-expand-multiline",
		});
	});

	test("script tag type with not js code", async () => {
		const content = [
			`@section('section')`,
			`    <script type="text/template" id="test">`,
			"        <div>",
			"            Test",
			"        </div>",
			"    </script>",
			`    <script id="test" type="text/template">`,
			"        <div>",
			"            Test",
			"        </div>",
			"    </script>",
			`    <script id="test"`,
			`        type="text/template">`,
			"        <div>",
			"            Test",
			"        </div>",
			"    </script>",
			"@endsection",
		].join("\n");

		const expected = [
			`@section('section')`,
			`    <script type="text/template" id="test">`,
			"        <div>",
			"            Test",
			"        </div>",
			"    </script>",
			`    <script id="test" type="text/template">`,
			"        <div>",
			"            Test",
			"        </div>",
			"    </script>",
			`    <script id="test"`,
			`        type="text/template">`,
			"        <div>",
			"            Test",
			"        </div>",
			"    </script>",
			"@endsection",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("script tag with module type", async () => {
		const content = [
			`@push('scripts')`,
			`    <script type="module">`,
			`    $("#table-kategori").DataTable({`,
			"    processing: true,",
			`    serverSide: true,ajax: "{{ route('kategori.list') }}",`,
			`    columns: [{data: "DT_RowIndex",`,
			`       name: "DT_RowIndex",orderable: false,searchable: false`,
			"     },",
			`        {    data: "nama",name: "nama"`,
			"      },",
			"         {",
			`         data: "jumlah_barang",`,
			`         name: "jumlah_barang"`,
			"       },",
			"       {",
			`       data: "created_at",`,
			`       name: "created_at"`,
			"       },",
			"       {",
			`       data: "action",`,
			`       name: "action"`,
			"       },",
			"       ],",
			"        });",
			"    </script>",
			"@endpush",
		].join("\n");

		const expected = [
			`@push('scripts')`,
			`    <script type="module">`,
			`        $("#table-kategori").DataTable({`,
			"            processing: true,",
			"            serverSide: true,",
			`            ajax: "{{ route('kategori.list') }}",`,
			"            columns: [{",
			`                    data: "DT_RowIndex",`,
			`                    name: "DT_RowIndex",`,
			"                    orderable: false,",
			"                    searchable: false",
			"                },",
			"                {",
			`                    data: "nama",`,
			`                    name: "nama"`,
			"                },",
			"                {",
			`                    data: "jumlah_barang",`,
			`                    name: "jumlah_barang"`,
			"                },",
			"                {",
			`                    data: "created_at",`,
			`                    name: "created_at"`,
			"                },",
			"                {",
			`                    data: "action",`,
			`                    name: "action"`,
			"                },",
			"            ],",
			"        });",
			"    </script>",
			"@endpush",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("elseif statement in script tag", async () => {
		const content = [
			"<script>",
			`@if (session()->has('success'))`,
			"//do something",
			`@elseif (session()->has('error'))`,
			"//do something",
			"@elseif",
			"($something)",
			"//do something",
			"@endif",
			"</script>",
		].join("\n");

		const expected = [
			"<script>",
			`    @if (session()->has('success'))`,
			"        //do something",
			`    @elseif (session()->has('error'))`,
			"        //do something",
			"    @elseif ($something)",
			"        //do something",
			"    @endif",
			"</script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("it should not throws error if non-native script type ontains directive", async () => {
		const content = [
			`<script type="text/template">`,
			"@if(true)",
			`    <div class="true"></div>`,
			"@else",
			`    <div class="false"></div>`,
			"@endif",
			"</script>",
			`<script id="data" type="application/json">`,
			`{"org": 10, "items":["one","two"]}`,
			"</script>",
			`<script id="data" type="application/json">`,
			"    <?php echo json_encode($users); ?>",
			"</script>",
			`<script id="data" type="application/json">`,
			"    @json($users)",
			"</script>",
			`<script id="data" type="text/template">`,
			"    <div>",
			"        @if ($users)",
			"            <p>@json($users)</p>",
			"        @endif",
			"    </div>",
			"</script>",
		].join("\n");

		const expected = [
			`<script type="text/template">`,
			"@if(true)",
			`    <div class="true"></div>`,
			"@else",
			`    <div class="false"></div>`,
			"@endif",
			"</script>",
			`<script id="data" type="application/json">`,
			`{"org": 10, "items":["one","two"]}`,
			"</script>",
			`<script id="data" type="application/json">`,
			"    <?php echo json_encode($users); ?>",
			"</script>",
			`<script id="data" type="application/json">`,
			"    @json($users)",
			"</script>",
			`<script id="data" type="text/template">`,
			"    <div>",
			"        @if ($users)",
			"            <p>@json($users)</p>",
			"        @endif",
			"    </div>",
			"</script>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
		await expect(new BladeFormatter().format(content)).resolves.not.toThrow(
			"Can't format blade",
		);
	});

	// see: https://github.com/shufo/vscode-blade-formatter/issues/967
	test("it should handle custom directives in scripts", async () => {
		const content = [
			`@extends('layouts.parent-layout')`,
			``,
			`@section('scripts')`,
			`    <script>`,
			`        $(document).ready(function() {`,
			`            @foo('submitSuccessInit',`,
			`            2,`,
			`            new Foo()->bar())`,
			``,
			`            @if (request('token'))`,
			`              foo`,
			`            @else`,
			`              bar`,
			`            @endif`,
			`        });`,
			`    </script>`,
			``,
			`@endsection`,
		].join("\n");

		const expected = [
			`@extends('layouts.parent-layout')`,
			``,
			`@section('scripts')`,
			`    <script>`,
			`        $(document).ready(function() {`,
			`            @foo('submitSuccessInit', 2, new Foo()->bar())`,
			``,
			`            @if (request('token'))`,
			`                foo`,
			`            @else`,
			`                bar`,
			`            @endif`,
			`        });`,
			`    </script>`,
			`@endsection`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
