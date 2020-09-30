<template>
  <el-dialog
    :visible="show"
    :append-to-body="true"
    :close-on-click-modal="false"
    top="10vh"
    width="900px"
    custom-class="no-padding-dialog log-comp-detail"
    @close="hideView">
    <el-tabs v-model="activeType" @tab-click="refreshList">
      <el-tab-pane label="已完成日志的员工" name="complete"/>
      <el-tab-pane label="未完成日志的员工" name="uncomplete"/>
    </el-tabs>

    <el-input
      v-model="search"
      placeholder="请输入姓名"
      class="search-input"
      @keyup.enter.native="refreshList">
      <el-button
        slot="append"
        icon="el-icon-search"
        @click.native="refreshList" />
    </el-input>

    <div class="list-body">
      <el-table
        v-loading="loading"
        :data="list"
        :cell-class-name="cellClassName"
        :height="tableHeight"
        stripe
        border
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :prop="item.prop"
          :label="item.label"
          show-overflow-tooltip/>
      </el-table>
      <div
        class="p-contianer">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size.sync="pageSize"
          :total="total"
          class="p-bar"
          background
          layout="prev, pager, next, sizes, total, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- CRM详情 -->
    <c-r-m-full-screen-detail
      :visible.sync="logDetailShow"
      :id="logDetailId"
      crm-type="log" />
  </el-dialog>
</template>

<script>
import {
  oaLogCompleteListAPI,
  oaLogUnCompleteListAPI
} from '@/api/oa/journal'

export default {
  // 日志完成详情
  name: 'LogComDetail',
  components: {
    CRMFullScreenDetail: () =>
      import('@/components/CRMFullScreenDetail')
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    type: [Number, String]
  },
  data() {
    return {
      loading: false, // 加载动画
      activeType: 'complete',
      fieldList: [{
        label: '姓名',
        prop: 'realname'
      }, {
        label: '日志内容',
        prop: 'content'
      }, {
        label: '创建时间',
        prop: 'createTime'
      }],
      tableHeight: this.getTableHeight(), // 表的高度
      list: [],
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 60],
      total: 0,
      search: '',

      logDetailId: '',
      logDetailShow: false
    }
  },
  computed: {},
  watch: {
    show(value) {
      if (value) {
        this.initInfo()
      }
    }
  },
  created() {
    window.onresize = () => {
      this.tableHeight = this.getTableHeight()
    }
  },

  beforeDestroy() {},
  methods: {
    /**
     * 获取表高
     */
    getTableHeight() {
      const clientHeight = document.documentElement.clientHeight
      const paddingHieght = clientHeight * 0.2

      return clientHeight - paddingHieght - 200
    },

    /**
     * 初始化数据
     */
    initInfo() {
      this.search = ''
      this.list = []
      this.refreshList()
    },

    refreshList() {
      this.currentPage = 1
      this.getList()
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'content') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 隐藏视图
     */
    hideView() {
      this.$emit('update:show', false)
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
     * 获取列表数据
     */
    getList() {
      this.loading = true
      var params = {
        page: this.currentPage,
        limit: this.pageSize,
        completeType: this.type,
        search: this.search
      }
      const request = this.activeType == 'complete' ? oaLogCompleteListAPI : oaLogUnCompleteListAPI
      request(params)
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
     * 查看详情
     */
    handleRowClick(row, column, event) {
      if (this.activeType == 'complete' && column.property === 'content') {
        this.logDetailId = row.logId
        this.logDetailShow = true
      }
    }
  }
}
</script>

<style lang="scss">
.log-comp-detail {
  .el-dialog__headerbtn {
    z-index: 3;
  }

  .el-tabs {
    margin-bottom: 10px;

    .el-tabs__nav-wrap::after {
      display: none;
    }

    .el-tabs__item.is-top:nth-child(2) {
      padding-right: 0;
    }
  }

  .search-input {
    width: 300px;
    margin: -18px 0 0 -150px;
    position: absolute;
    left: 50%;
    top: 20px;
  }

  .el-dialog__body {
    position: relative;
  }
}
</style>
