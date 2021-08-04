<template>
  <div class="crm-relative-table">
    <flexbox v-if="config.showHeader" class="header" justify="center">
      <el-input
        :placeholder="config.placeholder"
        v-model="search"
        @keyup.enter.native="searchInput">
        <el-button
          slot="append"
          type="primary"
          @click.native="searchInput">搜索</el-button>
      </el-input>
    </flexbox>
    <div class="body">
      <el-table
        v-loading="loading"
        id="crm-table"
        :row-height="40"
        :data="list"
        :height="tableHeight + reduceHeaderHeight"
        :row-key="config.rowKey"
        class="n-table--border"
        use-virtual
        stripe
        border
        highlight-current-row
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column
          show-overflow-tooltip
          reserve-selection
          type="selection"
          align="center"
          width="55"/>
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :fixed="index==0"
          :prop="item.fieldName"
          :label="item.name"
          :formatter="config.tableFormatter"
          show-overflow-tooltip />
      </el-table>
      <div class="p-contianer">
        <el-pagination
          :current-page="currentPage"
          :total="total"
          :page-size="pageSize"
          :pager-count="5"
          class="p-bar"
          background
          layout="total, prev, pager, next"
          @current-change="handleCurrentChange"/>
      </div>
    </div>
  </div>
</template>

<script>
import merge from '@/utils/merge'
import { isArray } from '@/utils/types'

const DefaultCrmRelativeTable = {
  // 表头
  fieldList: null,
  request: null,
  params: null,
  placeholder: '', // 搜索placeholder
  isPaging: true, // 是否分页
  showHeader: true, //
  tableFormatter: null,
  rowKey: '' // ElTable的rowKey
}

export default {
  // 通用table
  name: 'CrmRelativeTable',

  components: {},

  props: {
    props: Object
  },

  data() {
    return {
      search: '',
      copySearch: '',
      tableHeight: document.documentElement.clientHeight - 320,
      loading: false, // 加载动画
      list: [],
      fieldList: [],
      currentPage: 1,
      pageSize: 15,
      total: 0,
      selectionList: []
    }
  },

  computed: {
    config() {
      return merge({ ...DefaultCrmRelativeTable }, this.props || {})
    },

    reduceHeaderHeight() {
      return this.config.showHeader ? 0 : 32
    }
  },

  watch: {},

  created() {
    if (this.config.fieldList) {
      this.fieldList = this.config.fieldList
    }
    this.getList()
  },

  mounted() {
    this.updateTableHeight()
    window.onresize = () => {
      this.updateTableHeight()
    }
  },

  beforeDestroy() {},

  methods: {
    /**
     * 进行搜索操作
     */
    searchInput() {
      this.copySearch = this.search
      this.handleCurrentChange(1)
    },

    /**
     * 更改当前页数
     * @param {*} val
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      this.config.request(this.config.params || {}).then(res => {
        const resData = res.data
        if (isArray(resData)) {
          this.total = resData.length
          this.list = resData
        } else {
          this.list = resData.list
          this.total = resData.totalRow
        }
      }).catch(() => {

      })
    },

    /**
     * 更新表高
     */
    updateTableHeight() {
      this.tableHeight = document.documentElement.clientHeight - 320
    },

    /**
     * 获取table
     */
    getMainTable() {
      let table = null
      this.$children.forEach(item => {
        if (item.$options && item.$options.name === 'ElTable') {
          table = item
        }
      })
      return table
    },

    /**
     * 勾选操作
     * @param {*} val
     */
    handleSelectionChange(val) {
      // 单选操作
      if (this.config.radio && val.length > 1) {
        this.getMainTable().clearSelection()
        const lastObj = val[val.length - 1]
        this.getMainTable().toggleRowSelection(lastObj)
        this.selectionList = [lastObj]
      } else {
        this.selectionList = val
      }
      this.$emit('selection-change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.crm-relative-table {
  .header {
    /deep/ .el-input {
      width: 300px;
    }
    /deep/ .el-input-group__append {
      background-color: $xr-color-primary;
      border-color: $xr-color-primary;
      color: white;
    }
  }

  .body {
    margin-top: 15px;
    border-top: 1px solid #e6e6e6;
  }
}
</style>
