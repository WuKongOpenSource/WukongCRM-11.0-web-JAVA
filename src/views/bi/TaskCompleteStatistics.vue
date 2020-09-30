<template>
  <div
    v-loading="loading"
    class="main-container">
    <flexbox class="handle-bar">
      <flexbox justify="flex-start" class="title-box">
        <div class="icon-box">
          <span class="wk wk-my-task icon" />
        </div>
        <span class="text">业绩目标完成情况</span>
      </flexbox>
      <el-date-picker
        v-model="dateSelect"
        :clearable="false"
        :picker-options="pickerOptions"
        type="year"
        value-format="yyyy"
        placeholder="选择年"/>
      <el-select
        v-model="typeSelect">
        <el-option
          v-for="item in [{label:'合同金额', value:1},{label:'回款金额', value:2}]"
          :key="item.value"
          :label="item.label"
          :value="item.value"/>
      </el-select>
      <el-select
        v-model="dataSelect">
        <el-option
          v-for="item in [{label:'按部门', value:1},{label:'按员工', value:2}]"
          :key="item.value"
          :label="item.label"
          :value="item.value"/>
      </el-select>
      <xh-structure-cell
        v-if="dataSelect == 1"
        radio
        class="xh-structure-cell"
        @value-change="structureChange" />
      <xh-user-cell
        v-else
        radio
        class="xh-user-cell"
        @value-change="userChange" />
      <!-- <el-select
        v-model="structuresSelectValue"
        placeholder="选择部门"
        @change="structuresValueChange">
        <el-option
          v-for="item in deptList"
          :key="item.id"
          :label="item.name"
          :value="item.id"/>
      </el-select>
      <el-select
        v-model="userSelectValue"
        :clearable="true"
        placeholder="选择员工">
        <el-option
          v-for="item in userOptions"
          :key="item.userId"
          :label="item.realname"
          :value="item.userId"/>
      </el-select> -->
      <el-button
        type="primary"
        @click.native="handleClick('search')">搜索</el-button>
    </flexbox>
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
          stripe
          border
          height="400"
          highlight-current-row>
          <el-table-column
            v-for="(item, index) in fieldList"
            :key="index"
            :prop="item.field"
            :label="item.name"
            align="center"
            header-align="center"
            show-overflow-tooltip>
            <template v-if="item.children">
              <el-table-column
                v-for="(child, childIndex) in item.children"
                :key="childIndex"
                :prop="child.field"
                :label="child.name"
                align="center"
                header-align="center"
                show-overflow-tooltip/>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>

import { adminStructuresSubIndexAPI, userListAPI } from '@/api/common'
import { biAchievementStatisticsAPI, biAchievementStatisticsExportAPI } from '@/api/bi/bi'

import XhStructureCell from '@/components/CreateCom/XhStructureCell'
import XhUserCell from '@/components/CreateCom/XhUserCell'

import moment from 'moment'
import BaseMixin from './mixins/Base'
import SortMixin from './mixins/Sort'
import echarts from 'echarts'
import { floatAdd } from '@/utils'
import { debounce } from 'throttle-debounce'

export default {
  /** 业绩目标完成情况 */
  name: 'TaskCompleteStatistics',
  components: {
    XhStructureCell,
    XhUserCell
  },
  mixins: [BaseMixin, SortMixin],
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      loading: false,

      dateSelect: '', // 选择的date
      typeSelect: 1, // 类型选择 1销售（目标）2回款（目标）
      // /** 部门选择解析数据 */
      // structuresProps: {
      //   children: 'children',
      //   label: 'label',
      //   value: 'id'
      // },
      // deptList: [], // 部门列表
      // structuresSelectValue: '',
      // /** 用户列表 */
      // userOptions: [],
      // userSelectValue: '',

      // 部门员工
      dataSelect: 1,
      // 部门员工选择值
      deptSelectValue: [],
      userSelectValue: [],

      list: [],
      fieldList: [
        // { field: 'month', name: '时间' },
        // { field: 'receivables', name: '合同金额(元)' },
        // { field: 'achievement', name: '目标(元)' },
        // { field: 'rate', name: '完成率(%)' }
      ],

      axisChart: null, // 柱状图
      axisOption: null
    }
  },
  computed: {
    postParams() {
      const params = {
        year: this.dateSelect,
        type: this.typeSelect
      }
      params.isUser = this.dataSelect == 1 ? 0 : 1 // isUser  0 部门 1 员工
      if (this.dataSelect == 1) {
        params.deptId = this.deptSelectValue.length > 0 ? this.deptSelectValue[0].id : ''
      } else {
        params.userId = this.userSelectValue.length > 0 ? this.userSelectValue[0].userId : ''
      }

      return params
    }
  },
  mounted() {
    this.debouncedResize = debounce(300, this.resizeFn)

    this.$nextTick(() => {
      window.addEventListener('resize', this.debouncedResize)
    })

    this.dateSelect = moment(new Date())
      .year()
      .toString()
    // this.getDeptList()
    this.initAxis()
    this.getAhievementDatalist()

    const keysName = ['名称', '年度目标', '第一季度', '1月', '2月', '3月', '第二季度', '4月', '5月', '6月', '第三季度', '7月', '8月', '9月', '第四季度', '10月', '11月', '12月']
    const keys = ['name', 'Year', 'Quarter1', '1', '2', '3', 'Quarter2', '4', '5', '6', 'Quarter3', '7', '8', '9', 'Quarter4', '10', '11', '12']
    for (let index = 0; index < keysName.length; index++) {
      const key = keysName[index]
      if (index == 0) {
        this.fieldList.push({ field: keys[index], name: key })
      } else {
        const children = [
          { field: `achievement${keys[index]}`, name: '目标' },
          { field: `money${keys[index]}`, name: '完成' },
          { field: `rate${keys[index]}`, name: '完成率' }
        ]

        this.fieldList.push({ field: '', name: key, children: children })
      }
    }
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.debouncedResize)
  },

  methods: {
    /**
     * 窗口尺寸发生改变实时调整 EChart 尺寸
     */
    resizeFn() {
      if (this.axisChart) {
        this.axisChart.resize()
      }
    },

    /**
     * 部门选择
     */
    structureChange(data) {
      this.deptSelectValue = data.value || []
    },

    /**
     * 员工选择
     */
    userChange(data) {
      this.userSelectValue = data.value || []
    },

    /**
     * 获取部门列表
     */
    getDeptList() {
      this.loading = true
      adminStructuresSubIndexAPI()
        .then(res => {
          this.deptList = res.data
          this.loading = false
          if (res.data.length > 0) {
            this.structuresSelectValue = res.data[0].id
            this.getUserList()
            this.getAhievementDatalist()
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 部门更改 */
    structuresValueChange(data) {
      this.userSelectValue = ''
      this.userOptions = []
      this.getUserList() // 更新员工列表
    },
    /** 部门下员工 */
    getUserList() {
      const params = { pageType: 0 }
      params.deptId = this.structuresSelectValue
      userListAPI(params)
        .then(res => {
          this.userOptions = res.data
        })
        .catch(() => {})
    },
    /** 获取部门业绩完成信息 */
    getAhievementDatalist() {
      this.loading = true

      biAchievementStatisticsAPI(this.postParams)
        .then(res => {
          if (res.data && res.data.length > 0) {
            this.list = []
            // 月份合计list
            const sumList = []
            for (let index = 0; index < 12; index++) {
              sumList.push({
                achievement: 0,
                money: 0
              })
            }

            for (let index = 0; index < res.data.length; index++) {
              const element = res.data[index]
              // 循环出表头展示字段 注入element
              // 一条数据的开始 季度数据
              let quarter = {
                achievement: 0,
                money: 0
              }

              // 年数据
              const year = {
                achievement: 0,
                money: 0
              }

              for (let childIndex = 0; childIndex < element.list.length; childIndex++) {
                const child = element.list[childIndex]

                // 表展示数据
                const keys = ['achievement', 'rate', 'money']
                for (const key of keys) {
                  const childValue = child[key]
                  element[`${key}${childIndex + 1}`] = childValue

                  if (quarter.hasOwnProperty(key)) {
                    quarter[key] = floatAdd(quarter[key], childValue)
                    year[key] = floatAdd(year[key], childValue)
                  }
                }

                // 获取季度值
                if (childIndex % 3 == 2) {
                  const quarterIndex = parseInt(childIndex / 3) + 1
                  element[`achievementQuarter${quarterIndex}`] = quarter.achievement
                  element[`moneyQuarter${quarterIndex}`] = quarter.money
                  element[`rateQuarter${quarterIndex}`] = quarter.money ? (quarter.money / quarter.achievement * 100 + 0.001).toFixed(2).toString() : '0.00'
                  // 重置到新季度初始值
                  quarter = {
                    achievement: 0,
                    money: 0
                  }
                }


                // 合计数据
                const sumItem = sumList[childIndex]
                sumItem.achievement = floatAdd(sumItem.achievement, child.achievement)
                sumItem.money = floatAdd(sumItem.money, child.money)
              }
              // 获取年
              element['achievementYear'] = year.achievement
              element['moneyYear'] = year.money
              element['rateYear'] = year.money ? (year.money / year.achievement * 100 + 0.001).toFixed(2).toString() : '0.00'
              this.list.push(element)
            }


            var receivabless = []
            var achiements = []
            var rates = []



            for (let index = 0; index < sumList.length; index++) {
              const element = sumList[index]
              receivabless.push(element.money)
              achiements.push(element.achievement)

              if (element.achievement) {
                rates.push(element.money ? (element.money / element.achievement * 100 + 0.001).toFixed(2).toString() : '0.00')
              } else {
                rates.push('--')
              }
            }

            this.axisOption.series[0].data = receivabless
            this.axisOption.series[1].data = achiements
            this.axisOption.series[2].data = rates
            this.axisChart.setOption(this.axisOption, true)
          } else {
            this.list = []
            this.axisOption.series[0].data = []
            this.axisOption.series[1].data = []
            this.axisOption.series[2].data = []
            this.axisChart.setOption(this.axisOption, true)
          }

          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 顶部操作 */
    handleClick(type) {
      if (type === 'search') {
        this.refreshTableHeadAndChartInfo()
        this.getAhievementDatalist()
      }
    },
    /**
     * 刷新表头和图标关键字
     */
    refreshTableHeadAndChartInfo() {
      this.fieldList[1].name =
        this.typeSelect == 1 ? '合同金额(元)' : '回款金额(元)'
      this.axisOption.legend.data[0] =
        this.typeSelect == 1 ? '合同金额' : '回款金额'
      this.axisOption.series[0].name =
        this.typeSelect == 1 ? '合同金额' : '回款金额'
    },
    /** 柱状图 */
    initAxis() {
      var axisChart = echarts.init(document.getElementById('axismain'))

      var option = {
        color: ['#6ca2ff', '#6ac9d7', '#ff7474'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: ['合同金额', '目标', '完成率'],
          bottom: '0px',
          itemWidth: 14
        },
        grid: {
          top: '30px',
          left: '30px',
          right: '20px',
          bottom: '40px',
          containLabel: true,
          borderColor: '#fff'
        },
        xAxis: [
          {
            type: 'category',
            data: [
              '1月',
              '2月',
              '3月',
              '4月',
              '5月',
              '6月',
              '7月',
              '8月',
              '9月',
              '10月',
              '11月',
              '12月'
            ],
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
            name: '合同金额',
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            axisLabel: {
              color: '#333',
              formatter: '{value} 元'
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
            name: '完成率',
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            position: 'right',
            axisLabel: {
              color: '#333',
              formatter: '{value} %'
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
            name: '合同金额',
            type: 'bar',
            yAxisIndex: 0,
            barWidth: 15,
            data: []
          },
          {
            name: '目标',
            type: 'bar',
            yAxisIndex: 0,
            barWidth: 15,
            data: []
          },
          {
            name: '完成率',
            type: 'line',
            yAxisIndex: 1,
            data: []
          }
        ]
      }

      axisChart.setOption(option, true)
      this.axisOption = option
      this.axisChart = axisChart
    },

    /**
     * 导出点击
     */
    exportClick() {
      this.requestExportInfo(biAchievementStatisticsExportAPI, this.postParams)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import './styles/detail.scss';
.handle-bar {
  background-color: white;
  padding: 15px 20px 5px 20px;
  .title-box {
    width: 220px;
    display: flex;
    .icon-box {
      width: 34px;
      height: 34px;
      text-align: center;
      line-height: 34px;
      color: $xr-color-primary;
      background-color: #dfe8ff;
      border-radius: 50%;
      margin-right: 10px;
    }
    .text {
      font-size: 17px;
      font-weight: bold;
    }
  }
  .el-date-editor {
    width: 130px;
    margin-right: 15px;
  }
  .el-cascader {
    width: 130px;
    margin-right: 15px;
  }
  .el-select {
    width: 120px;
    margin-right: 15px;
  }

  .xh-user-cell,
  .xh-structure-cell {
    width: 120px;
    margin-right: 15px;
  }
}
</style>

