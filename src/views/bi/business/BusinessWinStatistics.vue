<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      title="商机转换率分析"
      class="filtrate-bar"
      module-type="business"
      @load="loading=true"
      @change="searchClick"/>
    <div class="content">
      <div class="axis-content">
        <div id="axismain"/>
      </div>
      <div class="table-content">
        <el-table
          :data="list"
          :cell-class-name="cellClassName"
          height="150"
          stripe
          border
          highlight-current-row
          @row-click="handleRowClick">
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

    <!-- 销售简报列表 -->
    <report-list
      :show.sync="reportListShow"
      :title="reportData.title"
      :placeholder="reportData.placeholder"
      :request="reportData.request"
      :params="reportData.params"
      :field-list="fieldReportList"/>
  </div>
</template>

<script>
import {
  biBusinessWinAPI,
  biBusinessTrendListAPI
} from '@/api/bi/business'

import ReportList from '@/views/crm/workbench/components/ReportList'

import BaseMixin from '../mixins/Base'
import echarts from 'echarts'


export default {
  /** 赢单机会转化率趋势分析 */
  name: 'BusinessWinStatistics',
  components: {
    ReportList
  },
  mixins: [BaseMixin],
  data() {
    return {
      loading: false,
      axisOption: null,

      list: [],

      postParams: {}, // 筛选参数
      axisList: [],
      fieldList: [],

      reportListShow: false,
      fieldReportList: [
        { prop: 'businessName', label: '商机名称' },
        { prop: 'customerName', label: '客户名称' },
        { prop: 'typeName', label: '商机状态组' },
        { prop: 'statusName', label: '商机阶段' },
        { prop: 'money', label: '商机金额' },
        { prop: 'dealDate', label: '预计成交日期' },
        { prop: 'ownerUserName', label: '负责人' },
        { prop: 'createTime', label: '创建时间' }
      ],
      reportData: {
        title: '',
        placeholder: '',
        request: null,
        params: null
      }
    }
  },
  computed: {},
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
    },
    /**
     * 图表数据
     */
    getDataList() {
      this.loading = true
      biBusinessWinAPI(this.postParams)
        .then(res => {
          this.loading = false
          this.axisList = res.data || []

          // 循环表头
          const fieldList = [{
            name: '日期',
            field: 'name'
          }]

          const endCounts = []
          const numCounts = []
          const proportionCounts = []
          const xAxis = []

          // 转化率table展示数据
          const listData = {
            name: '转化率'
          }
          for (let index = 0; index < this.axisList.length; index++) {
            const element = this.axisList[index]
            endCounts.push(element.businessEnd)
            numCounts.push(element.businessNum)
            proportionCounts.push(element.proportion)
            xAxis.push(element.type)

            fieldList.push({
              name: element.type,
              field: `type${index}`
            })
            listData[`type${index}`] = element.proportion + '%'
          }

          this.fieldList = fieldList
          this.list = [listData]

          this.axisOption.xAxis[0].data = xAxis

          this.axisOption.series[0].data = proportionCounts
          this.axisOption.series[1].data = numCounts
          this.axisOption.series[2].data = endCounts
          this.chartObj.setOption(this.axisOption, true)
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property != 'name' && row[column.property].replace('%', '') > 0) {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 列表点击
     */
    handleRowClick(row, column, event) {
      if (column.property != 'name' && row[column.property].replace('%', '') > 0) {
        this.reportData.title = `${column.label}详情`
        this.reportData.request = biBusinessTrendListAPI
        const params = { ...this.postParams }
        params.type = column.label
        this.reportData.params = params
        this.reportListShow = true
      }
    },

    /** 柱状图 */
    initAxis() {
      var chartObj = echarts.init(document.getElementById('axismain'))

      var option = {
        color: ['#6ca2ff', '#6ac9d7', '#ff7474'],
        toolbox: this.toolbox,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: ['赢单转化率', '商机总数', '赢单商机数'],
          bottom: '0px',
          itemWidth: 14
        },
        grid: {
          top: '40px',
          left: '40px',
          right: '40px',
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
            name: '赢单转化率',
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            axisLabel: {
              color: '#333',
              formatter: '{value}%'
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
            name: '商机数',
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
          }
        ],
        series: [
          {
            name: '赢单转化率',
            type: 'line',
            yAxisIndex: 0,
            data: []
          },
          {
            name: '商机总数',
            type: 'bar',
            yAxisIndex: 1,
            barMaxWidth: 15,
            data: []
          },
          {
            name: '赢单商机数',
            type: 'bar',
            yAxisIndex: 1,
            barMaxWidth: 15,
            data: []
          }
        ]
      }

      chartObj.setOption(option, true)
      chartObj.on('click', params => {
        // seriesIndex	1：赢单转化率 2:商机总数  dataIndex 具体的哪条数据
        // this.getRecordList(params.dataIndex)
      })
      this.axisOption = option
      this.chartObj = chartObj
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
