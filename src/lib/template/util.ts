import { readdirSync } from 'fs-extra';
import inquirer from 'inquirer';
import { resolve } from 'path';
import { spawnAsync } from '../../utils/process';
import log from '../../utils/log';
import { NPM_REGISTRY } from '../../constants';

export const downloadDependPackage = async (appPath: string, pkg: string = 'yarn') => {
  const isWindows = /^win/.test(process.platform);
  const map = {
    npm: 'install',
    yarn: '',
  };
  let cmd = pkg;
  if (isWindows) {
    cmd += '.cmd';
  }

  try {
    log.success('🚚 开始下载项目依赖');
    await spawnAsync(cmd, [map[pkg], `--registry=${NPM_REGISTRY}`], appPath);
    log.print(
      log.successColor('✌ 依赖包全部安装成功！现在你可以 ') +
        log.infoColor(`cd ${appPath}`) +
        log.successColor(' 开始尽情的工作啦！'),
    );
  } catch (err) {
    // err
  }
};

export const checkIsOverwriteCurrFiles = async distName => {
  const { isOverwrite } = await inquirer.prompt([
    {
      name: 'isOverwrite',
      type: 'confirm',
      message: `当前目录中存在同名文件(${log.infoColor(distName)})，是否要覆盖当前文件夹中的内容`,
    },
  ]);
  return isOverwrite;
};

export const checkProjectName = async () => {
  const { projectName } = await inquirer.prompt([
    {
      name: 'projectName',
      type: 'input',
      message: '请重新输入项目名称',
      validate(input) {
        const dirs = readdirSync(resolve());
        const done = this.async();
        setTimeout(() => {
          const value = input.trim();
          if (value === '') {
            done(log.warningColor('请输入项目名称'));
            return;
          }
          if (dirs.includes(input)) {
            done(log.warningColor('当前目录中存在同名文件，请重新输入文件名'));
            return;
          }
          done(null, true);
        }, 0);
      },
    },
  ]);
  return projectName;
};
