'use strict';

console.log();
process.on('exit', () => {
  console.log();
});

// 参数校验
if (!process.argv[2]) {
  console.error('[组件名]必填 - Please enter new component name');
  process.exit(1);
}

const path = require('path');
const fs = require('fs');
const fileSave = require('file-save');
const uppercamelcase = require('uppercamelcase');
// 获取命令行的参数
// e.g. node new.js input 输入框 
// process.argv表示命令行的参数数组
// 0是node，1是new.js，2和3就是后面两个参数
const componentname = process.argv[2]; // 组件名
const chineseName = process.argv[3] || componentname;
const ComponentName = uppercamelcase(componentname); // 转成驼峰表示
// 组件所在的目录文件
const PackagePath = path.resolve(__dirname, '../../packages', componentname);
// 文件对应使用的模板
const Files = [
  {
    filename: 'index.js',
    content: `import ${ComponentName} from './src/main';

    /* istanbul ignore next */
    ${ComponentName}.install = function(Vue) {
      Vue.component(${ComponentName}.name, ${ComponentName});
    };

    export default ${ComponentName};`
  },
  {
    filename: 'src/main.vue',
    content: `<template>
    <div class="el-${componentname}"></div>
    </template>

    <script>
    export default {
      name: 'El${ComponentName}'
    };
    </script>`
  },
  {
    filename: path.join('../../examples/docs/zh-CN', `${componentname}.md`),
    content: `## ${ComponentName} ${chineseName}`
  },
  {
    filename: path.join('../../examples/docs/en-US', `${componentname}.md`),
    content: `## ${ComponentName}`
  },
  {
    filename: path.join('../../examples/docs/es', `${componentname}.md`),
    content: `## ${ComponentName}`
  },
  {
    filename: path.join('../../examples/docs/fr-FR', `${componentname}.md`),
    content: `## ${ComponentName}`
  },
  {
    filename: path.join('../../test/unit/specs', `${componentname}.spec.js`),
    content: `import { createTest, destroyVM } from '../util';
    import ${ComponentName} from 'packages/${componentname}';

    describe('${ComponentName}', () => {
      let vm;
      afterEach(() => {
        destroyVM(vm);
      });

      it('create', () => {
        vm = createTest(${ComponentName}, true);
        expect(vm.$el).to.exist;
      });
    });
    `
  },
  {
    filename: path.join('../../packages/theme-chalk/src', `${componentname}.scss`),
    content: `@import "mixins/mixins";
    @import "common/var";

    @include b(${componentname}) {
    }`
  },
  {
    filename: path.join('../../types', `${componentname}.d.ts`),
    content: `import { ElementUIComponent } from './component'

    /** ${ComponentName} Component */
    export declare class El${ComponentName} extends ElementUIComponent {
    }`
  }
];

// 添加到 components.json
const componentsFile = require('../../components.json');
// 检查components.json中是否已经存在同名组件
if (componentsFile[componentname]) {
  console.error(`${componentname} 已存在.`);
  process.exit(1);
}
// componentsFile中写入新的组件键值对
componentsFile[componentname] = `./packages/${componentname}/index.js`;
fileSave(path.join(__dirname, '../../components.json'))
  .write(JSON.stringify(componentsFile, null, '  '), 'utf8')
  .end('\n');

// 添加到 index.scss
const sassPath = path.join(__dirname, '../../packages/theme-chalk/src/index.scss');
const sassImportText = `${fs.readFileSync(sassPath)}@import "./${componentname}.scss";`;
fileSave(sassPath)
  .write(sassImportText, 'utf8')
  .end('\n');

// 添加到 element-ui.d.ts
const elementTsPath = path.join(__dirname, '../../types/element-ui.d.ts');

let elementTsText = `${fs.readFileSync(elementTsPath)}
/** ${ComponentName} Component */
export class ${ComponentName} extends El${ComponentName} {}`;

const index = elementTsText.indexOf('export') - 1;
const importString = `import { El${ComponentName} } from './${componentname}'`;

elementTsText = elementTsText.slice(0, index) + importString + '\n' + elementTsText.slice(index);

fileSave(elementTsPath)
  .write(elementTsText, 'utf8')
  .end('\n');

// 创建 package
Files.forEach(file => {
  fileSave(path.join(PackagePath, file.filename))
    .write(file.content, 'utf8')
    .end('\n');
});

// 添加到 nav.config.json
const navConfigFile = require('../../examples/nav.config.json');

Object.keys(navConfigFile).forEach(lang => {
  let groups = navConfigFile[lang][4].groups;
  groups[groups.length - 1].list.push({
    path: `/${componentname}`,
    title: lang === 'zh-CN' && componentname !== chineseName
      ? `${ComponentName} ${chineseName}`
      : ComponentName
  });
});

fileSave(path.join(__dirname, '../../examples/nav.config.json'))
  .write(JSON.stringify(navConfigFile, null, '  '), 'utf8')
  .end('\n');

console.log('DONE!');
