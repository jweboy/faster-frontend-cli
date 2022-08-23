import chalk from 'chalk';
import commander from 'commander';
import { access, constants, fstat, mkdir, writeFile } from 'fs-extra';
import { resolve, join } from 'path';
import log from '../../utils/log';
import { getDirectoryTree, getFile } from '../../api/gitlab';
import { GitlabDirectory, GitlabFile } from '../../typings/fs';
import { DEFAULT_BLOCK_REPOSITORY_BRANCH, OPEN_REPOSITORY_API } from '../../constants';
import { get } from '../../utils/request';

// 当前项目根目录
const rootPath = join(__dirname, '../../..');

/**
 * @name 批量下载区块代码文件
 * @param blockFiles 区块代码文件列表
 * @param dist 指定每个文件下载的地址
 */
export const batchDownloadFiles = async (blockFiles, dist: string) => {
  for await (const blockFile of blockFiles) {
    // 获取当前文件内容
    const file = await getFile(blockFile.path);
    const { file_name, content, encoding } = file;
    // 拼接需要文件生成的目标地址
    const outPath = join(dist, file_name);
    // 写入并生成文件
    await writeFile(outPath, content, { encoding });
    log.success(`✔ ${outPath}创建成功`);
  }
};

/**
 * @name 下载指定区块目录中的代码文件
 * @param block {GitlabDirectory} 区块文件对象
 */
export const downloadSpecificBlock = async (block: GitlabDirectory) => {
  // 将区块名称拼接在当前项目根路径之后，拼接出完整的区块目录地址
  const dist = resolve(block.name);
  // 获取当前区块目录下的所有文件
  const currBlockFiles = await getDirectoryTree(block.path);
  // 过滤当前区块文件列表中的 index.md 文件
  const currUsefulBlockFiles = currBlockFiles.filter(item => !/\.md$/.test(item.name));

  // 批量下载当前区块目录中的文件
  try {
    await access(block.name, constants.F_OK);
    batchDownloadFiles(currUsefulBlockFiles, dist);
  } catch (err) {
    await mkdir(block.name);
    batchDownloadFiles(currUsefulBlockFiles, dist);
  }
};
