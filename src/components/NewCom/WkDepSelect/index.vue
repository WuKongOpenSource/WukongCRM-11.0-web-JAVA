<template>
  <div
    v-elclickoutside="handleClose"
    ref="reference"
    :class="[disabled ? 'is_disabled' : 'is_valid', { 'is_focus': visible }]"
    wrap="wrap"
    class="wk-dep-select xh-form-border"
    @click="containerClick">

    <div class="el-select__tags">
      <span
        v-for="(item, index) in showSelects"
        :key="index"
        class="user-item text-one-line">{{ item.name }}
        <i
          class="delete-icon el-icon-close"
          @click.stop="deleteDep(index)" />
      </span>
    </div>
    <i v-if="selects.length > max" class="el-icon-more" />
    <i
      :class="['el-icon-arrow-up', { 'is-reverse' : visible}]"/>
    <div
      v-if="selects.length == 0"
      class="user-placeholder text-one-line">{{ placeholder }}</div>

    <transition
      name="el-zoom-in-top"
      @before-enter="handleMenuEnter"
      @after-leave="doDestroy">
      <wk-select-dropdown
        v-show="visible && !disabled"
        ref="popper"
        :append-to-body="popperAppendToBody">
        <el-scrollbar
          ref="scrollbar"
          tag="div">
          <wk-dep
            v-loading="loading"
            v-model="dataValue"
            :options="optionsList"
            :props="props"
            :radio="radio"
            :disabled="disabled"
            :max="limit"
            @change="wkDepChange"
            @close="visible = false" />
        </el-scrollbar>
      </wk-select-dropdown>
    </transition>
  </div>
</template>

<script>
import { depListAPI } from '@/api/common'

import WkSelectDropdown from './src/SelectDropdown.vue'
import WkDep from './src/WkDep.vue'

import Emitter from 'element-ui/lib/mixins/emitter'
import { valueEquals } from 'element-ui/lib/utils/util'
import { objDeepCopy } from '@/utils'

export default {
  name: 'WkDepSelect',

  components: {
    WkSelectDropdown,
    WkDep
  },

  mixins: [Emitter],

  props: {
    radio: Boolean,
    // 展示限制
    max: {
      type: Number,
      default: 2
    },
    props: {
      type: Object,
      default: () => {
        return {
          value: 'id',
          label: 'name'
        }
      }
    },

    // 选择限制
    limit: Number,
    placeholder: {
      type: String,
      default() {
        return '请选择'
      }
    },
    // eslint-disable-next-line vue/require-prop-types
    value: {
      required: true
    },
    // 自定义请求和 参数
    request: Function,
    params: Object,
    options: Array,
    disabled: {
      type: Boolean,
      default: false
    },
    popperAppendToBody: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      visible: false,
      dataValue: [], // 校准传入值
      loading: false,

      optionsList: []
    }
  },

  computed: {
    // 实际展示的数据
    showSelects() {
      if (this.selects && this.selects.length > this.max) {
        return this.selects.slice(0, this.max)
      }
      return this.selects
    },

    // 选择的数据
    selects() {
      if (!this.optionsList.length) {
        return []
      }

      return this.getSelectList()
    }
  },

  watch: {
    visible(val) {
      if (!val) {
        this.broadcast('WkSelectDropdown', 'destroyPopper')
      } else {
        this.broadcast('WkSelectDropdown', 'updatePopper')
      }
      this.$emit('visible-change', val)
    },

    value() {
      this.verifyValue()
    },

    options: {
      handler() {
        this.verifyOptions()
      },
      immediate: true
    },

    /**
     * 更新值
     */
    dataValue(newValue, oldValue) {
      if (!valueEquals(newValue, oldValue)) {
        if (this.radio) {
          this.$emit('input', this.dataValue && this.dataValue.length ? this.dataValue[0] : '')
        } else {
          this.$emit('input', this.dataValue)
        }
      }
    }
  },

  created() {
    this.verifyValue()
  },

  methods: {

    /**
     * 获取展示的数组
     */
    getSelectList() {
      const list = []
      this.recursionOptions(this.optionsList, this.dataValue, list)
      return list
    },

    recursionOptions(options, selects, list) {
      options.forEach(item => {
        if (selects.includes(item[this.props.value])) {
          list.push(item)
        }

        if (item.children) {
          this.recursionOptions(item.children, selects, list)
        }
      })
    },

    /**
     * 处理值逻辑
     */
    verifyValue() {
      // 多选的默认值 校准为数组  单选校准为number
      if (!this.radio && !Array.isArray(this.value)) {
        this.$emit('input', [])
      }

      if (this.radio && (Array.isArray(this.value) || this.value === null || this.value === undefined)) {
        this.$emit('input', '')
      }

      if (this.radio) {
        if (this.value !== this.dataValue) {
          if (this.value) {
            this.dataValue = [parseInt(this.value)]
          } else {
            this.dataValue = []
          }
        }
      } else {
        if (!valueEquals(this.value, this.dataValue)) {
          if (this.value && this.value.length) {
            const firstItem = this.value[0]
            if (firstItem[this.props.value]) {
              this.dataValue = this.value.map(item => item[this.props.value])
            } else {
              this.dataValue = objDeepCopy(this.value)
            }
          } else {
            this.dataValue = []
          }
        }
      }
    },

    /**
     * 处理options
     */
    verifyOptions() {
      if (!this.options) {
        this.requestDepList()
      } else {
        this.optionsList = this.options
      }
    },

    /**
     * 获取请求
     */
    requestDepList() {
      this.loading = true
      let request = depListAPI
      if (this.request) {
        request = this.request
      } else if (this.props.request) {
        request = this.props.request
      }

      let params = { type: 'tree' }
      if (this.params) {
        params = this.params
      }

      request(params)
        .then(res => {
          this.optionsList = res.data || []
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    handleClose() {
      this.visible = false
    },

    handleMenuEnter() {
      // 处理聚焦到具体位置
    },

    doDestroy() {
      this.$refs.popper && this.$refs.popper.doDestroy()
    },

    /**
     * 删除
     */
    deleteDep(index) {
      // 直接 splice ,dataValue watch 的老旧值相同，复制之后新旧值不相同。暂时解决
      const dataValue = objDeepCopy(this.dataValue)
      dataValue.splice(index, 1)
      this.dataValue = dataValue
      this.wkDepChange()
    },

    /**
     * 聚焦动作
     */
    focusClick() {
      this.$emit('focus')
    },

    /**
     * chang 事件
     */
    wkDepChange() {
      this.$nextTick(() => {
        if (this.radio) {
          this.dispatch('ElFormItem', 'el.form.change', this.dataValue && this.dataValue.length ? this.dataValue[0] : '')
        } else {
          this.dispatch('ElFormItem', 'el.form.change', this.dataValue)
        }
        this.$emit('change', this.dataValue, this.selects)
      })
    },

    containerClick() {
      if (!this.disabled) {
        this.visible = !this.visible
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.wk-dep-select {
  height: 34px;
  position: relative;
  border-radius: $xr-border-radius-base;
  font-size: 13px;
  background-color: white;
  border: 1px solid #e6e6e6;
  color: #333333;
  width: 180px;
  padding: 0 20px 0 5px;
  cursor: pointer;

  .user-item {
    padding: 5px 15px 5px 5px;
    background-color: #F3F7FF;
    border-radius: $xr-border-radius-base;
    margin: 3px;
    max-width: 80px;
    position: relative;
  }
  .user-placeholder {
    color: #ddd;
    line-height: 34px;
    cursor: pointer;
    user-select: none;
  }
  .delete-icon {
    color: #999;
    cursor: pointer;
    position: absolute;
    top: 8px;
    right: 2px;

    &:hover {
      color: $xr-color-primary;
    }
  }
  &:hover {
    border-color: #c0c4cc;
  }
}

.wk-dep-select.is_disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
  .user-item {
    background-color: #f0f4f8ea;
    color: #c0c4cc;
    cursor: not-allowed;
  }
  .delete-icon {
    color: #c0c4cc;
    cursor: not-allowed;
  }
  .user-placeholder {
    color: #c0c4cc;
    cursor: not-allowed;
  }
}

.wk-dep-select.is_valid:hover {
  border-color: #c0c4cc;
}

.wk-dep-select.is_focus {
  border-color: $xr-focus-border !important;
}

.el-icon-more {
  position: absolute;
  top: 5px;
  right: 20px;
  padding: 6px 10px;
  font-size: 12px;
  background-color: #F3F7FF;
  color: #666;
  border-radius: $xr-border-radius-base;
  &:hover {
    background-color: $xr-color-primary;
    color: white;
  }
}

.el-icon-arrow-up {
  position: absolute;
  top: 10px;
  right: 5px;
  transition: transform .3s;
  color: #c0c4cc;
  font-size: 14px;
  transition: transform .3s;
  transform: rotate(180deg);
  cursor: pointer;
}
.el-icon-arrow-up.is-reverse {
  transform: rotate(0deg);
}
</style>
