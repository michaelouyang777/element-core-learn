/**
 * 文件说明：
 * 引入组件。
 * 配置成vue插件。为组件提供install方法
 * 导出插件。让Vue可以通过Vue.use()引入插件。
 */
import Radio from './src/radio';

/* istanbul ignore next */
Radio.install = function(Vue) {
  // 注册全局组件
  Vue.component(Radio.name, Radio);
};

export default Radio;
