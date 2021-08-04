<template>
  <div v-loading="loading" class="main">
    <xr-header
      icon-class="wk wk-double-gear"
      icon-color="#1CBAF5"
      label="计薪设置" />
    <div class="main-body">
      <div class="main-item">
        <span class="label">计薪周期：</span>当月1日至当月31日<el-tooltip
          content="计薪周期设置后不能修改"
          effect="dark"
          placement="top">
          <i class="wk wk-help wk-help-tips"/>
        </el-tooltip>
      </div>
      <div class="main-item">
        <span class="label">对应社保自然月：</span><el-tooltip
          content="请根据你工资报表月份对应的社保报表月份进行选择，例如工资报表为6月，如果要对应5月的社保报表，则选择上月。"
          effect="dark"
          placement="top">
          <i class="wk wk-help wk-help-tips"/>
        </el-tooltip>
      </div>
      <div class="main-item">
        <el-select
          v-model="form.socialSecurityMonthType"
          style="margin-left: 0;">
          <el-option
            v-for="(item, index) in monthTypeOptions"
            :key="index"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </div>

      <div class="main-handle">
        <el-button
          type="primary"
          @click="saveClick">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  hrmSalaryConfigQueryConfigAPI,
  hrmSalaryConfigUpdateConfigAPI
} from '@/api/hrm/salaryConfig'

import XrHeader from '@/components/XrHeader'

export default {
  // 计薪设置
  name: 'SalaryCompute',

  components: {
    XrHeader
  },

  props: {},

  data() {
    return {
      loading: false,
      form: {},
      monthTypeOptions: [{
        label: '上月',
        value: 0
      }, {
        label: '当月',
        value: 1
      }, {
        label: '次月',
        value: 2
      }]
    }
  },

  computed: {},

  watch: {},

  created() {
    this.getDetail()
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 详情
     */
    getDetail() {
      this.loading = true
      hrmSalaryConfigQueryConfigAPI()
        .then(res => {
          this.loading = false
          this.form = res.data || { socialSecurityMonthType: 0 }
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 保存
     */
    saveClick() {
      if (this.form.socialSecurityMonthType == null) {
        return this.$message.error('请选择')
      }
      this.loading = true
      hrmSalaryConfigUpdateConfigAPI({
        socialSecurityMonthType: this.form.socialSecurityMonthType
      })
        .then(res => {
          this.loading = false
          this.$message.success('操作成功')
          this.getDetail()
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  height:100%;

  /deep/ .xr-header {
    padding: 15px 30px;
  }
}

.main-body {
  height: calc(100% - 70px);
  background-color: white;
  border-top: 1px solid $xr-border-line-color;
  border-bottom: 1px solid $xr-border-line-color;
  padding: 15px 20px;
  padding-top: 25px;
  overflow-y: auto;

  .main-item {
    font-size: 13px;
    margin-bottom: 15px;

    .label {
      color: #666;
    }
  }

  .main-handle {
    margin-top: 40px;
  }
}
</style>
