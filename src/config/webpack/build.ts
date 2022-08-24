import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { relative } from 'path';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import os from 'os';
import { Env } from 'src/typings/webpack';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import paths from '../paths';
import getWebpackConfig from './core';
import terserOptions from '../options/terser';
import { cssRegexp, lessModuleRegexp, lessRegexp } from '../../constants';
import { loadFileConfig } from '../../utils/loadFileConfig';
import { setStyleLoaders } from './styleLoaders';

const { NODE_ENV } = process.env;
const cpu = os.cpus().length - 1;

// 默认 webpack 配置
const config = getWebpackConfig();
// 外部读取到的 webpack 配置
const { fileConfig } = loadFileConfig(paths.configFile);

// 构建模式
// @ts-ignore
config.mode(NODE_ENV);

// 生成 source map 规则
config.devtool(fileConfig.sourceMap ? 'source-map' : false);

// 打包遇到第一个错误时就直接抛出失败结果并退出进程
config.bail(true);

config.output
  .path(paths.dist)
  .filename(`js/[name].[contenthash:8].js`)
  .chunkFilename(`js/[name].[contenthash:8].chunk.js`);

// 将 sourcemap 指向原始磁盘位置
config.output.devtoolModuleFilenameTemplate(info => {
  return relative(paths.src, info.absoluteResourcePath).replace(/\\/g, '/');
});

// webpack5新增用于asset module
config.output.set('assetModuleFilename', 'assets/[hash][ext][query]');

// 自动删除输出目录
config.output.set('clean', true);

// 设置样式加载器
setStyleLoaders(config, process.env.ENV as Env);

config.plugin('hashModuleIds').use(webpack.ids.HashedModuleIdsPlugin, [
  {
    context: paths.dist,
    hashFunction: 'sha256',
    hashDigest: 'hex',
    hashDigestLength: 20,
  },
]);

// config.plugin('BundleAnalyzerPlugin').use(new BundleAnalyzerPlugin());

// 关闭性能提示
config.performance.hints(false);

// 编译出错就会 emit asset，这样可以确保出错的 asset 被 emit 出来。关键错误会被 emit 到生成的代码中，并在运行时报错。
config.optimization.set('emitOnErrors', true);

// 如果模块已经包含在所有父级模块中，告知 webpack 从 chunk 中检测出这些模块或移除这些模块，但是这个配置会削减 webapck 的性能表现，而且将会在下一个主要发布版本中，在 生产 模式下会被禁用，因此这里关闭它。
config.optimization.removeAvailableModules(false);

// 压缩JS代码
config.optimization
  .minimize(true)
  .minimizer('terser')
  .use(require.resolve('terser-webpack-plugin'), [terserOptions]);

config.plugin('MiniCssExtractPlugin').use(
  new MiniCssExtractPlugin({
    filename: `css/[name].[contenthash:8].css`,
    chunkFilename: `css/[name].[contenthash:8].chunk.css`,
    ignoreOrder: true, // 禁用 css order 警告
  }),
);

// 压缩CSS代码
config.optimization
  .minimize(true)
  .minimizer('css')
  .use(
    new CssMinimizerPlugin({
      parallel: cpu, // 多进程并发执行，默认执行数为当前 CPU 数量 - 1
    }),
  );

const buildConfig = config.toConfig();

// console.log(JSON.stringify(buildConfig, null, 2));

export default buildConfig;
