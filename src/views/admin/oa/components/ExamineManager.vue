<template>
  <div>
    <div class="se-table-header">
      <el-button
        class="se-table-header-button xr-btn--orange"
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
      stripe
      highlight-current-row
      style="width: 100%">
      <el-table-column
        width="100"
        label="审批流图标">
        <template slot-scope="scope">
          <div
            :style="{ backgroundColor: scope.row.iconColor }"
            class="table-icon">
            <i :class="scope.row.iconClass" />
          </div>
        </template>
      </el-table-column>
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
            @click="handleClick('edit-table', scope)">编辑表单</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleClick('edit', scope)">编辑</el-button>
          <el-button
            :disabled="scope.row.isSys === 1"
            type="text"
            size="small"
            @click="handleClick('delete', scope)">删除</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleClick('change', scope)">{{ scope.row['status'] === 2 ? '启用' : '停用' }}</el-button>
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
    <oa-approve-flow-create
      v-if="createShow"
      :detail="rowDetail"
      @success="saveSuccess"
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

import OaApproveFlowCreate from './Create'
import ApprovalFlowUpdateDialog from '@/components/ApprovalFlow/ApprovalFlowUpdateDialog'

export default {
  name: 'ExamineManager',
  components: {
    OaApproveFlowCreate,
    ApprovalFlowUpdateDialog
  },
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 240, // 表的高度
      list: [],
      fieldList: [
        {
          prop: 'examineName',
          label: '审批类型名称',
          width: 150
        },
        {
          prop: 'userList',
          label: '发起人范围',
          width: 150
        },
        {
          prop: 'recheckType',
          label: '审批被拒后重新提交',
          width: 150
        },
        {
          prop: 'remarks',
          label: '审批类型说明',
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
          width: 150
        }
      ],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 30, 40],
      total: 0,
      rowDetail: null,
      createShow: false // 审批类型操作
    }
  },
  watch: {},
  mounted() {
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 240
    }

    this.getList()
  },
  methods: {
    /**
     * 新建成功
     */
    saveSuccess() {
      this.currentPage = 1
      this.getList()
    },

    /**
     * 获取列表数据
     */
    getList() {
      this.loading = true
      examinesQueryListAPI({
        page: this.currentPage,
        limit: this.pageSize,
        label: 0 // oa
      })
        .then(res => {
          const resData = res.data || {}
          const list = resData.list || []
          list.forEach(item => {
            const temps = item.examineIcon ? item.examineIcon.split(',') : []
            if (temps.length > 1) {
              item.iconClass = temps[0]
              item.iconColor = temps[1]
            } else {
              item.iconClass = 'wk wk-approve'
              item.iconColor = '#9376FF'
            }
          })
          this.list = list

          this.total = resData.totalRow

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
      // 如果需要格式化
      if (column.property === 'userList') {
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
      } else if (column.property === 'status') {
        // status    1 正常 2 停用 3 删除
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
      if (type === 'edit-table') {
        this.$router.push({
          name: 'workbenchHandlefield',
          params: {
            type: 'oa_examine',
            label: '10',
            id: scope.row.examineId
          }
        })
      } else if (type === 'edit') {
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
            this.loading = true
            examinesUpdateStatusAPI({
              examineId: scope.row['examineId'],
              status: 3
            })
              .then(res => {
                this.list.splice(scope.$index, 1)
                if (this.list.length == 0) {
                  this.currentPage = this.currentPage - 1 > 0 ? this.currentPage - 1 : 1
                }
                this.getList()

                this.$message({
                  type: 'success',
                  message: '操作成功'
                })
                this.loading = false
              })
              .catch(() => {
                this.loading = false
              })
          })
          .catch(() => {
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
            })
              .then(res => {
                this.$message({
                  type: 'success',
                  message: '操作成功'
                })
                this.getList()
              })
              .catch(() => {})
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.se-table-header {
  height: 50px;
  background-color: white;
  position: relative;
  .se-table-header-button {
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

.table-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  border-radius: $xr-border-radius-base;
  .wk {
    color: white;
    font-size: 12px;
  }
}

@import '../../styles/table.scss';
</style>
