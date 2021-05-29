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
