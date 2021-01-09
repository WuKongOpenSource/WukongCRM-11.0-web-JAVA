<template>
  <div class="main">
    <xr-header
      icon-class="wk wk-record"
      icon-color="#2362FB"
      label="登录日志" />
    <div class="main-body">
      <flexbox class="main-table-header">
        <el-date-picker
          v-model="dateTime"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"/>
        <xh-user-cell
          :radio="false"
          placeholder="选择人员"
          @value-change="userChange" />
        <el-button
          type="primary"
          @click="refreshList">查询</el-button>
        <el-button
          class="main-table-header-button"
          @click="exportClick">导出</el-button>
      </flexbox>
      <el-table
        v-loading="loading"
        :data="list"
        :height="tableHeight"
        :cell-class-name="cellClassName"
        class="main-table"
        highlight-current-row
        style="width: 100%">
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :prop="item.prop"
          :label="item.label"
          show-overflow-tooltip/>
        <el-table-column/>
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
import {
  queryLoginLogListAPI,
  loginLogExportAPI
} from '@/api/admin/log'

import XrHeader from '@/components/XrHeader'
import XhUserCell from '@/components/CreateCom/XhUserCell'
import { Loading } from 'element-ui'

import { downloadExcelWithResData } from '@/utils'

export default {
  // 登录日志
  name: 'LoginLog',
  components: {
    XrHeader,
    XhUserCell
  },
  mixins: [],
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 240, // 表的高度
      dateTime: [],
      userList: [],
      list: [],
      fieldList: [
        {
          prop: 'realname',
          label: '用户',
          width: 100
        },
        {
          prop: 'loginTime',
          label: '登录时间',
          width: 150
        },
        {
          prop: 'ipAddress',
          label: 'IP地址',
          width: 100
        },
        {
          prop: 'loginAddress',
          label: '登录地点',
          width: 150
        },
        {
          prop: 'deviceType',
          label: '设备类型',
          width: 150
        },
        {
          prop: 'core',
          label: '终端内核',
          width: 150
        },
        {
          prop: 'platform',
          label: '平台',
          width: 100
        },
        {
          prop: 'authResult',
          label: '认证结果',
          width: 100
        }
      ],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 30, 40],
      total: 0,

      postParams: {}
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
    userChange(data) {
      this.userList = data.value || []
    },

    refreshList() {
      this.currentPage = 1
      this.getList()
    },

    /** 获取列表数据 */
    getList() {
      this.loading = true
      const params = {
        page: this.currentPage,
        limit: this.pageSize
      }
      if (this.userList && this.userList.length) {
        params.userIds = this.userList.map(item => item.userId)
      }

      if (this.dateTime && this.dateTime.length) {
        params.startTime = this.dateTime[0]
        params.endTime = this.dateTime[1]
      }

      this.postParams = params
      queryLoginLogListAPI(params)
        .then(res => {
          const list = res.data.list || []
          list.forEach(item => {
            item.authResult = {
              1: '成功',
              2: '失败'
            }[item.authResult]
          })
          this.list = list
          this.total = res.data.totalRow
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
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
    exportClick() {
      const loading = Loading.service({ fullscreen: true, text: '导出中...' })
      loginLogExportAPI(this.postParams)
        .then(res => {
          downloadExcelWithResData(res)
          loading.close()
        })
        .catch(() => {
          loading.close()
        })
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
    margin-right: 20px;
    position: absolute;
    right: 20px;
  }

  .el-date-editor--daterange {
    width: 300px;
    margin: 0 20px;
  }

  /deep/ .user-container {
    width: 200px;
    margin-right: 20px;
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
