<template>
  <div class="main">
    <xr-header
      icon-class="wk wk-s-seas"
      icon-color="#487DFF"
      label="客户公海规则设置" />
    <div class="main-body">
      <div class="main-table-header">
        <reminder
          :content="`提示：1、系统在每天的24:00~6:00统一将符合规则的客户退回到公海池<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2、当一个客户满足多个公海客户规则时会同时掉入多个公海<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3、若修改了“自动收回规则”，新的规则将于“次日生效”，在此之前客户公海成员的数据还是会遵循原规则进行划入`"
          class="xr-reminder"/>
        <el-button
          class="main-table-header-button xr-btn--orange"
          icon="el-icon-plus"
          type="primary"
          @click="addClick">新建公海</el-button>
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
          show-overflow-tooltip
          prop="poolName"
          width="150"
          label="公海名称"/>
        <el-table-column
          :formatter="fieldFormatter"
          show-overflow-tooltip
          prop="adminUser"
          label="公海管理员"/>
        <el-table-column
          :formatter="fieldFormatter"
          show-overflow-tooltip
          prop="memberUser"
          label="公海成员"/>
        <el-table-column
          show-overflow-tooltip
          prop="customerNum"
          width="100"
          label="客户数量"/>
        <el-table-column
          :formatter="fieldFormatter"
          show-overflow-tooltip
          prop="status"
          width="100"
          label="状态"/>
        <el-table-column
          fixed="right"
          label="操作"
          width="200">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleClick('status', scope)">{{ scope.row['status'] === 0 ? '启用' : '停用' }}</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick('transfer', scope)">转移</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick('edit', scope)">编辑</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick('delete', scope)">删除</el-button>
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

    <pool-add
      v-if="createShow"
      :action="createAction"
      @hiden-view="createShow=false"
      @save="getList" />

    <pool-detail
      v-if="detailShow"
      :id="detailId"
      @hide="detailShow = false"/>
    <pool-transfer
      :visible.sync="transferShow"
      :id="detailId"
      @transfer="getList"/>
  </div>
</template>

<script>
import {
  crmCustomerPoolSetListAPI,
  crmCustomerPoolSetDeleteAPI,
  crmCustomerPoolSetChangeStatusAPI
} from '@/api/crm/customer'

import Reminder from '@/components/Reminder'
import XrHeader from '@/components/XrHeader'
import PoolAdd from './components/PoolAdd'
import PoolDetail from './components/PoolDetail'
import PoolTransfer from './components/PoolTransfer'

export default {
  /** 系统管理 的 客户规则公海设置 */
  name: 'SystemPool',
  components: {
    Reminder,
    XrHeader,
    PoolAdd,
    PoolDetail,
    PoolTransfer
  },
  mixins: [],
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 284, // 表的高度
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 45, 60],
      total: 0,
      list: [],
      createAction: {
        type: 'save'
      },
      createShow: false,
      // 查看详情
      detailId: '',
      detailShow: false,
      // 转移
      transferShow: false
    }
  },
  computed: {},
  mounted() {
    var self = this
    /** 控制table的高度 */
    window.onresize = function() {
      self.tableHeight = document.documentElement.clientHeight - 284
    }

    this.getList()
  },
  methods: {
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
     * 获取列表数据
     */
    getList() {
      this.loading = true
      crmCustomerPoolSetListAPI({
        page: this.currentPage,
        limit: this.pageSize
      })
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
      if (column.property === 'adminUser') {
        const users = row['adminUser'] || []
        return users
          .map(item => {
            return item.realname
          })
          .join('、')
      } else if (column.property === 'memberUser') {
        const structures = row['memberDept'] || []
        let strName = structures
          .map(item => {
            return item.name
          })
          .join('、')

        const users = row['memberUser'] || []
        const userName = users
          .map(item => {
            return item.realname
          })
          .join('、')

        if (strName && userName) {
          strName += '、'
        }
        const name = strName + userName
        return name
      } else if (column.property === 'status') {
        if (row.status === 0) {
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
      if (column.property === 'poolName') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     *  添加权限
     */
    addClick() {
      this.createAction = {
        type: 'save'
      }
      this.createShow = true
    },

    /** 列表操作 */
    /**
     * 当某一行被点击时会触发该事件
     */
    handleRowClick(row, column, event) {
      if (column.property === 'poolName') {
        this.detailId = row.poolId
        this.detailShow = true
      }
    },

    /**
     * 编辑删除
     */
    handleClick(type, scope) {
      if (type === 'edit') {
        this.createAction = {
          type: 'update',
          id: scope.row.poolId,
          data: scope.row
        }
        this.createShow = true
      } else if (type === 'transfer') {
        this.detailId = scope.row.poolId
        this.transferShow = true
      } else if (type === 'delete') {
        this.$confirm('您确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            crmCustomerPoolSetDeleteAPI({
              poolId: scope.row.poolId
            })
              .then(res => {
                this.list.splice(scope.$index, 1)
                this.$message({
                  type: 'success',
                  message: '操作成功'
                })
              })
              .catch(() => {})
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      } else if (type === 'status') {
        // 启用 停用
        this.$confirm(`您确定要${scope.row.status === 0 ? '启用' : '停用'}该公海?`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
          .then(() => {
            crmCustomerPoolSetChangeStatusAPI({
              poolId: scope.row.poolId,
              status: scope.row.status === 0 ? 1 : 0
            })
              .then(res => {
                scope.row.status = scope.row.status === 0 ? 1 : 0
                this.$message({
                  type: 'success',
                  message: '操作成功'
                })
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
  background-color: white;
  position: relative;
  overflow: hidden;
  .main-table-header-button {
    float: right;
    margin-right: 20px;
    margin-top: 10px;
  }
}

.xr-reminder {
  width: auto;
  float: left;
  margin: 10px 20px;
}

/** 分页布局 */
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
@import '../../styles/table.scss';
</style>
