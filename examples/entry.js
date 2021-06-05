import Vue from 'vue';
// 引入app.vue作为全局容器的主组件
import entry from './app';
import VueRouter from 'vue-router';
// 引入element
import Element from 'main/index.js';
import hljs from 'highlight.js';
// 路由配置
import routes from './route.config';
// 引入demo项目的一些布局组件
import demoBlock from './components/demo-block';
import MainFooter from './components/footer';
import MainHeader from './components/header';
import SideNav from './components/side-nav';
import FooterNav from './components/footer-nav';
import title from './i18n/title';

// 引入全局样式入口文件
import 'packages/theme-chalk/src/index.scss';
// 引入demo样式入口文件
import './demo-styles/index.scss';
// 引入公共样式
import './assets/styles/common.css';
// 引入字体
import './assets/styles/fonts/style.css';
import icon from './icon.json';

// 全局导入element
Vue.use(Element);
Vue.use(VueRouter);
// 全局注册布局组件
Vue.component('demo-block', demoBlock);
Vue.component('main-footer', MainFooter);
Vue.component('main-header', MainHeader);
Vue.component('side-nav', SideNav);
Vue.component('footer-nav', FooterNav);

const globalEle = new Vue({
  data: { $isEle: false } // 是否 ele 用户
});

Vue.mixin({
  computed: {
    $isEle: {
      get: () => (globalEle.$data.$isEle),
      set: (data) => {globalEle.$data.$isEle = data;}
    }
  }
});

Vue.prototype.$icon = icon; // Icon 列表页用

// 路由配置
const router = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes
});

router.afterEach(route => {
  // https://github.com/highlightjs/highlight.js/issues/909#issuecomment-131686186
  Vue.nextTick(() => {
    const blocks = document.querySelectorAll('pre code:not(.hljs)');
    Array.prototype.forEach.call(blocks, hljs.highlightBlock);
  });
  const data = title[route.meta.lang];
  for (let val in data) {
    if (new RegExp('^' + val, 'g').test(route.name)) {
      document.title = data[val];
      return;
    }
  }
  document.title = 'Element';
  ga('send', 'event', 'PageView', route.name);
});

new Vue({ // eslint-disable-line
  ...entry,
  router
}).$mount('#app');
