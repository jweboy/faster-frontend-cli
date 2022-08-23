import {
  accessSync,
  constants,
  createReadStream,
  createWriteStream,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import glob from 'glob';
import { Readable } from 'stream';
import { isDeepStrictEqual } from 'util';
import { createFileSync } from 'fs-extra';
import { Compilation } from 'webpack';
import { join } from 'path';
import log from '../../utils/log';
import { checkFileExist, getRuntimeProjectPath } from '../../utils/fs';

class MergeRoutePlugin {
  routeMap: Map<string, any>;

  routeConfigFile: string;

  pages: string;

  constructor() {
    this.routeMap = new Map();
    this.routeConfigFile = getRuntimeProjectPath('src/routes/route-config.json');
    this.pages = getRuntimeProjectPath('src/pages');
  }

  cacheConfig(data) {
    const { view } = data;
    if (this.routeMap.has(view)) {
      const current = this.routeMap.get(view);
      const list = [current];
      list.push(data);
      this.routeMap.set(view, list);
    } else {
      this.routeMap.set(view, data);
    }

    return this.routeMap;
  }

  mergeConfig(data) {
    const { routes, path } = data;

    if (routes) {
      data.routes = routes.map(route => {
        const mainFile = join(data.view, route.view);
        const mainFullPath = join(this.pages, data.view, route.view);
        const { routes } = route;

        route.path = path + route.path;
        if (routes) {
          route.routes = routes.map(item => {
            item.path = route.path + item.path;
            item.main = join(mainFile, item.view, 'index.tsx');
            return item;
          });
        }

        try {
          const stat = statSync(mainFullPath);
          if (stat.isDirectory()) {
            route.main = join(mainFile, 'index.tsx');
          }
        } catch (err) {
          // err
          route.main = `${mainFile}.tsx`;
        }
        return route;
      });
    }

    if (data.path === '/') {
      data.main = `${data.view}.tsx`;
    } else if (!data.routes) {
      data.main = join(data.view, 'index.tsx');
    }

    return data;
  }

  async getRoutes(asyncTasks) {
    for await (const content of asyncTasks) {
      const data = content.default;
      this.mergeConfig(data);
      this.cacheConfig(data);
    }

    // console.log(this.routeMap, [...this.routeMap.values()]);
    const result = [...this.routeMap.values()];
    return result;
  }

  getImportFiles(files) {
    return files.map(file => import(file));
  }

  getRouteFiles(files): Promise<string[]> {
    return new Promise(resolve => {
      glob(files, (err, files) => {
        if (err) {
          process.exit(1);
        }
        resolve(files);
      });
    });
  }

  async writeRouteFile() {
    const routeFiles = await this.getRouteFiles(`${this.pages}/**/route.js`);
    const importFiles = this.getImportFiles(routeFiles);
    const routeConfig = await this.getRoutes(importFiles);
    // console.log('write file', routeFiles, routeConfig);
    const code = `${JSON.stringify(routeConfig, null, 2)}`;
    const buffer = Buffer.from(code);
    const readStream = Readable.from(buffer.toString());
    const writeStream = createWriteStream(this.routeConfigFile);

    readStream.pipe(writeStream);
  }

  apply(compiler) {
    const pluginName = MergeRoutePlugin.name;

    // compiler.hooks.run.tap('run', () => {
    //   console.log('开始编译...');
    // });

    compiler.hooks.beforeCompile.tapAsync('compilation', async (compilation, callback) => {
      try {
        await checkFileExist(this.routeConfigFile);
      } catch (err) {
        if (err.code === 'ENOENT') {
          // err
          createFileSync(this.routeConfigFile);
        }
      }

      callback();
    });

    compiler.hooks.afterPlugins.tap(pluginName, async () => {
      // const isEqual = isDeepStrictEqual(targetData, routeConfig);
      await this.writeRouteFile();
    });
  }
}

export default MergeRoutePlugin;
