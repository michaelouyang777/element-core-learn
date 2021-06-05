/**
 * md-loader的入口文件
 * 作用：将.md文件编译成Vue SFC格式的字符串
 * 描述：首先执行了 md.render(source) 对 md 文档解析，提取文档中 :::demo {content} ::: 内容，
 *      分别生成一些 Vue 的模板字符串，然后再从这个模板字符串中循环查找 <!--element-demo: 和 :element-demo--> 包裹的内容，
 *      从中提取模板字符串到 output 中，提取 script 到 componenetsString 中，然后构造 pageScript，最后返回的内容是一个模板字符串
 */

// 引入工具方法
const {
  stripScript,
  stripTemplate,
  genInlineComponentText
} = require('./util');
// 引入配置文件
const md = require('./config');

module.exports = function(source) {
  // 使用md.render(source) 对 md 文档解析
  const content = md.render(source);

  const startTag = '<!--element-demo:';
  const startTagLen = startTag.length;
  const endTag = ':element-demo-->';
  const endTagLen = endTag.length;

  let componenetsString = '';
  let id = 0; // demo 的 id
  let output = []; // 输出的内容
  let start = 0; // 字符串开始位置

  let commentStart = content.indexOf(startTag);
  let commentEnd = content.indexOf(endTag, commentStart + startTagLen);
  while (commentStart !== -1 && commentEnd !== -1) {
    output.push(content.slice(start, commentStart));

    const commentContent = content.slice(commentStart + startTagLen, commentEnd);
    const html = stripTemplate(commentContent);
    const script = stripScript(commentContent);
    let demoComponentContent = genInlineComponentText(html, script);
    const demoComponentName = `element-demo${id}`;
    output.push(`<template slot="source"><${demoComponentName} /></template>`);
    componenetsString += `${JSON.stringify(demoComponentName)}: ${demoComponentContent},`;

    // 重新计算下一次的位置
    id++;
    start = commentEnd + endTagLen;
    commentStart = content.indexOf(startTag, start);
    commentEnd = content.indexOf(endTag, commentStart + startTagLen);
  }

  // 仅允许在 demo 不存在时，才可以在 Markdown 中写 script 标签
  // todo: 优化这段逻辑
  let pageScript = '';
  if (componenetsString) {
    pageScript = `<script>
      export default {
        name: 'component-doc',
        components: {
          ${componenetsString}
        }
      }
    </script>`;
  } else if (content.indexOf('<script>') === 0) { // 硬编码，有待改善
    start = content.indexOf('</script>') + '</script>'.length;
    pageScript = content.slice(0, start);
  }

  output.push(content.slice(start));
  // 返回一个模板字符串
  return `
    <template>
      <section class="content element-doc">
        ${output.join('')}
      </section>
    </template>
    ${pageScript}
  `;
};
