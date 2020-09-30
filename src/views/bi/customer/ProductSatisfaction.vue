<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      title="产品满意度分析"
      class="filtrate-bar"
      module-type="contract"
      @load="loading=true"
      @change="getDataList">
      <el-button
        class="export-button"
        type="primary"
        @click.native="exportClick">导出</el-button>
    </filtrate-handle-view>
    <div class="content">
      <div class="table-content">
        <el-table
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
import { biCustomerProductSatisfactionTableAPI, biCustomerProductSatisfactionExportAPI } from '@/api/bi/customer'
import FiltrateHandleView from '../components/FiltrateHandleView'

export default {
  /** 产品满意度分析 */
  name: 'ProductSatisfaction',
  components: {
    FiltrateHandleView
  },
  mixins: [BaseMixin, SortMixin],
  data() {
    return {
      loading: false,
      tableHeight: document.documentElement.clientHeight - 200,

      postParams: {}, // 筛选参数

      list: [],
      fieldList: []
    }
  },
  computed: {},
  mounted() {
    /** 控制table的高度 */
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 200
    }
  },
  methods: {
    getDataList(params) {
      this.postParams = params
      this.loading = true
      biCustomerProductSatisfactionTableAPI(params)
        .then(res => {
          const list = res.data || []
          if (this.fieldList.length == 0 && list.length > 0) {
            const firstItem = list[0]
            const baseFields = [
              { field: 'productName', name: '产品名称' },
              { field: 'visitNum', name: '回访次数' }
            ]

            const otherFields = []
            for (const key in firstItem) {
              if (key !== 'productName' && key !== 'visitNum') {
                otherFields.push({ field: key, name: key })
              }
            }
            this.fieldList = baseFields.concat(otherFields)
          }
          this.list = list
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
      this.requestExportInfo(biCustomerProductSatisfactionExportAPI, this.postParams)
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
