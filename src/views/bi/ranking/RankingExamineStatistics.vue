<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      :show-user-select="false"
      title="出差次数排行"
      class="filtrate-bar"
      module-type="ranking"
      @load="loading=true"
      @change="getDataList"/>
    <div class="content">
      <div class="content-title">出差次数排行（按创建人、出差时间统计）</div>
      <div
        v-empty="list.length === 0"
        class="axis-content"
        xs-empty-text="暂无排行">
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
          height="400"
          stripe
          border
          highlight-current-row>
          <el-table-column
            align="center"
            header-align="center"
            show-overflow-tooltip
            label="公司总排名">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            v-for="(item, index) in fieldList"
            :key="index"
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
import RankingMixin from '../mixins/Ranking'
import echarts from 'echarts'
import { biRankingExamineAPI, biRankingExamineExportAPI } from '@/api/bi/ranking'

export default {
  /** 出差次数排行 */
  name: 'RankingExamineStatistics',
  mixins: [RankingMixin],
  data() {
    return {}
  },
  computed: {},
  mounted() {
    this.fieldList = [
      { field: 'realname', name: '员工' },
      { field: 'structureName', name: '部门' },
      { field: 'count', name: '出差次数（次）' }
    ]
    this.initAxis()
  },
  methods: {
    getDataList(params) {
      this.postParams = params
      this.loading = true
      biRankingExamineAPI(params)
        .then(res => {
          this.loading = false
          this.list = res.data || []

          const showData = []
          const yAxis = []

          const rankingIndex = res.data.length > 10 ? 10 : res.data.length
          for (let index = 0; index < rankingIndex; index++) {
            const element = res.data[index]
            showData.splice(0, 0, parseFloat(element.count))
            yAxis.splice(0, 0, element.realname)
          }
          this.axisOption.yAxis[0].data = yAxis
          this.axisOption.series[0].data = showData
          this.chartObj.setOption(this.axisOption, true)
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 柱状图 */
    initAxis() {
      this.chartObj = echarts.init(document.getElementById('axismain'))
      this.axisOption.tooltip.formatter = '{b} : {c}次'
      this.axisOption.xAxis[0].name = '（次）'
      this.chartObj.setOption(this.axisOption, true)
    },

    /**
     * 导出点击
     */
    exportClick() {
      this.requestExportInfo(biRankingExamineExportAPI, this.postParams)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
