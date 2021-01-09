<template>
  <div
    v-elclickoutside="handleClose"
    ref="reference"
    :class="[disabled ? 'is_disabled' : 'is_valid', { 'is_focus': visible }]"
    wrap="wrap"
    class="wk-user-dep-select xh-form-border"
    @click="containerClick">

    <div class="el-select__tags">
      <span
        v-for="(item, index) in showUserSelects"
        :key="`user${index}`"
        class="user-item text-one-line">{{ item[userPropsValue.label] }}
        <i
          class="delete-icon el-icon-close"
          @click.stop="deleteuser(index)" />
      </span>
      <span
        v-for="(item, index) in showDepSelects"
        :key="`dep${index}`"
        class="user-item text-one-line">{{ item[depPropsValue.label] }}
        <i
          class="delete-icon el-icon-close"
          @click.stop="deleteDep(index)" />
      </span>
    </div>
    <el-tooltip v-if="(depSelects.length + userSelects.length) > max" :content="getTooltipText()" effect="dark" placement="top">
      <i class="el-icon-more" />
    </el-tooltip>
    <i
      :class="['el-icon-arrow-up', { 'is-reverse' : visible}]"/>
    <div
      v-if="(depSelects.length + userSelects.length) == 0"
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
          <el-tabs v-model="tabType">
            <el-tab-pane label="员工" name="user">
              <wk-user
                v-loading="loading"
                v-model="userDataValue"
                :header-show="false"
                :disabled="disabled"
                :options="userOptionsList"
                :props="userPropsValue"
                :radio="radio"
                @change="wkUserChange"
                @close="visible = false" />
            </el-tab-pane>
            <el-tab-pane label="部门" name="dep">
              <wk-dep
                v-loading="loading"
                v-model="depDataValue"
                :header-show="false"
                :options="depOptionsList"
                :props="depPropsValue"
                :radio="radio"
                :disabled="disabled"
                @change="wkDepChange"
                @close="visible = false" />
            </el-tab-pane>
          </el-tabs>

        </el-scrollbar>
      </wk-select-dropdown>
    </transition>
  </div>
</template>

<script>
import { depListAPI } from '@/api/common'
import { userListAPI } from '@/api/common'

import WkSelectDropdown from '../WkDepSelect/src/SelectDropdown.vue'
import WkDep from '../WkDepSelect/src/WkDep.vue'
import WkUser from '../WkUserSelect/src/WkUser.vue'

import Emitter from 'element-ui/lib/mixins/emitter'
import { valueEquals } from 'element-ui/lib/utils/util'
import { objDeepCopy } from '@/utils'

export default {
  name: 'WkUserDepSelect',

  components: {
    WkSelectDropdown,
    WkDep,
    WkUser
  },

  mixins: [Emitter],

  props: {
    radio: Boolean,
    // 展示限制
    max: {
      type: Number,
      default: 2
    },
    depProps: {
      type: Object,
      default: () => {
        return {}
      }
    },

    userProps: {
      type: Object,
      default: () => {
        return {}
      }
    },

    placeholder: {
      type: String,
      default() {
        return '请选择'
      }
    },
    // eslint-disable-next-line vue/require-prop-types
    depValue: {
      required: true
    },
    // eslint-disable-next-line vue/require-prop-types
    userValue: {
      required: true
    },
    // 自定义请求和 参数
    // request: Function,
    // params: Object,
    depOptions: Array,
    userOptions: Array,
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
      tabType: 'user',
      depDataValue: [], // 校准传入值
      userDataValue: [],
      depPropsValue: {
        value: 'id',
        label: 'name',
        request: null,
        params: null },
      userPropsValue: {
        value: 'userId',
        label: 'realname',
        request: null,
        params: null },
      loading: false,

      depOptionsList: [],
      userOptionsList: []
    }
  },

  computed: {
    // 实际展示的数据
    showUserSelects() {
      if (this.userSelects && this.userSelects.length > this.max) {
        return this.userSelects.slice(0, this.max)
      }
      return this.userSelects
    },

    showDepSelects() {
      let max = 0
      if (this.userSelects && this.userSelects.length < this.max || !this.userSelects) {
        max = this.max - this.userSelects.length
      }

      if (max > 0 && this.depSelects) {
        return this.depSelects.slice(0, this.max)
      }
      return []
    },

    // 选择的数据
    depSelects() {
      if (!this.depOptionsList.length) {
        return []
      }

      return this.getSelectList()
    },

    // 员工选择的数据
    userSelects() {
      if (!this.userOptionsList.length) {
        return []
      }

      return this.userOptionsList.filter(item => this.userDataValue.includes(item[this.userPropsValue.value]))
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

    depValue() {
      this.depVerifyValue()
    },

    depOptions: {
      handler() {
        if (this.depOptions) {
          this.depOptionsList = this.depOptions
        }
      },
      immediate: true
    },

    /**
     * 更新值
     */
    depDataValue(newValue, oldValue) {
      if (!valueEquals(newValue, oldValue)) {
        if (this.radio) {
          this.$emit('update:depValue', this.depDataValue && this.depDataValue.length ? this.depDataValue[0] : '')
        } else {
          this.$emit('update:depValue', this.depDataValue)
        }
      }
    },

    userValue() {
      this.userVerifyValue()
    },

    userOptions: {
      handler() {
        if (this.userOptions) {
          this.userOptionsList = this.userOptions
        }
      },
      immediate: true
    },

    /**
     * 更新值
     */
    userDataValue() {
      if (this.radio) {
        this.$emit('update:userValue', this.userDataValue && this.userDataValue.length ? this.userDataValue[0] : '')
      } else {
        this.$emit('update:userValue', this.userDataValue)
      }
    },

    depProps: {
      handler(val) {
        const defaultValue = {
          value: 'id',
          label: 'name',
          request: null,
          params: null
        }
        if (val) {
          this.depPropsValue = { ...defaultValue, ...val }
        } else {
          this.depPropsValue = defaultValue
        }

        this.depVerifyOptions()
      },
      immediate: true
    },

    userProps: {
      handler(val) {
        const defaultValue = {
          value: 'userId',
          label: 'realname',
          request: null,
          params: null
        }
        if (val) {
          this.userPropsValue = { ...defaultValue, ...val }
        } else {
          this.userPropsValue = defaultValue
        }

        this.userVerifyOptions()
      },
      immediate: true
    }
  },

  mounted() {
    this.depVerifyValue()
    this.userVerifyValue()
  },

  methods: {

    /**
     * 获取展示的数组
     */
    getSelectList() {
      const list = []
      this.recursionOptions(this.depOptionsList, this.depDataValue, list)
      return list
    },

    recursionOptions(options, depSelects, list) {
      options.forEach(item => {
        if (depSelects.includes(item[this.depPropsValue.value])) {
          list.push(item)
        }

        if (item.children) {
          this.recursionOptions(item.children, depSelects, list)
        }
      })
    },

    /**
     * 处理值逻辑
     */
    depVerifyValue() {
      // 多选的默认值 校准为数组  单选校准为number
      if (!this.radio && !Array.isArray(this.depValue)) {
        this.$emit('update:depValue', [])
      }

      if (this.radio && (Array.isArray(this.depValue) || this.depValue === null || this.depValue === undefined)) {
        this.$emit('update:depValue', '')
      }

      if (this.radio) {
        if (this.depValue !== this.depDataValue) {
          if (this.depValue) {
            this.depDataValue = [parseInt(this.depValue)]
          } else {
            this.depDataValue = []
          }
        }
      } else {
        if (!valueEquals(this.depValue, this.depDataValue)) {
          if (this.depValue && this.depValue.length) {
            const firstItem = this.depValue[0]
            if (firstItem[this.depPropsValue.value]) {
              this.depDataValue = this.depValue.map(item => item[this.depPropsValue.value])
            } else {
              this.depDataValue = objDeepCopy(this.depValue)
            }
          } else {
            this.depDataValue = []
          }
        }
      }
    },

    /**
     * 处理options
     */
    depVerifyOptions() {
      if (!this.depOptions) {
        this.requestDepList()
      } else {
        this.depOptionsList = this.depOptions
      }
    },

    /**
     * 获取请求
     */
    requestDepList() {
      this.loading = true
      let request = depListAPI
      if (this.depPropsValue.request) {
        request = this.depPropsValue.request
      }

      let params = { type: 'tree' }
      if (this.depPropsValue.params) {
        params = this.depPropsValue.params
      }

      request(params)
        .then(res => {
          this.depOptionsList = res.data || []
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
      if (!this.disabled) {
        // 直接 splice ,depDataValue watch 的老旧值相同，复制之后新旧值不相同。暂时解决
        const depDataValue = objDeepCopy(this.depDataValue)
        depDataValue.splice(index, 1)
        this.depDataValue = depDataValue
        this.wkDepChange()
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
    wkDepChange() {
      this.$nextTick(() => {
        if (this.radio) {
          this.dispatch('ElFormItem', 'el.form.change', this.depDataValue && this.depDataValue.length ? this.depDataValue[0] : '')
        } else {
          this.dispatch('ElFormItem', 'el.form.change', this.depDataValue)
        }
        this.$emit('change', this.userDataValue, this.depDataValue, this.userSelects, this.depSelects, 'dep')
      })
    },

    containerClick() {
      if (!this.disabled) {
        this.visible = !this.visible
      }
    },


    /** *** 员工 */
    /**
     * 处理值逻辑
     */
    userVerifyValue() {
      // 多选的默认值 校准为数组  单选校准为number
      if (!this.radio && !Array.isArray(this.userValue)) {
        this.$emit('update:userValue', [])
      }

      if (this.radio && (Array.isArray(this.userValue) || this.userValue === null || this.userValue === undefined)) {
        this.$emit('update:userValue', '')
      }

      if (this.radio) {
        if (this.userValue !== this.userDataValue) {
          if (this.userValue) {
            this.userDataValue = [parseInt(this.userValue)]
          } else {
            this.userDataValue = []
          }
        }
      } else {
        if (!valueEquals(this.userValue, this.userDataValue)) {
          if (this.userValue && this.userValue.length) {
            const firstItem = this.userValue[0]
            if (firstItem[this.userPropsValue.value]) {
              this.userDataValue = this.userValue.map(item => item[this.userPropsValue.value])
            } else {
              this.userDataValue = objDeepCopy(this.userValue)
            }
          } else {
            this.userDataValue = []
          }
        }
      }
    },

    /**
     * 处理options
     */
    userVerifyOptions() {
      if (!this.userOptions) {
        this.requestUserList()
      } else {
        this.userOptionsList = this.userOptions
      }
    },

    /**
     * 获取请求
     */
    requestUserList() {
      this.loading = true
      let request = userListAPI
      let params = { pageType: 0 }
      if (this.userPropsValue.request) {
        request = this.userPropsValue.request
      }


      if (this.userPropsValue.params) {
        params = this.userPropsValue.params
      }

      request(params)
        .then(res => {
          this.userOptionsList = res.data.hasOwnProperty('list') ? (res.data.list || []) : (res.data || [])
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 删除
     */
    deleteuser(index) {
      if (!this.disabled) {
        this.userDataValue.splice(index, 1)
        // this.$emit('change', this.userDataValue, this.userSelects)
        this.wkUserChange()
      }
    },

    /**
     * chang 事件
     */
    wkUserChange() {
      this.$nextTick(() => {
        if (this.radio) {
          this.dispatch('ElFormItem', 'el.form.change', this.userDataValue && this.userDataValue.length ? this.userDataValue[0] : '')
        } else {
          this.dispatch('ElFormItem', 'el.form.change', this.userDataValue)
        }
      })
      this.$emit('change', this.userDataValue, this.depDataValue, this.userSelects, this.depSelects, 'user')
    },

    /**
     * 更多提示语
     */
    getTooltipText() {
      const structures = this.depSelects || []
      let strName = structures.map(item => item[this.depPropsValue.label]).join('、')

      const users = this.userSelects || []
      const userName = users.map(item => item[this.userPropsValue.label]).join('、')

      if (strName && userName) {
        strName += '、'
      }
      return strName + userName
    }
  }
}
</script>
<style lang="scss" scoped>
.wk-user-dep-select {
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

.wk-user-dep-select.is_disabled {
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

.wk-user-dep-select.is_valid:hover {
  border-color: #c0c4cc;
}

.wk-user-dep-select.is_focus {
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

/deep/ .el-tabs {
  .el-tabs__nav-wrap {
    padding: 0 15px;
  }

  .el-tabs__nav-wrap::after {
    height: 1px;
  }
}
</style>
