<template>
  <div
    class="el-select"
    :class="[selectSize ? 'el-select--' + selectSize : '']"
    @click.stop="toggleMenu"
    v-clickoutside="handleClose">
    <div
      class="el-select__tags"
      v-if="multiple"
      ref="tags"
      :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%' }">
      <span v-if="collapseTags && selected.length">
        <el-tag
          :closable="!selectDisabled"
          :size="collapseTagSize"
          :hit="selected[0].hitState"
          type="info"
          @close="deleteTag($event, selected[0])"
          disable-transitions>
          <span class="el-select__tags-text">{{ selected[0].currentLabel }}</span>
        </el-tag>
        <el-tag
          v-if="selected.length > 1"
          :closable="false"
          :size="collapseTagSize"
          type="info"
          disable-transitions>
          <span class="el-select__tags-text">+ {{ selected.length - 1 }}</span>
        </el-tag>
      </span>
      <transition-group @after-leave="resetInputHeight" v-if="!collapseTags">
        <el-tag
          v-for="item in selected"
          :key="getValueKey(item)"
          :closable="!selectDisabled"
          :size="collapseTagSize"
          :hit="item.hitState"
          type="info"
          @close="deleteTag($event, item)"
          disable-transitions>
          <span class="el-select__tags-text">{{ item.currentLabel }}</span>
        </el-tag>
      </transition-group>

      <input
        type="text"
        class="el-select__input"
        :class="[selectSize ? `is-${ selectSize }` : '']"
        :disabled="selectDisabled"
        :autocomplete="autoComplete || autocomplete"
        @focus="handleFocus"
        @blur="softFocus = false"
        @keyup="managePlaceholder"
        @keydown="resetInputState"
        @keydown.down.prevent="navigateOptions('next')"
        @keydown.up.prevent="navigateOptions('prev')"
        @keydown.enter.prevent="selectOption"
        @keydown.esc.stop.prevent="visible = false"
        @keydown.delete="deletePrevTag"
        @keydown.tab="visible = false"
        @compositionstart="handleComposition"
        @compositionupdate="handleComposition"
        @compositionend="handleComposition"
        v-model="query"
        @input="debouncedQueryChange"
        v-if="filterable"
        :style="{ 'flex-grow': '1', width: inputLength / (inputWidth - 32) + '%', 'max-width': inputWidth - 42 + 'px' }"
        ref="input">
    </div>
    <el-input
      ref="reference"
      v-model="selectedLabel"
      type="text"
      :placeholder="currentPlaceholder"
      :name="name"
      :id="id"
      :autocomplete="autoComplete || autocomplete"
      :size="selectSize"
      :disabled="selectDisabled"
      :readonly="readonly"
      :validate-event="false"
      :class="{ 'is-focus': visible }"
      :tabindex="(multiple && filterable) ? '-1' : null"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup.native="debouncedOnInputChange"
      @keydown.native.down.stop.prevent="navigateOptions('next')"
      @keydown.native.up.stop.prevent="navigateOptions('prev')"
      @keydown.native.enter.prevent="selectOption"
      @keydown.native.esc.stop.prevent="visible = false"
      @keydown.native.tab="visible = false"
      @paste.native="debouncedOnInputChange"
      @mouseenter.native="inputHovering = true"
      @mouseleave.native="inputHovering = false">
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="suffix">
        <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]"></i>
        <!-- 清空按钮 -->
        <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close" @click="handleClearClick"></i>
      </template>
    </el-input>
    <transition
      name="el-zoom-in-top"
      @before-enter="handleMenuEnter"
      @after-leave="doDestroy">
      <el-select-menu
        ref="popper"
        :append-to-body="popperAppendToBody"
        v-show="visible && emptyText !== false">
        <el-scrollbar
          tag="ul"
          wrap-class="el-select-dropdown__wrap"
          view-class="el-select-dropdown__list"
          ref="scrollbar"
          :class="{ 'is-empty': !allowCreate && query && filteredOptionsCount === 0 }"
          v-show="options.length > 0 && !loading">
          <el-option
            :value="query"
            created
            v-if="showNewOption">
          </el-option>
          <slot></slot>
        </el-scrollbar>
        <template v-if="emptyText && (!allowCreate || loading || (allowCreate && options.length === 0 ))">
          <slot name="empty" v-if="$slots.empty"></slot>
          <p class="el-select-dropdown__empty" v-else>
            {{ emptyText }}
          </p>
        </template>
      </el-select-menu>
    </transition>
  </div>
</template>

<script type="text/babel">
  import Emitter from 'element-ui/src/mixins/emitter';
  import Focus from 'element-ui/src/mixins/focus';
  import Locale from 'element-ui/src/mixins/locale';
  import ElInput from 'element-ui/packages/input';
  import ElSelectMenu from './select-dropdown.vue';
  import ElOption from './option.vue';
  import ElTag from 'element-ui/packages/tag';
  import ElScrollbar from 'element-ui/packages/scrollbar';
  import debounce from 'throttle-debounce/debounce';
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  import scrollIntoView from 'element-ui/src/utils/scroll-into-view';
  import { getValueByPath, valueEquals, isIE, isEdge } from 'element-ui/src/utils/util';
  import NavigationMixin from './navigation-mixin';
  import { isKorean } from 'element-ui/src/utils/shared';

  export default {
    mixins: [Emitter, Locale, Focus('reference'), NavigationMixin],

    name: 'ElSelect',

    componentName: 'ElSelect',

    inject: {
      elForm: {
        default: ''
      },

      elFormItem: {
        default: ''
      }
    },

    provide() {
      return {
        'select': this
      };
    },

    computed: {
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },

      readonly() {
        return !this.filterable || this.multiple || (!isIE() && !isEdge() && !this.visible);
      },

      showClose() {
        let hasValue = this.multiple
          ? Array.isArray(this.value) && this.value.length > 0
          : this.value !== undefined && this.value !== null && this.value !== '';
          // 是否开启clearable
        let criteria = this.clearable &&
          // 不是禁用状态
          !this.selectDisabled &&
          // 在hover状态
          this.inputHovering &&
          // 是否有值
          hasValue;
        return criteria;
      },

      iconClass() {
        return this.remote && this.filterable ? '' : (this.visible ? 'arrow-up is-reverse' : 'arrow-up');
      },

      debounce() {
        return this.remote ? 300 : 0;
      },

      emptyText() {
        if (this.loading) {
          return this.loadingText || this.t('el.select.loading');
        } else {
          if (this.remote && this.query === '' && this.options.length === 0) return false;
          if (this.filterable && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
            return this.noMatchText || this.t('el.select.noMatch');
          }
          if (this.options.length === 0) {
            return this.noDataText || this.t('el.select.noData');
          }
        }
        return null;
      },

      showNewOption() {
        let hasExistingOption = this.options.filter(option => !option.created)
          .some(option => option.currentLabel === this.query);
        return this.filterable && this.allowCreate && this.query !== '' && !hasExistingOption;
      },

      selectSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },

      selectDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },

      collapseTagSize() {
        return ['small', 'mini'].indexOf(this.selectSize) > -1
          ? 'mini'
          : 'small';
      },
      propPlaceholder() {
        return typeof this.placeholder !== 'undefined' ? this.placeholder : this.t('el.select.placeholder');
      }
    },

    components: {
      ElInput,
      ElSelectMenu,
      ElOption,
      ElTag,
      ElScrollbar
    },

    directives: { Clickoutside },

    props: {
      name: String,
      id: String,
      value: {
        required: true
      },
      autocomplete: {
        type: String,
        default: 'off'
      },
      /** @Deprecated in next major version */
      autoComplete: {
        type: String,
        validator(val) {
          process.env.NODE_ENV !== 'production' &&
            console.warn('[Element Warn][Select]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.');
          return true;
        }
      },
      automaticDropdown: Boolean,
      size: String,
      disabled: Boolean,
      clearable: Boolean,
      filterable: Boolean,
      allowCreate: Boolean,
      loading: Boolean,
      popperClass: String,
      remote: Boolean,
      loadingText: String,
      noMatchText: String,
      noDataText: String,
      remoteMethod: Function,
      filterMethod: Function,
      multiple: Boolean,
      multipleLimit: {
        type: Number,
        default: 0
      },
      placeholder: {
        type: String,
        required: false
      },
      defaultFirstOption: Boolean,
      reserveKeyword: Boolean,
      valueKey: {
        type: String,
        default: 'value'
      },
      collapseTags: Boolean,
      popperAppendToBody: {
        type: Boolean,
        default: true
      }
    },

    data() {
      return {
        options: [],
        cachedOptions: [],
        createdLabel: null,
        createdSelected: false,
        selected: this.multiple ? [] : {},
        inputLength: 20,
        inputWidth: 0,
        initialInputHeight: 0,
        cachedPlaceHolder: '',
        optionsCount: 0,
        filteredOptionsCount: 0,
        visible: false,
        softFocus: false,
        selectedLabel: '',
        hoverIndex: -1,
        query: '',
        previousQuery: null,
        inputHovering: false,
        currentPlaceholder: '',
        menuVisibleOnFocus: false,
        isOnComposition: false,
        isSilentBlur: false
      };
    },

    watch: {
      selectDisabled() {
        this.$nextTick(() => {
          this.resetInputHeight();
        });
      },

      propPlaceholder(val) {
        this.cachedPlaceHolder = this.currentPlaceholder = val;
      },

      value(val, oldVal) {
        // 多选
        if (this.multiple) {
          // 需要动态调整输入框高度
          this.resetInputHeight();
          if ((val && val.length > 0) || (this.$refs.input && this.query !== '')) {
            this.currentPlaceholder = '';
          } 
          // 没有值的时候，placeholder 需要还原
          else {
            this.currentPlaceholder = this.cachedPlaceHolder;
          }
          // 如果不保存当前的搜索关键词就清空输入框里输过的文字
          if (this.filterable && !this.reserveKeyword) {
            this.query = '';
            this.handleQueryChange(this.query);
          }
        }
        this.setSelected();
        if (this.filterable && !this.multiple) {
          this.inputLength = 20;
        }
        // 触发表单的 change 事件
        if (!valueEquals(val, oldVal)) {
          this.dispatch('ElFormItem', 'el.form.change', val);
        }
      },
      // 监听 visible 的变化，用来显示下拉框选择的选项
      visible(val) {
        // visible 为 false 时，下拉框不可见
        if (!val) {
          // 通知父组件销毁下拉框
          this.broadcast('ElSelectDropdown', 'destroyPopper');
          // 使可输入的输入框失去焦点
          if (this.$refs.input) {
            this.$refs.input.blur();
          }
          // 将这些变量都变成初始化时候的值
          this.query = '';
          this.previousQuery = null;
          this.selectedLabel = '';
          this.inputLength = 20;
          this.menuVisibleOnFocus = false;
          this.resetHoverIndex();
          
          // 更新 placeholder
          this.$nextTick(() => {
            if (this.$refs.input &&
              this.$refs.input.value === '' &&
              this.selected.length === 0) {
              this.currentPlaceholder = this.cachedPlaceHolder;
            }
          });
          
          // 单选时
          if (!this.multiple) {
            // 如果有选中的选项
            if (this.selected) {
              if (this.filterable && this.allowCreate &&
                this.createdSelected && this.createdLabel) {
                this.selectedLabel = this.createdLabel;
              } else {
                // 将输入框里显示的文字变成选择的那一项
                this.selectedLabel = this.selected.currentLabel;
              }
              if (this.filterable) this.query = this.selectedLabel;
            }
            // 如果开启了搜索但是没有选中的，复原 placeholder
            if (this.filterable) {
              this.currentPlaceholder = this.cachedPlaceHolder;
            }
          }

        } 
        // visible 为 true 时
        else {
          this.broadcast('ElSelectDropdown', 'updatePopper');
          if (this.filterable) {
            this.query = this.remote ? '' : this.selectedLabel;
            this.handleQueryChange(this.query);
            // 如果是多选就要聚焦 `可以输入的输入框`
            if (this.multiple) {
              this.$refs.input.focus();
            } 
            // 不是多选
            else {
              if (!this.remote) {
                this.broadcast('ElOption', 'queryChange', '');
                this.broadcast('ElOptionGroup', 'queryChange');
              }
              // 将已经选择的文字变成 placeholder，然后清空输入框
              if (this.selectedLabel) {
                this.currentPlaceholder = this.selectedLabel;
                this.selectedLabel = '';
              }
            }
          }
        }
        // 下拉框出现/隐藏时触发 visible-change 事件
        this.$emit('visible-change', val);
      },

      options() {
        if (this.$isServer) return;
        this.$nextTick(() => {
          this.broadcast('ElSelectDropdown', 'updatePopper');
        });
        if (this.multiple) {
          this.resetInputHeight();
        }
        let inputs = this.$el.querySelectorAll('input');
        if ([].indexOf.call(inputs, document.activeElement) === -1) {
          this.setSelected();
        }
        if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
          this.checkDefaultFirstOption();
        }
      }
    },

    methods: {
      // 【事件】处理 composition 事件，主要是解决不同输入法之间的差异
      handleComposition(event) {
        const text = event.target.value;
        if (event.type === 'compositionend') {
          this.isOnComposition = false;
          this.$nextTick(_ => this.handleQueryChange(text));
        } else {
          const lastCharacter = text[text.length - 1] || '';
          this.isOnComposition = !isKorean(lastCharacter);
        }
      },

      // 【事件】处理输入查询内容发生的变化
      handleQueryChange(val) {
        // 如果查询出来的或者正在输入就不往下执行
        if (this.previousQuery === val || this.isOnComposition) return;
        if (
          this.previousQuery === null &&
          (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')
        ) {
          // 将查询的内容先存储起来
          this.previousQuery = val;
          return;
        }
        this.previousQuery = val;
        // 通知下拉框组件更新
        this.$nextTick(() => {
          if (this.visible) this.broadcast('ElSelectDropdown', 'updatePopper');
        });
        this.hoverIndex = -1;

        // 多选和可搜索同时启用时
        if (this.multiple && this.filterable) {
          this.$nextTick(() => {
            // this.$refs.input 是可以输入的输入框
            // 多选标记的数字长度是 35
            const length = this.$refs.input.value.length * 15 + 20;
            // 如果输入的超过两个字符，那么就固定长度为 50
            this.inputLength = this.collapseTags ? Math.min(50, length) : length;
            this.managePlaceholder();
            this.resetInputHeight();
          });
        }

        // 远程搜索
        if (this.remote && typeof this.remoteMethod === 'function') {
          this.hoverIndex = -1;
          this.remoteMethod(val);
        } 
        // 如果使用了 自定义的搜索逻辑 
        else if (typeof this.filterMethod === 'function') {
          // 执行搜索逻辑
          this.filterMethod(val);
          this.broadcast('ElOptionGroup', 'queryChange');
        } else {
          this.filteredOptionsCount = this.optionsCount;
          this.broadcast('ElOption', 'queryChange', val);
          this.broadcast('ElOptionGroup', 'queryChange');
        }
        // 开启 在输入框按下回车，选择第一个匹配项 的功能
        // 并且当前列表项中有匹配的项时
        if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
          this.checkDefaultFirstOption();
        }
      },

      // 【工具】使选中项能够出现在下拉框的可视区域，通常出现在最后一个
      scrollToOption(option) {
        // 获取 option 的根元素 <li> 标签
        const target = Array.isArray(option) && option[0] ? option[0].$el : option.$el;
        if (this.$refs.popper && target) {
          // menu 就是包裹着滚动元素的 div
          const menu = this.$refs.popper.$el.querySelector('.el-select-dropdown__wrap');
          // 滚动到可视区域
          scrollIntoView(menu, target);
        }
        // 执行滚动方法
        this.$refs.scrollbar && this.$refs.scrollbar.handleScroll();
      },

      // 【功能函数】在动画开始之前执行
      // 使选中项能够出现在下拉框的可视区域
      handleMenuEnter() {
        this.$nextTick(() => this.scrollToOption(this.selected));
      },

      // 【事件】触发 change 事件
      emitChange(val) {
        if (!valueEquals(this.value, val)) {
          // 选中值发生变化时触发
          this.$emit('change', val);
        }
      },

      // 【工具】通过传入的 value 获取到它的 option
      getOption(value) {
        let option;
        const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
        const isNull = Object.prototype.toString.call(value).toLowerCase() === '[object null]';
        const isUndefined = Object.prototype.toString.call(value).toLowerCase() === '[object undefined]';

        for (let i = this.cachedOptions.length - 1; i >= 0; i--) {
          const cachedOption = this.cachedOptions[i];
          const isEqual = isObject
            ? getValueByPath(cachedOption.value, this.valueKey) === getValueByPath(value, this.valueKey)
            : cachedOption.value === value;
          if (isEqual) {
            option = cachedOption;
            break;
          }
        }
        if (option) return option;
        const label = (!isObject && !isNull && !isUndefined)
          ? value : '';
        let newOption = {
          value: value,
          currentLabel: label
        };
        if (this.multiple) {
          newOption.hitState = false;
        }
        return newOption;
      },

      // 【工具】设置被选中的选项
      setSelected() {
        // 如果是单选
        // 将选中的那一项的文字设置为输入框里显示的文字
        if (!this.multiple) {
          let option = this.getOption(this.value);
          if (option.created) {
            this.createdLabel = option.currentLabel;
            this.createdSelected = true;
          } else {
            this.createdSelected = false;
          }
          this.selectedLabel = option.currentLabel;
          this.selected = option;
          if (this.filterable) this.query = this.selectedLabel;
          return;
        }
        // 如果是多选的话就需要将所有选择的放进 selected 数组里
        let result = [];
        if (Array.isArray(this.value)) {
          this.value.forEach(value => {
            result.push(this.getOption(value));
          });
        }
        this.selected = result;
        this.$nextTick(() => {
          this.resetInputHeight();
        });
      },

      // 【事件】聚焦事件处理函数
      handleFocus(event) {
        if (!this.softFocus) {
          if (this.automaticDropdown || this.filterable) {
            this.visible = true;
            if (this.filterable) {
              this.menuVisibleOnFocus = true;
            }
          }
          // 当 input 获得焦点时触发
          this.$emit('focus', event);
        } else {
          this.softFocus = false;
        }
      },

      // 【事件】使 el-input 失去焦点
      blur() {
        this.visible = false;
        this.$refs.reference.blur();
      },

      // 【事件】失去焦点的事件处理函数
      handleBlur(event) {
        setTimeout(() => {
          if (this.isSilentBlur) {
            this.isSilentBlur = false;
          } else {
            this.$emit('blur', event);
          }
        }, 50);
        this.softFocus = false;
      },

      // 【事件】点击清空按钮你的事件处理函数
      handleClearClick(event) {
        this.deleteSelected(event);
      },

      // 【功能函数】在下拉框动画结束的时候销毁它
      doDestroy() {
        this.$refs.popper && this.$refs.popper.doDestroy();
      },

      // 【工具】点击的地方不在组件身上，直接关闭下拉框
      handleClose() {
        this.visible = false;
      },

      // 【工具】如果在输入框中有多个 tag
      // 切换最后一个 tag 的边框（要么加上要么去掉）
      // 返回的是有没有加上边框
      toggleLastOptionHitState(hit) {
        if (!Array.isArray(this.selected)) return;
        const option = this.selected[this.selected.length - 1];
        if (!option) return;

        if (hit === true || hit === false) {
          option.hitState = hit;
          return hit;
        }

        option.hitState = !option.hitState;
        return option.hitState;
      },

      // 【功能函数】在输入框按下 delete 键时，删除光标前面的一个 tag
      deletePrevTag(e) {
        if (e.target.value.length <= 0 && !this.toggleLastOptionHitState()) {
          const value = this.value.slice();
          value.pop();
          this.$emit('input', value);
          this.emitChange(value);
        }
      },

      // 【工具】管理占位符
      managePlaceholder() {
        if (this.currentPlaceholder !== '') {
          this.currentPlaceholder = this.$refs.input.value ? '' : this.cachedPlaceHolder;
        }
      },

      // 【工具】重新设置输入框的状态
      resetInputState(e) {
        if (e.keyCode !== 8) this.toggleLastOptionHitState(false);
        this.inputLength = this.$refs.input.value.length * 15 + 20;
        this.resetInputHeight();
      },

      // 【工具】重新设置 input 的高度
      resetInputHeight() {
        if (this.collapseTags && !this.filterable) return;
        this.$nextTick(() => {
          if (!this.$refs.reference) return;
          let inputChildNodes = this.$refs.reference.$el.childNodes;
          let input = [].filter.call(inputChildNodes, item => item.tagName === 'INPUT')[0];
          const tags = this.$refs.tags;
          const sizeInMap = this.initialInputHeight || 40;
          input.style.height = this.selected.length === 0
            ? sizeInMap + 'px'
            : Math.max(
              tags ? (tags.clientHeight + (tags.clientHeight > sizeInMap ? 6 : 0)) : 0,
              sizeInMap
            ) + 'px';
          if (this.visible && this.emptyText !== false) {
            this.broadcast('ElSelectDropdown', 'updatePopper');
          }
        });
      },

      // 【工具】重新设置 hover 状态
      resetHoverIndex() {
        setTimeout(() => {
          if (!this.multiple) {
            this.hoverIndex = this.options.indexOf(this.selected);
          } else {
            if (this.selected.length > 0) {
              this.hoverIndex = Math.min.apply(null, this.selected.map(item => this.options.indexOf(item)));
            } else {
              this.hoverIndex = -1;
            }
          }
        }, 300);
      },

      // 【事件】点击列表项的时候触发的事件处理函数
      handleOptionSelect(option, byClick) {
        if (this.multiple) {
          const value = (this.value || []).slice();
          const optionIndex = this.getValueIndex(value, option.value);
          // 如果已经存在于 value 里面，那么点击的时候就移除它
          if (optionIndex > -1) {
            value.splice(optionIndex, 1);
          } 
          // 没找到
          // 如果不限制用户选中的数量
          // 就往 value 里添加当前点击的列表项的值
          else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
            value.push(option.value);
          }
          this.$emit('input', value);
          this.emitChange(value);
          // 如果当前项是创建出来的
          // 那么点击完之后将一些属性重置
          if (option.created) {
            this.query = '';
            this.handleQueryChange('');
            this.inputLength = 20;
          }
          if (this.filterable) this.$refs.input.focus();
        } 
        // 单选情况下，点击了一个列表项就要隐藏下拉框
        else {
          // 将 option.value 的值通过 input 事件发送出去
          this.$emit('input', option.value);
          // 向外抛出 change 事件，并把所选的值传入
          this.emitChange(option.value);
          // 隐藏下拉框
          this.visible = false;
        }
        this.isSilentBlur = byClick;
        this.setSoftFocus();
        if (this.visible) return;
        // 在点击完之后将选中的那一项滚动到下拉框可视区域的最后一个
        this.$nextTick(() => {
          this.scrollToOption(option);
        });
      },

      // 【事件】使输入框聚焦（el-input 或者 原生input）
      setSoftFocus() {
        this.softFocus = true;
        const input = this.$refs.input || this.$refs.reference;
        if (input) {
          input.focus();
        }
      },

      // 【工具】获取指定值在数组中的索引
      getValueIndex(arr = [], value) {
        const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
        if (!isObject) {
          return arr.indexOf(value);
        } else {
          const valueKey = this.valueKey;
          let index = -1;
          arr.some((item, i) => {
            if (getValueByPath(item, valueKey) === getValueByPath(value, valueKey)) {
              index = i;
              return true;
            }
            return false;
          });
          return index;
        }
      },

      // 【功能函数】点击 select 组件时触发
      toggleMenu() {
        // 不是的禁用状态，并且不是只读状态，才可以操作
        if (!this.selectDisabled) {
          if (this.menuVisibleOnFocus) {
            this.menuVisibleOnFocus = false;
          } else {
            this.visible = !this.visible;
          }
          // 如果展示option，则input为聚焦状态
          if (this.visible) {
            (this.$refs.input || this.$refs.reference).focus();
          }
        }
      },

      // 【功能函数】选中 hover 状态下的那一项
      selectOption() {
        if (!this.visible) {
          this.toggleMenu();
        } else {
          if (this.options[this.hoverIndex]) {
            this.handleOptionSelect(this.options[this.hoverIndex]);
          }
        }
      },

      // 【事件】删除已经选中的列表项
      deleteSelected(event) {
        event.stopPropagation();
        // 取空值
        const value = this.multiple ? [] : '';
        // 向外抛出 input 事件，将空值传入
        this.$emit('input', value);
        // 向外抛出 change 事件，并把空值传入
        this.emitChange(value);
        // 隐藏 option 选项
        this.visible = false;
        // 向外抛出 clear 事件
        this.$emit('clear');
      },

      // 【功能函数】删除 tag 标签
      // 点击 tag 上的删除按钮时触发
      // event 原生事件对象
      // tag 要删除的标签
      deleteTag(event, tag) {
        let index = this.selected.indexOf(tag);
        if (index > -1 && !this.selectDisabled) {
          const value = this.value.slice();
          value.splice(index, 1);
          this.$emit('input', value);
          this.emitChange(value);
          this.$emit('remove-tag', tag.value);
        }
        event.stopPropagation();
      },

      // 【事件】结合防抖，处理输入框的input事件
      onInputChange() {
        if (this.filterable && this.query !== this.selectedLabel) {
          this.query = this.selectedLabel;
          this.handleQueryChange(this.query);
        }
      },

      // 【功能函数】当某一个 选项 需要销毁的时候执行
      // 具体在 option 组件里触发的
      onOptionDestroy(index) {
        if (index > -1) {
          this.optionsCount--;
          this.filteredOptionsCount--;
          this.options.splice(index, 1);
        }
      },

      // 【工具】重新设置 input 的宽度
      resetInputWidth() {
        this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
      },

      // 【事件】处理 resize 事件
      handleResize() {
        this.resetInputWidth();
        if (this.multiple) this.resetInputHeight();
      },

      // 【功能函数】高亮某一个选项，将它变成 hover 的状态
      checkDefaultFirstOption() {
        this.hoverIndex = -1;
        // highlight the created option
        let hasCreated = false;
        for (let i = this.options.length - 1; i >= 0; i--) {
          if (this.options[i].created) {
            hasCreated = true;
            this.hoverIndex = i;
            break;
          }
        }
        if (hasCreated) return;
        for (let i = 0; i !== this.options.length; ++i) {
          const option = this.options[i];
          if (this.query) {
            // highlight first options that passes the filter
            if (!option.disabled && !option.groupDisabled && option.visible) {
              this.hoverIndex = i;
              break;
            }
          } else {
            // highlight currently selected option
            if (option.itemSelected) {
              this.hoverIndex = i;
              break;
            }
          }
        }
      },

      // 【工具】获取指定的属性值
      getValueKey(item) {
        if (Object.prototype.toString.call(item.value).toLowerCase() !== '[object object]') {
          return item.value;
        } else {
          return getValueByPath(item.value, this.valueKey);
        }
      }
    },

    created() {
      this.cachedPlaceHolder = this.currentPlaceholder = this.propPlaceholder;
      if (this.multiple && !Array.isArray(this.value)) {
        this.$emit('input', []);
      }
      if (!this.multiple && Array.isArray(this.value)) {
        this.$emit('input', '');
      }

      this.debouncedOnInputChange = debounce(this.debounce, () => {
        this.onInputChange();
      });

      this.debouncedQueryChange = debounce(this.debounce, (e) => {
        this.handleQueryChange(e.target.value);
      });

      this.$on('handleOptionClick', this.handleOptionSelect);
      this.$on('setSelected', this.setSelected);
    },

    mounted() {
      if (this.multiple && Array.isArray(this.value) && this.value.length > 0) {
        this.currentPlaceholder = '';
      }
      addResizeListener(this.$el, this.handleResize);

      const reference = this.$refs.reference;
      if (reference && reference.$el) {
        const sizeMap = {
          medium: 36,
          small: 32,
          mini: 28
        };
        const input = reference.$el.querySelector('input');
        this.initialInputHeight = input.getBoundingClientRect().height || sizeMap[this.selectSize];
      }
      if (this.remote && this.multiple) {
        this.resetInputHeight();
      }
      this.$nextTick(() => {
        if (reference && reference.$el) {
          this.inputWidth = reference.$el.getBoundingClientRect().width;
        }
      });
      this.setSelected();
    },

    beforeDestroy() {
      if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize);
    }
  };
</script>
