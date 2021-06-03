<template>
  <label
    class="el-radio"
    :class="[
      border && radioSize ? 'el-radio--' + radioSize : '',
      { 'is-disabled': isDisabled },
      { 'is-focus': focus },
      { 'is-bordered': border },
      { 'is-checked': model === label }
    ]"
    role="radio"
    :aria-checked="model === label"
    :aria-disabled="isDisabled"
    :tabindex="tabIndex"
    @keydown.space.stop.prevent="model = isDisabled ? model : label"
  >
    <!-- radio 图标 -->
    <span class="el-radio__input"
      :class="{
        'is-disabled': isDisabled,
        'is-checked': model === label
      }"
    >
      <!-- 图标效果 -->
      <span class="el-radio__inner"></span>
      <!-- radio -->
      <input
        ref="radio"
        class="el-radio__original"
        :value="label"
        type="radio"
        aria-hidden="true"
        v-model="model"
        @focus="focus = true"
        @blur="focus = false"
        @change="handleChange"
        :name="name"
        :disabled="isDisabled"
        tabindex="-1"
      >
    </span>
    <!-- 文本内容 -->
    <span class="el-radio__label" @keydown.stop>
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElRadio',
    // 使用mixin扩展组件
    mixins: [Emitter],
    // 接收父级组件传递下来的数据（elementUI内部使用provide/inject作为父子组件的通讯方式）
    inject: {
      elForm: {
        default: ''
      },

      elFormItem: {
        default: ''
      }
    },

    componentName: 'ElRadio',
    // 定义可以传入的属性（elementUI使用props/$emit作为对外组件通讯的方式）
    props: {
      // 绑定值
      value: {},
      // Radio 的 value
      label: {},
      // 是否禁用
      disabled: Boolean,
      // 原生 name 属性
      name: String,
      // 是否显示边框
      border: Boolean,
      // Radio 的尺寸，仅在 border 为真时有效 【medium / small / mini】
      size: String
    },

    data() {
      return {
        focus: false
      };
    },
    computed: {
      // 向上遍历查询父级组件是否有 ElRadioGroup，即是否在按钮组中
      isGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElRadioGroup') {
            parent = parent.$parent;
          } else {
            this._radioGroup = parent;
            return true;
          }
        }
        return false;
      },
      // 重新定义 v-model 绑定内容的 get 和 set
      model: {
        get() {
          return this.isGroup ? this._radioGroup.value : this.value;
        },
        set(val) {
          if (this.isGroup) {
            this.dispatch('ElRadioGroup', 'input', [val]);
          } else {
            this.$emit('input', val);
          }
          this.$refs.radio && (this.$refs.radio.checked = this.model === this.label);
        }
      },
      // elFormItem 尺寸
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      // 计算 radio 尺寸，用于显示带有边框的radio的尺寸大小
      radioSize() {
        const temRadioSize = this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        return this.isGroup
          ? this._radioGroup.radioGroupSize || temRadioSize
          : temRadioSize;
      },
      // 是否禁用，如果radioGroup禁用则按钮禁用。
      isDisabled() {
        return this.isGroup
          ? this._radioGroup.disabled || this.disabled || (this.elForm || {}).disabled
          : this.disabled || (this.elForm || {}).disabled;
      },
      // 标签索引 0 or -1
      tabIndex() {
        return (this.isDisabled || (this.isGroup && this.model !== this.label)) ? -1 : 0;
      }
    },

    methods: {
      // 处理 @change 事件，如果有按钮组，出发按钮组事件。
      handleChange() {
        this.$nextTick(() => {
          this.$emit('change', this.model);
          this.isGroup && this.dispatch('ElRadioGroup', 'handleChange', this.model);
        });
      }
    }
  };
</script>
