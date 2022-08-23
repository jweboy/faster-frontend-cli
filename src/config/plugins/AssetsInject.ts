import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Assets, InjectAssets } from 'src/typings/webpack';
import { Compilation } from 'webpack';
import deepmerge from 'deepmerge';
import { OSS_BASE_URL, OSS_URL } from '../../constants';
import { injectAssetsOptions } from '../webpack/externals';

// TODO: 缓存优化

class AssetsInjectPlugin {
  options: InjectAssets = {};

  initialOptions: Map<string, string>;

  // cache: Map<string, string>;

  constructor(options = {}) {
    this.options = deepmerge(injectAssetsOptions, options);
  }

  private checkIsUrlAsset(asset: string) {
    const regexp = /http[s]{0,1}:\/\/([\w.]+\/?)\S*/;
    const isUrl = regexp.test(asset);
    return isUrl;
  }

  private setAssetData(data) {
    return Object.keys(data).map(key => {
      const value = data[key];
      return { name: key, ...value };
    });
  }

  private getTagData<T>(data: T[], tagName: 'link') {
    if (Array.isArray(data)) {
      return data.map(item => {
        // @ts-ignore
        const { href, ...restProps } = item;
        // @ts-ignore
        const isUrl = this.checkIsUrlAsset(item.href);
        return {
          tagName,
          attributes: {
            ...restProps,
            href: isUrl ? href : OSS_BASE_URL + href,
          },
          voidTag: false,
          meta: { plugin: AssetsInjectPlugin.name },
        };
      });
    }
  }

  private mergeAttributes(options: {
    data: InjectAssets | string[];
    tagName: 'script' | 'link';
    attributes;
    // externals?: any;
  }) {
    const { data, tagName, attributes } = options;
    const { ENV } = process.env;
    let list = [];
    const isProd = ENV === 'prod';

    if (!Array.isArray(data)) {
      list = this.setAssetData(data);
    } else {
      list = data;
    }

    return list.map(item => {
      const fileName = item[isProd ? 'prod' : 'dev'];
      const url = `${OSS_URL}/${item.name}/${item.version}/${fileName}`;
      return {
        tagName,
        attributes: {
          ...attributes,
          ...(tagName === 'script' && { src: url }),
          ...(tagName === 'link' && {
            href: attributes.rel === 'stylesheet' ? url : item,
          }),
        },
        voidTag: false,
        meta: { plugin: AssetsInjectPlugin.name },
      };
    });
  }

  apply(compiler) {
    const pluginName = AssetsInjectPlugin.name;
    const { js = {}, css = [], dnsPrefetch = [], link = [] } = this.options;

    compiler.hooks.compilation.tap(pluginName, (compilation: Compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
        pluginName,
        (data, callback) => {
          // const { externals } = compilation.options;

          // script js标签
          const scriptTags = this.mergeAttributes({
            data: js,
            tagName: 'script',
            attributes: { crossorigin: true },
            // externals,
          });
          data.bodyTags.find(item =>
            (item.attributes.src as string).includes('/js/main'),
          ).attributes.defer = true;
          data.bodyTags = data.bodyTags.concat(scriptTags);
          callback(null, data);
        },
      );

      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
        pluginName,
        (data, callback) => {
          const { assetTags } = data;

          // 常规 link 标签
          const linkTags = this.getTagData<HTMLLinkElement>(link, 'link');

          // style 样式标签
          const styleTags = this.mergeAttributes({
            data: css,
            tagName: 'link',
            attributes: { rel: 'stylesheet' },
          });

          // dns-prefetch 特定的 link 标签
          const dnsPrefetchTags = this.mergeAttributes({
            data: dnsPrefetch,
            tagName: 'link',
            attributes: { rel: 'dns-prefetch' },
          });

          // FIXME: styleTags 基础样式（如：antd.min.css）先加载，保证自定义样式能覆盖 antd 默认样式
          assetTags.styles = [...styleTags, ...assetTags.styles, ...dnsPrefetchTags, ...linkTags];
          callback();
        },
      );
    });
  }
}

export default AssetsInjectPlugin;
