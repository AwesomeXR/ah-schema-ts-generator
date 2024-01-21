import { createTsTypeMapFromModule, IModuleInfo } from './createTsTypeMapFromModule';
import * as Path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as prettier from 'prettier';
import { Logger } from 'ah-logger';

export type IRunOption = {
  rootDir: string;
  inputs: string[];
  ignores: string[];
  outputDir: string;
};

export const run = async (opt: IRunOption) => {
  const logger = new Logger('ST');
  const { inputs, ignores, rootDir, outputDir } = opt;

  const inputSet = new Set<string>();
  for (const _p of inputs) {
    glob.sync(_p, { cwd: rootDir, absolute: true, nodir: true }).forEach(v => inputSet.add(v));
  }

  const ignoreSet = new Set<string>();
  for (const _p of ignores) {
    glob.sync(_p, { cwd: rootDir, absolute: true, nodir: true }).forEach(v => ignoreSet.add(v));
  }

  const realInputs = [...inputSet].filter(_p => !ignoreSet.has(_p) && !_p.endsWith('.d.ts'));
  const resultMap = new Map<string, Map<string, IModuleInfo>>();

  for (let i = 0; i < realInputs.length; i++) {
    const filepath = realInputs[i];

    const subMap = await createTsTypeMapFromModule(filepath);
    if (subMap.size === 0) continue;

    const relFilepath = Path.relative(rootDir, filepath);
    logger.info('[%s/%s] %s in %s', i + 1, realInputs.length, subMap.size, relFilepath);

    resultMap.set(filepath, subMap);
  }

  let content = '';
  content += 'declare interface ST {';

  for (const [filepath, subMap] of resultMap) {
    const relFilepath = Path.relative(rootDir, filepath);

    content += `// auto generate from ${relFilepath}\n`;
    for (const [key, info] of subMap) {
      content += `${key}: ${info.tsTypeLiteral};\n`;
    }
  }

  content += '}';

  // pretty
  const prettierOpt = await prettier.resolveConfig(rootDir);
  content = await prettier.format(content, {
    parser: 'typescript',
    trailingComma: 'es5',
    tabWidth: 2,
    semi: true,
    singleQuote: true,
    jsxSingleQuote: true,
    printWidth: 120,
    bracketSpacing: true,
    arrowParens: 'avoid',
    ...prettierOpt,
  });

  fs.writeFileSync(Path.join(outputDir, 'declare.d.ts'), content, 'utf-8');
};
