import notifier from 'node-notifier';
import webpack from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { resolve } from 'path';
import paths from '../paths';
import getWebpackConfig from './core';
import { cssRegexp, lessModuleRegexp, lessRegexp } from '../../constants';
import { setStyleLoaders } from './styleLoaders';

const { NODE_ENV } = process.env;

// 默认 webpack 配置
const config = getWebpackConfig();

// 构建模式
// @ts-ignore
config.mode(NODE_ENV);

// 生成 source map 规则
config.devtool('cheap-module-source-map');

// 将 sourcemap 指向原始磁盘位置
config.output.devtoolModuleFilenameTemplate(info =>
  resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
);

// 设置样式加载器
setStyleLoaders(config, 'dev');

config.merge({
  entry: {
    // 由于 React 抽离外部加载，因此需要保证 refresh 在react加载之前
    reactRefreshSetup: require.resolve(
      '@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js',
    ),
    main: paths.src,
  },
});

// FIXME: 内部默认开启无需再添加
// config.plugin('HotModuleReplacementPlugin').use(new webpack.HotModuleReplacementPlugin());

config.plugin('ReactRefreshWebpackPlugin').use(
  new ReactRefreshWebpackPlugin({
    overlay: false,
    // overlay: {
    //   sockProtocol: 'ws',
    //   useLegacyWDSSockets: true,
    // },
  }),
);

// plugin => friendly errors
// config.plugin('friendlyErrors').use(require.resolve('friendly-errors-webpack-plugin'), [
//   {
//     compilationSuccessInfo: {
//       messages: [`You application is running at ${protocol}://${host}:${port}`],
//     },
//     onErrors: (severity, errors) => {
//       // console.log(errors);
//       if (severity !== 'error') {
//         return;
//       }
//       const error = errors[0];
//       notifier.notify({
//         title: '编译错误',
//         message: `${severity}: ${error.name}`,
//         subtitle: error.file || '',
//         icon: paths.errorIcon,
//       });
//     },
//   },
// ]);

// 隐藏构建完成后的 bundle 信息（开发模式只展示部分重要信息）
config.set('stats', {
  entrypoints: false,
  assets: false,
  modules: false,
});

const devConfig = config.toConfig();

// console.log(JSON.stringify(devConfig, null, 2));

export default devConfig;
