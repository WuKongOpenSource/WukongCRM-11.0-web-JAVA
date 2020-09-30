<template>
  <div class="system-customer">
    <xr-header
      icon-class="wk wk-customer"
      icon-color="#2362FB"
      label="业绩目标设置" />
    <div class="customer-content">
      <!-- 业绩目标设置 -->
      <div class="system-view-table">
        <task-set-statistics/>
      </div>
    </div>
  </div>
</template>

<script>
import TaskSetStatistics from './components/TaskSetStatistics' // 业绩目标设置
import XrHeader from '@/components/XrHeader'

export default {
  name: 'BizGoals', // 业绩目标设置

  components: {
    TaskSetStatistics,
    XrHeader
  },

  data() {
    return {
    }
  },

  created() {},

  methods: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.system-customer {
  /* padding: 0 20px 20px; */
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  /deep/ .xr-header {
    padding: 15px 30px;
  }
}
.customer-content {
  flex: 1;
  position: relative;
  display: flex;
  overflow: hidden;
}

.system-view-table {
  flex: 1;
  border: 1px solid #e6e6e6;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
}
</style>
