export interface IQuestionModel {
  type: string;
  name: string;
  pkg: string;
  remoteRepoUrl: string;
  isAutoInitialGitRepo: boolean;
}

export type Question = Partial<IQuestionModel>;
