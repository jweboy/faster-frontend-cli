import isFileEsm from 'is-file-esm';
import { WebpackOptionsApply, WebpackOptionsNormalized } from 'webpack';
import { accessSync, constants, stat, statSync } from 'fs-extra';
import { WebpackConfig } from '../typings/webpack';
import paths from '../config/paths';
import { loadModule } from './module';
import log from './log';

export const loadFileConfig = (
  filePath: string,
): {
  fileConfig?: Partial<WebpackConfig>;
} => {
  const deafultConfig = { fileConfig: {} };
  try {
    accessSync(filePath, constants.F_OK);
  } catch (err) {
    log.print(`${paths.configFile}文件不存在，将采用默认 Webpack 配置运行打包/构建服务`);
    return deafultConfig;
  }

  try {
    const { esm, path, pkgPath } = isFileEsm.sync(filePath);
    const config = esm ? import(path) : loadModule(path, pkgPath);

    return { fileConfig: config };
  } catch (err) {
    log.error(err);
    return deafultConfig;
  }
};
