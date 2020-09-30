<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      :show-business-select="true"
      title="销售漏斗"
      class="filtrate-bar"
      module-type="business"
      @load="loading=true"
      @change="getDataList"/>
    <div class="content">
      <div class="axis-content">
        <div id="axismain"/>
      </div>
      <div class="table-content">
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
            :sortable="item.sortable"
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
import echarts from 'echarts'
import { biBusinessFunnelAPI } from '@/api/bi/bi'

export default {
  /** 销售漏斗 */
  name: 'FunnelStatistics',
  components: {},
  mixins: [BaseMixin, SortMixin],
  data() {
    return {
      loading: false,

      list: [],
      fieldList: [
        { field: 'name', name: '阶段' },
        { field: 'money', name: '金额', sortable: 'custom' },
        { field: 'count', name: '商机数', sortable: 'custom' }
      ],

      funnelOption: null
    }
  },
  computed: {},
  mounted() {
    this.initAxis()
  },
  methods: {
    /**
     * 图表数据
     */
    getDataList(params) {
      this.loading = true
      biBusinessFunnelAPI(params)
        .then(res => {
          this.loading = false
          this.list = res.data
          var data = []
          let sumCount = 0
          for (let index = 0; index < res.data.length; index++) {
            const element = res.data[index]
            data.push({
              name: (element.name || '') + '(' + element.money + '元)',
              value: parseFloat(element.count)
            })
            sumCount += parseFloat(element.count)
          }

          this.funnelOption.series[0].data = data
          this.funnelOption.legend.data = data.map(o => o.name)
          this.funnelOption.series[0].max = sumCount < 1 ? 1 : sumCount
          this.chartObj.setOption(this.funnelOption, true)
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 合计
     */
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          if (index == 1) {
            sums[index] = sums[index].toFixed(2)
          }
        } else {
          sums[index] = 'N/A'
        }
      })
      return sums
    },

    /** 销售漏斗 */
    initAxis() {
      var chartObj = echarts.init(document.getElementById('axismain'))
      var option = {
        toolbox: this.toolbox,
        tooltip: {
          trigger: 'item',
          formatter: '{b} <br/> 商机个数: {c}个'
        },
        calculable: true,
        legend: {
          data: [],
          // 图例文本格式化
          formatter: function(name) {
            return name.split('(')[0]
          }
        },
        grid: {
          left: 0,
          right: 0,
          bottom: 0,
          top: 0
        },
        color: this.chartColors,
        series: [
          {
            name: '漏斗图',
            type: 'funnel',
            left: '20%',
            width: '56%',
            /** 数据排序 */
            sort: 'none',
            /** 数据图形间距。 */
            gap: 2,

            label: {
              normal: {
                show: true,
                position: 'right'
              },
              emphasis: {
                textStyle: {
                  fontSize: 20
                }
              }
            },
            labelLine: {
              normal: {
                length: 20,
                lineStyle: {
                  width: 1,
                  type: 'solid'
                }
              }
            },
            data: []
          }
        ]
      }

      chartObj.setOption(option, true)
      this.funnelOption = option
      this.chartObj = chartObj
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
