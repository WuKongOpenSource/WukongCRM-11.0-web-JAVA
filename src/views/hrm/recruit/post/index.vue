<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @Date: 2020-06-04 10:53:06
 * @LastEditTime: 2020-07-07 14:01:48
 * @LastEditors: yang
-->
<template>
  <div id="employee-main-container" class="employee-index">
    <xr-header
      style="padding: 0px 15px 15px 0;"
      ft-top="0"
      icon-class="wk wk-office"
      icon-color="#2362FB"
      placeholder="请输入职位名称"
      label="招聘职位"
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
        <el-button
          v-if="createAuth"
          icon="el-icon-plus"
          type="primary"
          @click="createClick">新建职位</el-button>
      </template>
    </xr-header>
    <div class="crm-container">
      <xr-table-header
        :handles="tabelHandles"
        :selects="selectionList"
        @command="handleCommand">
        <el-tabs v-model="tabType" style="width: 100%;margin-bottom: -8px;" @tab-click="createSaveSuccess">
          <el-tab-pane
            v-for="tab in tabList"
            :key="tab.name"
            :name="tab.name">
            <span slot="label">{{ tab.label }}<span v-if="tab.num > 0" style="margin-left: 5px;" class="tab-pane-num">{{ tab.num }}</span></span>
          </el-tab-pane>
        </el-tabs>
      </xr-table-header>
      <el-table
        v-loading="loading"
        id="crm-table"
        :row-height="40"
        :data="list"
        :height="tableHeight"
        :cell-class-name="cellClassName"
        use-virtual
        class="n-table--border el-table-header--white"
        stripe
        border
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange">
        <!-- <el-table-column
          show-overflow-tooltip
          type="selection"
          align="center"
          width="55"/> -->
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :prop="item.fieldName"
          :label="item.name"
          :min-width="item.width"
          :formatter="fieldFormatter"
          show-overflow-tooltip/>
        <el-table-column />
        <el-table-column
          v-if="updateStatusAuth"
          label="操作"
          fixed="right"
          width="100">
          <template slot-scope="scope">
            <el-dropdown
              trigger="click"
              @command="handleTypeClick($event, scope.row)">
              <i
                class="el-icon-more table-more" />
              <el-dropdown-menu slot="dropdown" style="width: 150px;">
                <el-dropdown-item
                  v-for="(item, index) in getRowDropdownItems(scope.row)"
                  :key="index"
                  :icon="item.icon"
                  :command="item.command">{{ item.label }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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

    <post-detail
      v-if="showDview"
      :id="rowID"
      @handle="detailHandle"
      @close="showDview=false"/>

    <post-create-view
      v-if="isCreate"
      :detail="handleRowData"
      @success="createSaveSuccess"
      @close="isCreate=false"/>

    <stop-post-dialog
      :id="handleRowData ? handleRowData.postId : ''"
      :visible.sync="stopDialogShow"
      @success="createSaveSuccess"
    />
  </div>
</template>

<script>
import {
  hrmRecruitPostQueryListAPI,
  hrmRecruitPostQueryNumAPI,
  hrmRecruitPostUpdateStatusAPI
} from '@/api/hrm/recruit/post'
import {
  hrmEmployeeAllListAPI
} from '@/api/hrm/employee'
import {
  hrmDeptQueryTreeListAPI
} from '@/api/hrm/dept'

import XrHeader from '@/components/XrHeader'
import XrTableHeader from '@/components/XrTableHeader'
import WkPopoverFilter from '@/components/NewCom/WkPopoverFilter'
import PostCreateView from './Create'
import PostDetail from './Detail'
import StopPostDialog from './components/StopPostDialog'

import { mapGetters } from 'vuex'
import postModel from '../model/post'
import { isEmpty } from '@/utils/types'

export default {
  name: 'PostIndex',
  components: {
    XrHeader,
    XrTableHeader,
    WkPopoverFilter,
    PostCreateView,
    PostDetail,
    StopPostDialog
  },
  data() {
    return {
      loading: false, // 加载动画
      isCreate: false, // 是创建
      tableHeight: document.documentElement.clientHeight - 235, // 表的高度
      list: [],
      fieldList: [],
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 60, 100],
      total: 0,
      search: '', // 搜索内容
      // 筛选宽
      popoverFilterWidth: 150,
      tabType: '1',
      tabList: [{
        label: '招聘中',
        name: '1',
        num: 0
      }, {
        label: '停止招聘',
        name: '0',
        num: 0
      }],
      /** 控制详情展示 */
      rowID: '', // 行信息
      showDview: false,
      // 高级筛选
      filterObj: {}, // 筛选确定数据
      filterList: [
        {
          name: '工作性质',
          field: 'jobNature',
          formType: 'radio',
          setting: postModel.getValueList(postModel.jobNatureValue)
        }, {
          name: '工作城市',
          field: 'city',
          formType: 'text',
          setting: []
        }, {
          name: '用人部门',
          field: 'deptId',
          formType: 'structure',
          props: {
            dataType: 'hrm'
          },
          request: hrmDeptQueryTreeListAPI,
          setting: []
        }, {
          name: '负责人',
          field: 'ownerEmployeeId',
          formType: 'user',
          props: {
            label: 'employeeName',
            value: 'employeeId'
          },
          request: hrmEmployeeAllListAPI,
          setting: []
        }],
      selectionList: [], // 勾选数据 用于全局导出
      // 编辑详情
      stopDialogShow: false,
      handleRowData: null // 需要编辑的详情
    }
  },

  provide() {
    return {
      'editAuth': this.editAuth
    }
  },

  computed: {
    ...mapGetters([
      'collapse',
      'hrm'
    ]),

    // 招聘权限
    recruitAuth() {
      return this.hrm.recruit
    },

    // 新建权限
    createAuth() {
      return this.recruitAuth && this.recruitAuth.savePost
    },

    // 编辑权限
    editAuth() {
      return this.recruitAuth && this.recruitAuth.updatePost
    },

    // 详情权限
    detailAuth() {
      return this.recruitAuth && this.recruitAuth.readPost
    },

    // 更新状态
    updateStatusAuth() {
      return this.recruitAuth && this.recruitAuth.updatePostStatus
    },

    // 操作
    tabelHandles() {
      const temps = []
      temps.push({
        label: '删除',
        command: 'delete',
        icon: 'wk wk-delete'
      })
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
      this.tableHeight = document.documentElement.clientHeight - 235
    }
    const fieldList = []
    for (let index = 0; index < postModel.fields.length; index++) {
      const field = postModel.fields[index]
      if (field.isTable) {
        const temp = {}
        temp.fieldName = field.field
        temp.name = field.name
        temp.width = field.width || 80
        fieldList.push(temp)
      }

      if (fieldList.length == 6) {
        fieldList.push({
          name: '招聘进度',
          fieldName: 'recruitSchedule',
          width: 80
        })
      }
    }
    fieldList.push({
      fieldName: 'status',
      name: '状态',
      width: 80
    })
    this.fieldList = fieldList
    this.refreshList()
    this.getTabsNum()
  },
  methods: {
    /**
     * 获取tab 数量
     */
    getTabsNum() {
      hrmRecruitPostQueryNumAPI()
        .then(res => {
          console.log(res.data)
          const data = res.data || {}
          this.tabList.forEach(item => {
            item.num = data[parseInt(item.name)] || 0
          })
        })
        .catch(() => {
        })
    },

    /**
     * 高级筛选
     */
    resetFilter() {
      this.filterObj = {}
      this.refreshList()
    },

    /**
     * 新建
     */
    createClick() {
      this.handleRowData = null
      this.isCreate = true
    },

    /**
     * 创建成功
     */
    createSaveSuccess() {
      this.getTabsNum()
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
     * 详情操作
     */
    detailHandle(data) {
      if (data.type === 'delete') {
        this.showDview = false
      }
      this.getTabsNum()
      this.getList()
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
        postName: this.search,
        status: this.tabType
      }

      for (var key in this.filterObj) {
        params[key] = this.filterObj[key]
      }

      hrmRecruitPostQueryListAPI(params)
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
      const valueObj = postModel[`${column.property}Value`]
      if (valueObj) {
        return valueObj[row[column.property]] || '--'
      } else if (column.property == 'ownerEmployeeId') {
        return row.ownerEmployeeName
      } else if (column.property == 'interviewEmployeeIds') {
        return row.interviewEmployeeName
      } else if (column.property == 'deptId') {
        return row.deptName
      } else if (column.property == 'postTypeId') {
        return row.postTypeName
      } else if (column.property == 'status') {
        return {
          1: '招聘中',
          0: '停止招聘'
        }[row[column.property] ] || '--'
      } else if (column.property == 'salary') {
        if (row.salaryUnit == -1) {
          return '面议'
        }
        return `${row.minSalary || ''}-${row.maxSalary || ''} ${postModel.salaryUnitValue[row.salaryUnit] || ''}`
      } else if (column.property == 'age') {
        if (row.minAge == -1 && row.maxAge == -1) {
          return '不限'
        }
        return `${row.minAge || ''}-${row.maxAge || ''}`
      } else {
        const value = row[column.property]
        if (column.property == 'recruitSchedule') {
          return isEmpty(value) ? '--' : `${value}%`
        }
        return isEmpty(value) ? '--' : value
      }
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (this.detailAuth && column.property == 'postName') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 列表操作
     */
    handleCommand(command) {
      // if (command === 'delete') {
      // }
    },

    /**
     * 列表点击
     */
    handleRowClick(row, column, event) {
      if (this.detailAuth && column.property == 'postName') {
        this.rowID = row.postId
        this.showDview = true
      }
    },

    /**
     * 勾选操作
     */
    handleSelectionChange(val) {
      this.selectionList = val // 勾选的行
    },

    /**
     * 获取行操作
     */
    getRowDropdownItems(data) {
      const dropdownItems = []
      // 试用状态操作
      if (data.status == 1) {
        dropdownItems.push({
          label: '停止招聘',
          command: 'stop',
          icon: 'wk wk-remove'
        })
      } else {
        dropdownItems.push({
          label: '启用招聘',
          command: 'start',
          icon: 'wk wk-activation'
        })
      }
      return dropdownItems
    },

    handleTypeClick(command, data) {
      if (command === 'stop') {
        this.handleRowData = data
        this.stopDialogShow = true
      } else {
        hrmRecruitPostUpdateStatusAPI({
          status: command == 'start' ? 1 : 0,
          postId: data.postId
        })
          .then(res => {
            this.$message.success('操作成功')
            this.createSaveSuccess()
          })
          .catch(() => {})
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

  /deep/.xr-table-header {
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

    .el-tabs__nav-wrap::after {
      height: 1px;
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
