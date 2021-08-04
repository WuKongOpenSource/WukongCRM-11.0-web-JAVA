<template>
  <div>
    <c-r-m-list-head
      :crm-type="crmType"
      :create-fun="createClick"
      title="回款计划管理"
      placeholder="请输入客户名称/合同编号"
      main-title="新建回款计划"
      @on-handle="listHeadHandle"
      @on-search="crmSearch"
      @on-export="exportInfos">
      <el-menu
        slot="icon"
        ref="elMenu"
        :default-active="crmType"
        mode="horizontal"
        active-text-color="#2362FB"
        @select="menuSelect" >
        <el-menu-item
          v-for="(item, index) in menuItems"
          :key="index"
          :index="item.path">
          <img :src="item.icon">
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>

      <el-button
        v-if="saveAuth"
        slot="ft"
        class="xr-btn--orange"
        icon="el-icon-plus"
        type="primary"
        @click="batchCreateClick">批量新建</el-button>
    </c-r-m-list-head>
    <div
      v-empty="!crm[crmType].index"
      xs-empty-icon="nopermission"
      xs-empty-text="暂无权限"
      class="crm-container">
      <c-r-m-table-head
        ref="crmTableHead"
        :crm-type="crmType"
        :sort-data="sortData"
        @filter="handleFilter"
        @handle="handleHandle"
        @scene="handleScene"
        @action="actionClick"/>
      <el-table
        v-loading="loading"
        id="crm-table"
        :row-height="40"
        :data="list"
        :height="tableHeight"
        :cell-class-name="cellClassName"
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
            <template v-else-if="item.prop == 'receivedStatus'">
              {{ getReceivedStatusName(row.receivedStatus) }}
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
          v-if="receivablesSaveAuth"
          :resizable="false"
          label="操作"
          fixed="right"
          width="120">
          <template slot-scope="scope">
            <el-button
              :disabled="!!scope.row.receivablesId"
              :type="!!scope.row.receivablesId ? '' : 'primary'"
              plain
              @click.native="receivablesCreate(scope.row)">新建回款</el-button>
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
            buttonTitle: '新建回款计划',
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
        <span v-if="moneyPageData" class="money-bar">计划回款总金额：{{ moneyPageData.planReceivedMoney || 0 | separator }}/实际回款总金额：{{ moneyPageData.realReceivedMoney || 0 | separator }}/未回款总金额：{{ moneyPageData.unreceivedMoney || 0 | separator }}</span>
      </div>
    </div>

    <!-- 新建 -->
    <c-r-m-all-create
      v-if="createShow"
      :crm-type="createCrmType"
      :action="createActionInfo"
      @save-success="handleHandle"
      @close="createShow=false"/>

    <!-- 批量新建 -->
    <receivables-plan-batch-create
      v-if="batchCreateShow"
      @close="batchCreateShow = false"
      @save-success="handleHandle"
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
  </div>
</template>

<script>
import ReceivablesPlanBatchCreate from './BatchCreate'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import CRMAllCreate from '@/views/crm/components/CRMAllCreate'

import TableMixin from '../mixins/Table'
import { isObject } from '@/utils/types'
import { getPlanReceivablesStatusName } from './utils'
import { getPermissionByKey } from '@/utils'
import moment from 'moment'

export default {
  // 回款计划计划
  name: 'ReceivablesPlanIndex',
  components: {
    ReceivablesPlanBatchCreate,
    CRMAllDetail,
    CRMAllCreate
  },
  mixins: [TableMixin],
  data() {
    return {
      crmType: 'receivablesPlan', // receivablesPlan
      createCrmType: '',
      createShow: false,
      batchCreateShow: false,
      moneyData: null, // 列表金额
      createActionInfo: {}
    }
  },
  computed: {
    moneyPageData() {
      // 选择数据，隐藏金额信息
      if (this.config.isSelect) {
        return false
      }

      if (!isObject(this.moneyData) || JSON.stringify(this.moneyData) == '{}') {
        return null
      }

      return this.moneyData
    },
    menuItems() {
      const temp = []
      if (this.crm && this.crm.receivables) {
        temp.push({
          title: '回款',
          path: 'receivables',
          icon: require('@/assets/img/crm/receivables.png')
        })
      }

      if (this.crm && this.crm.receivablesPlan) {
        temp.push({
          title: '回款计划',
          path: 'receivablesPlan',
          icon: require('@/assets/img/crm/receivablesPlan.png')
        })
      }

      return temp
    },

    receivablesSaveAuth() {
      return !!getPermissionByKey('crm.receivables.save')
    }
  },
  mounted() {},
  deactivated() {
    this.$refs.elMenu.activeIndex = this.crmType
  },
  methods: {
    /**
     * 左侧菜单选择
     */
    menuSelect(key, keyPath) {
      this.$emit('menu-select', key, keyPath)
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (
        column.property === 'customerName' ||
        column.property === 'contractNum' ||
        column.property === 'num'
      ) {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 新建点击
     */
    createClick() {
      this.createCrmType = this.crmType
      this.createActionInfo = {
        type: 'save',
        crmType: this.crmType,
        data: {}
      }
      this.createShow = true
    },

    /**
     * 批量创建
     */
    batchCreateClick() {
      this.batchCreateShow = true
    },

    /**
     * 获取回款状态值
     */
    getReceivedStatusName(receivedStatus) {
      return getPlanReceivablesStatusName(receivedStatus)
    },

    /**
     * 动作
     */
    actionClick(data) {
      if (data.type === 'update') {
        this.createCrmType = this.crmType
        const selection = data.selection
        this.createActionInfo = {
          type: 'update',
          id: selection[0][`${this.crmType}Id`]
        }
        this.createShow = true
      }
    },

    /**
     * 新建回款
     */
    receivablesCreate(data) {
      this.createCrmType = 'receivables'
      this.createActionInfo = {
        type: 'relative',
        crmType: this.crmType,
        data: {
          customer: {
            customerName: data.customerName,
            customerId: data.customerId
          },
          contract: {
            contractNum: data.contractNum,
            contractId: data.contractId
          },
          receivablesPlanId: data.receivablesPlanId,
          returnTime: moment().format('YYYY-MM-DD'),
          money: data.money,
          returnType: data.returnType
        }
      }
      this.createShow = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/table.scss';
</style>
