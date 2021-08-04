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
        v-loading="loading"
        v-show="visible && !disabled"
        ref="popper"
        :append-to-body="popperAppendToBody">
        <wk-user-dep
          ref="userDep"
          :radio="radio"
          :user-props="userPropsValue"
          :user-value="userDataValue"
          :props="props"
          :dep-props="depPropsValue"
          :dep-value="depDataValue"
          :disabled="disabled"
          @userChange="userChange"
          @depChange="depChange"
          @close="visible = false"
        />
      </wk-select-dropdown>
    </transition>
  </div>
</template>

<script>
import WkSelectDropdown from '../WkDepSelect/src/SelectDropdown.vue'
import WkUserDep from './src/WkUserDep.vue'

import Emitter from 'element-ui/lib/mixins/emitter'
import { valueEquals } from 'element-ui/lib/utils/util'
import { objDeepCopy } from '@/utils'
import { debounce } from 'throttle-debounce'
import merge from '@/utils/merge'
import { mapGetters } from 'vuex'

// 同 WkUserDep.vue 中的 DefaultWkUserDep
const DefaultWkUserDep = {
  // 树结构请求和参数
  request: null,
  params: null,
  // 默认的搜索人资和管理端人员请求
  // isHrm: false, // 替换为 dataType 默认 manage 其余 hrm
  dataType: 'manage', // 默认管理端
  // userOptions: null, // 固定数据，后可以放入 props options
  isList: false // 默认是树形接口，如果是列需设置为true
}

export default {
  name: 'WkUserDepSelect',

  components: {
    WkSelectDropdown,
    WkUserDep
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
        }
      }
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
      loading: false
    }
  },

  computed: {
    ...mapGetters(['userList', 'deptList', 'hrmUserList', 'hrmDeptList']),
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

    userOptionsList() {
      if (this.config.dataType === 'manage') {
        return this.userList
      } else if (this.config.dataType === 'hrm') {
        return this.hrmUserList
      }
    },

    depOptionsList() {
      if (this.config.dataType === 'manage') {
        // 以缓存中的全部数据为id转对象的源
        return this.deptList
      } else if (this.config.dataType === 'hrm') {
        return this.hrmDeptList
      }
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
    },

    config() {
      return merge({ ...DefaultWkUserDep }, this.props || {})
    },

    depPropsValue() {
      const defaultValue = {
        value: 'deptId',
        label: 'name'
      }
      if (this.config.dataType === 'hrm') {
        defaultValue.value = 'deptId'
        defaultValue.label = 'name'
      }
      if (this.depProps) {
        return { ...defaultValue, ...this.depProps }
      } else {
        return defaultValue
      }
    },


    userPropsValue() {
      const defaultValue = {
        value: 'userId',
        label: 'realname'
      }
      if (this.config.dataType === 'hrm') {
        defaultValue.value = 'employeeId'
        defaultValue.label = 'employeeName'
      }
      if (this.userProps) {
        return { ...defaultValue, ...this.userProps }
      } else {
        return defaultValue
      }
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

    /**
     * 更新值
     */
    userDataValue(newVal, oldVal) {
      if (!valueEquals(newVal, oldVal)) {
        if (this.radio) {
          this.$emit('update:userValue', this.userDataValue && this.userDataValue.length ? this.userDataValue[0] : '')
        } else {
          this.$emit('update:userValue', this.userDataValue)
        }
      }
    },

    depProps: {
      handler() {
        this.requestDepList()
      },
      immediate: true
    },

    userProps: {
      handler() {
        this.requestUserList()
      },
      immediate: true
    }
  },

  created() {
    this.debounceUserDeptChange = debounce(300, this.userDeptChange)
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
     * 获取请求
     */
    requestDepList() {
      if (this.config.dataType === 'manage') {
        this.$store.dispatch('debounceGetDeptList')
      } else if (this.config.dataType === 'hrm') {
        this.$store.dispatch('debounceGetHrmDeptList')
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
        this.debounceUserDeptChange('dep')
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
     * 获取请求
     */
    requestUserList() {
      if (this.config.dataType === 'manage') {
        // 以缓存中的全部数据为id转对象的源
        // this.userOptionsList = this.userList
        // this.loading = !this.userList || this.userList.length === 0
        // this.$store.dispatch('GetUserList').then(res => {
        //   this.userOptionsList = this.userList
        //   this.loading = false
        // }).then(() => {
        //   this.loading = false
        // })
        this.$store.dispatch('debounceGetUserList')
      } else if (this.config.dataType === 'hrm') {
        // 以缓存中的全部数据为id转对象的源
        // this.userOptionsList = this.hrmUserList
        // this.loading = !this.hrmUserList || this.hrmUserList.length === 0
        // this.$store.dispatch('GetHrmUserList').then(res => {
        //   this.userOptionsList = this.hrmUserList
        //   this.loading = false
        // }).then(() => {
        //   this.loading = false
        // })
        this.$store.dispatch('debounceGetHrmUserList')
      }
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
        this.debounceUserDeptChange('user')
      })
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
    },

    /**
     * change 事件
     */
    userChange(val) {
      this.userDataValue = val
      this.wkUserChange()
    },

    /**
     * change 事件
     */
    depChange(val) {
      this.depDataValue = val
      this.wkDepChange()
    },

    userDeptChange(type) {
      this.$emit('change', this.userDataValue, this.depDataValue, this.userSelects, this.depSelects, type)
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

  .el-tabs__header {
    margin: 0;
  }
}
</style>
