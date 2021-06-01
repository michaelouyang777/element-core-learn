<template>
  <button
    class="el-button"
    @click="handleClick"
    :disabled="buttonDisabled || loading"
    :autofocus="autofocus"
    :type="nativeType"
    :class="[
      type ? 'el-button--' + type : '',
      buttonSize ? 'el-button--' + buttonSize : '',
      {
        'is-disabled': buttonDisabled,
        'is-loading': loading,
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle
      }
    ]"
  >
    <!-- 按钮内部的加载动图 -->
    <i class="el-icon-loading" v-if="loading"></i>
    <!-- 按钮图标 -->
    <i :class="icon" v-if="icon && !loading"></i>
    <!-- 默认插槽 -->
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>
<script>
  export default {
    name: 'ElButton',
    // 接收父级组件传递下来的数据（elementUI内部使用provide/inject作为父子组件的通讯方式）
    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },
    // 定义可以传入的属性（elementUI使用props/$emit作为对外组件通讯的方式）
    props: {
      // 类型【primary / success / warning / danger / info / text】
      type: {
        type: String,
        default: 'default'
      },
      // 尺寸【medium / small / mini】
      size: String,
      // 图标类名
      icon: {
        type: String,
        default: ''
      },
      // 原生type属性【button / submit / reset】
      nativeType: {
        type: String,
        default: 'button'
      },
      // 是否加载中状态
      loading: Boolean,
      // 是否禁用状态
      disabled: Boolean,
      // 是否朴素按钮
      plain: Boolean,
      // 是否默认聚焦
      autofocus: Boolean,
      // 是否圆角按钮
      round: Boolean,
      // 是否圆形按钮
      circle: Boolean
    },

    computed: {
      // elFormItem 尺寸获取
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      // 按钮尺寸计算
      buttonSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      // 是否禁用
      buttonDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      }
    },

    methods: {
      // 抛出点击事件
      handleClick(evt) {
        this.$emit('click', evt);
      }
    }
  };
</script>
