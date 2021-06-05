/**
 * 路由配置
 *   对页面路由进行组装，组装成vue-router的route
 */

// 引入nav导航菜单配置
import navConfig from './nav.config';
import langs from './i18n/route';

// 封装对应语言需要加载的组件对象
const LOAD_MAP = {
  'zh-CN': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/zh-CN/${name}.vue`)),
    'zh-CN');
  },
  'en-US': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/en-US/${name}.vue`)),
    'en-US');
  },
  'es': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/es/${name}.vue`)),
    'es');
  },
  'fr-FR': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/fr-FR/${name}.vue`)),
    'fr-FR');
  }
};

/**
 * 【工厂函数】获取到对应的路由组件
 * @param {String} lang 语言
 * @param {String} path 路径
 */
const load = function(lang, path) {
  return LOAD_MAP[lang](path);
};

// 封装对应语言需要加载的doc
const LOAD_DOCS_MAP = {
  'zh-CN': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/zh-CN${path}.md`)),
    'zh-CN');
  },
  'en-US': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/en-US${path}.md`)),
    'en-US');
  },
  'es': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/es${path}.md`)),
    'es');
  },
  'fr-FR': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/fr-FR${path}.md`)),
    'fr-FR');
  }
};

/**
 * 【工厂函数】获取到对应的doc
 * @param {String} lang 语言
 * @param {String} path 路径
 */
const loadDocs = function(lang, path) {
  return LOAD_DOCS_MAP[lang](path);
};

/**
 * 注册路由
 * @param {Object} navConfig 导航配置文件
 */
const registerRoute = (navConfig) => {
  // 定义空数组，用作存放组装后的路由对象
  let route = [];
  // 拿取navConfig的keys作为数组，并遍历。
  Object.keys(navConfig).forEach((lang, index) => {
    // 拿到对应语言包的配置（数组）
    let navs = navConfig[lang];
    // 存入对应路由对象（path、redirect、component、children）给route
    route.push({
      path: `/${ lang }/component`,
      redirect: `/${ lang }/component/installation`,
      component: load(lang, 'component'),
      children: []
    });
    // 遍历已拿到的路由配置（数组）
    navs.forEach(nav => {
      // 如果有href属性就返回
      if (nav.href) return;
      // 如果有groups属性（分组属性），则遍历它
      if (nav.groups) {
        nav.groups.forEach(group => {
          group.list.forEach(nav => {
            addRoute(nav, lang, index);
          });
        });
      } else if (nav.children) { // 如果有children属性（子路由属性），则遍历它
        nav.children.forEach(nav => {
          addRoute(nav, lang, index);
        });
      } else { // 都没有则只有一级，直接添加
        addRoute(nav, lang, index);
      }
    });
  });
  /**
   * 添加子路由对象到对应的父路由对象中
   * @param {*} page  nav.config.json中数组的某一item项
   * @param {*} lang  Object.keys(navConfig)数组的item项——某个语言
   * @param {*} index Object.keys(navConfig)数组的下标
   */
  function addRoute(page, lang, index) {
    // 如果path是changelog则使用load函数，否则使用loadDocs
    const component = page.path === '/changelog'
      ? load(lang, 'changelog')
      : loadDocs(lang, page.path);
    // 定义子路由对象的路由参数（有path、meta、name、component）
    let child = {
      path: page.path.slice(1),
      meta: {
        title: page.title || page.name,
        description: page.description,
        lang
      },
      name: 'component-' + lang + (page.title || page.name),
      component: component.default || component
    };
    // 组装完子路由对象存入对应父路由对象中
    route[index].children.push(child);
  }

  return route;
};

// 根据nav.config.json配置生成route
let route = registerRoute(navConfig);

const generateMiscRoutes = function(lang) {
  let guideRoute = {
    path: `/${ lang }/guide`, // 指南
    redirect: `/${ lang }/guide/design`,
    component: load(lang, 'guide'),
    children: [{
      path: 'design', // 设计原则
      name: 'guide-design' + lang,
      meta: { lang },
      component: load(lang, 'design')
    }, {
      path: 'nav', // 导航
      name: 'guide-nav' + lang,
      meta: { lang },
      component: load(lang, 'nav')
    }]
  };

  let themeRoute = {
    path: `/${ lang }/theme`,
    component: load(lang, 'theme-nav'),
    children: [
      {
        path: '/', // 主题管理
        name: 'theme' + lang,
        meta: { lang },
        component: load(lang, 'theme')
      },
      {
        path: 'preview', // 主题预览编辑
        name: 'theme-preview-' + lang,
        meta: { lang },
        component: load(lang, 'theme-preview')
      }]
  };

  let resourceRoute = {
    path: `/${ lang }/resource`, // 资源
    meta: { lang },
    name: 'resource' + lang,
    component: load(lang, 'resource')
  };

  let indexRoute = {
    path: `/${ lang }`, // 首页
    meta: { lang },
    name: 'home' + lang,
    component: load(lang, 'index')
  };

  return [guideRoute, resourceRoute, themeRoute, indexRoute];
};

langs.forEach(lang => {
  route = route.concat(generateMiscRoutes(lang.lang));
});

route.push({
  path: '/play',
  name: 'play',
  component: require('./play/index.vue')
});

let userLanguage = localStorage.getItem('ELEMENT_LANGUAGE') || window.navigator.language || 'en-US';
let defaultPath = '/en-US';
if (userLanguage.indexOf('zh-') !== -1) {
  defaultPath = '/zh-CN';
} else if (userLanguage.indexOf('es') !== -1) {
  defaultPath = '/es';
} else if (userLanguage.indexOf('fr') !== -1) {
  defaultPath = '/fr-FR';
}

route = route.concat([{
  path: '/',
  redirect: defaultPath
}, {
  path: '*',
  redirect: defaultPath
}]);

export default route;
