<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      :show-year-select="true"
      title="发票统计分析"
      class="filtrate-bar"
      module-type="invoice"
      @load="loading=true"
      @change="getDataList">
      <el-button
        class="export-button"
        type="primary"
        @click.native="exportClick">导出</el-button>
    </filtrate-handle-view>
    <div class="content">
      <div class="content-title">
        回款金额：<span class="special">{{ data.receivablesMoney || 0 }}</span>元；开票金额：<span class="special">{{ data.invoiceMoney || 0 }}</span>元</div>
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
            header-align="center"
            show-overflow-tooltip/>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import SortMixin from '../mixins/Sort'
import BaseMixin from '../mixins/Base'
import { biAchievementInvoiceAPI, biAchievementInvoiceExportAPI } from '@/api/bi/achievement'
import FiltrateHandleView from '../components/FiltrateHandleView'

export default {
  /** 发票统计分析 */
  name: 'AchievementInvoiceStatistics',
  components: {
    FiltrateHandleView
  },
  mixins: [BaseMixin, SortMixin],
  data() {
    return {
      loading: false,
      tableHeight: document.documentElement.clientHeight - 240,

      postParams: {}, // 筛选参数

      list: [],
      data: {},
      fieldList: [
        { field: 'type', name: '日期' },
        { field: 'receivablesMoney', name: '回款金额' },
        { field: 'invoiceMoney', name: '开票金额' },
        { field: 'receivablesNoInvoice', name: '已回款未开票' },
        { field: 'invoiceNoReceivables', name: '已开票未回款' }
      ]
    }
  },
  computed: {},
  mounted() {
    /** 控制table的高度 */
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 240
    }
  },
  methods: {
    getDataList(params) {
      this.postParams = params
      this.loading = true
      biAchievementInvoiceAPI(params)
        .then(res => {
          const data = res.data || {}
          this.data = data
          this.list = data.list || []
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 导出点击
     */
    exportClick() {
      this.requestExportInfo(biAchievementInvoiceExportAPI, this.postParams)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
.content-title {
  padding-bottom: 15px;
  .special {
    font-weight: bold;
    margin-right: 3px;
  }
}
</style>
