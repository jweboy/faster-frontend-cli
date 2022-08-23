import fs, { realpathSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

function getEnvKeys(envKey: string) {
  const rootPath = realpathSync(process.cwd());

  const envPath = path.resolve(rootPath, `.env.${envKey}`);
  const fileEnv = dotenv.config({ path: envPath }).parsed;

  // 如果没有环境变量 env 文件就导出空数据
  return fileEnv || {};
}

export default getEnvKeys;
