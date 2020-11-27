<template>
  <div
    v-loading="loading"
    class="sales-funnel card">
    <flexbox class="card-title">
      <span class="icon wk wk-funnel" />
      <div class="card-title-center text-one-ellipsis">
        销售漏斗
        <template v-if="businessId">
          (商机组：{{ businessName }})
        </template>
      </div>
      <div class="card-title-right">
        <!--<span class="box">{{ filterText }}</span>
        <span class="box">{{ timeLine }}</span>-->
        <el-dropdown
          v-if="businessId"
          trigger="click"
          @command="handleCommand">
          <span class="box">
            {{ businessName }}<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(item, index) in businessOptions"
              :key="index"
              :command="index">
              {{ item.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </flexbox>
    <div id="sales-funnel" />
    <flexbox justify="center" class="info-box">
      <flexbox direction="column" class="info-item">
        <div class="label">赢单</div>
        <div class="value">{{ funnelData.winSingle }}元</div>
      </flexbox>
      <flexbox direction="column" class="info-item">
        <div class="label">输单</div>
        <div class="value">{{ funnelData.loseSingle }}元</div>
      </flexbox>
    </flexbox>
  </div>
</template>

<script>
import echarts from 'echarts'
import chartMixins from './chartMixins'
import { crmIndexFunnelAPI } from '@/api/crm/workbench'
import { crmBusinessStatusListAPI } from '@/api/crm/business'

export default {
  name: 'SalesFunnel',
  mixins: [chartMixins],
  data() {
    return {
      chartOption: {
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
        series: [
          {
            type: 'funnel',
            /** 数据排序 */
            sort: 'none',
            /** 数据图形间距。 */
            gap: 2,
            min: 0,
            max: 100,
            label: {
              normal: {
                show: true,
                position: 'right'
              },
              emphasis: {
                textStyle: {
                  fontSize: 16
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
            itemStyle: {
              /** 传入的是数据项 seriesIndex, dataIndex, data, value 等各个参数 */
              color: data => {
                return [
                  '#6CA2FF',
                  '#6AC9D7',
                  '#72DCA2',
                  '#DBB375',
                  '#E164F7',
                  '#FF7474',
                  '#FFB270',
                  '#FECD51'
                ][data.dataIndex % 8]
              }
            },
            data: []
          }
        ]
      },
      chartObj: null,
      loading: false,
      dataList: [],
      businessOptions: [],
      businessId: null,
      businessName: '',

      funnelData: {}
    }
  },
  mounted() {
    this.initChart()
    this.getBusinessStatusList()
  },
  methods: {
    initChart() {
      this.chartObj = echarts.init(document.getElementById('sales-funnel'))
      this.chartObj.setOption(this.chartOption, true)
      this.chartObj.on('click', params => {
        this.$emit('chart-click', params, this.dataList[params.dataIndex])
      })
    },
    /**
     * 获取统计数据
     */
    getData() {
      if (!this.businessId) return
      this.loading = true
      crmIndexFunnelAPI({
        ...this.getBaseParams(),
        typeId: this.businessId
      }).then(res => {
        this.loading = false
        const data = []
        let sumCount = 0

        const resData = res.data || {}
        this.dataList = resData.list || []
        for (let index = 0; index < this.dataList.length; index++) {
          const element = this.dataList[index]
          data.push({
            name: (element.name || '') + '(' + element.money + '元)',
            value: element.count
          })
          sumCount += parseFloat(element.count || 0)
        }

        this.chartOption.series[0].data = data
        this.chartOption.legend.data = data.map(o => o.name)
        this.chartOption.series[0].max = sumCount < 1 ? 1 : sumCount
        this.chartObj.setOption(this.chartOption, true)

        this.funnelData = {
          winSingle: resData.sumYing,
          loseSingle: resData.sumShu
        }
      }).catch(() => {
        this.loading = false
      })
    },
    /**
     * 获取商机状态组
     */
    getBusinessStatusList() {
      this.loading = true
      crmBusinessStatusListAPI().then(res => {
        const list = res.data || []
        this.businessOptions = list.filter(item => {
          return item.status === 1
        })
        if (this.businessOptions.length > 0) {
          this.handleCommand(0)
        } else {
          this.loading = false
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
      if (this.businessId === this.businessOptions[index].typeId) return
      this.businessId = this.businessOptions[index].typeId || null
      this.businessName = this.businessOptions[index].name || ''
      if (this.businessId) {
        this.getData()
      }
    }
  }
}
</script>

<style scoped lang="scss">
  @import "style";
  #sales-funnel {
    width: 100%;
    height: 322px;
    margin-top: 10px;
  }

  .sales-funnel {
    position: relative;
    .card-title-left .icon {
      color: #50CF9E;
    }

    .el-dropdown-selfdefine {
      display: inline-block;
      cursor: pointer;
    }

    .info-box {
      position: absolute;
      bottom: 24px;
      left: 0;
      width: 100%;
      .info-item {
        width: 15%;
        margin: 0 5px;
        .label {
          margin-bottom: 5px;
        }
        &:nth-child(1) {
          color: #6ca2ff;
        }
        &:nth-child(2) {
          color: #ff7474;
        }
      }
    }
  }
</style>
