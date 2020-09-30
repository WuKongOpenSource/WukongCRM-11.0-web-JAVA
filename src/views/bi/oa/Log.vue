<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      title="日志分析"
      class="filtrate-bar"
      module-type="oa"
      @load="loading=true"
      @change="getDataList">
      <el-button
        class="export-button"
        type="primary"
        @click.native="exportExcel">导出</el-button>
    </filtrate-handle-view>
    <div class="content">
      <div class="table-content">
        <el-table
          v-if="showTable"
          :data="list"
          :height="tableHeight"
          stripe
          border
          highlight-current-row
          @sort-change="({ prop, order }) => mixinSortFn(list, prop, order)">
          <el-table-column
            v-for="(item, index) in fieldList"
            :key="index"
            :prop="item.field"
            :label="item.name"
            sortable="custom"
            align="center"
            header-align="center"/>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import SortMixin from '../mixins/Sort'
import {
  biLogStatisticsAPI,
  biLogExcelExportAPI
} from '@/api/bi/oa'
import FiltrateHandleView from '../components/FiltrateHandleView'
import { downloadExcelWithResData } from '@/utils'

export default {
  /** 日志统计表 */
  name: 'LogStatistics',

  components: {
    FiltrateHandleView
  },
  mixins: [SortMixin],
  data() {
    return {
      loading: false,
      tableHeight: document.documentElement.clientHeight - 190,
      postParams: {},
      list: [],
      fieldList: [
        { field: 'realname', name: '员工' },
        { field: 'count', name: '填写数' },
        // { field: 'unReadCont', name: '接收人未读数' },
        { field: 'unCommentCount', name: '未评论数' },
        { field: 'commentCount', name: '已评论数' }
      ]
    }
  },

  mounted() {
    /** 控制table的高度 */
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 190
    }
  },

  methods: {
    /**
     * 列表数据
     */
    getDataList(params) {
      this.postParams = params
      this.loading = true
      biLogStatisticsAPI(params)
        .then(res => {
          this.list = res.data || []
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 导出
     */
    exportExcel() {
      this.loading = true
      biLogExcelExportAPI(this.postParams)
        .then(res => {
          this.loading = false
          downloadExcelWithResData(res)
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
