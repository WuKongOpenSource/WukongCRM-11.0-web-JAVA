<template>
  <div class="archive-project">
    <xr-header
      icon-class="wk wk-archive"
      icon-color="#19b5f6"
      label="归档项目统计" />
    <div
      v-loading="loading"
      class="content-body">
      <el-table
        id="crm-table"
        :data="list"
        :height="tableHeight"
        class="n-table--border"
        stripe
        highlight-current-row
        style="width: 100%">
        <el-table-column
          :resizable="false"
          prop="businessCheck"
          label=""
          width="38">
          <template
            slot="header"
            slot-scope="slot">
            <i
              style="color:#999"
              class="wukong wukong-subproject"/>
          </template>
          <template slot-scope="scope">
            <i
              :style="{'color':scope.row.color}"
              class="wukong wukong-subproject"/>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="name"
          label="项目名称"/>
        <el-table-column
          show-overflow-tooltip
          width="200"
          prop="archiveTime"
          label="归档时间"/>
        <el-table-column
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click.native="recoverProject(scope.row, scope.$index)">恢复项目</el-button>
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
  </div>
</template>

<script>
import { workWorkArchiveListAPI } from '@/api/pm/archive'
import { workWorkUpdateAPI } from '@/api/pm/project'

import XrHeader from '@/components/XrHeader'

export default {
  components: {
    XrHeader
  },
  data() {
    return {
      loading: false,
      tableHeight: document.documentElement.clientHeight - 205,
      list: [],

      // 分页
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 45, 60],
      total: 0
    }
  },
  created() {
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 205
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
     * 获取列表
     */
    getList() {
      this.loading = true
      workWorkArchiveListAPI({
        page: this.currentPage,
        limit: this.pageSize
      })
        .then(res => {
          this.list = res.data.list
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 恢复项目
     */
    recoverProject(val, index) {
      this.$confirm('确定恢复?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          workWorkUpdateAPI({
            workId: val.workId,
            status: 1 // 状态 1启用 2 删除 3归档
          })
            .then(res => {
              this.list.splice(index, 1)
              this.$message.success('恢复成功')
              this.$bus.$emit('recover-project', val.name, val.workId)
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    }
  }
}
</script>

<style scoped lang="scss">
.archive-project {
  height: 100%;
  overflow: hidden;
  position: relative;

  .xr-header {
    padding-top: 0;
  }

  .content-body {
    position: absolute;
    top: 45px;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 3px;
    overflow-y: auto;
  }
}

.el-table /deep/ thead th {
  background-color: #f5f5f5;
  font-weight: 400;
}

.el-table {
  border: 1px solid #e6e6e6;
  border-bottom: none;
}

.p-contianer {
  position: relative;
  background-color: white;
  height: 44px;
  border: 1px solid #e6e6e6;

  .p-bar {
    float: right;
    margin: 5px 100px 0 0;
    font-size: 14px !important;
  }
}

.el-table::before {
  display: none;
}

.wukong-subproject {
  font-size: 22px;
  display: block;
  margin-right: 5px;
}
</style>
