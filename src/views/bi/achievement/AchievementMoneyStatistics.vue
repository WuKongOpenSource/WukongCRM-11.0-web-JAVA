<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      :show-year-select="true"
      title="合同金额分析"
      class="filtrate-bar"
      module-type="contract"
      @load="loading=true"
      @change="getDataList"/>
    <div class="content">
      <div class="axis-content">
        <div id="axismain"/>
      </div>
      <div class="table-content">
        <div class="handle-bar">
          <el-button
            class="export-btn"
            @click="exportClick">导出</el-button>
        </div>
        <el-table
          :data="list"
          height="180"
          stripe
          border
          highlight-current-row>
          <el-table-column
            v-for="(item, index) in fieldList"
            :key="index"
            :fixed="index==0?true: false"
            :min-width="index==0?180: 100"
            :prop="item.field"
            :label="item.name"
            align="center"
            header-align="center"
            show-overflow-tooltip/>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import AchievementMixin from '../mixins/Achievement'

export default {
  /** 合同金额分析 */
  name: 'AchievementMoneyStatistics',
  mixins: [AchievementMixin],
  data() {
    return {}
  },
  computed: {},
  created() {
    this.type = 'money'
  },
  methods: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
