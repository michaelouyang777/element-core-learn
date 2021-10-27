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

### name
> 项目名


### version
> 项目当前的版本


### description
> 项目描述


### main
> 项目的入口文件
> ```
> "main": "lib/element-ui.common.js",
> ```
> 这就是引入该库时所执行的入口文件。
> ```
> import Element from 'element-ui'
> ```


### files
> 指定`npm publish`发包时需要包含的文件/目录。


### typings
> TypeScript入口文件。


### scripts
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
>   根据components.json，生成package/theme-chalk/index.scss。用gulp构建工具，编译scss、压缩、输出css到lib目录。
>   ```
>   "build:theme": "node build/bin/gen-cssfile && gulp build --gulpfile packages/theme-chalk/gulpfile.js && cp-cli packages/theme-chalk/lib lib/theme-chalk"
>   ```
>   + node build/bin/gen-cssfile <br/>
>     根据components.json，生成package/theme-chalk/index.scss文件，把所有组件的样式都导入到index.scss。
>   + gulp build --gulpfile packages/theme-chalk/gulpfile.js <br/>
>     使用gulp工具，将packages/theme-chalk下的所有scss文件编译为css。
>   + cp-cli packages/theme-chalk/lib lib/theme-chalk <br/>
>     复制文件到lib/theme-chalk下
>     > cp-cli 是一个跨平台的copy工具，和CopyWebpackPlugin类似
> 
> - build:utils <br/>
>   把src目录下的除了index.js入口文件外的其他文件通过babel转译，然后移动到lib文件夹下。
>   ```
>   "build:utils": "cross-env BABEL_ENV=utils babel src --out-dir lib --ignore src/index.js"
>   ```
> 
> - build:umd <br/>
>   生成umd模块的语言包。
>   ```
>   "build:umd": "node build/bin/build-locale.js",
>   ```
> - clean <br/>
>   删除之前打包生成文件
>   ```
>   "clean": "rimraf lib && rimraf packages/*/lib && rimraf test/**/coverage",
>   ```
> 
> - dev <br/>
>   运行项目
>   ```
>   "dev": "npm run bootstrap && npm run build:file && cross-env NODE_ENV=development webpack-dev-server --config build/webpack.demo.js & node build/bin/template.js"
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
>   + npm run build:file <br/>
>     根据components.json生成入口文件src/index.js，以及i18n相关文件。
>   + npm run lint <br/>
>     对项目代码进行es语法检测
>   + webpack --config build/webpack.conf.js <br/>
>     生成umd格式的js文件（index.js）
>   + webpack --config build/webpack.common.js <br/>
>     生成commonjs格式的js文件（element-ui.common.js），require时默认加载的是这个文件。
>   + webpack --config build/webpack.component.js <br/>
>     以components.json为入口，将每一个组件打包生成一个文件，用于按需加载。
>   + npm run build:utils <br/>
>     把src目录下的除了index.js入口文件外的其他文件通过babel转译，然后移动到lib文件夹下。
>   + npm run build:umd <br/>
>     生成umd模块的语言包。
>   + npm run build:theme <br/>
>     根据components.json，生成package/theme-chalk/index.scss。用gulp构建工具，编译scss、压缩、输出css到lib目录。
>
> - lint <br/>
>   对项目代码进行es语法检测
>   ```
>   "lint": "eslint src/**/* test/**/* packages/**/* build/**/* --quiet",
>   ```
> 
> - pub <br/>
>   项目发布
>   ```
>   "pub": "npm run bootstrap && sh build/git-release.sh && sh build/release.sh && node build/bin/gen-indices.js",
>   ```
>   + sh build/git-release.sh <br/>
>     运行 git-release.sh 进行git冲突的检测。这里主要是检测dev分支是否冲突，因为Element是在dev分支进行开发的。
>   + sh build/release.sh <br/>
>     dev分支代码检测没有冲突，接下来就会执行release.sh脚本，合并dev分支到master、更新版本号、推送代码到远程仓库并发布到npm（npm publish）。
>   + node build/bin/gen-indices.js <br/>
> 
> - deploy:build <br/>
> - deploy:extension <br/>
> - dev:extension <br/>
> - test <br/>
> - test:watch <br/>


### repository
> 项目的仓库地址


### homepage
> 项目的线上地址


### keywords
> 关键字


### license
> 项目的开源协议


### bugs
> 项目bug反馈的地址


### unpkg
> 当你把一个包发布到npm上时，它同时应该也可以在unpkg上获取到。也就是说，你的代码既可能在NodeJs环境也可能在浏览器环境执行。为此你需要用umd格式打包，lib/index.js是umd规范，由webpack.conf.js生成。


### style
> 声明样式入口文件，这里是lib/theme-chalk/index.css。


### peerDependencies
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




## src/index.js解析

一般情况下，src下存在index.js文件则是这个项目启动的主入口文件。
而`src/index.js` 和 package.json内的`"main": "lib/element-ui.common.js"` 是不同的。
前者是项目启动的主入口文件，后者是库被引用的主入口文件。

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

// 拿到组件name的数组
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






------------------------------------------------------------




## 整个打包流程
![打包流程](https://github.com/michaelouyang777/element-core-learn/tree/core-learn/doc/publish.jpg)




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
