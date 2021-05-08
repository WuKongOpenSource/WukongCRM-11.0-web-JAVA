<template>
  <div>
    <c-r-m-list-head
      :search.sync="search"
      :crm-type="crmType"
      :create-fun="createClick"
      title="回款管理"
      placeholder="请输入客户名称/回款编号"
      main-title="新建回款"
      @on-handle="listHeadHandle"
      @on-search="crmSearch"
      @on-export="exportInfos"/>
    <div
      v-empty="!crm.receivables.index"
      xs-empty-icon="nopermission"
      xs-empty-text="暂无权限"
      class="crm-container">
      <c-r-m-table-head
        ref="crmTableHead"
        :crm-type="crmType"
        :sort-data="sortData"
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
        :row-key="`${crmType}Id`"
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
          reserve-selection
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
          sortable="custom"
          show-overflow-tooltip>
          <template slot-scope="{ row, column, $index }">
            <template v-if="item.prop == 'checkStatus'">
              <span :style="getStatusStyle(row.checkStatus)" class="status-mark"/>
              <span>{{ getStatusName(row.checkStatus) }}</span>
            </template>
            <wk-field-view
              v-else
              :props="item"
              :form-type="item.formType"
              :value="row[column.property]"
            >
              <template slot-scope="{ data }">
                {{ fieldFormatter(row, column, row[column.property], item) }}
              </template>
            </wk-field-view>
          </template>
        </el-table-column>
        <el-table-column/>
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
        <wk-empty
          slot="empty"
          :props="{
            buttonTitle: '新建回款',
            showButton: saveAuth
          }"
          @click="createClick"
        />
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
        <span v-if="moneyPageData" class="money-bar">回款金额：{{ moneyPageData.receivablesMoney || 0 | separator }}</span>
      </div>
    </div>
    <!-- 相关详情页面 -->
    <c-r-m-all-detail
      :visible.sync="showDview"
      :crm-type="rowType"
      :id.sync="rowID"
      :page-list="crmType == rowType ? list : []"
      :page-index.sync="rowIndex"
      class="d-view"
      @handle="handleHandle"/>

    <!-- 新建 -->
    <receivables-create
      v-if="createShow"
      @close="createShow = false"
      @save-success="handleHandle"
    />

    <!-- 审批流升级提醒 -->
    <approval-flow-update-dialog />
  </div>
</template>

<script>
import ReceivablesCreate from './Create'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'

import TableMixin from '../mixins/Table'
import { floatAdd } from '@/utils'

export default {
  /** 客户管理 的 回款列表 */
  name: 'ReceivablesIndex',
  components: {
    ReceivablesCreate,
    CRMAllDetail
  },
  mixins: [TableMixin],
  data() {
    return {
      crmType: 'receivables',
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
          // 1 审核通过的
          if (element.checkStatus == 1) {
            money = floatAdd(money, parseFloat(element.money))
          }
        }
        return {
          receivablesMoney: money.toFixed(2)
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
      if (column.property === 'number') {
        return 'can-visit--underline can-visit--bold'
      } else if (
        column.property === 'customerName' ||
        column.property === 'contractNum'
      ) {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    headerCellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'number') {
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
