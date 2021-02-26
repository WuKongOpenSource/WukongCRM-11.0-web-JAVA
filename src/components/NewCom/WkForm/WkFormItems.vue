<template>
  <flexbox
    class="wk-form-items"
    align="flex-start"
    justify="flex-start">
    <el-form-item
      v-for="(item, index) in fieldList"
      :key="index"
      :prop="item.field"
      :class="[item.className || '', `is-${item.formType}`]"
      :style="{width: item.stylePercent ? `${item.stylePercent}%` : 'auto'}">
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
        :maxlength="100"
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
      <wk-percent-input
        v-else-if="item.formType == 'percent'"
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
        active-value="1"
        inactive-value="0"/>
      <wk-position
        v-else-if="item.formType == 'position'"
        :hide-area="item.hideArea"
        :only-province="item.onlyProvince"
        :show-detail="item.showDetail"
        v-model="fieldFrom[item.field]"/>
      <wk-location
        v-else-if="item.formType == 'location'"
        v-model="fieldFrom[item.field]"/>
      <wk-signature-pad
        v-else-if="item.formType == 'handwriting_sign'"
        v-model="fieldFrom[item.field]"/>
      <wk-desc-text
        v-else-if="item.formType == 'desc_text'"
        :value="fieldFrom[item.field]"/>
      <el-date-picker
        v-else-if="item.formType === 'date_interval'"
        v-model="fieldFrom[item.field]"
        :type="item.dateType || 'daterange'"
        :value-format="item.dateValueFormat || 'yyyy-MM-dd'"
        style="width: 100%;"
        start-placeholder="开始日期"
        end-placeholder="结束日期" />
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
  </flexbox>
</template>

<script>
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import WkDepSelect from '@/components/NewCom/WkDepSelect'
import WkPosition from '@/components/NewCom/WkPosition'
import WkLocation from '@/components/NewCom/WkLocation'
import WkSignaturePad from '@/components/NewCom/WkSignaturePad'
import WkDescText from '@/components/NewCom/WkDescText'
import WkPercentInput from '@/components/NewCom/WkPercentInput'
import VDistpicker from '@/components/VDistpicker'
import { XhFiles } from '@/components/CreateCom'

import Mixin from './Mixin'

export default {
  // 多块形式的form-item
  name: 'WkFormItems',

  components: {
    WkUserSelect,
    WkDepSelect,
    WkPosition,
    WkLocation,
    WkSignaturePad,
    WkDescText,
    WkPercentInput,
    VDistpicker,
    XhFiles
  },

  mixins: [Mixin],

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
    }
  },

  data() {
    return {
    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {}
}
</script>


<style lang="scss">
.wk-form-items {
  .el-form-item__label {
    line-height: 1.5;
    padding-bottom: 8px;
    word-break: break-all;
    word-wrap: break-word;
    color: #333;
  }

  .el-form-item__error {
    position: relative;
    top: auto;
    left: auto;
  }

  .el-form-item.is-desc_text {
    .el-form-item__label {
      display: none;
    }
  }
}
</style>


<style lang="scss" scoped>
.el-input-number {
  width: 100%;
  /deep/ .el-input__inner {
    text-align: left;
    padding: 0 8px;
  }
}

.wk-form-items {
  padding: 0 12px;

  .el-form-item {
    padding: 12px 12px 0;
    margin-bottom: 0;
  }
}
</style>
