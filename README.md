## element 源码学习



### 目录结构解析 
~~~
|-- .github                            // 贡献者、issue、PR模版
|   |-- CONTRIBUTING.en-US.md
|   |-- CONTRIBUTING.es.md
|   |-- CONTRIBUTING.fr-FR.md
|   |-- CONTRIBUTING.zh-CN.md
|   |-- ISSUE_TEMPLATE.md
|   |-- PULL_REQUEST_TEMPLATE.md
|   |-- stale.yml
|-- build                              // 打包
|-- examples                           // 示例代码
|-- packages                           // 组件源码
|-- src                                // 入口文件以及各种辅助文件
|-- test                               // 单元测试文件
|-- types                              // 类型声明
|-- .babelrc                           // babel相关配置
|-- .eslintignore
|-- .eslintrc                          // eslint相关配置
|-- .gitattributes
|-- .gitignore
|-- .travis.yml                        // ci配置
|-- CHANGELOG.en-US.md
|-- CHANGELOG.es.md
|-- CHANGELOG.fr-FR.md
|-- CHANGELOG.zh-CN.md                 // 版本改动说明
|-- components.json                    // 组件配置文件
|-- element_logo.svg
|-- FAQ.md                             // 常见问题QA
|-- LICENSE                            // 版权协议相关
|-- Makefile                           // 脚本集合（工程化编译）
|-- package.json
|-- README.md                          // 项目说明文档
|-- yarn.lock
~~~

首先，我们先来看看 ElementUI 的目录结构，总体来说，ElementUI 的目录结构与 vue-cli2 相差不大：
- github：存放贡献指南以及 issue、PR 模板，这些是一个成熟的开源项目必须具备的。
- build：存放打包工具的配置文件。
- examples：存放 ElementUI 组件示例。
- packages：存放组件源码，也是之后源码分析的主要目标。
- src：存放入口文件以及各种辅助文件。
- test：存放单元测试文件，合格的单元测试也是一个成熟的开源项目必备的。
- types：存放声明文件，方便引入 typescript 写的项目中，需要在 package.json 中指定 - typing 字段的值为 声明的入口文件才能生效。

说完了文件夹目录，抛开那些常见的 .babelrc、.eslintc 等文件，我们来看看根目录下的几个看起来比较奇怪的文件：
- travis.yml：持续集成（CI）的配置文件，它的作用就是在代码提交时，根据该文件执行对应脚本，成熟的开源项目必备之一。
- CHANGELOG：更新日志，土豪的 ElementUI 准备了 4 个不同语言版本的更新日志。
- components.json：配置文件，标注了组件的文件路径，方便 webpack 打包时获取组件的文件路径。
- element_logo.svg：ElementUI 的图标，使用了 svg 格式，合理使用 svg 文件，可以大大减少图片大小。
- FAQ.md：ElementUI 开发者对常见问题的解答。
- LICENSE：开源许可证，ElementUI 使用的是 MIT 协议，使用 ElementUI 进行二次开发的开发者建议注意该文件。
- Makefile：在 .github 文件夹下的贡献指南中提到过，组件开发规范中的第一条：通过 make new 创建组件目录结构，包含测试代码、入口文件、文档。其中 make new 就是 make 命令中的一种。make 命令是一个工程化编译工具，而 Makefile 定义了一系列的规则来制定文件变异操作，常常使用 Linux 的同学应该不会对 Makefile 感到陌生。




------------------------------------------------------------




### package.json解析
通常我们去看一个大型项目都是从package.json文件开始看起的，这里面包含了项目的版本、入口、脚本、依赖等关键信息。

* #### main
> 项目名


* #### version
> 项目当前的版本


* #### description
> 项目描述


* #### main
> 项目的入口文件
> ```
> "main": "lib/element-ui.common.js",
> ```
> 这就是引入该库时所执行的入口文件。
> ```
> import Element from 'element-ui'
> ```


* #### files
> 指定npm publish发包时需要包含的文件/目录。


* #### typings
> TypeScript入口文件。


* #### scripts
> 开发、测试、生产构建，打包、部署，测试用例等相关脚本。
> - bootstrap <br/>
>   官方推荐使用yarn下载依赖
>   ```
>   "bootstrap": "yarn || npm i"
>   ```
> 
> - build:file <br/>
>   该指令主要用来自动化生成一些文件。
>   ```
>   "build:file": "node build/bin/iconInit.js & node build/bin/build-entry.js & node build/bin/i18n.js & node build/bin/version.js"
>   ```
>   + node build/bin/iconInit.js <br/>
>     解析icon.scss，把所有的icon的名字放在examples/icon.json，最后挂在Vue原型上的$icon上。
>   + node build/bin/build-entry.js <br/>
>     根据components.json文件，生成src/index.js文件。
>   + node build/bin/i18n.js <br/>
>     根据 examples/i18n/page.json 和模版，生成不同语言的 demo，也就是官网 demo 展示国际化的处理。
>   + node build/bin/version.js <br/>
>     根据package.json中的version,生成examples/versions.json，对应就是完整的版本列表。
> 
> - build:theme <br/>
>   处理样式相关。
>   ```
>   "build:theme": "node build/bin/gen-cssfile && gulp build --gulpfile packages/theme-chalk/gulpfile.js && cp-cli packages/theme-chalk/lib lib/theme-chalk"
>   ```
>   + node build/bin/gen-cssfile <br/>
>   根据components.json，生成package/theme-chalk/index.scss文件，把所有组件的样式都导入到index.scss。
>   + gulp build --gulpfile packages/theme-chalk/gulpfile.js <br/>
>     将packages/theme-chalk下的所有scss文件编译为css。
>   + cp-cli packages/theme-chalk/lib lib/theme-chalk <br/>
>     复制文件到lib/theme-chalk下
>     > cp-cli 是一个跨平台的copy工具，和CopyWebpackPlugin类似
> 
> - dev <br/>
>   运行项目
>   ```
>   "dev": "npm run bootstrap && npm run build:file && cross-env NODE_ENV=development webpack-dev-server --config build/webpack.demo.js & node build/bin/template.js",
>   ```
>   + npm run bootstrap <br/>
>     安装依赖
>   + npm run build:file <br/>
>     执行build:file命令。主要用来自动化生成一些文件
>   + webpack-dev-server --config build/webpack.demo.js <br/>
>     用于跑Element官网的基础配置
>   + node build/bin/template.js <br/>
>     根据模板文件（examples/pages）和国际化配置（examples/i18n/page.json）生成国际化文档
> 
> - dev:play <br/>
>   运行项目 —— 单文件运行（examples/play/index.vue）
>   ```
>   "dev:play": "npm run build:file && cross-env NODE_ENV=development PLAY_ENV=true webpack-dev-server --config build/webpack.demo.js",
>   ```
>   `dev:play`对比`dev`命令，主要是少了`npm run bootstrap`和`node build/bin/template.js`
>   > `npm run bootstrap`安装依赖 <br/>
>   > `node build/bin/template.js`生成在线文档
>  
> - dist <br/>
>   打包项目
>   ```
>   "dist": "npm run clean && npm run build:file && npm run lint && webpack --config build/webpack.conf.js && webpack --config build/webpack.common.js && webpack --config build/webpack.component.js && npm run build:utils && npm run build:umd && npm run build:theme",
>   ```
>   + npm run clean <br/>
>     删除之前打包生成文件
>     ```
>     "clean": "rimraf lib && rimraf packages/*/lib && rimraf test/**/coverage",
>     ```
>   + npm run build:file <br/>
>     根据components.json生成入口文件src/index.js，以及i18n相关文件。
>   + npm run lint <br/>
>     对项目代码进行es语法检测
>     ```
>     "lint": "eslint src/**/* test/**/* packages/**/* build/**/* --quiet",
>     ```
>   + webpack --config build/webpack.conf.js <br/>
>     生成umd格式的js文件（index.js）
>   + webpack --config build/webpack.common.js <br/>
>     生成commonjs格式的js文件（element-ui.common.js），require时默认加载的是这个文件。
>   + webpack --config build/webpack.component.js <br/>
>     以components.json为入口，将每一个组件打包生成一个文件，用于按需加载。
>   + npm run build:utils <br/>
>     把src目录下的除了index.js入口文件外的其他文件通过babel转译，然后移动到lib文件夹下。
>     ```
>     "build:utils": "cross-env BABEL_ENV=utils babel src --out-dir lib --ignore src/index.js",
>     ```
>   + npm run build:umd <br/>
>     生成umd模块的语言包。
>     ```
>     "build:umd": "node build/bin/build-locale.js",
>     ```
>   + npm run build:theme <br/>
>     根据components.json，生成package/theme-chalk/index.scss。用gulp构建工具，编译scss、压缩、输出css到lib目录。
>     ```
>     "build:theme": "node build/bin/gen-cssfile && gulp build --gulpfile packages/theme-chalk/gulpfile.js && cp-cli packages/theme-chalk/lib lib/theme-chalk",
>     ```
> 
> - pub <br/>
>   项目发布
>   ```
>   "pub": "npm run bootstrap && sh build/git-release.sh && sh build/release.sh && node build/bin/gen-indices.js",
>   ```
>   + sh build/git-release.sh <br/>
>     运行 git-release.sh 进行git冲突的检测。这里主要是检测dev分支是否冲突，因为Element是在dev分支进行开发的。
>   + build/release.sh <br/>
>     dev分支代码检测没有冲突，接下来就会执行release.sh脚本，合并dev分支到master、更新版本号、推送代码到远程仓库并发布到npm（npm publish）。
> 
> - deploy:build <br/>
> - deploy:extension <br/>
> - dev:extension <br/>
> - test <br/>
> - test:watch <br/>


* #### repository
> 项目的仓库地址


* #### homepage
> 项目的线上地址


* #### keywords
> 关键字


* #### license
> 项目的开源协议


* #### bugs
> 项目bug反馈的地址


* #### unpkg
> 当你把一个包发布到npm上时，它同时应该也可以在unpkg上获取到。也就是说，你的代码既可能在NodeJs环境也可能在浏览器环境执行。为此你需要用umd格式打包，lib/index.js是umd规范，由webpack.conf.js生成。


* #### style
> 声明样式入口文件，这里是lib/theme-chalk/index.css。


* #### peerDependencies
> 所依赖的框架版本




------------------------------------------------------------




### 整个打包流程
![打包流程](https://user-gold-cdn.xitu.io/2020/6/23/172df2c6a4ca6dd8?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)




------------------------------------------------------------




### 发布流程
Element中发布主要是用shell脚本实现的。

Element发布一共涉及三个部分：
1. git 发布
2. npm 发布
3. 官网发布

发布对应的命令：
```
npm run pub
```

