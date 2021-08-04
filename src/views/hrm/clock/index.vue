<template>
  <div id="employee-main-container" class="clock-index">
    <xr-header
      style="padding: 0px 15px 15px 0;"
      ft-top="0"
      icon-class="wk wk-schedule"
      icon-color="#2362FB"
      placeholder="请输入员工姓名/工号"
      label="打卡记录"
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
        <el-dropdown
          v-if="headerMoreHandle.length > 0"
          trigger="click"
          style="margin-left: 5px;"
          @command="headerMoreHandleClick">
          <el-button icon="el-icon-more"/>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(item, index) in headerMoreHandle"
              :key="index"
              :icon="item.icon"
              :command="item.type">{{ item.name }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
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
        style="width: 100%">
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :fixed="index == 0"
          :prop="item.fieldName"
          :label="item.name"
          :min-width="item.width"
          :formatter="fieldFormatter"
          show-overflow-tooltip/>
        <el-table-column />
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
  </div>
</template>

<script>
import {
  hrmClockQueryPageListAPI,
  hrmAttendanceClockExportAPI
} from '@/api/hrm/clock'
import {
  hrmDeptQueryTreeListAPI
} from '@/api/hrm/dept'


import XrHeader from '@/components/XrHeader'
import WkPopoverFilter from '@/components/NewCom/WkPopoverFilter'

import moment from 'moment'
import { mapGetters } from 'vuex'
import { isEmpty } from '@/utils/types'
import { downloadExcelWithResData } from '@/utils'

export default {
  name: 'ClockIndex',
  components: {
    XrHeader,
    WkPopoverFilter
  },
  data() {
    return {
      loading: false, // 加载动画
      createType: '', // 创建类型
      tableHeight: document.documentElement.clientHeight - 190, // 表的高度
      list: [],
      fieldList: [],
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 60, 100],
      total: 0,
      search: '', // 搜索内容
      // 筛选宽
      popoverFilterWidth: 150,
      // 高级筛选
      filterObj: {
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        deptId: null
      }, // 筛选确定数据
      filterList: [
        {
          name: '时间',
          field: 'date',
          formType: 'date',
          setting: []
        },
        {
          name: '部门',
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
      'collapse',
      'hrm'
    ]),

    /**
     * 头部更多操作
     */
    headerMoreHandle() {
      const temps = []
      if (this.hrm.attendance && this.hrm.attendance.excelexport) {
        temps.push({ type: 'export', name: '导出', icon: 'wk wk-export' })
      }
      return temps
    },

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
      this.tableHeight = document.documentElement.clientHeight - 190
    }
    this.getFieldList()
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
     * 获取表头展示字段
     */
    getFieldList() {
      this.fieldList = [
        { fieldName: 'employeeName', name: '姓名', sortable: '', width: 100 },
        { fieldName: 'jobNumber', name: '工号', sortable: '', width: 100 },
        { fieldName: 'deptName', name: '部门', sortable: '', width: 100 },
        { fieldName: 'post', name: '岗位', sortable: '', width: 100 },
        { fieldName: 'attendanceTime', name: '上班日期', sortable: '', width: 100 },
        { fieldName: 'clockType', name: '打卡类型', sortable: '', width: 100 },
        { fieldName: 'clockTime', name: '打卡时间', sortable: '', width: 100 },
        { fieldName: 'address', name: '打卡地点', sortable: '', width: 100 }
      ]
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
        pageType: 1,
        search: this.search
      }

      for (var key in this.filterObj) {
        params[key] = this.filterObj[key]
      }


      hrmClockQueryPageListAPI(params)
        .then(res => {
          this.list = res.data.list
          this.total = res.data.totalRow
          if (res.data.totalRow && Math.ceil(res.data.totalRow / this.pageSize) < this.currentPage && this.currentPage > 1) {
            this.currentPage = this.currentPage - 1
            this.getList()
          } else {
            this.total = res.data.totalRow
            this.loading = false
          }

          this.$nextTick(() => {
            const warpDom = document.querySelector('.el-table__body-wrapper')
            warpDom.scrollTop = 1
            if (warpDom.scrollLeft != 0) {
              warpDom.scrollLeft = warpDom.scrollLeft - 1
            }
          })
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
      if (column.property == 'clockType') {
        return {
          1: '上班打卡',
          2: '下班打卡'
        }[row[column.property]] || '--'
      } else {
        return isEmpty(row[column.property]) ? '--' : row[column.property]
      }
    },

    /**
     * 头部更多操作
     */
    headerMoreHandleClick(command) {
      if (command == 'export') {
        this.loading = true
        const params = {
          search: this.search
        }

        for (var key in this.filterObj) {
          params[key] = this.filterObj[key]
        }

        hrmAttendanceClockExportAPI(params).then(res => {
          downloadExcelWithResData(res)
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.clock-index {
  .xr-header {
    /deep/ .xr-header__ft {
      top: 0;
      line-height: 34px;
    }
  }

  /deep/.xr-table-header {
    border-bottom: 1px solid $xr-border-color-base;
    .xr-table-header__body {
      padding: 0;
    }
  }
  .search-button {
    border: none;

    &.is-select {
      background: $xr-color-primary;
      color: white;
    }
  }

  /deep/ .el-tabs {
    .el-tabs__header {
      margin-bottom: 0;
    }

    .el-tabs__item {
      color: #42526E;
      font-weight: bold;
    }
  }

  .tab-pane-num {
    background-color: #DFE1E6;
    border-radius: 10px;
    color: #42526E;
    display: inline-block;
    font-size: 12px;
    font-weight: bold;
    height: 18px;
    line-height: 18px;
    padding: 0 6px;
    text-align: center;
    white-space: nowrap;
    border: 1px solid #fff;
  }

  .table-more {
    cursor: pointer;
    &:hover {
      color: $xr-color-primary
    }
  }
}
</style>
