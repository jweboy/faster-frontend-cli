#!/usr/bin/env node

import { program } from 'commander';
import { join } from 'path';
import semver from 'semver';
import build from '../lib/build';
import { SCAFFOLD_NAME } from '../constants';
import log from '../utils/log';
import { onDownloadBlocks } from '../lib/blocks';
import { onDownloadTemplate } from '../lib/template';
import { syncrReadFileContent } from '../utils/fs';
import { onGenerateBlocks } from '../lib/blocks/generate';
import dev from '../lib/dev';

const packageFile = join(__dirname, '../../package.json');
const packages = syncrReadFileContent(packageFile);

const checkNodeVersion = (expectedVersion: string, id: string) => {
  if (!semver.satisfies(process.version, expectedVersion, { includePrerelease: true })) {
    log.print(
      log.warningColor('你正在使用 ') +
        log.infoColor(`Node ${process.version}`) +
        log.warningColor('，此版本的\b') +
        log.infoColor(id) +
        log.warningColor(' 需要 ') +
        log.infoColor(`Node ${expectedVersion}`) +
        log.warningColor('，请升级你的Node版本。'),
    );
    process.exit(1);
  }
};

checkNodeVersion(packages.engines.node, SCAFFOLD_NAME);

program
  .version(`${SCAFFOLD_NAME} ${packages.version}`, '-v --version', '脚手架版本号')
  .usage('<command> [options]');

// program
//   .command('create')
//   .description('创建项目模板（如：通用后台系统等）')
//   .action(onDownloadTemplate);

// program
//   .command('add <blockName>')
//   .description('创建区块模板（如：列表、表单等）')
//   .action(onDownloadBlocks);

// program
//   .command('blocks')
//   .description('创建区块模板（如：列表、表单等）')
//   .action(onGenerateBlocks);

program
  .command('dev')
  .option('-e,--env <env>', '环境变量，如：dev、test、perf、prod')
  .description('运行开发环境')
  .action(dev);

program
  .command('build')
  .option('-e,--env <env>', '环境变量，如：dev、test、perf、prod')
  .description('打包构建')
  .action(build);

program.parse(process.argv);

// 单纯输入 web-cli 命令就输出脚手架的帮助信息
if (!program.args.length) program.help();

// 抓取全局 Promise 的 Reject 错误
process.on('unhandledRejection', (reason: Error) => {
  log.error(reason.stack);
  process.exit(-1);
});
