<template>
  <div class="wk-select">
    <template v-if="valueIsObject">
      <el-select
        v-if="showType === 'default'"
        v-model="dataValue.select"
        :disabled="disabled"
        :clearable="clearable"
        :placeholder="placeholder"
        style="width: 100%;"
        @change="valueChange">
        <el-option
          v-for="(item, index) in options"
          :key="index"
          :label="!isEmptyValue(item.value) ? item.label || item.name : item "
          :value="getValue(item)"/>
      </el-select>
      <el-radio-group
        v-else-if="showType === 'tiled'"
        v-model="dataValue.select"
        @change="valueChange">
        <el-radio
          v-for="(item, index) in options"
          :key="index"
          :label="getValue(item)">
          {{ !isEmptyValue(item.value) ? item.label || item.name : item }}
        </el-radio>
      </el-radio-group>
      <el-input
        v-if="dataValue.select === '其他' && otherShowInput"
        v-model="dataValue.otherValue"
        :disabled="disabled"
        :maxlength="100"
        placeholder="其他选项需填写，否则为无效选项"
        @blur="inputBlur"/>
    </template>
  </div>
</template>

<script>
import { isObject, isEmpty } from '@/utils/types'
import Emitter from 'element-ui/lib/mixins/emitter'

export default {
  // 自定义字段库 单选
  name: 'WkSelect',

  components: {},

  mixins: [Emitter],

  props: {
    value: [String, Number],
    // 选择其他展示input输入框
    otherShowInput: {
      type: Boolean,
      default: false
    },
    disabled: Boolean,
    clearable: Boolean,
    placeholder: String,
    options: {
      type: Array,
      default: () => {
        return []
      }
    },
    showType: {
      type: String,
      default: 'default' //  下拉 default 平铺 tiled
    }
  },

  data() {
    return {
      dataValue: {
        select: '',
        otherValue: ''
      }
    }
  },

  computed: {
    valueIsObject() {
      return isObject(this.dataValue)
    }
  },

  watch: {
    value: {
      handler(newVal, oldVal) {
        this.validValue()
      },
      immediate: true
    }
  },

  created() {
    // this.validValue()
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 验证值
     */
    validValue() {
      if (this.value !== this.dataValue.select && this.value !== this.dataValue.otherValue) {
        if (isEmpty(this.value)) {
          this.dataValue = {
            select: '',
            otherValue: ''
          }
        } else {
          if (this.otherShowInput) {
            const valueObj = this.options.find(item => this.getValue(item) === this.value)
            if (valueObj) {
              if (this.dataValue.select !== this.value) {
                this.dataValue = {
                  select: this.value,
                  otherValue: ''
                }
              }
            } else {
              if (this.dataValue.otherValue !== this.value) {
                this.dataValue = {
                  select: '其他',
                  otherValue: this.value
                }
              }
            }
          } else {
            this.dataValue = {
              select: this.value,
              otherValue: ''
            }
          }
        }
      }
    },

    /**
     * 选项值
     */
    getValue(item) {
      return !this.isEmptyValue(item.value) ? item.value : item
    },

    /**
     * 判断是空值
     */
    isEmptyValue(value) {
      return value === null || value == undefined
    },

    /**
     * 值更新
     */
    valueChange() {
      const value = this.dataValue.select === '其他' ? this.dataValue.otherValue.trim() : this.dataValue.select
      this.$emit('input', value)
      this.$emit('change', value)
      this.dispatch('ElFormItem', 'el.form.change', value)
    },

    /**
     * 失去焦点
     */
    inputBlur() {
      // 暂未加input触发change逻辑
      const value = this.dataValue.otherValue
      const eIsObject = this.options.length > 0 && !this.isEmptyValue(this.options[0].value)
      const has = this.options.find(item => {
        if (eIsObject) {
          return item.value === value.trim()
        } else {
          return item === value.trim()
        }
      })
      if (has) {
        this.dataValue.otherValue = ''
      }

      this.$emit('input', this.dataValue.otherValue)
      this.$emit('change', this.dataValue.otherValue)
      this.dispatch('ElFormItem', 'el.form.change', this.dataValue.otherValue)
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-select {
  .el-input {
    margin-top: 5px;
  }

  .el-radio {
    margin: 5px 30px 5px 0;
  }
}
</style>
