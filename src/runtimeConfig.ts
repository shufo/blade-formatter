import path from 'path';
import fs from 'fs';
import Ajv, { JSONSchemaType } from 'ajv';
import findup from 'findup-sync';

const ajv = new Ajv();

export type WrapAttributes =
  | 'auto'
  | 'force'
  | 'force-aligned '
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

function findConfigFile(filePath: string): string | null {
  const configs = [path.basename(filePath), ...defaultConfigNames];

  return findup(configs, { cwd: path.dirname(filePath) });
}

export async function getRuntimeConfig(filePath: string): Promise<RuntimeConfig | undefined> {
  const configFilePath: string | null = findConfigFile(filePath);

  if (configFilePath === null) {
    return undefined;
  }

  const options = JSON.parse((await fs.promises.readFile(configFilePath)).toString());

  const schema: JSONSchemaType<RuntimeConfig> = {
    type: 'object',
    properties: {
      indentSize: { type: 'integer', nullable: true },
      wrapLineLength: { type: 'integer', nullable: true },
      wrapAttributes: { type: 'string', nullable: true },
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
