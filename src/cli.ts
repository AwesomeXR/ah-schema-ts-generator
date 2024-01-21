#!/usr/bin/env node

import * as yargs from 'yargs';
import { run } from './index';

const args = yargs
  .option('rootDir', { alias: 'r', describe: '项目根目录', type: 'string' })
  .option('inputs', { alias: 'i', describe: '输入文件 glob pattern', type: 'string', array: true })
  .option('ignores', { describe: '忽略文件 glob pattern', type: 'string', array: true })
  .option('outputDir', { alias: 'o', describe: 'ts 类型输出目录', type: 'string' })
  .demandOption(['inputs', 'outputDir'])
  .parseSync();

run({
  rootDir: args.rootDir || process.cwd(),
  inputs: args.inputs,
  ignores: args.ignores || [],
  outputDir: args.outputDir,
}).catch(err => {
  console.error(err);
  process.exit(1);
});
