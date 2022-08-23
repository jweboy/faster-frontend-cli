import webpack from 'webpack';
import Config from 'webpack-chain';
import deepmerge from 'deepmerge';
import log from '../../utils/log';
import { getRuntimeProjectPath } from '../../utils/fs';
import { loadFileConfig } from '../../utils/loadFileConfig';
import paths from '../paths';
import babelOptions from '../options/babel';
import getEnvKeys from '../../utils/getEnvKeys';
import AssetsInjectPlugin from '../plugins/AssetsInject';
import { injectAssetsOptions, externals } from './externals';
import MergeRoutePlugin from '../plugins/MergeRoute';

// https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/334
// https://github.com/pmmmwh/react-refresh-webpack-plugin
// https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/252
// https://jishuin.proginn.com/p/763bfbd4c946

const getWebpackConfig = () => {
  const config = new Config();
  const { NODE_ENV, ENV } = process.env;
  const envFile = getRuntimeProjectPath(`.env.${ENV}`);
  const envKeys = getEnvKeys(ENV);

  const isProd = NODE_ENV === 'production';
  const isDev = NODE_ENV === 'development';

  // 外部读取到的 webpack 配置
  const { fileConfig } = loadFileConfig(paths.configFile);
  // console.log('NODE_ENV=>', process.env.NODE_ENV, envKeys);
  const { title, env, injectAssets, template, ...restProps } = fileConfig;

  // 构件目标
  config.target('web');

  /** ========================= cache ========================= */

  /**
   * @description 变更 webpack 配置项将原有的缓存失效，并在新的配置项编译完成之后生成新的缓存
   * @link https://webpack.docschina.org/configuration/cache/#cachebuilddependencies
   */
  config.cache({
    type: 'filesystem',
    buildDependencies: {
      config: [__filename, paths.devConfig, paths.buildConfig],
    },
  });

  /** ========================= entry、output ========================= */

  // 解析入口点和加载器的基础目录
  // config.context(paths.src);

  // 文件入口
  // config.entry('index').add(paths.src);

  config.output
    .path(paths.dist)
    .filename('js/[name].js')
    .chunkFilename('js/[name].[contenthash].js')
    .publicPath(paths.public);

  /** ========================= resolve ========================= */

  config.resolve.modules
    .add('node_modules')
    .add(paths.cliNodeModules)
    .end()
    .extensions.merge(['.js', '.jsx', '.ts', '.tsx', '.json']);

  config.resolve.alias.set('@', paths.src).set('process', 'process/browser');

  // webpack5 移除了自动导入 polyfill 功能，因此这里需要手动导入 process.env 的 polyfill 以兼容老业务功能，否则会导致 process.env 未定义
  config.resolve.set('fallback', {
    events: false,
    url: false,
    path: false,
  });

  config.externals(externals);

  /** ========================= module ========================= */

  config.module
    .rule('jsCode')
    .test(/\.(js|jsx|ts|tsx)$/)
    .include.add(paths.src)
    .end()
    .exclude.add(paths.nodeModules)
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelOptions);

  config.module
    .rule('esmJs')
    .test(/\.m?js/)
    .resolve.set('fullySpecified', false);

  // webpack5解析静态文件
  config.module
    .rule('asset')
    .test(/\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i)
    .set('type', 'asset');

  /** ========================= plugin ========================= */

  // webpack5 移除了自动导入 polyfill 功能，因此这里需要手动导入 process.env 的 polyfill 以兼容老业务功能，否则会导致 process.env 未定义
  config.plugin('processPolyfill').use(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  );

  // 读取外部配置文件里（如：dev.config.js）的 env 环境变量并注入，这个插件需要结合上述的 processPolyfill 插件一起使用
  config.plugin('env').use(
    new webpack.EnvironmentPlugin({
      ...envKeys,
      ...(env && { ...env }),
      ENV,
    }),
  );

  // 解决打包后 process.env 里参数丢失问题
  if (isProd) {
    config.plugin('DotPlugin').use(require.resolve('dotenv-webpack'), [
      {
        path: envFile,
      },
    ]);
  }

  // log.error('初始化了 AssetsInjectPlugin');

  config.plugin('AssetsInjectPlugin').use(new AssetsInjectPlugin(fileConfig.injectAssets));

  // 模板页面
  config.plugin('html').use(require.resolve('html-webpack-plugin'), [
    {
      title: fileConfig.title || 'React App',
      template: template || paths.template,
      // 结合refresh插件需要手动注入bundle
      inject: false,
      scriptLoading: 'blocking',
      // templateParameters: (compilation, assets, assetTags, options) => {
      //   return {
      //     compilation,
      //     webpackConfig: compilation.options,
      //     htmlWebpackPlugin: {
      //       tags: assetTags,
      //       files: assets,
      //       options,
      //     },
      //   };
      // },
    },
  ]);

  config.plugin('MergeRoute').use(new MergeRoutePlugin());

  // 进度提示
  config.plugin('progress').use(webpack.ProgressPlugin, [{ percentBy: 'entries' }]);

  // 文件监听忽略
  config.plugin('ignore').use(webpack.WatchIgnorePlugin, [
    {
      paths: [/module\.less\.d\.ts$/],
    },
  ]);

  // 针对 react-refresh-webpack-plugin 插件，具体问题查阅 https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/88

  // runtimeChunk 设置为 single，生成一个在所有生成 chunk 之间共享的运行时文件
  config.optimization.runtimeChunk('single');

  config.optimization.splitChunks({
    chunks: 'all',
    name: 'vendors',
  });

  config.merge(restProps);

  return config;
};

export default getWebpackConfig;
