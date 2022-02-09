import path from 'path';
import fs from 'fs';
import Ajv, { JSONSchemaType } from 'ajv';
import findConfig from 'find-config';

const ajv = new Ajv();

export type WrapAttributes =
  | 'auto'
  | 'force'
  | 'force-aligned'
  | 'force-expand-multiline'
  | 'aligned-multiple'
  | 'preserve'
  | 'preserve-aligned';

export interface RuntimeConfig {
  indentSize?: number;
  wrapLineLength?: number;
  wrapAttributes?: WrapAttributes;
  endWithNewline?: boolean;
  useTabs?: boolean;
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
      endWithNewline: { type: 'boolean', nullable: true },
      useTabs: { type: 'boolean', nullable: true },
    },
    additionalProperties: true,
  };
  const validate = ajv.compile(schema);

  if (!validate(options)) {
    throw validate;
  }

  return options;
}
