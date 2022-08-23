import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { checkHasExistProcess, detectPort } from '../utils/process';
import devServerOptions from '../config/options/devServer';

async function dev(options) {
  // 接收外部传入env变量，对应现有的 dev、test、perf、prod 四个环境
  process.env.ENV = options.env || 'dev';
  process.env.NODE_ENV = 'development';

  // 加载开发运行时的配置项
  const devConfig = (await import('../config/webpack/dev')).default;
  // @ts-ignore
  const { devServer = {} } = devConfig;

  // @ts-ignore
  const compiler = webpack(devConfig);

  // 组合内置 devServer 配置和外部自定义 devServer 配置
  const serverOptions = {
    ...devServerOptions,
    ...devServer,
  };

  // 检测当前端口是否已被进程监听
  const pid = checkHasExistProcess(serverOptions.port);
  // pid 不为空就说明当前端口已被进程监听
  if (pid !== '') {
    // 生成一个新端口
    serverOptions.port = await detectPort(serverOptions.port, serverOptions.host);
  }

  // 获得服务实例
  const server = new WebpackDevServer(serverOptions, compiler);

  // 启动服务
  server.startCallback((err: Error) => {
    // 遇到错误退出当前服务的进程
    if (err) {
      process.exit(-1);
    }
  });

  // ctrl + c / kill 直接中断服务进程并退出
  ['SIGINT', 'SIGTERM'].forEach(sig => {
    process.on(sig, () => {
      server.close();
      process.exit();
    });
  });
}

export default dev;
