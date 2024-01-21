import {
  isSchemaArray,
  isSchemaBoolean,
  isSchemaInteger,
  isSchemaNumber,
  isSchemaObject,
  isSchemaOneOf,
  isSchemaString,
  createTsTypeLiteral,
} from 'ah-api-type';
import { importOrRequireFile } from './util';

export type IModuleInfo = {
  tsTypeLiteral: string;
};

export const createTsTypeMapFromModule = async (filepath: string): Promise<Map<string, IModuleInfo>> => {
  const [mEntry] = await importOrRequireFile(filepath);

  const resultMap = new Map<string, IModuleInfo>();

  for (const [expName, expValue] of Object.entries(mEntry)) {
    const schema = expValue as any;
    if (!schema) continue;
    if (typeof schema !== 'object') continue;

    if (
      isSchemaArray(schema) ||
      isSchemaObject(schema) ||
      isSchemaBoolean(schema) ||
      isSchemaNumber(schema) ||
      isSchemaInteger(schema) ||
      isSchemaString(schema) ||
      isSchemaOneOf(schema)
    ) {
      const tsTypeLiteral = createTsTypeLiteral(schema);
      resultMap.set(expName, { tsTypeLiteral });
    }
  }

  return resultMap;
};
