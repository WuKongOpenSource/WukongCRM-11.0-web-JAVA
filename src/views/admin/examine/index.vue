<template>
  <div class="main">
    <xr-header
      icon-class="wk wk-approve"
      icon-color="#FFB940"
      label="审批流" />
    <div class="main-body">
      <div class="main-table-header">
        <el-button
          class="main-table-header-button xr-btn--orange"
          type="primary"
          icon="el-icon-plus"
          @click="addExamine">新建审批流程</el-button>
      </div>
      <el-table
        v-loading="loading"
        id="examine-table"
        :data="list"
        :height="tableHeight"
        :cell-class-name="cellClassName"
        class="main-table"
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :formatter="fieldFormatter"
          :prop="item.prop"
          :width="item.width"
          :label="item.label"
          show-overflow-tooltip/>
        <el-table-column/>
        <el-table-column
          fixed="right"
          label="操作"
          width="250">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleClick('edit', scope)">编辑</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick('delete', scope)">删除</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick('change', scope)">{{ scope.row['status'] === 0 ? '启用' : '停用' }}</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick('copy', scope)">复制并新建</el-button>
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
          background
          layout="prev, pager, next, sizes, total, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"/>
      </div>
    </div>
    <create-system-examine
      v-if="showHandleView"
      :handle="createHandleInfo"
      @save="getList"
      @hiden-view="showHandleView=false"/>
    <system-examine-detail
      v-if="showDetail"
      :data="detailData"
      @refresh="getList"
      @hide-view="showDetail=false"/>
  </div>
</template>

<script>
import {
  crmExamineQueryAllAPI,
  crmExamineUpdateStatusAPI
} from '@/api/examine'

import CreateSystemExamine from './components/CreateSystemExamine'
import SystemExamineDetail from './components/SystemExamineDetail'
import XrHeader from '@/components/XrHeader'

export default {
  /** 系统管理 的 审核管理 */
  name: 'SystemExamine',
  components: {
    CreateSystemExamine,
    SystemExamineDetail,
    XrHeader
  },
  mixins: [],
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 240, // 表的高度
      list: [],
      fieldList: [
        {
          prop: 'name',
          label: '审批流名称',
          width: 150
        },
        {
          prop: 'examineType',
          label: '流程类型',
          width: 150
        },
        {
          prop: 'categoryType',
          label: '关联对象',
          width: 150
        },
        {
          prop: 'userList',
          label: '适用范围',
          width: 150
        },
        {
          prop: 'updateUserName',
          label: '最后修改人',
          width: 150
        },
        {
          prop: 'updateTime',
          label: '最后修改时间',
          width: 150
        },
        {
          prop: 'status',
          label: '状态',
          width: 100
        }
      ],
      currentPage: 1,
      pageSize: 20,
      pageSizes: [10, 20, 30, 40],
      total: 0,
      /** 展示操作框 */
      showHandleView: false,
      // 创建的相关信息
      createHandleInfo: { action: 'save', type: 'examineflow', id: '' },
      // 详情展示
      showDetail: false,
      detailData: {},

      categoryTypeList: [
        { name: '合同', value: 1 },
        { name: '回款', value: 2 },
        { name: '发票', value: 3 },
        { name: '薪资', value: 4 },
        { name: '采购审批', value: 5 },
        { name: '采购退货审批', value: 6 },
        { name: '销售审批', value: 7 },
        { name: '销售退货审批', value: 8 },
        { name: '付款审批', value: 9 },
        { name: '回款审批', value: 10 },
        { name: '盘点审批', value: 11 },
        { name: '调拨审批', value: 12 }
      ]
    }
  },
  computed: {},
  mounted() {
    // 控制table的高度
    window.onresize = () => {
      self.tableHeight = document.documentElement.clientHeight - 240
    }

    this.getList()
  },
  methods: {
    /** 获取列表数据 */
    getList() {
      this.loading = true
      crmExamineQueryAllAPI({
        page: this.currentPage,
        limit: this.pageSize
      }).then(res => {
        this.list = res.data.list

        this.total = res.data.totalRow
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    /** 格式化字段 */
    fieldFormatter(row, column) {
      // 如果需要格式化
      // 1 固定审批 2 授权审批
      if (column.property === 'examineType') {
        if (row[column.property] === 1) {
          return '固定审批流'
        } else if (row[column.property] === 2) {
          return '授权审批人'
        } else {
          return ''
        }
        // 1 合同 2 回款
      } else if (column.property === 'categoryType') {
        const findRes = this.categoryTypeList.find(o => o.value === row.categoryType)
        return findRes ? findRes.name : '--'
      } else if (column.property === 'userList') {
        const structures = row['deptList'] || []
        let strName = structures
          .map(item => {
            return item.name
          })
          .join('、')

        const users = row['userList'] || []
        const userName = users
          .map(item => {
            return item.realname
          })
          .join('、')

        if (strName && userName) {
          strName += '、'
        }
        const name = strName + userName
        return name || '全公司'
        // 1 启用 0 禁用 2 删除
      } else if (column.property === 'status') {
        if (row[column.property] === 0) {
          return '停用'
        }
        return '启用'
      }
      return row[column.property]
    },
    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'name') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },
    /**
     *  添加审批流
     */
    addExamine() {
      this.createHandleInfo = { action: 'save', type: 'examineflow', id: '' }
      this.showHandleView = true
    },
    /** 列表操作 */
    // 当某一行被点击时会触发该事件
    handleRowClick(row, column, event) {
      if (column.property) {
        this.detailData = row
        this.showDetail = true
      }
    },
    // 更改每页展示数量
    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },
    // 更改当前页数
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },
    handleClick(type, scope) {
      if (type === 'edit') {
        this.createHandleInfo.action = 'update'
        this.createHandleInfo.id = scope.row.examineId
        this.createHandleInfo.data = scope.row
        this.showHandleView = true
      } else if (type === 'delete') {
        // 启用停用
        this.$confirm('您确定要删除该审批流?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            crmExamineUpdateStatusAPI({
              examineId: scope.row['examineId']
            }).then(res => {
              this.list.splice(scope.$index, 1)
              if (this.list.length === 0) {
                this.currentPage = this.currentPage - 1 > 0 ? this.currentPage - 1 : 1
              }
              this.getList()
              this.$message({
                type: 'success',
                message: '操作成功'
              })
            }).catch(() => {})
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      } else if (type === 'change') {
        // 启用停用
        this.$confirm(
          '您确定要' +
            (scope.row['status'] === 0 ? '启用' : '停用') +
            '该审批流?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
          .then(() => {
            crmExamineUpdateStatusAPI({
              examineId: scope.row['examineId'],
              status: scope.row['status'] === 0 ? 1 : 0
            }).then(res => {
              scope.row['status'] = scope.row['status'] === 0 ? 1 : 0
              this.$message({
                type: 'success',
                message: '操作成功'
              })
            }).catch(() => {})
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消操作'
            })
          })
      } else if (type === 'copy') {
        this.createHandleInfo.action = 'save'
        this.createHandleInfo.id = ''
        this.createHandleInfo.data = scope.row
        this.showHandleView = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  height:100%;

  /deep/ .xr-header {
    padding: 15px 30px;
  }
}

.main-body {
  background-color: white;
  border-top: 1px solid $xr-border-line-color;
  border-bottom: 1px solid $xr-border-line-color;
}

.main-table-header {
  height: 50px;
  background-color: white;
  position: relative;
  .main-table-header-button {
    float: right;
    margin-right: 20px;
    margin-top: 10px;
  }
}

.p-contianer {
  position: relative;
  background-color: white;
  height: 44px;
  .p-bar {
    float: right;
    margin: 5px 100px 0 0;
    font-size: 14px !important;
  }
}

@import '../styles/table.scss';
</style>
