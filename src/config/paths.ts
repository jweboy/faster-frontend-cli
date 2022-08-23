import { join } from 'path';
import { getRuntimeProjectPath } from '../utils/fs';

export const getPathByCurrentDirectory = (path: string) => {
  return join(__dirname, path);
};

const paths = {
  src: getRuntimeProjectPath('src'),
  dist: getRuntimeProjectPath('dist'),
  configFile: getRuntimeProjectPath('sl.config.js'),
  nodeModules: getRuntimeProjectPath('node_modules'),
  postcss: getPathByCurrentDirectory('../../postcss.config.js'),
  cliNodeModules: getPathByCurrentDirectory('../../node_modules'),
  template: getPathByCurrentDirectory('../../public/index.html'),
  errorIcon: getPathByCurrentDirectory('../../public/error.png'),
  devConfig: getPathByCurrentDirectory('./webpack/dev.js'),
  buildConfig: getPathByCurrentDirectory('./webpack/build.js'),
  public: '/',
  runtimeRoot: getPathByCurrentDirectory('../../'),
  // tsConfigFile: path.join(__dirname, './tsconfig.default.json'),
};

export default paths;
