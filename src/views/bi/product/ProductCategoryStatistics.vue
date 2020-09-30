<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      :show-product-selct="true"
      title="产品分类销量分析"
      class="filtrate-bar"
      module-type="product"
      @load="loading=true"
      @change="getDataList"/>
    <div class="content">
      <div class="axis-content">
        <div id="axismain"/>
      </div>
    </div>
  </div>
</template>

<script>
import BaseMixin from '../mixins/Base'
import echarts from 'echarts'
import { biProductCategoryAPI } from '@/api/bi/product'

export default {
  /** 产品分类销量分析 */
  name: 'ProductCategoryStatistics',
  mixins: [BaseMixin],
  data() {
    return {
      loading: false,
      axisOption: null
    }
  },
  computed: {},
  mounted() {
    this.initAxis()
  },
  methods: {
    getDataList(params) {
      this.loading = true
      biProductCategoryAPI(params)
        .then(res => {
          this.loading = false

          const numCounts = []
          const legendData = []
          for (let index = 0; index < res.data.length; index++) {
            const element = res.data[index]
            numCounts.push({ name: element.categoryName, value: element.num })
            legendData.push(element.categoryName)
          }
          this.axisOption.legend.data = legendData
          this.axisOption.series[0].data = numCounts
          this.chartObj.setOption(this.axisOption, true)
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 柱状图 */
    initAxis() {
      var chartObj = echarts.init(document.getElementById('axismain'))

      var option = {
        title: {
          text: '产品分类销售',
          x: 'center',
          bottom: '10'
        },
        color: this.chartColors,
        toolbox: this.toolbox,
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}'
        },
        legend: {
          orient: 'vertical',
          type: 'scroll',
          x: 'left',
          data: []
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['50%', '70%'],
            data: []
          }
        ]
      }

      chartObj.setOption(option, true)
      this.axisOption = option
      this.chartObj = chartObj
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
