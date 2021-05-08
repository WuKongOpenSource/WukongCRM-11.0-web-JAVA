<template>
  <div
    v-clickoutside="clickOutSide"
    v-if="typeObj"
    class="field-setting">
    <div class="setting-title">
      {{ typeObj.name }}
    </div>

    <div class="setting-body">
      <template v-if="!isDescText">
        <div class="item-section">
          <div class="name">标识名</div>
          <el-input
            v-model="field.name"
            :disabled="!fieldAuth.nameEdit"/>
          <div class="input-tips"><span>*</span>标识名不能为空</div>
        </div>

        <div class="item-section">
          <div class="name">提示文字</div>
          <el-input
            v-model="field.inputTips"
            :rows="3"
            type="textarea"
            resize="none"/>
          <div class="input-tips"><span>*</span>显示在标识名右侧的说明文字</div>
        </div>

        <setting-detail-table
          v-if="field.formType === 'detail_table'"
          :field="field"
          @child-edit="emitChildEdit" />

        <template v-if="canOptions">
          <div class="item-section">
            <div class="name">选项内容</div>
            <div class="input-tips"><span>*</span>修改选项后该项设置的逻辑表单会失效</div>
            <setting-options
              :field="field"
              :is-table-child="isTableChild" />
          </div>

          <div v-if="!isTableChild" class="item-section">
            <div class="name">逻辑表单</div>
            <setting-logic-form
              :field="field"
              :point="point"
              :field-arr="fieldArr" />
          </div>
        </template>

        <div v-if="canPrecisions" class="item-section">
          <div class="name">
            {{ precisionsTitle }}
          </div>
          <setting-precisions :field="field" />
        </div>

        <div v-if="canDefault" class="item-section">
          <div class="name">默认值</div>
          <setting-default :field="field" />
        </div>

        <div v-if="canNumber" class="item-section">
          <setting-number :field="field" />
        </div>
      </template>

      <div v-if="isDescText" class="item-section">
        <div class="name">内容</div>
        <setting-desc-text :field="field" />
      </div>

      <div v-if="fieldAuth.percentEdit" class="item-section">
        <div class="name">
          字段占比 %
          <el-tooltip
            content="配置表单布局，可以单行多字段排布"
            effect="dark"
            placement="top">
            <i class="wk wk-help wk-help-tips" style="margin-left: 3px;"/>
          </el-tooltip>
        </div>
        <el-radio-group
          v-model="field.stylePercent"
          size="medium"
          @change="emitUpdateWidth">
          <el-radio-button
            v-for="item in widthOptions"
            :label="item.value"
            :key="item.value">{{ item.value }}</el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="canTransform && transformData && transformData[field.formType]" class="item-section">
        <div class="name">转化客户字段</div>
        <el-select
          v-model="field.relevant"
          clearable>
          <el-option
            v-for="item in transformData[field.formType]"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </div>

      <template v-if="!isDescText">
        <div
          v-if="fieldAuth.nullEdit"
          class="item-check-section">
          <el-checkbox
            v-model="field.isNull"
            :true-label="1"
            :false-label="0">设为必填</el-checkbox>
        </div>

        <div
          v-if="fieldAuth.uniqueEdit"
          class="item-check-section">
          <el-checkbox
            v-model="field.isUnique"
            :true-label="1"
            :false-label="0">设为唯一</el-checkbox>
        </div>

        <div
          v-if="fieldAuth.hiddenEdit"
          class="item-check-section">
          <el-checkbox
            v-model="field.isHidden"
            :true-label="1"
            :false-label="0">隐藏字段</el-checkbox>
        </div>
      </template>

    </div>
  </div>
</template>

<script>
import SettingDefault from './SettingDefault'
import SettingOptions from './SettingOptions'
import SettingNumber from './SettingNumber'
import SettingPrecisions from './SettingPrecisions'
import SettingDescText from './SettingDescText'
import SettingDetailTable from './SettingDetailTable'
import SettingLogicForm from './SettingLogicForm'

import FieldTypeLib from '../../fieldTypeLib'
import { getFieldAuth } from '../../utils'

export default {
  name: 'FieldSetting',
  components: {
    SettingDefault,
    SettingOptions,
    SettingNumber,
    SettingPrecisions,
    SettingDescText,
    SettingDetailTable,
    SettingLogicForm
  },
  props: {
    // 是否开启转移  转移对应数据
    canTransform: Boolean,
    transformData: Object,
    field: { // 要编辑的字段信息
      type: Object,
      required: true
    },
    fieldArr: { // 所有字段
      type: Array,
      required: true
    },
    point: { // 被选中的字段坐标
      type: Array,
      required: true
    }
  },
  data() {
    return {
      widthOptions: [
        { value: 25 },
        { value: 50 },
        { value: 75 },
        { value: 100 }
      ],
      stylePercentValue: []
    }
  },
  computed: {
    typeObj() {
      const field = FieldTypeLib.find(o => o.formType === this.field.formType)
      return field || this.field
    },
    fieldAuth() {
      return getFieldAuth(this.field.operating)
    },
    // 是否允许设置字段默认值
    canDefault() {
      return ![
        'user',
        'structure',
        'file',
        'location',
        'handwriting_sign',
        'detail_table'
      ].includes(this.field.formType)
    },
    // 是否允许设置选项内容
    canOptions() {
      return [
        'select',
        'checkbox'
      ].includes(this.field.formType)
    },
    // 是否允许设置小数
    canNumber() {
      return [
        'number',
        'floatnumber',
        'percent'
      ].includes(this.field.formType)
    },
    // 精度
    canPrecisions() {
      return [
        'date_interval',
        'position',
        'select',
        'checkbox'
      ].includes(this.field.formType)
    },
    // 精度标题
    precisionsTitle() {
      if (!this.canPrecisions) return ''
      switch (this.field.formType) {
        case 'date_interval':
          return '日期类型'
        case 'position':
          return '地址精度'
        case 'select':
          return '展示方式'
        case 'checkbox':
          return '展示方式'
        default:
          return '精度'
      }
    },
    // 是否为描述文字类型
    isDescText() {
      return this.field.formType === 'desc_text'
    },

    // 是否为明细表格内部字段
    isTableChild() {
      const fatherField = this.fieldArr[this.point[0]][this.point[1]]
      return fatherField.formType === 'detail_table'
    }
  },
  watch: {
    field: {
      handler() {
        this.stylePercentValue = [Number(this.field.stylePercent) || 100]
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    emitUpdateWidth() {
      this.$emit('update-width')
    },
    emitChildEdit(field = null) {
      this.$emit('child-edit', field)
    },
    clickOutSide() {
      this.emitChildEdit()
    }
  }
}
</script>

<style scoped lang="scss">
.el-checkbox /deep/ .el-checkbox__label {
  font-size: 13px;
  color: #333333;
}

.field-setting {
  .setting-title {
    padding: 20px 15px 0;
    font-weight: bold;
  }

  .setting-body {
    padding: 0 15px 10px;
    .input-tips {
      font-size: 12px;
      margin-top: 10px;
      color: #999;
      span {
        color: red;
      }
    }

    .item-section {
      padding: 10px 0;
      border-bottom: 1px solid #e6e6e6;
      .name {
        font-size: 13px;
        font-weight: 500;
        color: #333;
        margin: 10px 0;
      }
    }

    .item-check-section {
      margin-top: 10px;
    }
  }
}
</style>
