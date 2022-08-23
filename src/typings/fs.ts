export interface IGitlabDirectoryModel {
  id: string;
  name: string;
  type: string;
  path: string;
  mode: string;
}

export type GitlabDirectory = Partial<IGitlabDirectoryModel>;

export interface IGitlabFileModel {
  file_name: string;
  file_path: string;
  size: number;
  content: string;
  ref: string;
  blob_id: string;
  commit_id: string;
  last_commit_id: string;
  encoding: string;
}

export type GitlabFile = Partial<IGitlabFileModel>;
