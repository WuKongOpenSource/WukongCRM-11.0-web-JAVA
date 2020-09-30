<template>
  <div>
    <el-form-item
      v-for="(item, index) in fieldList"
      :key="index"
      :prop="item.field"
      :class="[item.className || '', `is-${item.formType}`]"
      :rules="item.rules">
      <template slot="label">
        {{ item.name }}
        <span style="color:#999;">
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
        v-else-if="isTrimInput(item.formType)"
        v-model.trim="fieldFrom[item.field]"
        :disabled="item.disabled"
        :maxlength="100"
        :placeholder="item.placeholder"
        :type="item.formType"
        @input="commonChange(item, index, $event)"/>
      <el-input-number
        v-else-if="item.formType == 'number'"
        v-model="fieldFrom[item.field]"
        :placeholder="item.placeholder"
        :disabled="item.disabled"
        :controls="false"
        @input="commonChange(item, index, $event)" />
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
        :autosize="{ minRows: 3}"
        :maxlength="800"
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
        clearable
        style="width: 100%;"
        type="daterange"
        value-format="yyyy-MM-dd"
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
      <v-distpicker
        v-if="item.formType == 'address'"
        :province="fieldFrom[item.field].province"
        :city="fieldFrom[item.field].city"
        :area="fieldFrom[item.field].area"
        @province="selectProvince($event, item, index)"
        @city="selectCity($event, item, index)"
        @area="selectArea($event, item, index)"/>
      <template v-else>
        <slot :data="item" />
      </template>
    </el-form-item>
  </div>
</template>

<script>
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import WkDepSelect from '@/components/NewCom/WkDepSelect'
import VDistpicker from '@/components/VDistpicker'

import Mixin from './Mixin'

export default {
  // 多块形式的form-item
  name: 'WkFormItems',

  components: {
    WkUserSelect,
    WkDepSelect,
    VDistpicker
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

<style lang="scss" scoped>

</style>
