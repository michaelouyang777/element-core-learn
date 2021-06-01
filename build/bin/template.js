/**
 * 文件说明：
 * 监听change事件，执行`npm run i18n`命令（即`node build/bin/i18n.js`）
 */

const path = require('path');
// 读取模板文件夹
const templates = path.resolve(process.cwd(), './examples/pages/template');

// 引入观察者工具库
const chokidar = require('chokidar');
// 获取监听对象
let watcher = chokidar.watch([templates]);
// 监听ready事件
watcher.on('ready', function() {
  // 监听change事件
  watcher
    .on('change', function() {
      // 执行`npm run i18n`命令
      exec('npm run i18n');
    });
});

function exec(cmd) {
  // 引入子进程，同步执行传入的命令
  return require('child_process').execSync(cmd).toString().trim();
}
