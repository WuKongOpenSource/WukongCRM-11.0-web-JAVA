<template>
  <div
    v-loading="loading"
    class="sale-statistics card">
    <flexbox class="card-title">
      <span class="icon wk wk-target" />
      <div class="card-title-center text-one-ellipsis">{{ typeName }}金额目标及完成情况</div>
      <div class="card-title-right">
        <!--<span class="box">{{ filterText }}</span>
        <span class="box">{{ timeLine }}</span>-->
        <el-dropdown
          trigger="click"
          @command="handleCommand">
          <span class="box">
            {{ optionName }}<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(item, index) in options"
              :key="index"
              :command="index">
              {{ item.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </flexbox>
    <div class="card-desc">
      近一年的{{ typeName }}目标完成情况柱状图
      <el-button v-if="hasSetAuth" style="margin-left: 8px;" type="text" @click="enterSetPage">设置目标</el-button>
    </div>
    <div id="sale-statistics" />
  </div>
</template>

<script>
import { crmIndexSaletrendAPI } from '@/api/crm/workbench'

import echarts from 'echarts'
import chartMixins from './chartMixins'
import { mapGetters } from 'vuex'

export default {
  name: 'SaleStatistics',
  mixins: [chartMixins],
  data() {
    return {
      options: [
        { name: '合同金额', value: 1 },
        { name: '回款金额', value: 2 }
      ],
      optionName: '合同金额',
      optionValue: 1,
      chartOption: {
        color: ['#6ca2ff', '#ff7474'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: '46px',
          left: '20px',
          right: '20px',
          bottom: '10px',
          containLabel: true,
          borderColor: '#fff'
        },
        legend: {
          right: '20px',
          data: ['当月目标金额', '金额']
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
              lineStyle: { color: '#BDBDBD' }
            },
            splitLine: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            /** 坐标轴轴线相关设置 */
            axisLine: {
              lineStyle: { width: 0 }
            },
            splitLine: {
              lineStyle: {
                color: '#eee',
                type: 'dotted'
              }
            }
          }
        ],
        series: [
          {
            name: '当月目标金额',
            type: 'bar',
            stack: 'one',
            barMaxWidth: 25,
            barGap: '0',
            data: []
          },
          {
            name: '金额',
            type: 'bar',
            stack: 'two',
            barMaxWidth: 25,
            barGap: '0%',
            data: []
          }
        ]
      },
      chartObj: null,
      loading: false
    }
  },
  computed: {
    ...mapGetters(['manage']),
    // 目标设置权限
    hasSetAuth() {
      return this.manage && this.manage.crm && this.manage.crm.achievement
    },
    // 类型名字
    typeName() {
      return {
        1: '合同',
        2: '回款'
      }[this.optionValue]
    }
  },
  mounted() {
    this.initChart()
    // 获取默认 optionValue 类型的数据
    this.getData()
  },
  methods: {
    initChart() {
      this.chartObj = echarts.init(document.getElementById('sale-statistics'))
      this.chartObj.setOption(this.chartOption, true)
    },

    /**
     * 下拉菜单选项选择
     * @param index 选项序号
     */
    handleCommand(index) {
      if (this.optionValue === this.options[index].value) return
      this.optionName = this.options[index].name
      this.optionValue = this.options[index].value
      this.getData()
    },

    getData() {
      this.loading = true
      crmIndexSaletrendAPI({
        label: this.optionValue,
        ...this.getBaseParams()
      }).then(res => {
        // this.trendData = {
        //   totlaContractMoney: res.data.totlaContractMoney,
        //   totlaReceivablesMoney: res.data.totlaReceivablesMoney
        // }

        const list = res.data.list || []
        const contractList = []
        const receivablesList = []
        const xAxisData = []
        for (let index = 0; index < list.length; index++) {
          const element = list[index]
          contractList.push(element.achievement)
          receivablesList.push(element.money)
          xAxisData.push(element.type)
        }
        this.chartOption.xAxis[0].data = xAxisData
        this.chartOption.series[0].data = contractList
        this.chartOption.series[1].data = receivablesList

        this.chartObj.setOption(this.chartOption, true)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 进入设置页面
     */
    enterSetPage() {
      this.$router.push({
        name: 'crmBizGoals'
      })
    }
  }
}
</script>

<style scoped lang="scss">
  @import "style";
  #sale-statistics {
    width: 100%;
    height: 300px;
  }
</style>
