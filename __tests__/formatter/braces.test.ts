import assert from "node:assert";
import { describe, test } from "vitest";
import { BladeFormatter } from "../../src/main.js";
import * as util from "../support/util";

describe("formatter braces test", () => {
	test("escaped brace without line return issue shufo/vscode-blade-formatter#12", async () => {
		const content = [
			`{!! Form::open(['method' => 'DELETE', 'route' => ['roles.destroy', $role->id], 'style' => 'display:inline']) !!}`,
			`{!! Form::submit('Delete', ['class' => 'btn btn-danger']) !!}`,
			"{!! Form::close() !!}",
		].join("\n");

		const expected = [
			`{!! Form::open(['method' => 'DELETE', 'route' => ['roles.destroy', $role->id], 'style' => 'display:inline']) !!}`,
			`{!! Form::submit('Delete', ['class' => 'btn btn-danger']) !!}`,
			"{!! Form::close() !!}",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("braces without content should not occurs error", async () => {
		const content = [
			`<x-app-layout title="Add new client">`,
			`    <section class="section">`,
			"        {{ }}",
			"    </section>",
			"</x-app-layout>",
		].join("\n");

		const expected = [
			`<x-app-layout title="Add new client">`,
			`    <section class="section">`,
			"        {{ }}",
			"    </section>",
			"</x-app-layout>",
			"",
		].join("\n");

		return new BladeFormatter().format(content).then((result: any) => {
			assert.equal(result, expected);
		});
	});

	test("long expression blade brace", async () => {
		const content = [
			`<a href="{{ $relatedAuthority->id }}" class="no-border"`,
			`   itemprop="{{ $author->isCorporateBody() ?`,
			`                ($relatedAuthority->isCorporateBody() ? 'knowsAbout' : 'member') :`,
			`                ($relatedAuthority->isCorporateBody() ? 'memberOf' : 'knows') }}">`,
			"    <strong>{{ formatName($relatedAuthority->name) }}</strong>",
			`    <i class="icon-arrow-right"></i>`,
			"</a><br>",
		].join("\n");

		const expected = [
			`<a href="{{ $relatedAuthority->id }}" class="no-border"`,
			`    itemprop="{{ $author->isCorporateBody()`,
			"        ? ($relatedAuthority->isCorporateBody()",
			`            ? 'knowsAbout'`,
			`            : 'member')`,
			"        : ($relatedAuthority->isCorporateBody()",
			`            ? 'memberOf'`,
			`            : 'knows') }}">`,
			"    <strong>{{ formatName($relatedAuthority->name) }}</strong>",
			`    <i class="icon-arrow-right"></i>`,
			"</a><br>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("sort blade brace mixes classes", async () => {
		const content = [
			"<div",
			`    class="px-4 py-5 bg-white sm:p-6 shadow     {{ isset($actions) ? 'sm:rounded-tl-md sm:rounded-tr-md' : 'sm:rounded-md' }} {{ isset($actions) ? 'foo' : 'bar' }}">`,
			"</div>",
		].join("\n");

		const expected = [
			"<div",
			`    class="{{ isset($actions) ? 'sm:rounded-tl-md sm:rounded-tr-md' : 'sm:rounded-md' }} {{ isset($actions) ? 'foo' : 'bar' }} bg-white px-4 py-5 shadow sm:p-6">`,
			"</div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected, {
			sortTailwindcssClasses: true,
		});
	});

	test("long inline brade braces", async () => {
		const content = [
			`<input id="combobox" type="text" placeholder="{{ $itemsPlaceholder }}" role="combobox" aria-controls="options"`,
			`       aria-expanded="false" x-on:keydown.up.prevent="hoverPreviousItem()"`,
			`       x-on:keydown.enter.stop.prevent="selectItem()" x-on:keydown.down.prevent="hoverNextItem()" x-ref="input"`,
			`       x-model="input"`,
			`       class="form-input focus:border-blue-good-standard-light focus:ring-blue-good-standard-light {{ empty($selectedItemIds)?'placeholder:text-blue-good-standard-light focus:placeholder:text-blue-good-standard-dark':'placeholder:text-gray-good-standard-light focus:placeholder:text-gray-good-standard-dark' }} {{ $inputClasses }} w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-12 text-base shadow-sm transition-all placeholder:font-medium focus:outline-none focus:ring-1">`,
		].join("\n");

		const expected = [
			`<input id="combobox" type="text" placeholder="{{ $itemsPlaceholder }}" role="combobox" aria-controls="options"`,
			`    aria-expanded="false" x-on:keydown.up.prevent="hoverPreviousItem()" x-on:keydown.enter.stop.prevent="selectItem()"`,
			`    x-on:keydown.down.prevent="hoverNextItem()" x-ref="input" x-model="input"`,
			`    class="form-input focus:border-blue-good-standard-light focus:ring-blue-good-standard-light {{ empty($selectedItemIds) ? 'placeholder:text-blue-good-standard-light focus:placeholder:text-blue-good-standard-dark' : 'placeholder:text-gray-good-standard-light focus:placeholder:text-gray-good-standard-dark' }} {{ $inputClasses }} w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-12 text-base shadow-sm transition-all placeholder:font-medium focus:outline-none focus:ring-1">`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("multiline blade brace #581", async () => {
		const content = [
			"<reservation-modal",
			`    :my-count="{{ json_encode(`,
			"        $user->countReservations()",
			`    ) }}"`,
			">",
		].join("\n");

		const expected = [
			`<reservation-modal :my-count="{{ json_encode($user->countReservations()) }}">`,
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("raw blade brace losts indentation https://github.com/shufo/vscode-blade-formatter/issues/474", async () => {
		const content = [
			`                        <div class="row">`,
			`                            <div class="col-12 col-sm-8 mb-2">`,
			"",
			"                            </div>",
			`                            <div class="col-12 col-sm-4">`,
			`                                {!! Form::button(trans('forms.save-changes'), [`,
			`    'class' => 'btn btn-success btn-block margin-bottom-1 mt-3 mb-2 btn-save',`,
			`    'type' => 'button',`,
			`    'data-toggle' => 'modal',`,
			`    'data-target' => '#confirmSave',`,
			`    'data-title' => trans('modals.edit_user__modal_text_confirm_title'),`,
			`    'data-message' => trans('modals.edit_user__modal_text_confirm_message'),`,
			"]) !!}",
			"                            </div>",
			"                        </div>",
		].join("\n");

		const expected = [
			`                        <div class="row">`,
			`                            <div class="col-12 col-sm-8 mb-2">`,
			"",
			"                            </div>",
			`                            <div class="col-12 col-sm-4">`,
			`                                {!! Form::button(trans('forms.save-changes'), [`,
			`                                    'class' => 'btn btn-success btn-block margin-bottom-1 mt-3 mb-2 btn-save',`,
			`                                    'type' => 'button',`,
			`                                    'data-toggle' => 'modal',`,
			`                                    'data-target' => '#confirmSave',`,
			`                                    'data-title' => trans('modals.edit_user__modal_text_confirm_title'),`,
			`                                    'data-message' => trans('modals.edit_user__modal_text_confirm_message'),`,
			"                                ]) !!}",
			"                            </div>",
			"                        </div>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("Long raw blade brace line should be formatted into multiple lines", async () => {
		const content = [
			`{!! Form::button(trans('forms.save-changes'), [    'class' => 'btn btn-success btn-block margin-bottom-1 mt-3 mb-2 btn-save',    'type' => 'button',    'data-toggle' => 'modal',    'data-target' => '#confirmSave',    'data-title' => trans('modals.edit_user__modal_text_confirm_title'),    'data-message' => trans('modals.edit_user__modal_text_confirm_message'),]) !!}`,
		].join("\n");

		const expected = [
			`{!! Form::button(trans('forms.save-changes'), [`,
			`    'class' => 'btn btn-success btn-block margin-bottom-1 mt-3 mb-2 btn-save',`,
			`    'type' => 'button',`,
			`    'data-toggle' => 'modal',`,
			`    'data-target' => '#confirmSave',`,
			`    'data-title' => trans('modals.edit_user__modal_text_confirm_title'),`,
			`    'data-message' => trans('modals.edit_user__modal_text_confirm_message'),`,
			"]) !!}",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});

	test("do not preserve unnecessary spaces in blade braces", async () => {
		const content = [
			// escaped brade braces
			"{{}}",
			"{{                      }}",
			"{{    ",
			"      ",
			"   }}",
			"{{",
			"",
			"auth()->user()->some() }}",
			"<p>{{                                                                                                          auth()->user()->some() }}</p>",
			// raw blade braces
			"{!!!!}",
			"{!!                      !!}",
			"{!!    ",
			"      ",
			"   !!}",
			"{!!",
			"",
			"auth()->user()->some() !!}",
			"<p>{!!                                                                                                          auth()->user()->some() !!}</p>",
		].join("\n");

		const expected = [
			// escaped brade braces
			"{{}}",
			"{{ }}",
			"{{ }}",
			"{{ auth()->user()->some() }}",
			"<p>{{ auth()->user()->some() }}</p>",
			// raw blade braces
			"{!!!!}",
			"{!! !!}",
			"{!! !!}",
			"{!! auth()->user()->some() !!}",
			"<p>{!! auth()->user()->some() !!}</p>",
			"",
		].join("\n");

		await util.doubleFormatCheck(content, expected);
	});
});
