<template>
  <div>
    <c-r-m-list-head
      :search.sync="search"
      :crm-type="crmType"
      :create-fun="createClick"
      title="发票管理"
      placeholder="请输入发票号码/客户名称/合同编号"
      main-title="新建发票"
      @on-handle="listHeadHandle"
      @on-search="crmSearch"
      @on-export="exportInfos"/>
    <div
      v-empty="!crm.invoice.index"
      xs-empty-icon="nopermission"
      xs-empty-text="暂无权限"
      class="crm-container">
      <c-r-m-table-head
        ref="crmTableHead"
        :crm-type="crmType"
        :sort-data="sortData"
        :handle-fun="handleCommand"
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
          v-for="(item, index) in showfieldList"
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
            <template v-else-if="item.prop == 'invoiceType'">
              {{ fieldFormatter(row, column, row[column.property], item) }}
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
          v-if="canUpdateStatus"
          :resizable="false"
          label="操作"
          fixed="right"
          width="150">
          <template slot-scope="scope">
            <el-button
              :disabled="scope.row.invoiceStatus == 1"
              :type="scope.row.invoiceStatus == 1 ? '' : 'primary'"
              plain
              @click.native="markReceivables(scope)">{{ scope.row.invoiceStatus == 1 ? '已开票':'标记为开票' }}</el-button>
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
        <wk-empty
          slot="empty"
          :props="{
            buttonTitle: '新建发票',
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
      </div>
    </div>

    <create
      v-if="isCreate"
      @save-success="refreshList"
      @close="isCreate = false"/>
    <mark-invoice
      v-if="markShow"
      :visible.sync="markShow"
      :reset="isResetInvoice"
      :detail="rowDetail"
      @change="handleHandle({
        type: 'reset_invoice_status'
      })"
    />

    <!-- 相关详情页面 -->
    <c-r-m-all-detail
      :visible.sync="showDview"
      :crm-type="rowType"
      :id.sync="rowID"
      :page-list="crmType == rowType ? list : []"
      :page-index.sync="rowIndex"
      class="d-view"
      @handle="handleHandle"/>

    <!-- 转移 -->
    <transfer-handle
      :crm-type="crmType"
      :selection-list="selectionList"
      :dialog-visible.sync="transferDialogShow"
      @handle="handleHandle({
        type: 'transfer'
    })" />

    <!-- 审批流升级提醒 -->
    <approval-flow-update-dialog />
  </div>
</template>

<script>
import {
  crmInvoiceDeleteIdsAPI
} from '@/api/crm/invoice'

import Create from './Create'
import MarkInvoice from './components/MarkInvoice'
import TransferHandle from '../components/SelectionHandle/TransferHandle' // 转移
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import ApprovalFlowUpdateDialog from '@/components/ApprovalFlow/ApprovalFlowUpdateDialog'

import TableMixin from '../mixins/Table'
import { getFormFieldShowName } from '@/components/NewCom/WkForm/utils'

export default {
  name: 'Invoice', // 发票
  components: {
    Create,
    MarkInvoice,
    TransferHandle,
    CRMAllDetail,
    ApprovalFlowUpdateDialog
  },
  mixins: [TableMixin],
  props: {},
  data() {
    return {
      crmType: 'invoice',
      list: [],
      selectionList: [], // 勾选数据 用于全局导出
      isCreate: false,
      rowDetail: {},
      markShow: false,
      isResetInvoice: false,
      transferDialogShow: false,
      showDview: false
    }
  },
  computed: {
    // 是否能操作
    canUpdateStatus() {
      return this.crm && this.crm[this.crmType] && this.crm[this.crmType].resetInvoiceStatus
    },
    showfieldList() {
      return this.fieldList.filter(item => item.prop !== 'invoiceStatus')
    }
  },
  watch: {},
  created() {
  },

  beforeDestroy() {},
  methods: {
    /**
     * 创建点击
     */
    createClick() {
      this.isCreate = true
    },

    /**
     * 格式化字段
     */
    fieldFormatter(row, column, cellValue, field) {
      if (column.property == 'invoiceType') {
        return {
          1: '增值税专用发票',
          2: '增值税普通发票',
          3: '国税通用机打发票',
          4: '地税通用机打发票',
          5: '收据'
        }[row[column.property]]
      }

      if (field) {
        return getFormFieldShowName(field.formType, row[column.property])
      }
      return row[column.property] === '' || row[column.property] === null ? '--' : row[column.property]
    },

    /**
     * 开票操作
     */
    markReceivables(scope) {
      this.rowDetail = scope.row
      this.isResetInvoice = false
      this.markShow = true
    },

    /**
     * 改变负责人筛选条件
     */
    changeUserCell(data) {
      this.filterParams.ownerUserId = data.value
      this.refreshList()
    },

    /**
     * 列表操作
     */
    handleCommand(command) {
      if (command == 'delete') {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.loading = true
            crmInvoiceDeleteIdsAPI(this.selectionList.map(item => item.invoiceId))
              .then(res => {
                this.loading = false
                this.$message({
                  type: 'success',
                  message: '删除成功'
                })
                this.handleHandle({
                  type: 'delete'
                })
              })
              .catch(() => {
                this.loading = false
              })
          })
          .catch(() => {})
      } else if (command == 'transfer') {
        this.transferDialogShow = true
      } else {
        this.rowDetail = this.selectionList[0]
        this.isResetInvoice = true
        this.markShow = true
      }
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'invoiceApplyNumber') {
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
      if (column.property === 'invoiceApplyNumber') {
        return 'header-can-visit-backgroud'
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/table.scss';

.status-mark {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: $xr-border-radius-base;
}
</style>
