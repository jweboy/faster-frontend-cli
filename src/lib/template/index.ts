import { access, constants } from 'fs-extra';
import { join, resolve } from 'path';
import { spawnAsync } from '../../utils/process';
import {
  cloneGitRepository,
  traverseDeleteFiles,
  copyFilesWithoutGitFile,
  getCurrentFilePath,
} from '../../utils/fs';
import { Project } from '../../typings/project';
import { getProjects, getProjectSnippetRawById } from '../../api/gitlab';
import { SCAFFOLD_SNIPPET_ID } from '../../constants';
import loading from '../../utils/loading';
import log from '../../utils/log';
import { downloadDependPackage, checkIsOverwriteCurrFiles, checkProjectName } from './util';
import { getUserQuestions } from './question';

// const rootPath = join(__dirname, '../../..');

const onGenerateNewProject = async ({
  tplRepoUrl,
  tplPath,
  pkg,
  dist,
  remoteRepoUrl,
  distName,
}) => {
  const donwload = async (dist: string, isOverwrite?: boolean) => {
    // 如果选择了覆盖文件选项，就先删除已经生成的Git项目。
    if (isOverwrite) {
      await traverseDeleteFiles(dist);
    }

    if (remoteRepoUrl) {
      const dotGitFiles = getCurrentFilePath(dist, '.git');
      // 下载用户输入的指定Git仓库的项目文件
      // await cloneGitRepository({
      //   repoUrl: remoteRepoUrl,
      //   dist,
      // });

      // 删除本地已经存在的模板文件（每次重新获取模板文件保证文件内容是最新的）
      await traverseDeleteFiles(tplPath);

      // 下载Git仓库中的模板文件
      await cloneGitRepository({
        repoUrl: tplRepoUrl,
        dist,
        targetName: '模板',
      });

      // 将模板文件拷贝到新的Git项目中
      // await copyFilesWithoutGitFile({
      //   src: tplPath,
      //   dist,
      //   targetName: '模板',
      // });
      await traverseDeleteFiles(dotGitFiles);
      await spawnAsync('git', ['init'], dist);
      await spawnAsync('git', ['remote', 'add', 'origin', remoteRepoUrl], dist);
      // await spawnAsync('git', ['remote', '-v'], dist);
    } else {
      // 下载用户输入的指定Git仓库的项目文件
      await cloneGitRepository({ repoUrl: tplRepoUrl, dist });
    }

    // 自动安装项目依赖
    await downloadDependPackage(dist, pkg);
  };

  // 检查本地是否已创建了同名项目，如果已存在就询问用户是否要进行文件覆盖，反之就新建项目。
  try {
    await access(dist, constants.F_OK);
    const isOverwrite = await checkIsOverwriteCurrFiles(distName);

    // 如果用户选择了文件覆盖选项就开始新建项目，反之就直接退出。
    if (isOverwrite) {
      await donwload(dist, true);
    } else {
      const projectName = await checkProjectName();
      const filePath = resolve(projectName);
      await donwload(filePath);
    }
    process.exit();
  } catch (err) {
    await donwload(dist);
    process.exit();
  }
};

export const onDownloadTemplate = async () => {
  loading.start('开始读取模板列表\n');

  // 从脚手架 Gitlab 仓库的 Snippet 文件中读取到模板相关配置
  const { templates: originTemplates } = await getProjectSnippetRawById(SCAFFOLD_SNIPPET_ID);

  // 组合后的模板列表
  const templates = await originTemplates
    // 获取模板名称 FIXME: 暂时不需要配置Git地址，可通过名称来获取仓库信息，可删除
    // .map(item => {
    //   const keys = item.split('/');
    //   const name = keys[keys.length - 1];
    //   return name;
    // })
    // 组合模板列表数据（包括：模板名称、模板ID、模板仓库地址）
    .reduce<Promise<Project[]>>(async (promise, name) => {
      const list = await promise;
      const data = (await getProjects({ search: name }))[0];
      if (data) {
        const { path, id, http_url_to_repo } = data;
        list.push({ name: path, id, repoUrl: http_url_to_repo });
      }
      return list;
    }, Promise.resolve([]));

  loading.stop();
  log.success('✨ 模板列表读取成功');

  // 命令行收集用户输入的信息
  const questions = await getUserQuestions(templates);
  const { type, name, pkg, remoteRepoUrl, isAutoInitialGitRepo } = questions;

  // 设置需要生成的模板项目名称，如果没有输入就使用默认名称
  const appName = name || type;

  // 拼接需要生成的模板项目的完整地址（resolve默认返回当前工作目录的绝对路径）
  const appPath = resolve(appName);

  // 获取当前模板数据
  const currTemplate = templates.filter(item => item.name === type)[0];

  // 如果没有筛选到模板信息就退出程序
  if (!currTemplate) {
    log.error('当前模板不存在');
    process.exit(-1);
  }

  onGenerateNewProject({
    pkg,
    dist: appPath,
    distName: appName,
    remoteRepoUrl,
    tplPath: appPath,
    tplRepoUrl: currTemplate.repoUrl,
  });
};
