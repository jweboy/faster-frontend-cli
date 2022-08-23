import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { join, resolve } from 'path';
import { access, constants, mkdir, writeFile } from 'fs-extra';
import { getDirectoryTree, getFile } from '../../api/gitlab';
import log from '../../utils/log';
import {
  DEFAULT_BLOCK_DIRECTORY,
  DEFAULT_BLOCK_REPOSITORY_BRANCH,
  OPEN_REPOSITORY_API,
} from '../../constants';
import { GitlabDirectory, GitlabFile } from '../../typings/fs';
import { get } from '../../utils/request';
import { downloadSpecificBlock } from './donwload';
import loading from '../../utils/loading';

let spinner;

export const onGenerateBlocks = async () => {
  loading.start('正在从 Git 仓库中拉取区块目录...');

  // 从 Git 仓库获取所有区块目录结构列表
  const blocks = await getDirectoryTree(DEFAULT_BLOCK_DIRECTORY);

  // 用于判断当前文件名是否有后缀，用于判断当前文件是目录类型还是文件类型
  /* eslint-disable */
  const regexp = /\.[^\.]+$/;
  // 过滤区块目录中的 index.tsx index.md 等文件
  const usefulBlocks = blocks.filter(item => !regexp.test(item.name));

  loading.stop();
  log.success('✨ 区块目录拉取成功');

  // 生成区块选择列表，收集用户选择的区块名称（blockName）
  const question = await inquirer.prompt([
    {
      name: 'blockName',
      type: 'list',
      message: '请选择模版项目！',
      choices: usefulBlocks,
    },
  ]);

  // 根据选择好的区块名称，在区块列表中筛选出当前区块的具体信息
  const currBlock: GitlabDirectory =
    usefulBlocks.filter(item => item.name === question.blockName)[0] || {};

  // 下载指定区块目录中的代码文件
  downloadSpecificBlock(currBlock);
};
