import Config from 'webpack-chain';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { cssRegexp, lessModuleRegexp, lessRegexp } from '../../constants';
import { Env, Mode, WebpackConfig } from '../../typings/webpack';
import paths from '../paths';

export const setStyleLoaders = (config: Config, env: Env) => {
  // TODO: 当前 CSS 拆分打包有样式次序问题导致样式覆盖，先暂时用注入 style 的方式
  const isDevEnv = true;
  // const isDevEnv = env !== 'prod';
  const isDevMode = process.env.NODE_ENV === 'development';

  // 解析常规 *.css 文件（包括业务文件、node_modules文件）
  config.module
    .rule('nodeModulesCss')
    .test(cssRegexp)
    .use(isDevEnv ? 'style-loader' : 'miniCssExtract')
    .loader(isDevEnv ? require.resolve('style-loader') : MiniCssExtractPlugin.loader)
    .end()
    .use('css-loader')
    .loader(require.resolve('css-loader'));

  // 解析业务中的 *.less 文件
  config.module
    .rule('appLess')
    .test(lessRegexp)
    // 外部项目（如：新电商和）部分依赖引用了 antd，针对ts中的 antd 按需暂无，因此这里做一个less兼容
    // .include.add(paths.src)
    // .end()
    .exclude.add(lessModuleRegexp)
    .end()
    .use(isDevEnv ? 'style-loader' : 'miniCssExtract')
    .loader(isDevEnv ? require.resolve('style-loader') : MiniCssExtractPlugin.loader)
    .end()
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .options({
      modules: false,
      sourceMap: true,
      importLoaders: 1, // 设置在 css-loader 前应用的 loader 数量
    })
    .end()
    .use('less')
    .loader(require.resolve('less-loader'))
    .options({
      lessOptions: {
        javascriptEnabled: true,
      },
    });

  // 解析业务中的 *.module.less 文件（Css Modules形式）
  const cssModules = config.module
    .rule('cssModules')
    .test(/\.module\.less$/)
    .include.add(paths.src)
    .end()
    .exclude.add(paths.nodeModules)
    .end();
  config.module
    .rule('cssModules')
    .test(/\.module\.less$/)
    .include.add(paths.src)
    .end()
    .exclude.add(paths.nodeModules)
    .end()
    .use(isDevEnv ? 'style-loader' : 'miniCssExtract')
    .loader(isDevEnv ? require.resolve('style-loader') : MiniCssExtractPlugin.loader)
    .end();

  if (isDevEnv && isDevMode) {
    cssModules
      // 自动生成 *.module.less.d.ts
      .use('@teamsupercell/typings-for-css-modules-loader')
      .loader(require.resolve('@teamsupercell/typings-for-css-modules-loader'))
      .end();
  }

  cssModules
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .options({
      modules: {
        auto: /\.module\.\w+$/i, // 检测 *.module.less 文件
        compileType: 'module',
        exportLocalsConvention: 'camelCase', // 类名将被驼峰化，原类名不会删除
        localIdentName: isDevEnv ? '[path][name]__[local]' : '[hash:base64]', // 拼接原始地址用于开发调试
      },
      sourceMap: true,
      importLoaders: 2, // 设置在 css-loader 前应用的 loader 数量
    })
    .end()
    .use('postcss-loader')
    .loader(require.resolve('postcss-loader'))
    .options({
      postcssOptions: {
        config: paths.postcss, // 默认 postcss 配置
      },
    })
    .end()
    .use('less')
    .loader(require.resolve('less-loader'))
    .options({
      lessOptions: {
        javascriptEnabled: true,
      },
    });
};
