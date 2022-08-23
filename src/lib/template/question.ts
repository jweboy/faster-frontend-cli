import inquirer from 'inquirer';
import log from '../../utils/log';
import { Question } from '../../typings/template';

export const getUserQuestions = (templates): Promise<Question> => {
  return inquirer.prompt([
    {
      name: 'pkg',
      type: 'list',
      message: '请选择包管理器',
      choices: ['yarn', 'npm'],
    },
    {
      name: 'type',
      type: 'list',
      message: '请选择模版',
      choices: templates,
    },
    {
      name: 'name',
      type: 'input',
      message: '请输入项目名称(如果为空就默认采用模板名称)',
    },
    {
      name: 'isAutoInitialGitRepo',
      type: 'confirm',
      message: '是否自动初始化Git仓库',
      default: false,
      loop: false,
    },
    {
      name: 'remoteRepoUrl',
      type: 'input',
      message: '请输入新创建项目的Git地址',
      default: '',
      when(data) {
        return data.isAutoInitialGitRepo;
      },
      validate(input) {
        const done = this.async();
        const httpPrefixRegexp = /^https?:\/\/.+/;
        const gitPrefixRegexp = /^git@.+/;
        setTimeout(() => {
          const value = input.trim();
          if (value === '') {
            done(log.warningColor('请输入Git地址'));
            return;
          }
          if (!httpPrefixRegexp.test(value) && !gitPrefixRegexp.test(value)) {
            done(log.warningColor('请输入正确的Git地址'));
            return;
          }
          done(null, true);
        }, 0);
      },
    },
  ]);
};
