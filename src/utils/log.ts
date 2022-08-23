import chalk, { Chalk, cyan } from 'chalk';
import { Color } from 'ora';

class Log {
  /* 警告信息字体颜色 */
  warningColor: Chalk;

  /* 成功信息字体颜色 */
  successColor: Chalk;

  /* 错误信息字体颜色 */
  errorColor: Chalk;

  /* 常规信息字体颜色 */
  infoColor: Chalk;

  /* 当前时间 */
  currTime: string;

  constructor() {
    const { red, yellow, green, cyan } = chalk;

    this.errorColor = red;
    this.warningColor = yellow;
    this.successColor = green;
    this.infoColor = cyan;
    this.currTime = new Date().toLocaleString();
  }

  success(text: string) {
    console.log(this.warningColor(`[${this.currTime}] `) + this.successColor(text));
  }

  error(text: string | Error) {
    const isStr = typeof text === 'string';
    console.log(
      this.warningColor(`[${this.currTime}] `) +
        this.errorColor(`${isStr ? text : JSON.stringify(text)}`),
    );
  }

  debug(text) {
    console.log(
      this.errorColor(`[debug: ${this.currTime}] `) + this.successColor(JSON.stringify(text)),
    );
  }

  print(str: string) {
    console.log(this.warningColor(`[${this.currTime}] `) + str);
  }
}

const log = new Log();

export default log;
