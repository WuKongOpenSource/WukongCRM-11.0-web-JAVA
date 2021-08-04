<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <slide-view
    v-loading="loading"
    :listener-ids="listenerIDs"
    :no-listener-ids="noListenerIDs"
    :no-listener-class="noListenerClass"
    :body-style="{padding: 0, height: '100%', background: 'white'}"
    class="d-view"
    @afterEnter="viewAfterEnter"
    @close="hideView">
    <flexbox
      v-if="detailData"
      direction="column"
      align="stretch"
      style="padding: 0 15px 15px;"
      class="side-detail-main">
      <wk-detail-header
        :detail-value="detailData.employeeName"
        icon-class="wk wk-office"
        detail-name="姓名"
        icon-bg-color="#ECEEF2"
        icon-color="#42526E"
      />
      <el-carousel
        :autoplay="false"
        :loop="false"
        arrow="always"
        indicator-position="none"
        trigger="click" height="200px">
        <el-carousel-item v-for="(list, index) in carouselList" :key="index">
          <flexbox class="times-section">
            <div v-for="(item, subIndex) in list" :key="subIndex" class="times-section__item">
              <flexbox class="times">
                <div class="times__line"/>
                <wk-circle-tag
                  :label="getEmployeeLabelName(item)"
                  :des="item.status == 6 ? `${item.score}分` : ''"
                  :bold="item.status == 6"
                />
                <div class="times__line"/>
              </flexbox>
              <div class="item-label">{{ item.appraisalName }}</div>
              <div class="item-des">{{ getAppraisalTime(item) }}</div>
            </div>
          </flexbox>
        </el-carousel-item>
      </el-carousel>

      <div class="table-des">
        <span>已归档绩效：{{ detailData.apprailsaledCnt }}</span>
        <span style="margin-left: 40px;">进行中绩效：{{ detailData.apprailsalingCnt }}</span>
      </div>

      <el-table
        id="crm-table"
        :data="list"
        :cell-class-name="cellClassName"
        height="380"
        class="n-table--border el-table-header--white"
        stripe
        border
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column
          prop="index"
          label="序号"
          width="80"
          show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :prop="item.fieldName"
          :label="item.name"
          :formatter="fieldFormatter"
          show-overflow-tooltip/>
      </el-table>
    </flexbox>

    <employee-confirm-performance
      v-if="detailShow"
      :id="rowId"
      handle-type="evaluato-view"
      @close="detailShow = false"
    />
  </slide-view>
</template>

<script>
import {
  hrmPerformanceEmployeeQueryAppraisalNumAPI,
  hrmPerformanceQueryEmployeeAppraisalAPI
} from '@/api/hrm/performance'

import SlideView from '@/components/SlideView'
import WkDetailHeader from '@/components/WkDetailHeader'
import WkCircleTag from './components/WkCircleTag'

import { isEmpty } from '@/utils/types'
import { timeToFormatTime } from '@/utils'
import performanceModel from '../../selfService/performance/model/performance'
import EmployeeConfirmPerformance from '../../selfService/performance/components/EmployeeConfirmPerformance'

export default {
  // 绩效档案详情
  name: 'EmployeePerformanceDetail',
  components: {
    SlideView,
    WkDetailHeader,
    WkCircleTag,
    EmployeeConfirmPerformance
  },
  props: {
    // 详情信息id
    id: [String, Number],
    // 监听的dom 进行隐藏详情
    listenerIDs: {
      type: Array,
      default: () => {
        return ['crm-main-container']
      }
    },
    // 不监听
    noListenerIDs: {
      type: Array,
      default: () => {
        return []
      }
    },
    noListenerClass: {
      type: Array,
      default: () => {
        return ['el-table__body']
      }
    }
  },
  data() {
    return {
      loading: false,
      carouselList: [],
      list: [],
      fieldList: [{
        fieldName: 'appraisalName',
        name: '考核名称'
      }, {
        fieldName: 'time',
        name: '考核时间'
      }, {
        fieldName: 'status',
        name: '考核状态'
      }, {
        fieldName: 'score',
        name: '评分'
      }, {
        fieldName: 'resultLevel',
        name: '等级'
      }],
      detailData: null,
      // 查看详情
      rowId: '',
      detailShow: false
    }
  },
  computed: {},
  watch: {
    id() {
      this.detailData = null
      this.getDetial()
    }
  },
  mounted() {},

  beforeDestroy() {},
  methods: {
    viewAfterEnter() {
      this.getDetial()
    },

    /**
     * 详情
     */
    getDetial() {
      this.getPerformanceDetial()
      this.loading = true
      hrmPerformanceEmployeeQueryAppraisalNumAPI(this.id)
        .then(res => {
          this.detailData = res.data || {}
          this.loading = false
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },


    /**
     * 详情
     */
    getPerformanceDetial() {
      this.loading = true
      hrmPerformanceQueryEmployeeAppraisalAPI({
        employeeId: this.id,
        // 是否分页，0:不分页 1 分页
        pageType: 0
      })
        .then(res => {
          const list = res.data.list || []
          this.list = list

          const carouselList = [[]]
          for (let index = 0; index < list.length; index++) {
            const element = list[index]
            const subList = carouselList[carouselList.length - 1]
            if (subList && subList.length < 4) {
              subList.push(element)
            } else {
              carouselList.push([element])
            }
          }
          this.carouselList = carouselList
          this.loading = false
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },

    /**
     * 格式化字段
     */
    fieldFormatter(row, column) {
      if (column.property == 'time') {
        return this.getAppraisalTime(row)
      } else if (column.property == 'status') {
        return performanceModel.statusValue[row.status] || '--'
      }
      const value = row[column.property]
      return isEmpty(value) ? '--' : value
    },

    /**
     * 绩效时间
     */
    getAppraisalTime(data) {
      return `${timeToFormatTime(data.startTime, 'YYYY.MM.DD')}-${timeToFormatTime(data.endTime, 'YYYY.MM.DD')}`
    },

    /**
     * 圈主展示内容
     */
    getEmployeeLabelName(item) {
      if (item.status == 6) {
        return item.resultLevel
      }

      return performanceModel.statusValue[item.status]
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property == 'appraisalName') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 列表点击
     */
    handleRowClick(row, column, event) {
      if (column.property == 'appraisalName') {
        this.rowId = row.employeeAppraisalId
        this.detailShow = true
      }
    },

    /**
     * 关闭
     */
    hideView() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/side-detail.scss';
.times-section {
  padding: 0 55px;
  height: 100%;
  text-align: center;
  &__item {
    flex: 1;

    .item-label {
      margin-top: 15px;
      color: #666;
    }

    .item-des {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
    }
  }
}

.times {
  &__line {
    width: 100%;
    height: 1px;
    background-color: #E6E6E6;
  }

  .wk-circle-tag {
    flex-shrink: 0;
  }
}

.table-des {
  padding: 20px;
}
</style>
