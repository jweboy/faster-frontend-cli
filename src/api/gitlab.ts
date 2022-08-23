import { IProjectModel } from '../typings/project';
import { ISnippetModel } from '../typings/snippet';
import {
  SCAFFOLD_PROJECT_ID,
  DEFAULT_BLOCK_REPOSITORY_BRANCH,
  OPEN_REPOSITORY_API,
} from '../constants';
import { IGitlabFileModel, IGitlabDirectoryModel } from '../typings/fs';
import { get } from '../utils/request';

export const getDirectoryTree = (path: string) => {
  return get<IGitlabDirectoryModel[]>({
    url: `${OPEN_REPOSITORY_API}/tree`,
    params: {
      ref: DEFAULT_BLOCK_REPOSITORY_BRANCH,
      path,
    },
    encodeParams: false,
  });
};

export const getFile = (filePath: string) => {
  return get<IGitlabFileModel>({
    url: `${OPEN_REPOSITORY_API}/files/${encodeURIComponent(filePath)}`,
    params: {
      ref: DEFAULT_BLOCK_REPOSITORY_BRANCH,
    },
  });
};

/**
 * @name 获取脚手架项目的snippet文件（主要是脚手架的配置相关的json文件）
 * @param {string} snippetId
 */
export const getProjectSnippetRawById = (snippetId: string) => {
  return get<ISnippetModel>({
    url: `/projects/${SCAFFOLD_PROJECT_ID}/snippets/${snippetId}/raw`,
  });
};

/**
 *
 * @param data
 */
export const getProjects = (data: { search: string }) => {
  return get<IProjectModel[]>({
    url: '/projects',
    params: data,
  });
};
