<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      title="公海客户分析"
      class="filtrate-bar"
      module-type="customer"
      @load="loading=true"
      @change="searchClick"/>
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
          v-if="showTable"
          :data="list"
          :summary-method="getSummaries"
          height="400"
          show-summary
          stripe
          border
          highlight-current-row
          @sort-change="({ prop, order }) => mixinSortFn(list, prop, order)">
          <el-table-column
            v-for="(item, index) in fieldList"
            :key="index"
            :prop="item.field"
            :label="item.name"
            sortable="custom"
            align="center"
            header-align="center"
            show-overflow-tooltip/>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import BaseMixin from '../mixins/Base'
import SortMixin from '../mixins/Sort'
import SummaryMixin from '../mixins/Summary'
import echarts from 'echarts'
import {
  biCustomerPoolAPI,
  biCustomerPoolListAPI,
  biCustomerPoolListExportAPI
} from '@/api/bi/customer'

export default {
  /** 公海客户分析 */
  name: 'CustomerPoolStatistics',
  mixins: [BaseMixin, SortMixin, SummaryMixin],
  data() {
    return {
      loading: false,
      axisOption: null,

      list: [],

      postParams: {}, // 筛选参数
      dataIndex: null,

      axisList: [],
      fieldList: [
        { field: 'realname', name: '姓名' },
        { field: 'deptName', name: '部门' },
        { field: 'receiveNum', name: '公海池领取客户数' },
        { field: 'putInNum', name: '进入公海客户数' }
      ]
    }
  },
  computed: {
    // 列表请求参数
    listPostParams() {
      const params = { ...this.postParams }

      if (this.dataIndex !== undefined && this.dataIndex !== null) {
        const dataItem = this.axisList[this.dataIndex]
        delete params.type
        params.startTime = dataItem.type
        params.endTime = dataItem.type
      }

      return params
    }
  },
  mounted() {
    this.initAxis()
  },
  methods: {
    /**
     * 搜索点击
     */
    searchClick(params) {
      this.postParams = params
      this.getDataList()
      this.getRecordList()
    },
    /**
     * 图表数据
     */
    getDataList() {
      this.loading = true
      biCustomerPoolAPI(this.postParams)
        .then(res => {
          this.loading = false
          this.axisList = res.data || []

          const putCounts = []
          const receiveCounts = []
          const xAxis = []
          for (let index = 0; index < res.data.length; index++) {
            const element = res.data[index]
            putCounts.push(element.putInNum)
            receiveCounts.push(element.receiveNum)
            xAxis.push(element.type)
          }
          this.axisOption.xAxis[0].data = xAxis
          this.axisOption.series[0].data = putCounts
          this.axisOption.series[1].data = receiveCounts
          this.chartObj.setOption(this.axisOption, true)
        })
        .catch(() => {
          this.loading = false
        })
    },
    /**
     * 获取相关列表
     */
    getRecordList(dataIndex) {
      this.dataIndex = dataIndex
      this.list = []
      this.loading = true
      biCustomerPoolListAPI(this.listPostParams)
        .then(res => {
          this.loading = false
          const data = res.data || {}
          this.list = data.list || []
          this.getSummariesData(data.total)
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 柱状图 */
    initAxis() {
      var chartObj = echarts.init(document.getElementById('axismain'))

      var option = {
        color: ['#6ca2ff', '#ff7474'],
        toolbox: this.toolbox,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: ['进入公海客户数', '公海池领取客户数'],
          bottom: '0px',
          itemWidth: 14
        },
        grid: {
          top: '40px',
          left: '30px',
          right: '50px',
          bottom: '40px',
          containLabel: true,
          borderColor: '#fff'
        },
        xAxis: [
          {
            type: 'category',
            data: [],
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            axisLabel: {
              color: '#333'
            },
            /** 坐标轴轴线相关设置 */
            axisLine: {
              lineStyle: { color: '#333' }
            },
            splitLine: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '进入公海客户数',
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            axisLabel: {
              color: '#333',
              formatter: '{value}个'
            },
            /** 坐标轴轴线相关设置 */
            axisLine: {
              lineStyle: { color: '#333' }
            },
            splitLine: {
              show: false
            }
          },
          {
            type: 'value',
            name: '公海池领取客户数',
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            axisLabel: {
              color: '#333',
              formatter: '{value}次'
            },
            /** 坐标轴轴线相关设置 */
            axisLine: {
              lineStyle: { color: '#333' }
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: '进入公海客户数',
            type: 'bar',
            yAxisIndex: 0,
            barWidth: 15,
            data: []
          },
          {
            name: '公海池领取客户数',
            type: 'bar',
            yAxisIndex: 1,
            barWidth: 15,
            data: []
          }
        ]
      }

      chartObj.setOption(option, true)
      chartObj.on('click', params => {
        // seriesIndex	1：进入公海客户数 2:公海池领取客户数  dataIndex 具体的哪条数据
        this.getRecordList(params.dataIndex)
      })
      this.axisOption = option
      this.chartObj = chartObj
    },

    /**
     * 导出点击
     */
    exportClick() {
      this.requestExportInfo(biCustomerPoolListExportAPI, this.listPostParams)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
