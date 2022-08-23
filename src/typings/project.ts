export interface IProjectModel {
  name: string;
  id: string;
  http_url_to_repo: string;
  repoUrl: string;
  path: string;
}

export type Project = Partial<IProjectModel>;
