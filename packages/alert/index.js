/**
 * 文件说明：
 * 引入组件，然后为组件提供install方法，让Vue可以通过Vue.use(Alert)去使用。
 */

import Alert from './src/main';

// Vue.js 的插件应该暴露一个 install 方法。
// 这个方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象
// https://cn.vuejs.org/v2/guide/plugins.html#%E5%BC%80%E5%8F%91%E6%8F%92%E4%BB%B6
/* istanbul ignore next */
Alert.install = function(Vue) {
  Vue.component(Alert.name, Alert);
};

export default Alert;
