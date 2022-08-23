import { WebpackOptionsNormalized } from 'webpack';

export type WebpackConfig = WebpackOptionsNormalized & {
  title: string;
  scripts: string[];
  env: Record<string, any>;
  sourceMap?: boolean;
  injectAssets: InjectAssets;
  template?: string;
};

export type Env = 'dev' | 'prod' | 'perf' | 'test';

export type Mode = 'development' | 'production';

export type Assets = Record<
  string,
  {
    dev: string;
    prod: string;
    version: string;
  }
>;

export type InjectAssets = {
  js?: Assets;
  css?: Assets;
  dnsPrefetch?: string[];
  link?: HTMLLinkElement[];
};
