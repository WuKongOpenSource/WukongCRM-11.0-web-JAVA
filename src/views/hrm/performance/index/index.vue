<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <div id="employee-main-container" class="performance-index">
    <xr-header
      style="padding: 0px 15px 15px 0;"
      ft-top="0"
      icon-class="wk wk-perform"
      icon-color="#2362FB"
      label="考核计划" >
      <template slot="ft">
        <el-dropdown trigger="click" @command="showTypeChange">
          <div class="el-dropdown-link" >
            {{ tabShowType | showTypeName }}<i class="el-icon-arrow-down el-icon--right"/>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="board">卡片视图</el-dropdown-item>
            <el-dropdown-item command="list">列表视图</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button
          v-if="createAuth"
          style="margin-left: 8px;"
          icon="el-icon-plus"
          type="primary"
          @click="createClick">新建考核</el-button>
      </template>
    </xr-header>
    <div class="main-body">
      <flexbox>
        <wk-border-menu
          :list="tabLeftList"
          v-model="tabType"
          :is-select="!!tabLeftList.find(item => item.name == tabType)"
          style="flex: 1;"
          @select="refreshList"
        />
        <wk-border-menu
          :list="tabRightList"
          v-model="tabType"
          :is-select="!!tabRightList.find(item => item.name == tabType)"
          style="flex: 1;margin-left: 20px;"
          @select="refreshList"
        />
      </flexbox>
      <!-- <el-tabs v-model="tabType" style="width: 100%;" @tab-click="refreshList">
        <el-tab-pane
          v-for="tab in tabList"
          :key="tab.name"
          :name="tab.name">
          <span slot="label">{{ tab.label }}<span v-if="tab.num > 0" style="margin-left: 5px;" class="tab-pane-num">{{ tab.num }}</span></span>
        </el-tab-pane>
      </el-tabs> -->
      <div
        v-loading="loading"
        class="main-list">
        <template v-if="tabShowType === 'board'">
          <div v-empty="!list || list.length == 0" class="main-list__body">
            <el-card
              v-for="(item, index) in list"
              :key="index"
              class="main-card">
              <div class="main-card__header">
                <span class="can-visit--underline" @click="rowClick('check', item, index)">{{ item.appraisalName }}</span>
                <div class="header-handle">
                  <el-button v-if="detailAuth" plain @click="rowClick('check', item, index)">查看考核设置</el-button>
                  <el-button
                    v-if="isCanHandle(item, 'delete')"
                    plain
                    @click="rowClick('delete', item, index)">{{ getDeleteButtonName(item) }}</el-button>
                  <el-button
                    v-if="isCanHandle(item, 'status')"
                    :disabled="isHandleDisabled(item)"
                    type="primary"
                    @click="rowClick('status', item, index)">{{ getStatusHandleButtonName(item) }}</el-button>
                </div>
              </div>
              <el-row style="margin-top: 8px;">
                <el-col :span="9">
                  <el-table
                    :data="[item]"
                    style="width: 100%">
                    <el-table-column
                      show-overflow-tooltip
                      align="center"
                      header-align="center"
                      prop="date"
                      label="考核时间">
                      <template slot-scope="{row}">
                        {{ getPeriodTime(row) }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      show-overflow-tooltip
                      align="center"
                      header-align="center"
                      prop="appraisalRange"
                      label="考核范围"/>
                    <el-table-column
                      show-overflow-tooltip
                      align="center"
                      header-align="center"
                      prop="tableName"
                      label="考核模板"/>
                  </el-table>
                </el-col>
                <el-col :span="2" class="main-card__separate">&nbsp;</el-col>
                <el-col :span="13">
                  <el-table
                    :data="[item.statistics ? {...item.statistics, status: item.status} : {}]"
                    :cell-style="itemCellStyle"
                    align="center"
                    header-align="center"
                    style="width: 100%"
                    @row-click="numRowClick(arguments, item)">
                    <el-table-column
                      prop="0"
                      show-overflow-tooltip
                      align="center"
                      header-align="center"
                      label="考核人数">
                      <template slot-scope="scope">
                        <span :class="{'can-visit--underline':scope.row.status !== 0}">{{ scope.row[scope.column.property] }}</span><span style="color: #333;">人</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="1"
                      show-overflow-tooltip
                      align="center"
                      header-align="center"
                      label="目标待填写">
                      <template slot-scope="scope">
                        <span class="can-visit--underline">{{ scope.row[scope.column.property] }}</span><span style="color: #333;">人</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="2"
                      show-overflow-tooltip
                      align="center"
                      header-align="center"
                      label="目标待确认">
                      <template slot-scope="scope">
                        <span class="can-visit--underline">{{ scope.row[scope.column.property] }}</span><span style="color: #333;">人</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="3"
                      show-overflow-tooltip
                      align="center"
                      header-align="center"
                      label="结果待评定">
                      <template slot-scope="scope">
                        <span class="can-visit--underline">{{ scope.row[scope.column.property] }}</span><span style="color: #333;">人</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="4"
                      show-overflow-tooltip
                      align="center"
                      header-align="center"
                      label="结果待确认">
                      <template slot-scope="scope">
                        <span class="can-visit--underline">{{ scope.row[scope.column.property] }}</span><span style="color: #333;">人</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-col>
              </el-row>
              <el-steps :space="200" :active="item.isStop == 1 || item.status == 4 ? null : item.status">
                <el-step
                  v-for="(step, sIndex) in stepList"
                  :key="sIndex"
                  :title="step"
                  :icon="getStepIcon(item, sIndex)"
                />
              </el-steps>

              <img
                v-if="item.status === 4"
                class="main-card__stop"
                width="120px"
                src="@/assets/img/status-achieve.png" >
              <img
                v-else-if="item.isStop === 1"
                class="main-card__stop"
                width="120px"
                src="@/assets/img/status-stop.png" >
            </el-card>
          </div>
        </template>
        <div v-else class="main-list__body">
          <el-table
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
            @row-click="handleRowClick">
            <el-table-column
              v-for="(item, index) in fieldList"
              :key="index"
              :fixed="index == 0"
              :prop="item.field"
              :label="item.name"
              :min-width="item.width"
              :formatter="tableFieldFormatter"
              show-overflow-tooltip/>
            <el-table-column />
            <el-table-column
              label="操作"
              fixed="right"
              width="350">
              <template slot-scope="{ row, $index }">
                <el-button v-if="detailAuth" plain @click="rowClick('check', row, $index)">查看考核设置</el-button>
                <el-button
                  v-if="isCanHandle(row, 'delete')"
                  plain
                  @click="rowClick('delete', row, $index)">{{ getDeleteButtonName(row) }}</el-button>
                <el-button
                  v-if="isCanHandle(row, 'status')"
                  :disabled="isHandleDisabled(row)"
                  type="primary"
                  @click="rowClick('status', row, $index)">{{ getStatusHandleButtonName(row) }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
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

    <performance-create-view
      v-if="isCreate"
      :id="rowId"
      :status="rowStatus"
      @success="createSaveSuccess"
      @close="isCreate=false"/>

    <employees-view
      :visible.sync="employeesViewShow"
      :id="employeesViewData.appraisalId"
      :status="employeesViewData.status"
    />
  </div>
</template>

<script>
import {
  hrmPerformanceQueryListAPI,
  hrmPerformanceQueryStatusNumPI,
  hrmPerformanceDeleteAPI,
  hrmPerformanceStopAPI,
  hrmPerformanceUpdateStatusAPI
} from '@/api/hrm/performance'

import XrHeader from '@/components/XrHeader'
import XrTableHeader from '@/components/XrTableHeader'
import EmployeesView from './components/EmployeesView'
import PerformanceCreateView from './Create'
import WkBorderMenu from '../../components/WkBorderMenu'

import { timeToFormatTime } from '@/utils'
import { mapGetters } from 'vuex'
import { isEmpty } from '@/utils/types'

export default {
  name: 'PerformanceIndex',
  components: {
    XrHeader,
    XrTableHeader,
    PerformanceCreateView,
    EmployeesView,
    WkBorderMenu
  },
  filters: {
    showTypeName(value) {
      return {
        board: '卡片视图',
        list: '列表视图'
      }[value]
    }
  },
  data() {
    return {
      loading: false, // 加载动画
      isCreate: false, // 是创建
      tabShowType: 'list',
      list: [],
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 60, 100],
      total: 0,
      //  0 未开启考核 1 目标填写/目标确认中 2 结果评定中 3 结果确认中 4 归档 5 进行中的考核
      tabType: '5',
      tabLeftList: [{
        label: '未开始考核',
        name: '0',
        num: 0
      }, {
        label: '进行中考核',
        name: '5',
        num: 0
      }, {
        label: '已归档',
        name: '4',
        num: 0
      }],
      tabRightList: [{
        label: '目标填写/目标确认中',
        name: '1',
        num: 0
      }, {
        label: '结果评定中',
        name: '2',
        num: 0
      }, {
        label: '结果确认中',
        name: '3',
        num: 0
      }],
      stepList: [
        '发起考核',
        '填写目标/确认目标',
        '评定结果',
        '确认结果',
        '考核归档'
      ],
      // 控制详情展示
      rowId: null, // 行信息
      rowStatus: null, // 行状态
      showDview: false,
      employeesViewData: {},
      employeesViewShow: false,

      // 表格
      tableHeight: document.documentElement.clientHeight - 295, // 表的高度
      fieldList: [{
        field: 'appraisalName',
        width: 120,
        name: '考核名称'
      }, {
        field: 'status',
        width: 180,
        name: '当前阶段'
      }, {
        field: 'time',
        width: 180,
        name: '考核时间'
      }, {
        field: 'appraisalRange',
        width: 180,
        name: '考核范围'
      }, {
        field: 'tableName',
        width: 120,
        name: '考核模板'
      }, {
        field: 'statistics.0',
        width: 120,
        name: '考核人数'
      }, {
        field: 'statistics.1',
        width: 120,
        name: '目标待填写'
      }, {
        field: 'statistics.2',
        width: 120,
        name: '目标待确认'
      }, {
        field: 'statistics.3',
        width: 120,
        name: '结果待评定'
      }, {
        field: 'statistics.4',
        width: 120,
        name: '结果待确认'
      }]
    }
  },

  provide() {
    return {
      'editAuth': this.editAuth
    }
  },

  computed: {
    ...mapGetters([
      'hrm'
    ]),

    // 权限
    appraisalAuth() {
      return this.hrm.appraisal
    },

    // 新建
    createAuth() {
      return this.appraisalAuth && this.appraisalAuth.save
    },

    // 删除权限
    deleteAuth() {
      return this.appraisalAuth && this.appraisalAuth.delete
    },

    // 编辑权限
    editAuth() {
      return this.appraisalAuth && this.appraisalAuth.update
    },

    // 详情
    detailAuth() {
      return this.appraisalAuth && this.appraisalAuth.read
    },

    // 停用
    stopAuth() {
      return this.appraisalAuth && this.appraisalAuth.stop
    }
  },
  watch: {
  },
  beforeRouteUpdate(to, from, next) {
    if (to.query.tabType) {
      this.tabType = to.query.tabType
    }
    this.refreshList()
    next()
  },
  created() {
    // window.onresize = () => {
    //   this.tableHeight = document.documentElement.clientHeight - 275
    // }
    if (this.$route.query.tabType) {
      this.tabType = this.$route.query.tabType
    }
    this.refreshList()
  },
  methods: {
    /**
     * 展示乐行change
     */
    showTypeChange(type) {
      this.tabShowType = type
    },

    /**
     * 新建
     */
    createClick() {
      this.rowId = null
      this.isCreate = true
    },

    /**
     * 创建成功
     */
    createSaveSuccess() {
      this.refreshList()
    },
    /**
     * 刷新
     */
    refreshList() {
      this.getTabsNum()
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
     * 获取tab 数量
     */
    getTabsNum() {
      hrmPerformanceQueryStatusNumPI()
        .then(res => {
          const data = res.data || {}
          this.tabLeftList.forEach(item => {
            item.num = data[parseInt(item.name)] || 0
          })
          this.tabRightList.forEach(item => {
            item.num = data[parseInt(item.name)] || 0
          })
        })
        .catch(() => {
        })
    },

    /**
     * 列表数据
     */
    getList() {
      this.loading = true
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        pageType: 1, // 是否分页，0:不分页 1 分页
        status: this.tabType
      }

      hrmPerformanceQueryListAPI(params)
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
     * 获取周期时间
     */
    getPeriodTime(data) {
      return `${timeToFormatTime(data.startTime, 'YYYY.MM.DD')}-${timeToFormatTime(data.endTime, 'YYYY.MM.DD')}`
    },

    /**
     * 获取状态操作按钮名字
     */
    getStatusHandleButtonName(item) {
      if (item.status == 4) {
        return ''
      }
      // 终止的考核  和 结果确认中 状态 可进行归档
      if (item.isStop == 1) {
        return '归档'
      }
      return {
        0: '开启考核',
        1: '开启评定',
        2: '开启结果确认',
        3: '归档'
      }[item.status]
    },

    /**
     * 是否能操作
     */
    isCanHandle(item, type) {
      const can = item.status != 4

      if (type == 'delete') {
        if (this.getIsDeleteHandle(item)) {
          return can && this.deleteAuth
        } else {
          return can && this.stopAuth
        }
      }
      return can && this.editAuth
    },

    /**
     * 操作禁用
     */
    isHandleDisabled(item) {
      return (item.status == 3 && item.isArchive == 0) // 是否可以归档 0 否 1 是
    },

    /**
     * 删除终止按钮
     */
    getIsDeleteHandle(item) {
      //  0 未开启考核 1 目标填写/目标确认中 2 结果评定中 3 结果确认中 4 归档 5 进行中的考核
      return item.status == 0 || item.status == 4 || item.isStop == 1
    },

    getDeleteButtonName(item) {
      if (item.status == 4) {
        return ''
      }
      if (this.getIsDeleteHandle(item)) {
        return '删除考核'
      }
      return '终止考核'
    },

    /**
     * 操作
     */
    rowClick(type, item, index) {
      if (type == 'delete') {
        // 删除操作
        if (this.getIsDeleteHandle(item)) {
          this.deleteItem(item)
        } else {
          this.stopItem(item)
        }
      } else if (type == 'status') {
        //  0 未开启考核 1 目标填写/目标确认中 2 结果评定中 3 结果确认中 4 归档 5 进行中的考核
        if (item.status == 3 || item.isStop == 1) {
          const message = item.isStop == 1 ? `${this.getStatusMessage(item.status, item.isStop)}，归档后不能修改，是否确认归档？` : `${this.getStatusMessage(item.status)}，归档后不能修改，是否确认归档？`
          this.updateItemStatus(message, item, '4')
        } else if (item.status == 0) {
          this.updateItemStatus(`${this.getStatusMessage(item.status)}，开启考核后只能修改结果评定人和结果确认人，是否确认开启？`, item, '1')
        } else if (item.status == 1) {
          let message = `${this.getStatusMessage(item.status)}，` + this.getStatusNumMessage(false, item.statistics)
          message = `${message}开启评定后只能修改结果确认人，是否确认开启？`
          this.updateItemStatus(message, item, '2')
        } else if (item.status == 2) {
          let message = `${this.getStatusMessage(item.status)}，` + this.getStatusNumMessage(true, item.statistics)
          message = `${message}开启结果确认后将无法修改结果确认人，是否确认开启？`

          this.updateItemStatus(message, item, '3')
        }
      } else if (type == 'check') {
        this.rowStatus = item.status
        this.rowId = item.appraisalId
        this.isCreate = true
      }
    },

    /**
     * 值格式化
     */
    fieldFormatter(row, column, cellValue) {
      return `${cellValue}人`
    },

    /**
     * 数量颜色
     */
    numCellClassName({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        return row.status === 0 ? '' : 'can-visit--underline'
      }
      return 'can-visit--underline'
    },

    /**
    * 卡片点击单元样式
     */
    itemCellStyle({ row, column }) {
      if (column.property == 0) {
        return row.status !== 0 ? { cursor: 'pointer' } : {}
      }
      return { cursor: 'pointer' }
    },

    /**
     * 数量查看
     */
    numRowClick(args, data) {
      const arr = Array.prototype.slice.call(args)
      console.log(arr)
      // if (arr[1].property != '0') {
      const status = arr[1].property
      if (!(data.status === 0 && status == '0')) {
        this.employeesViewData = {
          appraisalId: data.appraisalId,
          status: status == '0' ? '' : status
        }
        this.employeesViewShow = true
      }
    },

    /**
     * 删除
     */
    deleteItem(item) {
      this.$confirm('确定要删除考核?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          hrmPerformanceDeleteAPI(item.appraisalId).then(res => {
            this.$message.success('删除成功')
            this.refreshList()
          }).catch(() => {})
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
    },

    /**
     *终止
     */
    stopItem(item) {
      let message = `${this.getStatusMessage(item.status)}，` + this.getStatusNumMessage(true, item.statistics)
      message = `${message}是否确认终止考核？`

      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          hrmPerformanceStopAPI(item.appraisalId).then(res => {
            this.$message.success('终止成功')
            this.refreshList()
          }).catch(() => {})
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
    },

    /**
     * 获取状态消息 无 已归档
     */
    getStatusMessage(status, isStop) {
      if (isStop === 1) {
        return '当前考核已终止'
      }
      return {
        0: '当前考核未开始',
        1: '当前考核在目标填写/目标确认中',
        2: '当前考核在结果评定中',
        3: '当前考核在结果确认中'
      }[status] || ''
    },

    /**
     * 获取num信息
     */
    getStatusNumMessage(evaluate = false, statistics) {
      const numObj = statistics || {}
      const writeNum = numObj[1]
      const sureNum = numObj[2]
      const evaluateNum = evaluate ? numObj[3] : 0
      let message = ''
      if (writeNum > 0 || sureNum > 0 || (evaluate && evaluateNum > 0)) {
        message = message + '还有'
        const mess = []
        if (writeNum > 0) {
          mess.push(`${writeNum}人目标待填写`)
        }
        if (sureNum > 0) {
          mess.push(`${sureNum}人目标待确认`)
        }
        if (evaluateNum > 0) {
          mess.push(`${evaluateNum}人结果待评定`)
        }
        message = message + mess.join('、') + '，'
      }
      return message
    },

    /**
     * 更新状态
     */
    updateItemStatus(message, item, status) {
      this.$confirm(`${message}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          hrmPerformanceUpdateStatusAPI({
            appraisalId: item.appraisalId,
            status
          }).then(res => {
            this.$message.success('操作成功')
            this.refreshList()
          }).catch(() => {})
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
    },

    // 表格
    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if ((column.property === 'statistics.0' && row.status !== 0) ||
      ['appraisalName', 'statistics.1', 'statistics.2', 'statistics.3', 'statistics.4'].includes(column.property)) {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 列表点击
     */
    handleRowClick(row, column, event) {
      if (column.property === 'appraisalName') {
        this.rowClick('check', row, null)
      } else if (['statistics.0', 'statistics.1', 'statistics.2', 'statistics.3', 'statistics.4'].includes(column.property)) {
        const columnProperty = column.property.split('.')[1]
        this.numRowClick([null, { property: columnProperty }], row)
      }
    },

    /**
     * 格式化字段
     */
    tableFieldFormatter(row, column, cellValue, index) {
      if (column.property === 'status') {
        // 1 已终止 并且不是 4归档状态 展示已终止
        const stopName = row.isStop == 1 && row.status != 4 ? '（已终止）' : ''
        return (this.stepList[cellValue] + stopName) || '--'
      } else if (column.property === 'time') {
        return this.getPeriodTime(row)
      }
      return isEmpty(cellValue) ? '--' : cellValue
    },

    /**
     * 获取阶段图标
     */
    getStepIcon(item, index) {
      // 如果有节点未完成
      if (index <= item.appraisalSteps) {
        return 'wk wk-success'
      } else if (index < item.activateSteps) {
        return 'wk wk-icon-datetime'
      } else if (index === item.activateSteps) {
        return ''
      } else if (index === 4 && item.status === 4) { // 最后一个归档阶段的状态
        return 'wk wk-success'
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.performance-index {
  height: 100%;
  .xr-header {
    /deep/ .xr-header__ft {
      top: 0;
      line-height: 34px;
    }
  }

  .el-dropdown-menu {
    .el-dropdown-title {
      padding: 0px 20px 10px;
      color: #999;
      border-bottom: 1px solid $xr-border-color-base;
    }
    .el-dropdown-menu__item {
      color: #333;
    }
  }

  .el-dropdown-link {
    cursor: pointer;
  }

  .wk-border-menu {
    margin-bottom: 8px;
  }

  /deep/.xr-table-header {
    border-bottom: 1px solid $xr-border-color-base;
    .xr-table-header__body {
      padding: 0;
    }
  }

  /deep/ .el-tabs {
    .el-tabs__nav-wrap::after {
      display: none;
    }

    .el-tabs__item {
      color: #42526E;
      font-weight: bold;
    }
  }

  .main-body {
    height: calc(100% - 88px);
  }
  .main-list {
    height: calc(100% - 88px);
    padding: 8px;
    position: relative;
    &__body {
      height: 100%;
      overflow-y: auto;
    }
  }
  .main-card {
    position: relative;

    /deep/ .el-card__body {
      padding: 10px 20px;
    }
    &__header {
      line-height: 45px;
      font-weight: bold;

      .header-handle {
        float: right;
      }
    }

    &__separate {
      position: relative;
      height: 80px;
      &::before {
        position: absolute;
        content: "";
        top: 20px;
        left: 50%;
        bottom: 20px;
        width: 1px;
        background-color: #EBECF0;
      }
    }

    &__stop {
      position: absolute;
      right: 60px;
      bottom: 0px;
      opacity: 0.6;
    }


    /deep/.el-table {
      background: #F9FAFC;
      border-radius: 4px;

      .el-table__header {
        margin-top: 8px;
      }

      .el-table__body {
        margin-top: -12px;
        margin-bottom: 5px;
      }

      th {
        background-color: transparent;
        border-bottom-color: transparent;
        .cell {
          font-weight: normal;
          color: #666;
        }
      }

      tr {
        background-color: transparent;
      }

      td {
        background-color: transparent;
        border-bottom-color: transparent;
        .cell {
          font-weight: bold;
        }
      }

      &::before {
        display: none;
      }
    }

    /deep/ .el-steps {
      margin-top: 15px;
      padding-left: 30px;

      .el-step__head.is-process,
      .el-step__head.is-success {
        color: $xr-color-primary;
        border-color: $xr-color-primary;
      }
      .el-step__title {
        font-size: 12px;
        transform: translateX(-50%);
        text-align: center;
        margin-left: 10px;
      }

      .el-step__title.is-process {
        font-weight: normal;
        color: #333;
      }

      .el-step__title.is-finish,
      .el-step__title.is-success {
        color: #333;
      }

      .el-step__line {
        height: 1px;
        left: 30px;
        right: 7px;
        top: 8px;
        overflow: hidden;
      }

      .el-step__icon {
        width: 16px;
        height: 16px;
      }

      .el-step__head.is-success  {
        .el-step__line {
          background-color: $xr-color-primary
        }
      }
      div[class="el-step__icon-inner"]{
        display: none;
      }
    }
  }

  .main-card + .main-card {
    margin-top: 15px;
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
      color: $xr-color-primary;
    }
  }
}
</style>
