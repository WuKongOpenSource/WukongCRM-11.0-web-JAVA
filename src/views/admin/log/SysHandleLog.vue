<template>
  <div class="main">
    <xr-header
      icon-class="wk wk-record"
      icon-color="#2362FB"
      label="系统操作日志" />
    <div class="main-body">
      <flexbox class="main-table-header">
        <el-date-picker
          v-model="dateTime"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"/>
        <wk-user-select
          :radio="false"
          v-model="userList"
          placeholder="选择人员" />
        <el-select
          v-model="subModelLabels"
          multiple
          style="width: 200px;"
          collapse-tags>
          <el-option
            v-for="item in sysOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
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
  querySystemLogListAPI,
  systemLogExportAPI
} from '@/api/admin/log'

import XrHeader from '@/components/XrHeader'
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import { Loading } from 'element-ui'

import HandleLogMixin from './mixins/HandleLog'
import { downloadExcelWithResData } from '@/utils'

export default {
  // 系统操作日志
  name: 'SysHandleLog',
  components: {
    XrHeader,
    WkUserSelect
  },
  mixins: [HandleLogMixin],
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 240, // 表的高度
      dateTime: [],
      userList: [],
      subModelLabels: [],
      list: [],
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
    refreshList() {
      this.currentPage = 1
      this.getList()
    },

    /** 获取列表数据 */
    getList() {
      this.loading = true
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        model: 'admin',
        type: 2 //  1 数据操作日志 2 系统操作日志
      }
      if (this.userList && this.userList.length) {
        params.userIds = this.userList
      }

      if (this.dateTime && this.dateTime.length) {
        params.startTime = this.dateTime[0]
        params.endTime = this.dateTime[1]
      }

      params.subModelLabels = this.subModelLabels
      this.postParams = params
      querySystemLogListAPI(params)
        .then(res => {
          const list = res.data.list
          list.forEach(item => {
            item.model = this.getModelName(item.model)
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
     *  添加审批流
     */
    exportClick() {
      const loading = Loading.service({ fullscreen: true, text: '导出中...' })
      systemLogExportAPI(this.postParams)
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

  .wk-user-select,
  .el-select {
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
