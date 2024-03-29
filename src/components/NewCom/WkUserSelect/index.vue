<template>
  <div
    v-elclickoutside="handleClose"
    ref="reference"
    :class="[disabled ? 'is_disabled' : 'is_valid', { 'is_focus': visible }, { 'is-default': !$slots.reference }]"
    :style="{ height: `${isNaN(height) ? height || 'auto' : `${height}px` }` }"
    wrap="wrap"
    class="wk-user-select xh-form-border"
    @click="containerClick">
    <slot name="reference" />
    <template v-if="!$slots.reference">
      <div ref="tags" class="el-select__tags">
        <span
          v-for="(item, index) in showSelects"
          :key="index"
          :class="{'is-hide': item.isHide}"
          class="user-item text-one-line">{{ item[config.label] }}
          <i
            v-if="!item.disabled"
            class="delete-icon el-icon-close"
            @click.stop="deleteuser(item, index)" />
        </span>
      </div>
      <i v-if="selects.length > max && max > 0" class="el-icon-more" />
      <i
        :class="['el-icon-arrow-up', { 'is-reverse' : visible}]"/>
      <div
        v-if="selects.length == 0"
        class="user-placeholder text-one-line">{{ placeholder }}</div>
    </template>

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
          <wk-user
            v-loading="loading"
            v-if="initView"
            v-model="dataValue"
            :disabled="disabled"
            :options="optionsList"
            :props="config"
            :radio="radio"
            @change="wkUserChange"
            @close="visible = false" />
        </el-scrollbar>
      </wk-select-dropdown>
    </transition>
  </div>
</template>

<script>
import WkSelectDropdown from './src/SelectDropdown.vue'
import WkUser from './src/WkUser.vue'

import Emitter from 'element-ui/lib/mixins/emitter'
import { valueEquals } from 'element-ui/lib/utils/util'
import { objDeepCopy } from '@/utils'
import { isEmpty } from '@/utils/types'
import merge from '@/utils/merge'
import store from '@/store'
import { mapGetters } from 'vuex'

const DefaultWkUserSelect = {
  value: 'userId',
  label: 'realname',
  dataType: '', // 部门的 value label 一致，用 dataType 区分
  // 主列表请求和参数 会和 props 内的合并（如果有值的情况下）
  request: null,
  params: null,
  isList: false // 默认是树形接口，如果是列需设置为true
}

export default {
  name: 'WkUserSelect',

  components: {
    WkSelectDropdown,
    WkUser
  },

  mixins: [Emitter],

  props: {
    radio: Boolean,
    // 展示限制 0 标示展示全部
    max: {
      type: Number,
      default: 2
    },
    // 取值字段 如果继续新增 改为 props 方案
    props: {
      type: Object,
      default: () => {
        return {

        }
      }
    },
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
      height: 34,

      initView: false
    }
  },

  computed: {
    ...mapGetters(['userList', 'hrmUserList']),
    optionsList() {
      if (this.options) {
        return this.options
      }

      // 如果是一维数组，而且数据源根据请求获取，不传入 options
      if (this.config.isList && this.config.request) {
        return null
      }

      if (this.config.dataType === 'manage') {
        return this.userList
      } else if (this.config.dataType === 'hrm') {
        return this.hrmUserList
      }
    },
    // 实际展示的数据
    showSelects() {
      if (this.max && this.max > 0 && this.selects && this.selects.length > this.max) {
        return this.selects.slice(0, this.max)
      }
      return this.selects
    },

    // 选择的数据
    selects() {
      let optionsList = []
      if (this.config.dataType === 'manage') {
        optionsList = this.userList
      } else if (this.config.dataType === 'hrm') {
        optionsList = this.hrmUserList
      }

      return optionsList.filter(item => this.dataValue.includes(item[this.config.value]))
    },

    // 合并 props
    config() {
      const props = merge({ ...DefaultWkUserSelect }, this.props || {})
      if (this.request) {
        props.request = this.request
      }

      if (isEmpty(props.dataType)) {
        if (props.value === 'userId') {
          props.dataType = 'manage'
        } else if (props.value === 'employeeId') {
          props.dataType = 'hrm'
        }
      }

      if (this.params) {
        props.params = this.params
      }
      return props
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

    value(newVal, oldVal) {
      this.verifyValue()
    },

    props: {
      handler() {
        this.requestUserList()
      },
      immediate: true
    },

    /**
     * 更新值
     */
    dataValue() {
      if (this.radio) {
        this.$emit('input', this.dataValue && this.dataValue.length ? this.dataValue[0] : '')
      } else {
        this.$emit('input', this.dataValue)
      }
    },

    showSelects: {
      handler() {
        this.resetHeight()
      },
      immediate: true
    }
  },

  created() {
    this.verifyValue()
  },

  methods: {
    resetHeight() {
      const tags = this.$refs.tags
      if (tags) {
        this.$nextTick(() => {
          this.height = tags.clientHeight > 34 ? tags.clientHeight + 6 : 34
        })
      } else {
        this.height = 34
      }
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
          if (!isEmpty(this.value)) {
            this.dataValue = [parseInt(this.value)]
          } else {
            this.dataValue = []
          }
        }
      } else {
        if (!valueEquals(this.value, this.dataValue)) {
          if (this.value && this.value.length) {
            const firstItem = this.value[0]
            if (firstItem[this.config.value]) {
              this.dataValue = this.value.map(item => item[this.config.value])
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
     * 获取请求
     */
    requestUserList() {
      if (this.config.dataType === 'manage') {
        // 以缓存中的全部数据为id转对象的源
        store.dispatch('debounceGetUserList')
      } else if (this.config.dataType === 'hrm') {
        store.dispatch('debounceGetHrmUserList')
      }
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
    deleteuser(item) {
      if (!item.disabled && !this.disabled) {
        for (let index = 0; index < this.dataValue.length; index++) {
          const id = this.dataValue[index]
          if (id == item[this.config.value]) {
            this.dataValue.splice(index, 1)
            // this.$emit('change', this.dataValue, this.selects)
            this.wkUserChange()
            break
          }
        }
      }
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
    wkUserChange() {
      this.$nextTick(() => {
        if (this.radio) {
          this.dispatch('ElFormItem', 'el.form.change', this.dataValue && this.dataValue.length > 0 ? this.dataValue[0] : '')
        } else {
          this.dispatch('ElFormItem', 'el.form.change', this.dataValue)
        }
      })
      this.$emit('change', this.dataValue, this.selects)
    },

    containerClick() {
      if (!this.disabled) {
        this.initView = true
        this.visible = !this.visible
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.wk-user-select {
  cursor: pointer;

  &.is-default {
    height: 34px;
    // display: inline-block;
    position: relative;
    border-radius: $xr-border-radius-base;
    font-size: 13px;
    background-color: white;
    border: 1px solid #e6e6e6;
    color: #333333;
    width: 180px;
    padding: 0 20px 0 5px;
  }

  .user-item {
    padding: 5px 15px 5px 5px;
    background-color: #F3F7FF;
    border-radius: $xr-border-radius-base;
    margin: 3px;
    max-width: 80px;
    position: relative;

    &.is-hide {
      background-color: #f2f2f2;
      color: #999;
    }
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

.wk-user-select.is_disabled {
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

.wk-user-select.is_valid:hover {
  border-color: #c0c4cc;
}

.wk-user-select.is_focus {
  border-color: $xr-focus-border !important;
}

.el-select__tags {
  padding-right: 30px;
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
  top: calc(50% - 7px);
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
