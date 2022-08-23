/*
 * @Author: jweboy
 * @Date: 2021-11-30 18:47:32
 * @LastEditors: jweboy
 * @LastEditTime: 2022-01-21 15:45:13
 */
import { spawn, execSync } from 'child_process';
import detect from 'detect-port-alt';

export const spawnAsync = (command: string, args: string[], appPath?: string) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args], {
      ...(appPath && { cwd: appPath }),
      stdio: 'inherit',
    });

    // console.log(child.stderr, child.stdout, child.stdin, child.stdio);
    // child.on('close', data => {
    //   console.log('data=>', data);
    // });
    // child.on('error', data => {
    //   reject(new Error(`${data}`));
    // });

    child.on('exit', code => {
      // log.debug(code);
      code === 0 ? resolve(code) : reject(new Error(`${code}`));
    });

    // 监听 Ctrl C 断开程序
    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });
  });
};

/**
 * @name 查找当前端口是否被进程监听，如已监听就返回进程ID(pid)，如未监听就返回空
 * @param {number} defaultPort
 * @returns {string} pid
 */
export function checkHasExistProcess(defaultPort: number) {
  try {
    // 获取端口对应的进程ID(pid)
    const pid = execSync(`lsof -i:${defaultPort} -P -t -sTCP:LISTEN`, {
      encoding: 'utf8',
      // stdio: ['pipe', 'pipe', 'ignore'],
    });
    return pid;
  } catch (err) {
    // FIXME: node 貌似对于 linux 命令返回的空字符串会判断为错误结果并中断进程，这里做一层 catch 针对没被监听的端口，也没有对应进程，获取不到 pid时会返回一个空字符串。
    return '';
  }
}

export const detectPort = (defaultPort: number, host: string) => {
  // 获取新的端口
  return new Promise((resolve, reject) => {
    detect(defaultPort, host, (err, port) => {
      // 抓取错误抛出
      if (err) {
        return reject(err);
      }
      return resolve(port);
    });
  });
};
