<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      :show-custom-select="true"
      :custom-default="showType"
      :custom-options="[{name:'折线图', value: 'line'}, {name:'饼状图', value: 'pie'},{name:'柱状图', value: 'bar'}]"
      title="客户转化率分析"
      class="filtrate-bar"
      module-type="customer"
      @load="loading=true"
      @change="searchClick"
      @typeChange="showTypeChange"/>
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
          @row-click="handleRowClick">
          <el-table-column
            v-for="(item, index) in fieldList"
            :key="index"
            :prop="item.field"
            :label="item.name"
            min-width="140"
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
  biCustomerConversionInfoAPI,
  biCustomerConversionAPI
} from '@/api/bi/customer'

import ReportList from '@/views/crm/workbench/components/ReportList'

import BaseMixin from '../mixins/Base'
import echarts from 'echarts'

export default {
  /** 客户转化率分析 */
  name: 'CustomerConversionStatistics',
  components: {
    ReportList
  },
  mixins: [BaseMixin],
  data() {
    return {
      loading: false,
      showType: 'line',

      axisOption: null,
      pieOption: null,

      postParams: {}, // 筛选参数
      list: [],
      axisList: [],
      fieldList: [],

      reportListShow: false,
      fieldReportList: [
        { prop: 'customerName', label: '客户名称' },
        { prop: 'contractName', label: '合同名称' },
        { prop: 'contractMoney', label: '合同金额（元）' },
        { prop: 'receivablesMoney', label: '回款金额（元）' },
        { prop: 'ownerUserName', label: '负责人' },
        { prop: 'createTime', label: '创建时间' },
        { prop: 'orderDate', label: '下单时间' }
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
    this.initPie()
    this.initAxis()
  },
  methods: {
    showTypeChange(type) {
      this.showType = type
      this.refreshChartInfo()
    },
    refreshChartInfo() {
      if (this.showType != 'pie') {
        this.axisOption.series[0].type = this.showType
        this.chartObj.setOption(this.axisOption, true)
      } else {
        this.chartObj.setOption(this.pieOption, true)
      }
    },
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
      biCustomerConversionAPI(this.postParams)
        .then(res => {
          this.loading = false
          const list = res.data || []
          this.axisList = list

          // 循环表头
          const fieldList = [{
            name: '日期',
            field: 'name'
          }]

          const pieData = []
          const axisData = []
          const legendData = []

          // 转化率table展示数据
          const listData = {
            name: '转化率'
          }
          for (let index = 0; index < list.length; index++) {
            const element = list[index]
            pieData.push({ name: element.type, value: element.pro })
            axisData.push(element.pro)
            legendData.push(element.type)
            fieldList.push({
              name: element.type,
              field: `type${index}`
            })
            listData[`type${index}`] = element.pro + '%'
          }

          this.fieldList = fieldList
          this.list = [listData]

          this.pieOption.legend.data = legendData
          this.pieOption.series[0].data = pieData

          this.axisOption.xAxis[0].data = legendData
          this.axisOption.series[0].data = axisData

          this.refreshChartInfo()
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
        this.reportData.request = biCustomerConversionInfoAPI
        const params = { ...this.postParams }
        params.type = column.label
        this.reportData.params = params
        this.reportListShow = true
      }
    },

    /** 柱状图 */
    initAxis() {
      this.chartObj = echarts.init(document.getElementById('axismain'))
      this.chartObj.on('click', params => {
        // seriesIndex	1：跟进客户数 2:跟进次数  dataIndex 具体的哪条数据
        // this.getRecordList(params.dataIndex)
      })

      this.axisOption = {
        color: ['#6ca2ff'],
        toolbox: this.toolbox,
        tooltip: {
          trigger: 'axis',
          formatter: '{b} : {c}% ',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: '40px',
          left: '30px',
          right: '30px',
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
            name: '',
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            axisLabel: {
              color: '#333',
              formatter: '{value}%'
            },
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
            name: '',
            type: this.showType,
            barWidth: 15,
            data: []
          }
        ]
      }
    },
    /** 饼状图 */
    initPie() {
      this.pieOption = {
        color: this.chartColors,
        toolbox: this.toolbox,
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}% '
        },
        legend: {
          type: 'scroll',
          bottom: '0px',
          data: []
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: '55%',
            center: ['40%', '50%'],
            stillShowZeroSum: false,
            data: [],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
