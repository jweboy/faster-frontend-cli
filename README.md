# fft-cli

`fft-cli` 是针对B端后台系统的通用脚手架工具。

## 🌟 功能

- 支持一键创建通用后台系统模板，自动安装项目依赖，快速上手开发。
- 支持下载丰富的区块模块。

## 👐 外部使用

### 安装环境

#### Step1 Node环境

> 注意点：`Node` 版本需要确保在 10.14.0之上（`>=10.14.0`），否则脚手架在安装过程中会出现包兼容问题而报错中断。

此脚手架工具基于 `Node` 环境运行，因此在开始使用之前，需要在本地安装 `Node` 环境。（如果想方便在本地快速安装或者切换 `Node` 版本，推荐使用 [nvs](https://github.com/jasongin/nvs) ）普通安装只需在 [Node官网](https://nodejs.org/zh-cn/) 选择稳定的 `长期支持版` 直接下载安装即可。以下是 `Node` 截图：

安装完成之后，在命令行中执行 `node -v`，如果输出了对应的版本信息，说明本地 `Node` 环境已安装成功，示例如下：

```js
node -v
v10.14.2 // node 版本号
```

## 👷 脚手架开发

目录结构

```js
.
├── README.md // 说明文档
├── global.d.ts // 全局 ts 声明
├── lerna.json // 分包管理配置，目前添加分包的目的主要是用于管理项目和模板的依赖安装问题
├── lint-staged.config.js // 代码提交前的钩子函数配置
├── nodemon.json
├── package-lock.json
├── package.json
├── packages // 分包目录，目前为空
├── src // 源码目录
│   ├── api
│   │   └── gitlab.ts // Gitlab开放API
│   ├── bin
│   │   └── main.ts // 命令行工具入口文件
│   ├── constants
│   │   └── index.ts // 全局常量
│   ├── lib
│   │   ├── blocks // 创建区块功能模块
│   │   │   ├── donwload.ts
│   │   │   ├── generate.ts
│   │   │   ├── index.ts
│   │   │   └── prompt.ts
│   │   └── template // 创建模板功能模块
│   │       ├── index.ts
│   │       ├── question.ts
│   │       └── util.ts
│   ├── scripts // 全局处理脚本
│   │   └── version // 更新项目版本号功能模块
│   │       ├── index.ts
│   │       ├── question.ts
│   │       └── typings.ts
│   ├── tmp.ts // 临时文件
│   ├── typings // ts类型声明
│   │   ├── fs.ts
│   │   ├── global.ts
│   │   ├── project.ts
│   │   ├── snippet.ts
│   │   └── template.ts
│   └── utils // 工具函数
│       ├── fs.ts // fs有关API封装
│       ├── loading.ts // 命令行输出loading
│       ├── log.ts // 命令行输出日志
│       ├── process.ts // process有关API封装
│       └── request.ts // 请求函数封装
├── tsconfig.json // ts配置
└── yarn.lock

```

运行命令行脚本

npm版本

```js
// 安装依赖
npm install
npm run bootstrap // 如果需要开发模板项目就运行这个脚本

// 执行开发脚本
npm link // 在全局 node_modules 中创建文件符号软链，这样就能全局访问 fft-cli 命令了
npm run dev:watch // 执行自动编译并监听文件变化自动更新脚本
fft-cli create // 然后新开一个命令面板就可以执行相关操作开发了

// 发布版本
npm login // 首次执行 publish 之前需要登录，账号密码是内部npm仓库注册的账密
npm publish // 会先执行版本更新命令，遵循语义化版本规范，具体内容见参照部分

```

yarn版本

```js
// 安装依赖
yarn 
yarn bootstrap // 如果需要开发模板项目就运行这个脚本

// 执行开发脚本
yarn global add fft-cli // 在全局 node_modules 中创建文件符号软链，这样就能全局访问 fft-cli 命令了
yarn watch:dev // 执行自动编译并监听文件变化自动更新脚本
fft-cli -c // 然后新开一个命令面板就可以执行相关操作开发了
```

## ❗ 注意点

确保运行时的 node版本 `>=10.14` 以兼容 `cross-env` 依赖包。
