import { webpack } from 'webpack';
import log from '../utils/log';

const build = async options => {
  // 接收外部传入env变量，对应现有的 dev、test、perf、prod 四个环境
  process.env.ENV = options.env || 'prod';
  process.env.NODE_ENV = 'production';

  const buildConfig = await import('../config/webpack/build');

  const compiler = webpack(buildConfig.default);

  /**
   * @url https://webpack.docschina.org/api/node
   */
  compiler.run((err, stats) => {
    // webpack 配置错误等
    if (err) {
      log.error(err.stack || err);
      process.exit(1);
    }

    const info = stats.toJson();

    // 忽略编译警告
    // if (stats.hasWarnings()) {
    //   console.warn('warnings=>', info.warnings);
    //   log.print(info.warnings.map(item => item.message).join(''));
    // }

    // 编译错误
    if (stats.hasErrors()) {
      // console.warn('errors=>', info.errors);
      log.error(info.errors.map(item => item.stack).join(''));
      process.exit(1);
    }

    console.log(
      stats.toString({
        colors: true,
        // chunks: true, // 详细的 chunk 信息
        chunkModules: true, // 已构建模块和关于 chunk 的信息
        cachedAssets: true, // 缓存资源的信息
      }),
    );
  });
};

export default build;
