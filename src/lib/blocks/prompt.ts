import { readdirSync } from 'fs';
import { join } from 'path';

const tplPath = join(__dirname, '../../../templates');
const generators = readdirSync(tplPath).filter(file => !file.startsWith('.'));

const prompt = [
  {
    name: 'type',
    type: 'list',
    message: '请选择模版项目！',
    choices: generators,
  },
  {
    name: 'name',
    type: 'input',
    message: '请输入项目名称！',
  },
];

export default prompt;
