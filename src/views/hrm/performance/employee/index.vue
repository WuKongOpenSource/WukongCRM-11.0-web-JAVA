<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <div id="employee-main-container" class="employee-index">
    <xr-header
      style="padding: 0px 15px 15px 0;"
      ft-top="0"
      icon-class="wk wk-perform"
      icon-color="#2362FB"
      placeholder="请输入员工姓名"
      label="绩效档案"
      show-search
      search-icon-type="icon"
      @search="searchClick" >
      <template slot="ft">
        <el-button v-if="hasFilterContent" type="text" @click="resetFilter">清除筛选</el-button>
        <wk-popover-filter
          :width="popoverFilterWidth"
          :field-from.sync="filterObj"
          :field-list="filterList"
          :has-content="hasFilterContent"
          style="margin-right: 5px;"
          placement="bottom"
          @sure="refreshList"
          @reset="resetFilter"
        />
      </template>
    </xr-header>
    <div class="crm-container">
      <el-table
        v-loading="loading"
        id="crm-table"
        :row-height="40"
        :data="list"
        :height="tableHeight"
        use-virtual
        class="n-table--border el-table-header--white"
        stripe
        border
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :prop="item.fieldName"
          :label="item.name"
          :min-width="item.width"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <template v-if="scope.column.property === 'employeeName'">
              <span class="can-visit--underline">{{ fieldFormatter(scope.row, scope.column) }}</span><span v-if="scope.row.isDel == 1" style="color: #999;">（已删除）</span>
            </template>
            <template v-else>
              {{ fieldFormatter(scope.row, scope.column) }}
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="p-contianer">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size.sync="pageSize"
          :total="total"
          class="p-bar"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"/>
      </div>
    </div>
    <employee-performance-detail
      v-if="detailShow"
      :id="rowID"
      @close="detailShow = false"
    />
  </div>
</template>

<script>
import {
  hrmPerformanceQuerylEmployeeListAPI
} from '@/api/hrm/performance'
import {
  hrmDeptQueryTreeListAPI
} from '@/api/hrm/dept'

import XrHeader from '@/components/XrHeader'
import WkPopoverFilter from '@/components/NewCom/WkPopoverFilter'
import EmployeePerformanceDetail from './EmployeePerformanceDetail'

import { mapGetters } from 'vuex'
import { isEmpty } from '@/utils/types'
import { employeeModel } from '../../employee/model/employee'

export default {
  name: 'EmployeeIndex',
  components: {
    XrHeader,
    WkPopoverFilter,
    EmployeePerformanceDetail
  },
  data() {
    return {
      loading: false, // 加载动画
      isCreate: false, // 是创建
      tableHeight: document.documentElement.clientHeight - 185, // 表的高度
      list: [],
      fieldList: [{
        fieldName: 'employeeName',
        name: '员工姓名',
        width: 140
      }, {
        fieldName: 'mobile',
        name: '手机号',
        width: 80
      }, {
        fieldName: 'deptName',
        name: '部门',
        width: 80
      }, {
        fieldName: 'employeeStatus',
        name: '员工状态',
        width: 80
      }, {
        fieldName: 'becomeTime',
        name: '入职时间',
        width: 80
      }, {
        fieldName: 'apprailsaledCnt',
        name: '已归档绩效',
        width: 80
      }, {
        fieldName: 'apprailsalingCnt',
        name: '进行中绩效',
        width: 80
      }, {
        fieldName: 'lastAppraisalName',
        name: '最近考核计划',
        width: 120
      }, {
        fieldName: 'lastAppraisalResult',
        name: '最近绩效等级及评分',
        width: 150
      }],
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 60, 100],
      total: 0,
      search: '', // 搜索内容
      // 筛选宽
      popoverFilterWidth: 150,
      /** 控制详情展示 */
      rowID: '', // 行信息
      detailShow: false,
      // 高级筛选
      filterObj: {}, // 筛选确定数据
      filterList: [
        {
          name: '手机号',
          field: 'mobile',
          formType: 'number',
          setting: []
        }, {
          name: '员工状态',
          field: 'employeeStatus',
          formType: 'select',
          setting: employeeModel.getValueList(employeeModel.validStatusValue)
        }, {
          name: '用人部门',
          field: 'deptId',
          formType: 'structure',
          props: {
            dataType: 'hrm'
          },
          request: hrmDeptQueryTreeListAPI,
          setting: []
        }]
    }
  },
  computed: {
    ...mapGetters([
      'collapse'
    ]),
    // 有筛选内容
    hasFilterContent() {
      if (this.filterObj) {
        let hasContent = false
        const keys = Object.keys(this.filterObj)
        for (let index = 0; index < keys.length; index++) {
          const key = keys[index]
          if (this.filterObj[key] != '' &&
           this.filterObj[key] != [] &&
           this.filterObj[key] != null &&
           this.filterObj[key] != undefined) {
            hasContent = true
          }
        }
        return hasContent
      }
      return false
    }
  },
  watch: {
    collapse: {
      handler(val) {
        this.popoverFilterWidth = document.documentElement.clientWidth - (val ? 89 : 225)
      },
      immediate: true
    }
  },
  created() {
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 185
    }
    this.refreshList()
  },
  methods: {
    /**
     * 高级筛选
     */
    resetFilter() {
      this.filterObj = {}
      this.refreshList()
    },
    /**
     * 搜索
     */
    searchClick(search) {
      this.search = search
      this.refreshList()
    },
    /**
     * 刷新
     */
    refreshList() {
      this.handleCurrentChange(1)
    },

    /**
     * 更改每页展示数量
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },

    /**
     * 更改当前页数
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },

    /**
     * 列表数据
     */
    getList() {
      this.loading = true
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        employeeName: this.search
      }

      for (var key in this.filterObj) {
        params[key] = this.filterObj[key]
      }

      hrmPerformanceQuerylEmployeeListAPI(params)
        .then(res => {
          this.list = res.data.list
          this.total = res.data.totalRow
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 格式化字段
     */
    fieldFormatter(row, column) {
      if (column.property == 'employeeStatus') {
        return employeeModel.statusValue[row.employeeStatus] || '--'
      } else {
        const value = row[column.property]
        return isEmpty(value) ? '--' : value
      }
    },

    // /**
    //  * 通过回调控制class
    //  */
    // cellClassName({ row, column, rowIndex, columnIndex }) {
    //   if (column.property == 'employeeName') {
    //     return 'can-visit--underline'
    //   } else {
    //     return ''
    //   }
    // },

    /**
     * 列表点击
     */
    handleRowClick(row, column, event) {
      if (column.property == 'employeeName') {
        this.rowID = row.employeeId
        this.detailShow = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.employee-index {
  .xr-header {
    /deep/ .xr-header__ft {
      top: 0;
      line-height: 34px;
    }
  }
  .search-button {
    border: none;

    &.is-select {
      background: $xr-color-primary;
      color: white;
    }
  }
}
</style>
