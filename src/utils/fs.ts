import { exec } from 'child_process';
import { copySync, readFileSync } from 'fs-extra';
import { join } from 'path';
import util from 'util';
import { accessSync, constants, realpathSync } from 'fs';
import log from './log';
import { spawnAsync } from './process';

const execAsync = util.promisify(exec);

export const syncrReadFileContent = (filePath: string) => {
  const buffer = readFileSync(filePath);
  const content = JSON.parse(buffer.toString());

  return content;
};

export const getCurrentFilePath = (src, dist) => {
  return join(src, dist);
};

export const cloneGitRepository = async ({
  repoUrl,
  dist = '.',
  hasTip = true,
  targetName = 'Git',
}: {
  repoUrl: string;
  dist: string;
  hasTip?: boolean;
  targetName?: string;
}) => {
  hasTip && log.success(`🚀 开始创建${targetName}项目`);

  // 下载用户输入的指定Git仓库的项目文件
  await spawnAsync('git', ['clone', repoUrl, '--depth=1', '--verbose', '--progress', dist]);

  hasTip && log.success(`✨ ${targetName}项目创建成功`);
};

export const traverseDeleteFiles = async (filePath: string) => {
  await execAsync(`rm -rf ${filePath}`);
};

export const copyFilesWithoutGitFile = async ({
  src,
  dist,
  hasTip = true,
  targetName = '',
}: {
  src: string;
  dist: string;
  hasTip?: boolean;
  targetName?: string;
}) => {
  hasTip && log.success(`🚀 开始拷贝${targetName}文件`);

  await copySync(src, dist, {
    filter: src => {
      const regexp = /\.git/;
      const hasIgnoreGitFile = !regexp.test(src);
      if (hasIgnoreGitFile) {
        log.print(log.infoColor(src) + log.successColor(' ✔'));
      }
      return hasIgnoreGitFile;
    },
  });

  hasTip && log.success(`✨ ${targetName}文件拷贝成功`);
};

/**
 * @param {string} relativePath 文件相对路径
 * @returns 基于根目录的完整文件绝对路径
 */
export const getRuntimeProjectPath = (path: string, rootPath?: string) => {
  const appPath = realpathSync(rootPath || process.cwd());
  const fullPath = join(appPath, path);

  return fullPath;
};

export const checkFileExist = filePath => {
  return accessSync(filePath, constants.F_OK);
};
