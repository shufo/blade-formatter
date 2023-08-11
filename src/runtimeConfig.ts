import Ajv, { JSONSchemaType } from 'ajv';
import findConfig from 'find-config';
import fs from 'fs';
import path from 'path';

const ajv = new Ajv();

export type WrapAttributes =
  | 'auto'
  | 'force'
  | 'force-aligned'
  | 'force-expand-multiline'
  | 'aligned-multiple'
  | 'preserve'
  | 'preserve-aligned';

export type SortHtmlAttributes = 'none' | 'alphabetical' | 'code-guide' | 'idiomatic' | 'vuejs' | 'custom';

export type EndOfLine = 'LF' | 'CRLF';

export interface RuntimeConfig {
  indentSize?: number;
  wrapLineLength?: number;
  wrapAttributes?: WrapAttributes;
  wrapAttributesMinAttrs?: number;
  indentInnerHtml?: boolean;
  endWithNewline?: boolean;
  endOfLine?: EndOfLine;
  useTabs?: boolean;
  sortTailwindcssClasses?: boolean;
  tailwindcssConfigPath?: string;
  sortHtmlAttributes?: SortHtmlAttributes;
  customHtmlAttributesOrder?: string[] | string;
  noMultipleEmptyLines?: boolean;
  noPhpSyntaxCheck?: boolean;
  noSingleQuote?: boolean;
  extraLiners?: string[];
}

const defaultConfigNames = ['.bladeformatterrc.json', '.bladeformatterrc'];

export function findRuntimeConfig(filePath: string): string | null {
  for (let i = 0; i < defaultConfigNames.length; i += 1) {
    const result: string | null = findConfig(defaultConfigNames[i], {
      cwd: path.dirname(filePath),
      home: false,
    });

    if (result) {
      return result;
    }
  }

  return null;
}

export async function readRuntimeConfig(filePath: string | null): Promise<RuntimeConfig | undefined> {
  if (filePath === null) {
    return undefined;
  }

  const options = JSON.parse((await fs.promises.readFile(filePath)).toString());

  const schema: JSONSchemaType<RuntimeConfig> = {
    type: 'object',
    properties: {
      indentSize: { type: 'integer', nullable: true },
      wrapLineLength: { type: 'integer', nullable: true },
      wrapAttributes: {
        type: 'string',
        enum: [
          'auto',
          'force',
          'force-aligned',
          'force-expand-multiline',
          'aligned-multiple',
          'preserve',
          'preserve-aligned',
        ],
        nullable: true,
      },
      wrapAttributesMinAttrs: { type: 'integer', nullable: true, default: 2 },
      indentInnerHtml: { type: 'boolean', nullable: true },
      endWithNewline: { type: 'boolean', nullable: true },
      endOfLine: { type: 'string', enum: ['LF', 'CRLF'], nullable: true },
      useTabs: { type: 'boolean', nullable: true },
      sortTailwindcssClasses: { type: 'boolean', nullable: true },
      tailwindcssConfigPath: { type: 'string', nullable: true },
      sortHtmlAttributes: {
        type: 'string',
        enum: ['none', 'alphabetical', 'code-guide', 'idiomatic', 'vuejs', 'custom'],
        nullable: true,
      },
      customHtmlAttributesOrder: { type: 'array', nullable: true, items: { type: 'string' }, default: [] },
      noMultipleEmptyLines: { type: 'boolean', nullable: true },
      noPhpSyntaxCheck: { type: 'boolean', nullable: true },
      noSingleQuote: { type: 'boolean', nullable: true },
      extraLiners: { type: 'array', nullable: true, items: { type: 'string' }, default: ['head', 'body', '/html'] },
    },
    additionalProperties: true,
  };
  const validate = ajv.compile(schema);

  if (!validate(options)) {
    throw validate;
  }

  return options;
}
