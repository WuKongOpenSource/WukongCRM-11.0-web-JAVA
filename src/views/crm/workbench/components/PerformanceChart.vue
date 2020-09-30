<template>
  <div
    v-loading="loading"
    class="performance-chart card">
    <flexbox class="card-title">
      <span class="icon wk wk-performance" />
      <div class="card-title-center text-one-ellipsis">
        业绩指标完成率 ({{ optionName }})
      </div>
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
    <div id="performance-chart" />
    <flexbox justify="center" class="info-box">
      <flexbox direction="column" class="info-item">
        <div class="label">目标</div>
        <div class="value">{{ data.achievementMoneys }}元</div>
      </flexbox>
      <flexbox v-if="optionValue === 1" direction="column" class="info-item">
        <div class="label">合同金额</div>
        <div class="value">{{ data.contractMoneys }}元</div>
      </flexbox>
      <flexbox v-if="optionValue === 2" direction="column" class="info-item">
        <div class="label">回款金额</div>
        <div class="value">{{ data.receivablesMoneys }}元</div>
      </flexbox>
    </flexbox>
  </div>
</template>

<script>
import echarts from 'echarts'
import chartMixins from './chartMixins'
import {
  crmIndexAchievementDataAPI
} from '@/api/crm/workbench'

export default {
  name: 'PerformanceChart',
  mixins: [chartMixins],
  data() {
    return {
      chartOption: {
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
          {
            type: 'gauge',
            detail: {
              formatter: '{value}%',
              fontSize: 20,
              fontWeight: 'bold',
              color: '#5F879D'
            },
            data: [{ value: 0, name: '完成率' }],
            axisLine: {
              lineStyle: {
                width: 15,
                color: [[0.2, '#FF7474'], [0.8, '#FECD51'], [1, '#48E78D']]
              }
            },
            splitLine: {
              length: 13,
              lineStyle: { width: 0 }
            },
            /** 刻度样式 */
            axisTick: { show: false },
            /** 刻度标签 */
            axisLabel: { fontSize: 9 },
            /** 仪表盘指针 */
            pointer: {
              length: '70%',
              width: 4
            },
            /** 仪表盘指针颜色 */
            itemStyle: { color: '#5F879D' },
            title: { fontSize: 13, color: '#666' }
          }
        ]
      },
      loading: false,
      data: {
        achievementMoneys: 0,
        contractMoneys: 0,
        receivablesMoneys: 0
      },
      options: [
        { name: '回款金额', value: 2 },
        { name: '合同金额', value: 1 }
      ],
      optionName: '回款金额',
      optionValue: 2
    }
  },
  mounted() {
    this.initChart()
    this.getData()
  },
  methods: {
    initChart() {
      this.chartObj = echarts.init(document.getElementById('performance-chart'))
      this.chartObj.setOption(this.chartOption, true)
    },
    /**
     * 获取统计数据
     */
    getData() {
      if (this.loading) return
      this.loading = true
      crmIndexAchievementDataAPI({
        ...this.getBaseParams(),
        label: this.optionValue
      }).then(res => {
        this.loading = false
        if (res.data) {
          this.data = res.data
          this.chartOption.series[0].data[0].value =
            res.data.proportion || '0'
          this.chartObj.setOption(this.chartOption, true)
        }
      }).catch(() => {
        this.loading = false
      })
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
    }
  }
}
</script>

<style scoped lang="scss">
  @import "style";
  .performance-chart {
    position: relative;

    .el-dropdown-selfdefine {
      display: inline-block;
      cursor: pointer;
    }

    #performance-chart {
      width: 100%;
      height: 322px;
      margin-top: 10px;
    }

    .info-box {
      position: absolute;
      bottom: 24px;
      left: 0;
      width: 100%;
      .info-item {
        width: 20%;
        margin: 0 5px;
        .label {
          margin-bottom: 10px;
        }
      }
    }
  }
</style>
