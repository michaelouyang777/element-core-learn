'use strict';
/**
 * 文件说明：
 * 将./packages/theme-chalk/src/icon.scss'中的满足一定规则的（.el-icon-success:before）选择器的名字（'success'）组成一个数组，
 * 写入'./examples/icon.json'这个文件中
 */

var postcss = require('postcss');
var fs = require('fs');
var path = require('path');
var fontFile = fs.readFileSync(path.resolve(__dirname, '../../packages/theme-chalk/src/icon.scss'), 'utf8');
var nodes = postcss.parse(fontFile).nodes;
var classList = [];

nodes.forEach((node) => {
  var selector = node.selector || '';
  var reg = new RegExp(/\.el-icon-([^:]+):before/);
  var arr = selector.match(reg);

  if (arr && arr[1]) {
    classList.push(arr[1]);
  }
});

classList.reverse(); // 希望按 css 文件顺序倒序排列

// 将 classList 这个数组转成字符串，然后写入 ./examples/icon.json 这个文件中
fs.writeFile(path.resolve(__dirname, '../../examples/icon.json'), JSON.stringify(classList), () => {});
