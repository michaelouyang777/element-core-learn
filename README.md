# element 源码学习


## 目录结构解析 
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
|-- .eslintignore                      // eslint忽略配置
|-- .eslintrc                          // eslint相关配置
|-- .gitattributes
|-- .gitignore                         // 忽略文件配置
|-- .travis.yml                        // ci配置
|-- CHANGELOG.en-US.md                 // 版本改动说明（英文版）
|-- CHANGELOG.es.md                    // 版本改动说明
|-- CHANGELOG.fr-FR.md                 // 版本改动说明
|-- CHANGELOG.zh-CN.md                 // 版本改动说明（中文版）
|-- components.json                    // 组件配置文件
|-- element_logo.svg                   // element logo
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
  + directives ：放置自定义指令。
  + locale：放置语言的配置文件。
  + mixins：放置组件用的混合文件。
  + transitions：放置动画配置文件。
  + utils：放置用到工具函数文件。
  + index.js：组件注册的入口文件。
- test：存放单元测试文件，合格的单元测试也是一个成熟的开源项目必备的。
- types：存放声明文件，方便引入 typescript 写的项目中，需要在 package.json 中指定 - typing 字段的值为 声明的入口文件才能生效。
> NOTE：
> * 组件代码放在 packages 目录中，而并不在 src 目录中。
> * 组件样式、公共样式是放在 packages/theme-chalk/src 目录中。

说完了文件夹目录，抛开那些常见的 .babelrc、.eslintc 等文件，我们来看看根目录下的几个看起来比较奇怪的文件：
- travis.yml：持续集成（CI）的配置文件，它的作用就是在代码提交时，根据该文件执行对应脚本，成熟的开源项目必备之一。
- CHANGELOG：更新日志，这里ElementUI提供了4种不同语言版本的更新日志。
- components.json：配置文件，标注了组件的文件路径，方便 webpack 打包时获取组件的文件路径。
- element_logo.svg：ElementUI 的图标，使用了 svg 格式，合理使用 svg 文件，可以大大减少图片大小。
- FAQ.md：ElementUI 开发者对常见问题的解答。
- LICENSE：开源许可证。ElementUI 使用的是 MIT 协议，使用 ElementUI 进行二次开发的开发者建议注意该文件。
- Makefile：在 .github 文件夹下的贡献指南中提到过，组件开发规范中的第一条：通过 make new 创建组件目录结构，包含测试代码、入口文件、文档。其中 make new 就是 make 命令中的一种。make 命令是一个工程化编译工具，是批处理的一种方法，而 Makefile 定义了一系列的规则来制定文件编译操作。




------------------------------------------------------------




## package.json解析
通常我们去看一个大型项目都是从package.json文件开始看起的，这里面包含了项目的版本、入口、脚本、依赖等关键信息。

- **name**
  > 项目名


- **version**
  > 项目当前的版本


- **description**
  > 项目描述


- **main**
  > 项目的入口文件
  > ```js
  > "main": "lib/element-ui.common.js"
  > ```
  > 这就是引入该库时所执行的入口文件。
  > ```js
  > import Element from 'element-ui'
  > ```


- **files**
  > 指定`npm publish`发包时需要包含的文件/目录。


- **typings**
  > TypeScript入口文件。


- **scripts**
  > 开发、测试、生产构建，打包、部署，测试用例等相关脚本。


- **repository**
  > 项目的仓库地址


- **homepage**
  > 项目的线上地址


- **keywords**
  > 关键字


- **license**
  > 项目的开源协议


- **bugs**
  > 项目bug反馈的地址


- **unpkg**
  > 当你把一个包发布到npm上时，它同时应该也可以在unpkg上获取到。也就是说，你的代码既可能在NodeJs环境也可能在浏览器环境执行。为此你需要用umd格式打包，lib/index.js是umd规范，由webpack.conf.js生成。


- **style**
  > 声明样式入口文件，这里是lib/theme-chalk/index.css。


- **peerDependencies**
  > 所依赖的框架版本




------------------------------------------------------------




## components.json解析

这个文件其实就是记录了组件的路径，在自动化生成文件以及入口时会用到：

```json
{
  "pagination": "./packages/pagination/index.js",
  "dialog": "./packages/dialog/index.js",
  "autocomplete": "./packages/autocomplete/index.js",
  // ...
  "avatar": "./packages/avatar/index.js",
  "drawer": "./packages/drawer/index.js",
  "popconfirm": "./packages/popconfirm/index.js"
}
```




------------------------------------------------------------




## 组件定义说明

**组件源码位置：**
组件的存放位置全都放在`packages`这个目录内。
`packages`里面一个子文件夹就是一个组件。
![packages目录](https://michaelouyang777.github.io/element-core-learn//doc/packages.png)

**组件样式源码位置：**
而组件的样式文件是单独存放的，统一放到`packages/theme-chalk`文件夹内的。
![packages/theme-chalk目录](https://michaelouyang777.github.io/element-core-learn//doc/theme-chalk.png)
index.scss是组件样式的统一入口，用于全局引入时导出所有组件样式
其它的则是每个组件对应的scss文件，用于按需引入时导出对应的组件样式




------------------------------------------------------------




## shell命令描述

element在`package.json`中的scripts字段内有非常多的命令，这里单独一节出来详细解释。

shell命令列表：
```json
"scripts": {
  "bootstrap": "yarn || npm i",
  "build:file": "node build/bin/iconInit.js & node build/bin/build-entry.js & node build/bin/i18n.js & node build/bin/version.js",
  "build:theme": "node build/bin/gen-cssfile && gulp build --gulpfile packages/theme-chalk/gulpfile.js && cp-cli packages/theme-chalk/lib lib/theme-chalk",
  "build:utils": "cross-env BABEL_ENV=utils babel src --out-dir lib --ignore src/index.js",
  "build:umd": "node build/bin/build-locale.js",
  "clean": "rimraf lib && rimraf packages/*/lib && rimraf test/**/coverage",
  "deploy:build": "npm run build:file && cross-env NODE_ENV=production webpack --config build/webpack.demo.js && echo element.eleme.io>>examples/element-ui/CNAME",
  "deploy:extension": "cross-env NODE_ENV=production webpack --config build/webpack.extension.js",
  "dev:extension": "rimraf examples/extension/dist && cross-env NODE_ENV=development webpack --watch --config build/webpack.extension.js",
  "dev": "npm run build:file && cross-env NODE_ENV=development webpack-dev-server --config build/webpack.demo.js & node build/bin/template.js",
  "dev:play": "npm run build:file && cross-env NODE_ENV=development PLAY_ENV=true webpack-dev-server --config build/webpack.demo.js",
  "dist": "npm run clean && npm run build:file && npm run lint && webpack --config build/webpack.conf.js && webpack --config build/webpack.common.js && webpack --config build/webpack.component.js && npm run build:utils && npm run build:umd && npm run build:theme",
  "i18n": "node build/bin/i18n.js",
  "lint": "eslint src/**/* test/**/* packages/**/* build/**/* --quiet",
  "pub": "npm run bootstrap && sh build/git-release.sh && sh build/release.sh && node build/bin/gen-indices.js",
  "test": "npm run lint && npm run build:theme && cross-env CI_ENV=/dev/ BABEL_ENV=test karma start test/unit/karma.conf.js --single-run",
  "test:watch": "npm run build:theme && cross-env BABEL_ENV=test karma start test/unit/karma.conf.js"
}
```


### bootstrap
官方推荐使用yarn下载依赖

```json
"bootstrap": "yarn || npm i"
```



### build:file
该指令主要用来自动化生成一些文件。

```json
"build:file": 
"node build/bin/iconInit.js &
 node build/bin/build-entry.js &
 node build/bin/i18n.js &
 node build/bin/version.js"
```

> emement把每种资源的编译都单独拆分成一个一个命令，意义在于可以自定义多元化的编译命令。

+ `node build/bin/iconInit.js`
  解析icon.scss，把所有的icon的名字放在`examples/icon.json`，最后挂在Vue原型上的$icon上。
+ `node build/bin/build-entry.js`
  根据`components.json`文件，生成`src/index.js`文件。
+ `node build/bin/i18n.js`
  根据`examples/i18n/page.json`和模版，生成不同语言的demo，也就是官网 demo 展示国际化的处理。
+ `node build/bin/version.js`
  根据package.json中的version,生成examples/versions.json，对应就是完整的版本列表。



### build:theme
该指令是用来处理样式相关的内容。
根据`components.json`文件，生成`package/theme-chalk/index.scss`。
样式部分是应用gulp构建工具，把scss编译、压缩，输出css到lib目录。

```json
"build:theme": 
"node build/bin/gen-cssfile && 
 gulp build --gulpfile packages/theme-chalk/gulpfile.js && 
 cp-cli packages/theme-chalk/lib lib/theme-chalk"
```

+ `node build/bin/gen-cssfile`
  根据`components.json`，生成`package/theme-chalk/index.scss`文件，把所有组件的样式都导入到index.scss。通过自动化操作生成样式主入口文件，就无需手动引入每个组件了。
+ `gulp build --gulpfile packages/theme-chalk/gulpfile.js`
  使用gulp工具，将`packages/theme-chalk`下的所有scss文件编译为css。
+ `cp-cli packages/theme-chalk/lib lib/theme-chalk`
  将`packages/theme-chalk/lib`文件夹拷贝到`lib/theme-chalk`下
  > 注：cp-cli 是一个跨平台的copy工具，和CopyWebpackPlugin类似



### build:utils
把src目录下的除了index.js入口文件外的其他文件通过babel转译，然后移动到lib文件夹下。

```json
"build:utils": "cross-env BABEL_ENV=utils babel src --out-dir lib --ignore src/index.js"
```



### build:umd
生成umd模块的语言包。

```json
"build:umd": "node build/bin/build-locale.js",
```



### clean
删除之前打包生成文件

```json
"clean": 
"rimraf lib && 
 rimraf packages/*/lib && 
 rimraf test/**/coverage",
```



### dev
运行项目

```json
"dev": 
"npm run bootstrap && 
 npm run build:file && 
 cross-env NODE_ENV=development webpack-dev-server --config build/webpack.demo.js & 
 node build/bin/template.js"
```

+ `npm run bootstrap`
  安装依赖
+ `npm run build:file`
  执行build:file命令。主要用来自动化生成一些文件
+ `cross-env NODE_ENV=development webpack-dev-server --config build/webpack.demo.js`
  用于跑Element官网的基础配置
+ `node build/bin/template.js`
  根据模板文件（examples/pages）和国际化配置（examples/i18n/page.json）生成国际化文档



### dev:play
运行项目 —— 单文件运行（examples/play/index.vue）

```json
"dev:play": 
"npm run build:file && 
 cross-env NODE_ENV=development PLAY_ENV=true webpack-dev-server --config build/webpack.demo.js"
```

`dev:play`对比`dev`命令，主要是少了第一条`npm run bootstrap`和最后一条`node build/bin/template.js`
> `npm run bootstrap`安装依赖 <br/>
> `node build/bin/template.js`生成在线文档



### dist
打包项目

```json
"dist": 
"npm run clean && 
 npm run build:file && 
 npm run lint && 
 webpack --config build/webpack.conf.js && 
 webpack --config build/webpack.common.js && 
 webpack --config build/webpack.component.js && 
 npm run build:utils && 
 npm run build:umd && 
 npm run build:theme"
```

+ `npm run clean`
  删除之前打包生成文件
+ `npm run build:file`
  根据components.json生成入口文件src/index.js，以及i18n相关文件。
+ `npm run lint`
  对项目代码进行es语法检测
+ `webpack --config build/webpack.conf.js`
  生成umd格式的js文件（index.js）
+ `webpack --config build/webpack.common.js`
  生成commonjs格式的js文件（element-ui.common.js），require时默认加载的是这个文件。
+ `webpack --config build/webpack.component.js`
  以components.json为入口，将每一个组件打包生成一个文件，用于按需加载。
+ `npm run build:utils`
  把src目录下的除了index.js入口文件外的其他文件通过babel转译，然后移动到lib文件夹下。
+ `npm run build:umd`
  生成umd模块的语言包。
+ `npm run build:theme`
  根据components.json，生成package/theme-chalk/index.scss。用gulp构建工具，编译scss、压缩、输出css到lib目录。



### lint
对项目代码进行es语法检测

```json
"lint": "eslint src/**/* test/**/* packages/**/* build/**/* --quiet",
```



### pub
项目发布

```json
"pub": 
"npm run bootstrap && 
 sh build/git-release.sh && 
 sh build/release.sh && 
 node build/bin/gen-indices.js"
```

+ `sh build/git-release.sh`
  运行 git-release.sh 进行git冲突的检测。这里主要是检测dev分支是否冲突，因为Element是在dev分支进行开发的。
+ `sh build/release.sh`
  dev分支代码检测没有冲突，接下来就会执行release.sh脚本，合并dev分支到master、更新版本号、推送代码到远程仓库并发布到npm（npm publish）。
+ `node build/bin/gen-indices.js`



### deploy:build
TODO



### deploy:extension
TODO



### dev:extension
TODO



### test
TODO



### test:watch
TODO






------------------------------------------------------------





## shell命令详解

### shell命令列表
+ `node build/bin/iconInit.js`
  解析icon.scss，把所有的icon的名字放在`examples/icon.json`，最后挂在Vue原型上的$icon上。

+ `node build/bin/build-entry.js`
  根据`components.json`文件，生成`src/index.js`文件。

+ `node build/bin/i18n.js`
  根据`examples/i18n/page.json`和模版，生成不同语言的demo，也就是官网 demo 展示国际化的处理。

+ `node build/bin/version.js`
  根据package.json中的version,生成examples/versions.json，对应就是完整的版本列表。

+ `node build/bin/gen-cssfile`
  根据`components.json`，生成`package/theme-chalk/index.scss`文件，把所有组件的样式都导入到index.scss。通过自动化操作生成样式主入口文件，就无需手动引入每个组件了。

+ `gulp build --gulpfile packages/theme-chalk/gulpfile.js`
  使用gulp工具，将`packages/theme-chalk`下的所有scss文件编译为css。

+ `cp-cli packages/theme-chalk/lib lib/theme-chalk`
  将`packages/theme-chalk/lib`文件复制到`lib/theme-chalk`下

+ `cross-env BABEL_ENV=utils babel src --out-dir lib --ignore src/index.js`
  把src目录下的除了index.js入口文件外的其他文件通过babel转译，然后移动到lib文件夹下。

+ `node build/bin/build-locale.js`
  生成umd模块的语言包。

+ `rimraf lib`
  删除`lib`文件夹

+ `rimraf packages/*/lib`
  删除`packages/*/lib`文件夹

+ `rimraf test/**/coverage`
  删除`test/**/coverage`文件夹

+ `cross-env NODE_ENV=development webpack-dev-server --config build/webpack.demo.js`
  用于跑Element官网的基础配置

+ `node build/bin/template.js`
  根据模板文件（examples/pages）和国际化配置（examples/i18n/page.json）生成国际化文档

+ `cross-env NODE_ENV=development PLAY_ENV=true webpack-dev-server --config build/webpack.demo.js`
  用于跑Element官网的基础配置

+ `webpack --config build/webpack.conf.js`
  生成umd格式的js文件（index.js）

+ `webpack --config build/webpack.common.js`
  生成commonjs格式的js文件（element-ui.common.js），require时默认加载的是这个文件。

+ `webpack --config build/webpack.component.js`
  以components.json为入口，将每一个组件打包生成一个文件，用于按需加载。

+ `eslint src/**/* test/**/* packages/**/* build/**/* --quiet`
  对项目代码进行es语法检测

+ `sh build/git-release.sh`
  运行 git-release.sh 进行git冲突的检测。这里主要是检测dev分支是否冲突，因为Element是在dev分支进行开发的。

+ `sh build/release.sh`
  dev分支代码检测没有冲突，接下来就会执行release.sh脚本，合并dev分支到master、更新版本号、推送代码到远程仓库并发布到npm（npm publish）。

+ `node build/bin/gen-indices.js`
  <!-- TODO -->



### shell命令详情

#### node build/bin/build-entry.js

一般情况下，源码都会放在src目录下，src下会存在index.js，这个则是项目的主入口文件。
> 注意：
> `src/index.js` 和 package.json内的`"main": "lib/element-ui.common.js"` 所说的主入口是不同的。
> 前者是项目启动的主入口文件，后者是库被引用的主入口文件。

`src/index.js`文件的开头有下面这句注释：
```js
/* Automatically generated by './build/bin/build-entry.js' */
```
意思是该文件是由 `build/bin/build-entry.js` 生成的

这个文件主要做了以下事情：
1. 导入了 packages 下的所有组件。
2. 对外暴露了install方法，把所有的组件注册到Vue上面，并在Vue原型上挂载了一些全局变量和方法。
3. 最终将install方法、变量、方法导出。

下面是`src/index.js`的全部代码：
```js
/* Automatically generated by './build/bin/build-entry.js' */
/* 该文件是由 build/bin/build-entry.js 生成的 */

// 引入各个组件
import Pagination from '../packages/pagination/index.js';
import Dialog from '../packages/dialog/index.js';
import Autocomplete from '../packages/autocomplete/index.js';
// ...
// ...
import Drawer from '../packages/drawer/index.js';
import Popconfirm from '../packages/popconfirm/index.js';
import locale from 'element-ui/src/locale';
import CollapseTransition from 'element-ui/src/transitions/collapse-transition';

// 将引入的组件，存入数组内
const components = [
  Pagination,
  Dialog,
  Autocomplete,
  // ...
  // ...
  Drawer,
  Popconfirm,
  CollapseTransition
];

// 编写install方法，供vue装载调用
const install = function(Vue, opts = {}) {
  // 国际化配置
  locale.use(opts.locale);
  locale.i18n(opts.i18n);

  // 批量全局注册组件
  components.forEach(component => {
    Vue.component(component.name, component);
  });

  // 全局注册指令
  Vue.use(InfiniteScroll);
  Vue.use(Loading.directive);

  // 全局设置尺寸
  Vue.prototype.$ELEMENT = {
    size: opts.size || '',
    zIndex: opts.zIndex || 2000
  };

  // 在 Vue 原型上挂载方法，以API的形式调用组件
  Vue.prototype.$loading = Loading.service;
  Vue.prototype.$msgbox = MessageBox;
  Vue.prototype.$alert = MessageBox.alert;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$notify = Notification;
  Vue.prototype.$message = Message;

};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

// 导出组件
export default {
  version: '2.15.1',
  locale: locale.use,
  i18n: locale.i18n,
  install,
  CollapseTransition,
  Loading,
  Pagination,
  // ...
  // ...
  Dialog,
  Avatar,
  Drawer,
  Popconfirm
};
```

**划重点：**
> `src/index.js` 是由 `build/bin/build-entry.js` 生成的。

那么下面来分析一下他是如何被生成出来的。

`build\bin\build-entry.js` 文件主要做了以下事情：
1. 引入components.json，读取组件列表，批量生成组件的import引入。
2. 文件内准备好一段js模板，用于生成`src/index.js`。
3. 取得各种参数，通过`json-templater`组装到模板上。
4. 使用 `fs.writeFileSync` 写入文件。

批量生成了组件引入、注册的代码。这样做的好处是什么？
这样就不再需要每添加或删除一个组件，就在入口文件中进行多处修改。
使用自动化生成入口文件之后，我们只需要修改`components.json`一处的注册信息即可。

`build\bin\build-entry.js` 源码如下：
```js
/**
 * 文件说明：
 * 根据components.json，生成src/index.js文件。
 */

// 引入组件名单文件（用json文件进行声明）
var Components = require('../../components.json');
var fs = require('fs');
// 【插件】可以让string与变量结合，输出一些内容
var render = require('json-templater/string');
// 【插件】转化为驼峰 foo-bar >> FooBar
var uppercamelcase = require('uppercamelcase');
var path = require('path');
// os.EOL属性是一个常量，返回当前操作系统的换行符（Windows系统是\r\n，其他系统是\n）
var endOfLine = require('os').EOL;

// 输出地址
var OUTPUT_PATH = path.join(__dirname, '../../src/index.js');
// 导入模板
var IMPORT_TEMPLATE = 'import {{name}} from \'../packages/{{package}}/index.js\';';
// 安装组件模板
var INSTALL_COMPONENT_TEMPLATE = '  {{name}}';
// 生成入口文件的模板
var MAIN_TEMPLATE = `/* Automatically generated by './build/bin/build-entry.js' */

{{include}}
import locale from 'element-ui/src/locale';
import CollapseTransition from 'element-ui/src/transitions/collapse-transition';

const components = [
{{install}},
  CollapseTransition
];

const install = function(Vue, opts = {}) {
  locale.use(opts.locale);
  locale.i18n(opts.i18n);

  components.forEach(component => {
    Vue.component(component.name, component);
  });

  Vue.use(InfiniteScroll);
  Vue.use(Loading.directive);

  Vue.prototype.$ELEMENT = {
    size: opts.size || '',
    zIndex: opts.zIndex || 2000
  };

  Vue.prototype.$loading = Loading.service;
  Vue.prototype.$msgbox = MessageBox;
  Vue.prototype.$alert = MessageBox.alert;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$notify = Notification;
  Vue.prototype.$message = Message;

};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  version: '{{version}}',
  locale: locale.use,
  i18n: locale.i18n,
  install,
  CollapseTransition,
  Loading,
  {{list}}
};
`;

delete Components.font;

// 拿到所有组件的name，存放在数组内
var ComponentNames = Object.keys(Components);

var includeComponentTemplate = [];
var installTemplate = [];
var listTemplate = [];

// 根据components.json 文件批量生成模板所需的参数
ComponentNames.forEach(name => {
  var componentName = uppercamelcase(name);

  includeComponentTemplate.push(render(IMPORT_TEMPLATE, {
    name: componentName,
    package: name
  }));

  // 这几个特殊组件需要挂载到Vue的原型链上
  if (['Loading', 'MessageBox', 'Notification', 'Message', 'InfiniteScroll'].indexOf(componentName) === -1) {
    installTemplate.push(render(INSTALL_COMPONENT_TEMPLATE, {
      name: componentName,
      component: name
    }));
  }

  if (componentName !== 'Loading') listTemplate.push(`  ${componentName}`);
});

// 传入模板参数
var template = render(MAIN_TEMPLATE, {
  include: includeComponentTemplate.join(endOfLine),
  install: installTemplate.join(',' + endOfLine),
  version: process.env.VERSION || require('../../package.json').version,
  list: listTemplate.join(',' + endOfLine)
});

// 生成src/index.js入口文件
fs.writeFileSync(OUTPUT_PATH, template);
console.log('[build entry] DONE:', OUTPUT_PATH);
```



#### node build/bin/i18n.js

通过`examples/i18n`内的内容和`examples/pages/template`内的模版，生成element官网。
其中，`examples/i18n`内提供了4种语言的内容，通过传入不同语言的内容，生成不同语言版本的element官网，这就是element官网国际化的处理。

语言以及内容由`examples/i18n`内的json文件提供，每个文件内都会有4种语言的内容：
![examples/i18n目录](https://michaelouyang777.github.io/element-core-learn//doc/i18n.png)
模板由`examples/pages/template`提供，以下是生成element官网的模板文件目录：
![examples/pages/template目录](https://michaelouyang777.github.io/element-core-learn//doc/template.png)
> 里面的.tpl文件，就是一个模板文件，而且每个tpl文件都是符合SFC规范的Vue文件。

下面来看看`examples/i18n`内的json文件
以`examples/i18n/page.json`为例，一个对象就是一个语言版本：
```json
[
  {
    "lang": "zh-CN",
    "pages": {
      "index": {
        "1": "网站快速成型工具",
        "2": "Element，一套为开发者、设计师和产品经理准备的基于 Vue 2.0 的桌面端组件库",
        "3": "指南",
        "4": "了解设计指南，帮助产品设计人员搭建逻辑清晰、结构合理且高效易用的产品。",
        "5": "查看详情",
        "6": "组件",
        "7": "使用组件 Demo 快速体验交互细节；使用前端框架封装的代码帮助工程师快速开发。",
        "8": "资源",
        "9": "下载相关资源，用其快速搭建页面原型或高保真视觉稿，提升产品设计效率。",
        "10": "主题",
        "11": "在线主题编辑器，可视化定制和管理站点主题、组件样式",
        "12": "主题定制功能上线",
        "13": "点击开始编辑",
        "14": "尝试您的新主题",
        "lang": "zh-CN",
        "titleSize": "34",
        "paraSize": "18"
      },
      "component": {},
      "theme": {
        "1": "官方主题",
        "2": "我的主题",
        "3": "主题名称"
      },
      "theme-preview": {
        "1": "返回"
      },
      "theme-nav": {},
      "changelog": {
        "1": "更新日志",
        "2": "zh-CN"
      },
      "design": {
        "1": "设计原则",
        "2": "一致",
        "3": "Consistency",
        "4": "反馈",
        "5": "Feedback",
        "6": "效率",
        "7": "Efficiency",
        "8": "可控",
        "9": "Controllability",
        "10": "一致性 Consistency",
        "11": "与现实生活一致：",
        "12": "与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；",
        "13": "在界面中一致：",
        "14": "所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。",
        "15": "反馈 Feedback",
        "16": "控制反馈：",
        "17": "通过界面样式和交互动效让用户可以清晰的感知自己的操作；",
        "18": "页面反馈：",
        "19": "操作后，通过页面元素的变化清晰地展现当前状态。",
        "20": "效率 Efficiency",
        "21": "简化流程：",
        "22": "设计简洁直观的操作流程；",
        "23": "清晰明确：",
        "24": "语言表达清晰且表意明确，让用户快速理解进而作出决策；",
        "25": "帮助用户识别：",
        "26": "界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。",
        "27": "可控 Controllability",
        "28": "用户决策：",
        "29": "根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；",
        "30": "结果可控：",
        "31": "用户可以自由的进行操作，包括撤销、回退和终止当前操作等。"
      },
      "guide": {
        "1": "设计原则",
        "2": "导航"
      },
      "nav": {
        "1": "导航",
        "2": "导航可以解决用户在访问页面时：在哪里，去哪里，怎样去的问题。一般导航会有「侧栏导航」和「顶部导航」2 种类型。",
        "3": "选择合适的导航",
        "4": "选择合适的导航可以让用户在产品的使用过程中非常流畅，相反若是不合适就会引起用户操作不适（方向不明确），以下是「侧栏导航」和 「顶部导航」的区别。",
        "5": "侧栏导航",
        "6": "可将导航栏固定在左侧，提高导航可见性，方便页面之间切换；顶部可放置常用工具，如搜索条、帮助按钮、通知按钮等。适用于中后台的管理型、工具型网站。",
        "7": "一级类目",
        "8": "适用于结构简单的网站：只有一级页面时，不需要使用面包屑。",
        "9": "二级类目",
        "10": "侧栏中最多可显示两级导航；当使用二级导航时，我们建议搭配使用面包屑，方便用户定位自己的位置和快速返回。",
        "11": "三级类目",
        "12": "适用于较复杂的工具型后台，左侧栏为一级导航，中间栏可显示其对应的二级导航，也可放置其他的工具型选项。",
        "13": "顶部导航",
        "14": "顺应了从上至下的正常浏览顺序，方便浏览信息；顶部宽度限制了导航的数量和文本长度。",
        "15": "适用于导航较少，页面篇幅较长的网站。"
      },
      "resource": {
        "1": "资源",
        "2": "整理中",
        "3": "Axure Components",
        "4": "通过在 Axure 中导入 Element 组件库，可以在交互设计阶段方便地调用常用的组件",
        "5": "下载",
        "6": "Sketch Template",
        "7": "从 Element Template 快速调用常用组件，在提升设计效率的同时，保证统一的视觉风格",
        "8": "组件交互文档",
        "9": "进一步查看 Element 交互文档，从一个较为微观的角度详细地了解各个组件的交互细节",
        "paraHeight": "1.8",
        "placeholder1": "整理中",
        "placeholder2": "设计资源正在整理和完善中"
      }
    }
  },
  {
    "lang": "en-US",
    // 其他语言版本...
  },
  {
    "lang": "es",
    // 其他语言版本...
  },
  {
    "lang": "fr-FR",
    // 其他语言版本...
  }
]
```

再来看看其中一个.tpl文件：
里面标有数字的地方，就是需要替换字符的地方。
```js
export default {
  data() {
    return {
      lang: this.$route.meta.lang,
      navsData: [
        {
          path: '/design',
          name: '<%= 1 >'
        },
        {
          path: '/nav',
          name: '<%= 2 >'
        }
      ]
    };
  }
};
```

那么`build/bin/i18n.js`里面，到底做了什么？

我们思考一个问题：首页的展示是如何做到根据不同语言，生成不同的vue文件呢？

这就是`build/bin/i18n.js`帮我们做的事情。

下面来看下`build/bin/i18n.js`源码：
```js
'use strict';
 /**
  * 文件说明：
  * 遍历examples/i18n/page.json，根据不同的数据结构把tpl文件的标志位，通过正则匹配出来，并替换成预先设定好的字段。
  */

var fs = require('fs');
var path = require('path');
// 读取examples/i18n/page.json文件
var langConfig = require('../../examples/i18n/page.json');

// 这个数组
langConfig.forEach(lang => {
  try {
    fs.statSync(path.resolve(__dirname, `../../examples/pages/${ lang.lang }`));
  } catch (e) {
    fs.mkdirSync(path.resolve(__dirname, `../../examples/pages/${ lang.lang }`));
  }

  // 拿到lang.pages对象内的keys数组，并遍历
  Object.keys(lang.pages).forEach(page => {
    // 拿到对应模板路径
    var templatePath = path.resolve(__dirname, `../../examples/pages/template/${ page }.tpl`);
    // 拼接对应的输出路径
    var outputPath = path.resolve(__dirname, `../../examples/pages/${ lang.lang }/${ page }.vue`);
    // 读取指定模板（同步）
    var content = fs.readFileSync(templatePath, 'utf8');
    // 拿到pages内的各种属性的对象
    var pairs = lang.pages[page];
    // 获取对象的keys数组，并遍历
    Object.keys(pairs).forEach(key => {
      content = content.replace(new RegExp(`<%=\\s*${ key }\\s*>`, 'g'), pairs[key]);
    });
    // 输出.vue文件
    fs.writeFileSync(outputPath, content);
  });
});
```

处理流程也很简单：
遍历`examples/i18n/page.json`，根据不同的数据结构把tpl文件的标志位，通过正则匹配出来，并替换成自己预先设定好的字段。




#### node build/bin/gen-cssfile

根据`components.json`生成`package/theme-chalk/index.scss`文件，把所有组件的样式都导入到index.scss。通过自动化操作生成样式主入口文件，就无需手动引入每个组件了。

```js
/**
 * 文件说明：
 * 将'../../components.json'中所有的组件名称提取出来，
 * 拼接成一个导入所有这些组件的.scss文件的字符串，
 * 将这个字符串写入'../../packages/theme-chalk/src/index.scss'文件中。
 */

var fs = require('fs');
var path = require('path');
var Components = require('../../components.json');
var themes = [
  'theme-chalk'
];
Components = Object.keys(Components);
var basepath = path.resolve(__dirname, '../../packages/');

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

themes.forEach((theme) => {
  var isSCSS = theme !== 'theme-default';
  var indexContent = isSCSS ? '@import "./base.scss";\n' : '@import "./base.css";\n';
  Components.forEach(function(key) {
    if (['icon', 'option', 'option-group'].indexOf(key) > -1) return;
    var fileName = key + (isSCSS ? '.scss' : '.css');
    indexContent += '@import "./' + fileName + '";\n';
    var filePath = path.resolve(basepath, theme, 'src', fileName);
    if (!fileExists(filePath)) {
      fs.writeFileSync(filePath, '', 'utf8');
      console.log(theme, ' 创建遗漏的 ', fileName, ' 文件');
    }
  });
  fs.writeFileSync(path.resolve(basepath, theme, 'src', isSCSS ? 'index.scss' : 'index.css'), indexContent);
});
```




#### gulp build --gulpfile packages/theme-chalk/gulpfile.js

使用gulp工具，将`packages/theme-chalk`下的所有scss文件编译为css。


首先说说，ElementUI在使用时有两种引入方式：

**一、全局引入：**
```js
// main.js
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';

Vue.use(ElementUI);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

**二、按需引入：**
```js
// component
import Vue from 'vue';
import { Pagination, Dropdown } from 'element-ui';

import App from './App.vue';

Vue.use(Pagination)
Vue.use(Dropdown)

new Vue({
  el: '#app',
  render: h => h(App)
});
```

对应这两种引入方式，Element在打包时对应的也有两种方案。

方案如下：
按需引入的解决方案：以单个组件来进行划分样式文件，这样就提供按需引入的方式。
全局引入的解决方案：通过一个汇总入口index.scss，把所有组件的样式文件统统在这里引入。
再将`packages/theme-chalk`下的所有scss文件编译为css。


那么`packages/theme-chalk`下的所有scss文件是如何编译成css呢？
element是采用gulp单独对scss进行编译操作的。
而gulp相关的编译逻辑就在`packages/theme-chalk/gulpfile.js`中，配置如下：
```js
'use strict';

const { series, src, dest } = require('gulp');
const sass = require('gulp-sass');  // 编译gulp工具
const autoprefixer = require('gulp-autoprefixer');  // 添加厂商前缀
const cssmin = require('gulp-cssmin');  // 压缩css

function compile() {
  return src('./src/*.scss')  // src下的所有scss文件
    .pipe(sass.sync())  // 把scss文件编译成css
    .pipe(autoprefixer({  // 基于目标浏览器版本，添加厂商前缀
      browsers: ['ie > 9', 'last 2 versions'],
      cascade: false
    }))
    .pipe(cssmin())  // 压缩css
    .pipe(dest('./lib')); // 输出到lib下
}

function copyfont() {
  return src('./src/fonts/**')  // 读取src/fonts下的所有文件
    .pipe(cssmin())
    .pipe(dest('./lib/fonts')); // 输出到lib/fonts下
}

exports.build = series(compile, copyfont);
```


思考：
为什么element采用gulp来编译scss？而不用webpack来编译scss？
因为gulp可以单独对scss后缀的文件进行编译操作，而webapck是需要指定工程化的js入口文件，并不能单一对scss文件进行编译工作。所以采用gulp。





------------------------------------------------------------





### 自动化操作

在element中，自动化生成的文件有以下这些：
`src/index.js`
`package/theme-chalk/index.scss`






------------------------------------------------------------




## 整个打包流程
![打包流程](https://michaelouyang777.github.io/element-core-learn//doc/publish.jpg)





------------------------------------------------------------




## 发布流程
Element中发布主要是用shell脚本实现的。

Element发布一共涉及三个部分：
1. git 发布
2. npm 发布
3. 官网发布

发布对应的命令：
```
npm run pub
```

![发布流程](https://segmentfault.com/img/remote/1460000016419057?w=897&h=1297)




------------------------------------------------------------




## 其他

### elementUI的主题
element-ui 组件样式中的颜色、字体、线条等等样式都是通过变量的方式引入的，在 packages/theme-chalk/src/common/var.scss 中我们可以看到这些变量的定义，这样就给做多主题提供了方便，因为我只要修改这些变量，就可以实现组件的主题改变。
