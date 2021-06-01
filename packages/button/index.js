/**
 * 文件说明：
 * 引入组件。
 * 配置成vue插件。为组件提供install方法
 * 导出插件。让Vue可以通过Vue.use(ElButton)引入插件。
 */
import ElButton from './src/button';

/* istanbul ignore next */
ElButton.install = function(Vue) {
  // 注册全局组件
  Vue.component(ElButton.name, ElButton);
};

export default ElButton;
