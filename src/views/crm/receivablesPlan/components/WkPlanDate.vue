<template>
  <el-radio-group v-model="dateType" class="wk-plan-date" @change="radioChange">
    <el-radio label="loop">循环设置日期</el-radio>
    <div class="content">
      <div>从<el-date-picker
        v-model="startTime"
        :clearable="false"
        type="date"
        value-format="yyyy-MM-dd"
        @change="changeValue" />开始，每
        <el-input-number
          v-model="interval"
          :min="1"
          :max="31"
          :controls="false"
          @change="changeValue" />
        <el-select
          v-model="dayUnit"
          @change="changeValue">
          <el-option
            v-for="item in dayUnits"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
      </el-select>回款一次</div>
      <div v-if="loopValue" class="des">{{ loopValue.join('、') }}</div>
    </div>
    <el-radio label="custom">自定义日期（多选）</el-radio>
    <div class="content">
      <wk-multi-date
        v-model="customValue"
        @change="radioChange"
      />
    </div>
  </el-radio-group>
</template>

<script>
import WkMultiDate from './WkMultiDate'

import moment from 'moment'
import Emitter from 'element-ui/lib/mixins/emitter'

export default {
  // 计划回款日期
  name: 'WkPlanDate',

  components: {
    WkMultiDate
  },

  mixins: [Emitter],

  props: {
    value: Array,
    count: [Number, String]
  },

  data() {
    return {
      dateType: 'loop', // loop custom
      startTime: '',
      interval: 1,
      dayUnit: 'days',
      dayUnits: [{
        label: '天',
        value: 'days'
      }, {
        label: '周',
        value: 'weeks'
      }, {
        label: '月',
        value: 'months'
      }, {
        label: '年',
        value: 'years'
      }],
      loopValue: [],
      customValue: []
    }
  },

  computed: {},

  watch: {
    count: {
      handler(val) {
        if (isNaN(val)) {
          this.loopValue = []
          this.customValue = []
          this.$emit('input', [])
        } else {
          if (this.dateType === 'loop') {
            this.changeValue()
          }
        }
      },
      immediate: true
    },
    value() {
      this.dispatch('ElFormItem', 'el.form.change', this.value)
    }
  },

  created() {
    this.startTime = moment().format('YYYY-MM-DD')
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    radioChange() {
      this.$emit('input', this.dateType === 'loop' ? this.loopValue : this.customValue)
    },

    changeValue() {
      const values = []
      for (let index = 0; index < this.count; index++) {
        const newValue = moment(this.startTime).add(index * this.interval, this.dayUnit)
        values.push(newValue.format('YYYY-MM-DD'))
      }

      if (this.dateType === 'loop') {
        this.loopValue = values
        this.$emit('input', values)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-plan-date {
  padding-top: 8px;
  .content {
    font-size: 13px;
    padding: 8px 22px;
    .el-date-editor {
      width: 140px;
      margin: 0 5px;
    }
    .el-select {
      width: 60px;
      margin-right: 5px;
    }
    .el-input-number {
      width: 60px;
      margin-left: 5px;
    }

    .des {
      color: #999;
      margin-top: 8px;
      line-height: 1.5;
    }
  }
}
</style>
