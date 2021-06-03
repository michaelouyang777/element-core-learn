// 广播
function broadcast(componentName, eventName, params) {
  // 遍历子组件
  this.$children.forEach(child => {
    // 组件名
    var name = child.$options.componentName;

    if (name === componentName) {
      // 触发事件
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      // 执行broadcast方法
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
export default {
  methods: {
    // dispatch 方法向上获取父级组件并触发 eventName 事件
    dispatch(componentName, eventName, params) {
      // 父级组件及其组件名
      var parent = this.$parent || this.$root;
      var name = parent.$options.componentName;

      // 有父级组件 同时 没有name 或者 name 不等于组件名
      while (parent && (!name || name !== componentName)) {
        // parent 向上获取父级组件
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }
      // 触发 eventName 事件
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    // broadcast 方法向下遍历子组件触发 eventName 事件
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};
