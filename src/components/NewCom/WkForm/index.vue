<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @Date: 2020-05-28 11:47:02
 * @LastEditTime: 2020-07-15 11:55:39
 * @LastEditors: yang
-->
<template>
  <el-form
    ref="form"
    v-bind="$attrs"
    :class="customClass"
    class="wk-form"
    v-on="$listeners">
    <el-form-item
      v-for="(item, index) in fieldList"
      :key="index"
      :prop="item.field"
      :class="[item.className || '', `is-${item.formType}`]">
      <template slot="label">
        {{ item.name }}
        <el-tooltip
          v-if="item.tipType == 'tooltip'"
          effect="dark"
          placement="top">
          <div slot="content" v-html="getTips(item)"/>
          <i class="wk wk-help wk-help-tips"/>
        </el-tooltip>
        <span v-else style="color:#999;">
          {{ getTips(item) }}
        </span>
      </template>
      <el-input
        v-if="item.formType == 'text'"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        :maxlength="100"
        :placeholder="item.placeholder"
        :type="item.formType"
        @input="commonChange(item, index, $event)"/>
      <el-input
        v-if="isTrimInput(item.formType)"
        v-model.trim="fieldFrom[item.field]"
        :disabled="item.disabled"
        :prefix-icon="getInputIcon(item.formType)"
        :maxlength="getInputMaxlength(item.formType)"
        :placeholder="item.placeholder"
        type="text"
        @input="commonChange(item, index, $event)"/>
      <el-input-number
        v-else-if="item.formType == 'number'"
        v-model="fieldFrom[item.field]"
        :placeholder="item.placeholder"
        :disabled="item.disabled"
        :controls="false"
        @change="commonChange(item, index, $event)" />
      <el-input-number
        v-else-if="item.formType == 'floatnumber'"
        v-model="fieldFrom[item.field]"
        :placeholder="item.placeholder"
        :disabled="item.disabled"
        :controls="false"
        @change="commonChange(item, index, $event)" />
      <el-input
        v-else-if="item.formType == 'textarea'"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        :rows="3"
        :autosize="{ minRows: 3}"
        :maxlength="item.maxlength || 800"
        :placeholder="item.placeholder"
        :type="item.formType"
        resize="none"
        @input="commonChange(item, index, $event)" />
      <!-- 逻辑表单单选多选 -->
      <wk-select
        v-else-if="item.formType === 'select' && item.hasOwnProperty('optionsData')"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        :clearable="item.clearable"
        :placeholder="item.placeholder"
        :options="item.setting"
        :show-type="item.precisions === 1 ? 'tiled' : 'default'"
        :other-show-input="item.hasOwnProperty('optionsData')"
        @change="commonChange(item, index, $event)"/>
      <wk-checkbox
        v-else-if="item.formType === 'checkbox' && item.hasOwnProperty('optionsData')"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        :clearable="item.clearable"
        :placeholder="item.placeholder"
        :options="item.setting"
        :show-type="item.precisions === 1 ? 'tiled' : 'default'"
        :other-show-input="item.hasOwnProperty('optionsData')"
        @change="commonChange(item, index, $event)"/>
      <el-select
        v-else-if="['checkbox', 'select'].includes(item.formType)"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        :clearable="item.clearable"
        :placeholder="item.placeholder"
        :multiple="item.formType === 'checkbox'"
        style="width: 100%;"
        @change="commonChange(item, index, $event)">
        <el-option
          v-for="(item, index) in item.setting"
          :key="index"
          :label="!isEmptyValue(item.value) ? item.label || item.name : item "
          :value="!isEmptyValue(item.value) ? item.value : item"/>
      </el-select>
      <el-select
        v-else-if="item.formType == 'checkbox'"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        :clearable="item.clearable"
        :placeholder="item.placeholder"
        multiple
        style="width: 100%;"
        @change="commonChange(item, index, $event)">
        <el-option
          v-for="(item, index) in item.setting"
          :key="index"
          :label="!isEmptyValue(item.value) ? item.label || item.name : item "
          :value="!isEmptyValue(item.value) ? item.value : item"/>
      </el-select>
      <el-date-picker
        v-else-if="item.formType == 'date'"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        clearable
        style="width: 100%;"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="选择日期"
        @change="commonChange(item, index, $event)"/>
      <el-date-picker
        v-else-if="item.formType == 'dateRange'"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        :type="item.dateType || 'daterange'"
        :value-format="item.dateValueFormat || 'yyyy-MM-dd'"
        clearable
        style="width: 100%;"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="commonChange(item, index, $event)"/>
      <el-date-picker
        v-else-if="item.formType == 'datetime'"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        clearable
        style="width: 100%;"
        type="datetime"
        value-format="yyyy-MM-dd HH:mm:ss"
        placeholder="选择日期"
        @change="commonChange(item, index, $event)"/>
      <wk-dep-select
        v-else-if="item.formType == 'structure'"
        v-model="fieldFrom[item.field]"
        :request="item.request"
        :props="item.props"
        :params="item.params"
        :disabled="item.disabled"
        :radio="!isEmptyValue(item.radio) ? item.radio : true"
        style="width: 100%;"
        @change="depOrUserChange(item, index, arguments[0], arguments[1])"
      />
      <wk-user-select
        v-else-if="['single_user', 'user'].includes(item.formType)"
        v-model="fieldFrom[item.field]"
        :request="item.request"
        :props="item.props"
        :params="item.params"
        :disabled="item.disabled"
        :radio="!isEmptyValue(item.radio) ? item.radio : true"
        style="width: 100%;"
        @change="depOrUserChange(item, index, arguments[0], arguments[1])"
      />
      <el-radio-group
        v-else-if="item.formType == 'radio'"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        :placeholder="item.placeholder"
        @change="commonChange(item, index, $event)">
        <el-radio
          v-for="(item, index) in item.setting"
          :key="index"
          :label="!isEmptyValue(item.value) ? item.value : item">
          {{ !isEmptyValue(item.value) ? item.label || item.name : item }}
        </el-radio>
      </el-radio-group>
      <el-switch
        v-else-if="item.formType == 'boolean_value'"
        v-model="fieldFrom[item.field]"
        :disabled="item.disabled"
        active-value="1"
        inactive-value="0"/>
      <v-distpicker
        v-if="item.formType == 'address'"
        :province="fieldFrom[item.field].province"
        :city="fieldFrom[item.field].city"
        :area="fieldFrom[item.field].area"
        @province="selectProvince($event, item, index)"
        @city="selectCity($event, item, index)"
        @area="selectArea($event, item, index)"/>
      <xh-files
        v-if="item.formType == 'file'"
        :value="fieldFrom[item.field]"
        :disabled="item.disabled"
        @value-change="oldChange($event, item, index)"
      />
      <template v-else>
        <slot :data="item" :index="index" />
      </template>
    </el-form-item>
    <slot name="suffix" />
  </el-form>
</template>

<script>
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import WkDepSelect from '@/components/NewCom/WkDepSelect'
import VDistpicker from '@/components/VDistpicker'
import { XhFiles } from '@/components/CreateCom'
import WkSelect from '@/components/NewCom/WkSelect'
import WkCheckbox from '@/components/NewCom/WkCheckbox'

import Mixin from './Mixin'

export default {
  name: 'WkForm',
  components: {
    WkUserSelect,
    WkDepSelect,
    VDistpicker,
    XhFiles,
    WkSelect,
    WkCheckbox
  },
  mixins: [Mixin],
  inheritAttrs: false,
  props: {
    fieldFrom: {
      type: Object,
      default: () => {
        return {}
      }
    },
    fieldList: {
      type: Array,
      default: () => {
        return []
      }
    },
    customClass: {
      type: String,
      default: 'is-two-columns'
    }
  },
  data() {
    return {
      instance: null
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.$nextTick(() => {
      this.instance = this.$refs.form
    })
  },
  beforeDestroy() {},
  methods: {
  }
}
</script>

<style lang="scss">
@import '@/styles/wk-form.scss';
</style>
<style lang="scss" scoped>
  .el-input-number {
    width: 100%;
    /deep/ .el-input__inner {
      text-align: left;
      padding: 0 8px;
    }
  }
</style>
