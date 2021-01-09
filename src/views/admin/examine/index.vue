<template>
  <div class="main">
    <xr-header
      icon-class="wk wk-approve"
      icon-color="#FFB940"
      label="业务审批流" />
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
        class="main-table"
        highlight-current-row
        style="width: 100%">
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
              @click="handleClick('change', scope)">{{ scope.row['status'] === 2 ? '启用' : '停用' }}</el-button>
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
    <business-approve-flow-create
      v-if="createShow"
      :detail="rowDetail"
      :is-copy="isCopyCreate"
      @success="getList"
      @close="createShow = false"
    />

    <!-- 审批流升级提醒 -->
    <approval-flow-update-dialog />
  </div>
</template>

<script>
import {
  examinesQueryListAPI,
  examinesUpdateStatusAPI
} from '@/api/examine'

import BusinessApproveFlowCreate from './Create'
import XrHeader from '@/components/XrHeader'
import ApprovalFlowUpdateDialog from '@/components/ApprovalFlow/ApprovalFlowUpdateDialog'

export default {
  // 系统管理 的 审核管理
  name: 'SystemExamine',
  components: {
    XrHeader,
    BusinessApproveFlowCreate,
    ApprovalFlowUpdateDialog
  },
  mixins: [],
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 240, // 表的高度
      list: [],
      fieldList: [
        {
          prop: 'examineName',
          label: '审批流名称',
          width: 150
        },
        {
          prop: 'label',
          label: '关联对象',
          width: 150
        },
        {
          prop: 'recheckType',
          label: '审批被拒后重新提交',
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
      labelList: [
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
      ],
      rowDetail: null,
      isCopyCreate: false,
      createShow: false
    }
  },
  computed: {},
  mounted() {
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 240
    }

    this.getList()
  },
  methods: {
    /**
     * 获取列表数据
     */
    getList() {
      this.loading = true
      examinesQueryListAPI({
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

    /**
     * 格式化字段
     */
    fieldFormatter(row, column) {
      // 如果需要格式化
      // 1 固定审批 2 授权审批
      if (column.property === 'label') {
        const findRes = this.labelList.find(o => o.value === row.label)
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
        // status    1 正常 2 停用 3 删除
      } else if (column.property === 'status') {
        if (row[column.property] === 2) {
          return '停用'
        }
        return '启用'
      } else if (column.property === 'recheckType') {
        return {
          1: '返回审批流初始层级',
          2: '跳过审批流已通过的层级，返回拒绝的层级'
        }[row[column.property]]
      }
      return row[column.property]
    },

    /**
     *  添加审批流
     */
    addExamine() {
      this.isCopyCreate = false
      this.rowDetail = null
      this.createShow = true
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
    handleClick(type, scope) {
      if (type === 'edit') {
        this.isCopyCreate = false
        this.rowDetail = scope.row
        this.createShow = true
      } else if (type === 'delete') {
        // 启用停用
        this.$confirm('您确定要删除该审批流?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            examinesUpdateStatusAPI({
              examineId: scope.row['examineId'],
              status: 3
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
            (scope.row['status'] === 2 ? '启用' : '停用') +
            '该审批流?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
          .then(() => {
            examinesUpdateStatusAPI({
              examineId: scope.row['examineId'],
              status: scope.row['status'] === 2 ? 1 : 2
            }).then(res => {
              this.$message({
                type: 'success',
                message: '操作成功'
              })
              this.getList()
            }).catch(() => {})
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消操作'
            })
          })
      } else if (type === 'copy') {
        this.isCopyCreate = true
        this.rowDetail = scope.row
        this.createShow = true
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
