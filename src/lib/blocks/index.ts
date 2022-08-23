import log from '../../utils/log';
import { getDirectoryTree } from '../../api/gitlab';
import { downloadSpecificBlock } from './donwload';

export const onDownloadBlocks = async (arg: string) => {
  const args = arg.split('/');
  const [blockDir, blockName] = args;

  // 从 Git 仓库获取所有区块的目录结构列表
  const blocks = await getDirectoryTree(`src/${blockDir}`);

  // 校验区块目录名称是否输入正确
  if (blocks.length === 0) {
    log.print(
      log.errorColor('请检查区块目录名是否正确，默认区块名称是 ') +
        log.infoColor('blocks') +
        log.errorColor('，更多区块请查阅 ') +
        log.infoColor('xxx'),
    );
    process.exit(-1);
  }

  // 校验区块名称是否输入
  if (!blockName) {
    log.print(
      log.errorColor('请指定需要下载的区块名称，如：') +
        log.infoColor('blocks/action-table') +
        log.errorColor('，更多区块请查阅 ') +
        log.infoColor('xxx'),
    );
    process.exit(-1);
  }

  // 格式化命令行输入的区块名，去除 - 字符并且首字母大写，如：action-table => ActionTable
  const formatBlockName = blockName
    .split('-')
    .map(item => item.replace(/^\S/, str => str.toUpperCase()))
    .join('');

  // 从区块列表中筛选出对应区块的具体信息
  const currBlock = blocks.filter(item => item.name === formatBlockName)[0];

  // 如果没有匹配到则说明输入的区块名称不存在，需要用户重新输入
  if (!currBlock) {
    log.error('请检查区块名是否设置正确');
    process.exit(-1);
  }

  // 下载指定区块目录中的代码文件
  downloadSpecificBlock(currBlock);
};
