import type Formatter from "./formatter";
import { AdjustSpacesProcessor } from "./processors/adjustSpacesProcessor";
import { BladeBraceProcessor } from "./processors/bladeBraceProcessor";
import { BladeCommentProcessor } from "./processors/bladeCommentProcessor";
import { BladeDirectiveInScriptsProcessor } from "./processors/bladeDirectiveInScriptsProcessor";
import { BladeDirectiveInStylesProcessor } from "./processors/bladeDirectiveInStylesProcessor";
import { BreakLineBeforeAndAfterDirectiveProcessor } from "./processors/breakLineBeforeAndAfterDirectiveProcessor";
import { ComponentAttributeProcessor } from "./processors/componentAttributeProcessor";
import { ConditionsProcessor } from "./processors/conditionsProcessor";
import { CurlyBraceForJSProcessor } from "./processors/curlyBraceForJSProcessor";
import { CustomDirectiveProcessor } from "./processors/customDirectiveProcessor";
import { EscapedBladeDirectiveProcessor } from "./processors/escapedBladeDirectiveProcessor";
import { FormatAsPhpProcessor } from "./processors/fomatAsPhpProcessor";
import { FormatAsBladeProcessor } from "./processors/formatAsBladeProcessor";
import { FormatAsHtmlProcessor } from "./processors/formatAsHtmlProcessor";
import { HtmlAttributesProcessor } from "./processors/htmlAttributesProcessor";
import { HtmlTagsProcessor } from "./processors/htmlTagsProcessor";
import { IgnoredLinesProcessor } from "./processors/ignoredLinesProcessor";
import { InlineDirectiveProcessor } from "./processors/inlineDirectiveProcessor";
import { InlinePhpDirectiveProcessor } from "./processors/inlinePhpDirectiveProcessor";
import { NonnativeScriptsProcessor } from "./processors/nonnativeScriptsProcessor";
import { PhpBlockProcessor } from "./processors/phpBlockProcessor";
import type { Processor } from "./processors/processor";
import { PropsProcessor } from "./processors/propsProcessor";
import { RawBladeBraceProcessor } from "./processors/rawBladeBraceProcessor";
import { RawPhpTagProcessor } from "./processors/rawPhpTagProcessor";
import { ScriptsProcessor } from "./processors/scriptsProcessor";
import { ShorthandBindingProcessor } from "./processors/shorthandBindingProcessor";
import { SortHtmlAttributesProcessor } from "./processors/sortHtmlAttributesProcessor";
import { SortTailwindClassesProcessor } from "./processors/sortTailwindClassesProcessor";
import { UnbalancedDirectiveProcessor } from "./processors/unbalancedDirectiveProcessor";
import { XDataProcessor } from "./processors/xdataProcessor";
import { XInitProcessor } from "./processors/xinitProcessor";
import { XslotProcessor } from "./processors/xslotProcessor";

export class FormatContentPipeline {
	private processors: Processor[];

	private preProcessors: (typeof Processor)[] = [
		IgnoredLinesProcessor,
		NonnativeScriptsProcessor,
		CurlyBraceForJSProcessor,
		RawPhpTagProcessor,
		EscapedBladeDirectiveProcessor,
		FormatAsPhpProcessor,
		BladeCommentProcessor,
		BladeBraceProcessor,
		RawBladeBraceProcessor,
		ConditionsProcessor,
		PropsProcessor,
		InlinePhpDirectiveProcessor,
		InlineDirectiveProcessor,
		BladeDirectiveInScriptsProcessor,
		BladeDirectiveInStylesProcessor,
		CustomDirectiveProcessor,
		UnbalancedDirectiveProcessor,
		BreakLineBeforeAndAfterDirectiveProcessor,
		ScriptsProcessor,
		SortTailwindClassesProcessor,
		XInitProcessor,
		XDataProcessor,
		PhpBlockProcessor,
		SortHtmlAttributesProcessor,
		HtmlAttributesProcessor,
		ComponentAttributeProcessor,
		ShorthandBindingProcessor,
		XslotProcessor,
		HtmlTagsProcessor,
		FormatAsHtmlProcessor,
		FormatAsBladeProcessor,
	];

	private postProcessors: (typeof Processor)[] = [
		HtmlTagsProcessor,
		XslotProcessor,
		ShorthandBindingProcessor,
		ComponentAttributeProcessor,
		HtmlAttributesProcessor,
		PhpBlockProcessor,
		PropsProcessor,
		XDataProcessor,
		XInitProcessor,
		ScriptsProcessor,
		UnbalancedDirectiveProcessor,
		CustomDirectiveProcessor,
		BladeDirectiveInStylesProcessor,
		BladeDirectiveInScriptsProcessor,
		InlineDirectiveProcessor,
		InlinePhpDirectiveProcessor,
		ConditionsProcessor,
		RawBladeBraceProcessor,
		BladeBraceProcessor,
		BladeCommentProcessor,
		EscapedBladeDirectiveProcessor,
		RawPhpTagProcessor,
		CurlyBraceForJSProcessor,
		NonnativeScriptsProcessor,
		IgnoredLinesProcessor,
		AdjustSpacesProcessor,
	];

	constructor(private formatter: Formatter) {
		this.processors = [
			new IgnoredLinesProcessor(formatter),
			new NonnativeScriptsProcessor(formatter),
			new CurlyBraceForJSProcessor(formatter),
			new RawPhpTagProcessor(formatter),
			new EscapedBladeDirectiveProcessor(formatter),
			new FormatAsPhpProcessor(formatter),
			new BladeCommentProcessor(formatter),
			new BladeBraceProcessor(formatter),
			new RawBladeBraceProcessor(formatter),
			new ConditionsProcessor(formatter),
			new PropsProcessor(formatter),
			new InlinePhpDirectiveProcessor(formatter),
			new InlineDirectiveProcessor(formatter),
			new BladeDirectiveInScriptsProcessor(formatter),
			new BladeDirectiveInStylesProcessor(formatter),
			new CustomDirectiveProcessor(formatter),
			new UnbalancedDirectiveProcessor(formatter),
			new BreakLineBeforeAndAfterDirectiveProcessor(formatter),
			new ScriptsProcessor(formatter),
			new SortTailwindClassesProcessor(formatter),
			new XInitProcessor(formatter),
			new XDataProcessor(formatter),
			new PhpBlockProcessor(formatter),
			new SortHtmlAttributesProcessor(formatter),
			new HtmlAttributesProcessor(formatter),
			new ComponentAttributeProcessor(formatter),
			new ShorthandBindingProcessor(formatter),
			new XslotProcessor(formatter),
			new HtmlTagsProcessor(formatter),
			new FormatAsHtmlProcessor(formatter),
			new FormatAsBladeProcessor(formatter),
			new AdjustSpacesProcessor(formatter),
		];
	}

	async formatContent(content: any): Promise<any> {
		let target = await Promise.resolve(content);

		// pre process content
		const preProcessors = this.processors.filter((processor) =>
			this.preProcessors.includes(processor.constructor as typeof Processor),
		);

		for (const processor of preProcessors) {
			target = await processor.preProcess(target);
		}

		// post process content
		const postProcessors = this.processors.filter((processor) =>
			this.postProcessors.includes(processor.constructor as typeof Processor),
		);
		postProcessors.sort((a, b) => {
			return (
				this.postProcessors.indexOf(a.constructor as typeof Processor) -
				this.postProcessors.indexOf(b.constructor as typeof Processor)
			);
		});

		for (const processor of postProcessors) {
			target = await processor.postProcess(target);
		}

		return target;
	}
}
