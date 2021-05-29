## element 源码学习



### 目录结构解析 

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


------------------------
* #### 
> 
### package.json
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
> - bootstrap
> ```
> "bootstrap": "yarn || npm i"
> ```
> 官方推荐使用yarn下载依赖
> - build:file
> ```
> "build:file": "node build/bin/iconInit.js & node build/bin/build-entry.js & node build/bin/i18n.js & node build/bin/version.js"
> ```
> 该指令主要用来自动化生成一些文件。

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
> 
* #### unpkg
> 当你把一个包发布到npm上时，它同时应该也可以在unpkg上获取到。也就是说，你的代码既可能在NodeJs环境也可能在浏览器环境执行。为此你需要用umd格式打包，lib/index.js是umd规范，由webpack.conf.js生成。

* #### style
> 声明样式入口文件，这里是lib/theme-chalk/index.css。

* #### peerDependencies
> 所依赖的框架版本





