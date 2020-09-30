<template>
  <div>
    <c-r-m-list-head
      :search.sync="search"
      :crm-type="crmType"
      :create-fun="createClick"
      title="商机管理"
      placeholder="请输入商机名称"
      main-title="新建商机"
      @on-handle="listHeadHandle"
      @on-search="crmSearch"
      @on-export="exportInfos"/>
    <div
      v-empty="!crm.business.index"
      xs-empty-icon="nopermission"
      xs-empty-text="暂无权限"
      class="crm-container">
      <c-r-m-table-head
        ref="crmTableHead"
        :crm-type="crmType"
        @filter="handleFilter"
        @handle="handleHandle"
        @scene="handleScene"/>
      <el-table
        v-loading="loading"
        id="crm-table"
        :row-height="40"
        :data="list"
        :height="tableHeight"
        :cell-class-name="cellClassName"
        :header-cell-class-name="headerCellClassName"
        class="n-table--border"
        use-virtual
        stripe
        border
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick"
        @sort-change="sortChange"
        @header-dragend="handleHeaderDragend"
        @selection-change="handleSelectionChange">
        <el-table-column
          show-overflow-tooltip
          type="selection"
          align="center"
          width="55"/>
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :fixed="index==0"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :formatter="fieldFormatter"
          sortable="custom"
          show-overflow-tooltip/>
        <el-table-column/>
        <el-table-column
          label="关注"
          align="center"
          fixed="right"
          width="60">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.star == 0 ? '添加关注' : '取消关注'" effect="dark" placement="top">
              <i
                :class="{active: scope.row.star != 0}"
                class="wk wk-focus-on focus-icon"
                @click="toggleStar(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          :resizable="false"
          fixed="right"
          width="40">
          <template
            slot="header"
            slot-scope="slot">
            <field-set
              :crm-type="crmType"
              @change="setSave"/>
          </template>
        </el-table-column>
      </el-table>
      <div class="p-contianer">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size.sync="pageSize"
          :total="total"
          :pager-count="5"
          class="p-bar"
          background
          layout="prev, pager, next, sizes, total, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"/>
        <span v-if="moneyPageData" class="money-bar">商机金额：{{ moneyPageData.businessSumMoney || 0 | separator }}</span>
      </div>
    </div>
    <!-- 相关详情页面 -->
    <c-r-m-all-detail
      :visible.sync="showDview"
      :crm-type="rowType"
      :id="rowID"
      class="d-view"
      @handle="handleHandle"/>

    <!-- 新建 -->
    <business-create
      v-if="createShow"
      @close="createShow = false"
      @save-success="handleHandle"
    />
  </div>
</template>

<script>
import BusinessCreate from './Create'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'

import TableMixin from '../mixins/Table'
import { floatAdd } from '@/utils'

export default {
  /** 客户管理 的 商机列表 */
  name: 'BusinessIndex',
  components: {
    BusinessCreate,
    CRMAllDetail
  },
  mixins: [TableMixin],
  data() {
    return {
      crmType: 'business',
      createShow: false,
      moneyData: null // 列表金额
    }
  },
  computed: {
    moneyPageData() {
      if (!this.moneyData || JSON.stringify(this.moneyData) == '{}') {
        return null
      }

      if (this.selectionList.length == 0) {
        return this.moneyData || {}
      } else {
        let money = 0.0
        for (let index = 0; index < this.selectionList.length; index++) {
          const element = this.selectionList[index]
          money = floatAdd(money, parseFloat(element.money))
        }
        return {
          businessSumMoney: money.toFixed(2)
        }
      }
    }
  },
  mounted() {},
  methods: {

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'businessName') {
        return 'can-visit--underline can-visit--bold'
      } else if (column.property === 'customerName') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    headerCellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'businessName') {
        return 'header-can-visit-backgroud'
      }
      return ''
    },

    /**
     * 新建点击
     */
    createClick() {
      this.createShow = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/table.scss';
</style>
