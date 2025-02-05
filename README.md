## 项目安装
```
# 安装
yarn install
# 运行
yarn dev:h5
yarn dev:mp-weixin
# 打包
yarn build:h5
yarn build:mp-weixin
```

## 变更日志

- 新建 uniapp & Vue3 & Vite 项目

```
npx degit dcloudio/uni-preset-vue#vite quick-development-platform-mobile
```

- 修改 gitignore 文件，新增 prettier + eslint 配置文件

- 引入 auto-import 插件，引入 uni-app

- 新增 format 命令，格式化全部文件

- 安装 sass 包

- Mac M1 下 HBuilderX 运行报错（1、执行 npx @dcloudio/uvm 降低 vite 版本；2、执行 npm i 重新安装依赖；3、node_modules/@esbuild/darwin-x64 复制一份命名为 darwin-arm64）

- 引入 uview-plus

- 新增环境变量

- 请求封装（请求头带 token）

- 封装公共方法

- 封装公共组件（配置 easycom 按需自动导入）

- uview-plus 组件二次封装

- uview-plus 主题色修改

- 改造 LoadMore 组件

- 改造 PageLoading 组件

- 引入公共校验方法
