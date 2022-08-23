import { Configuration } from 'webpack-dev-server';
import paths from '../paths';

// const host = process.env.HOST || 'localhost';
// const port = parseInt(process.env.PORT, 10) || 4000;

const host = '0.0.0.0';
const port = 4000;

const devServerOptions: Configuration = {
  /** ====================== FIXME: 已默认内置开启 ====================== */
  // hot: true, // 模块热更新，支持配置 'only'，对应老的 hotOnly 属性
  // compress: true, // 启用gzip压缩
  // liveReload: true,
  // webSocketServer: 'ws',
  // server: 'http',

  /** ====================== FIXME: 以下是目前支持的属性 ====================== */
  host, // 主机名
  port, // 端口
  historyApiFallback: true, // 任意 404 响应都重定向到 index.html
  // FIXME: v4.6.0 感觉性能不佳，暂时不开放，通过上层命令手动干掉进程
  // setupExitSignals: true, // 在 SIGINT 和 SIGTERM 信号时关闭开发服务器和退出进程(ctrl + c、kill)
  client: {
    logging: 'info',
    overlay: false, // 在浏览器中全屏显示错误信息
    webSocketTransport: 'ws',
  },
  open: {
    app: {
      name: 'Google Chrome', // 自动打开 chrome 浏览器
    },
  },
  // publicPath: paths.dist, // 浏览器中访问的静态资源目录
  // https: protocol === 'https', // 是否使用https协议
};

export default devServerOptions;
