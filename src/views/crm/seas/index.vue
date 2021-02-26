<template>
  <div>
    <c-r-m-list-head
      :search.sync="search"
      :is-seas="true"
      title="公海管理"
      placeholder="请输入客户名称/手机/电话"
      main-title="新建客户"
      crm-type="customer"
      @on-handle="listHeadHandle"
      @on-search="crmSearch"
      @on-export="exportInfos">
      <el-menu
        slot="icon"
        ref="elMenu"
        default-active="seas"
        mode="horizontal"
        active-text-color="#2362FB"
        @select="menuSelect">
        <el-menu-item
          v-for="(item, index) in menuItems"
          :key="index"
          :index="item.path">
          <img :src="item.icon">
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </c-r-m-list-head>
    <div
      v-empty="!crm.pool.index && poolAuth.index"
      xs-empty-icon="nopermission"
      xs-empty-text="暂无权限"
      class="crm-container">
      <c-r-m-table-head
        ref="crmTableHead"
        :is-seas="isSeas"
        :pool-id="poolId"
        :pool-auth="poolAuth"
        :sort-data="sortData"
        crm-type="customer"
        @filter="handleFilter"
        @handle="handleHandle"
        @scene="handleScene">
        <template slot="custom">
          <div>公海：</div>
          <el-select
            v-model="poolId"
            @change="poolChange">
            <el-option
              v-for="item in poolList"
              :key="item.poolId"
              :label="item.poolName"
              :value="item.poolId"/>
          </el-select>
        </template>
      </c-r-m-table-head>
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
          <template slot-scope="scope">
            <template v-if="item.prop == 'dealStatus'">
              <i :class="scope.row[item.prop] | dealIcon"/>
              <span>{{ scope.row[item.prop] | dealName }}</span>
            </template>
            <template v-else-if="item.prop == 'status'">
              <i
                v-if="scope.row.status == 2"
                class="wk wk-circle-password customer-lock"/>
            </template>
            <template v-else>{{ fieldFormatter(scope.row, scope.column) }}</template>
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
              :is-seas="isSeas"
              :crm-type="crmType"
              :pool-id="poolId"
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
      </div>
    </div>
    <customer-detail
      v-if="showDview"
      :id.sync="rowID"
      :page-list="crmType == rowType ? list : []"
      :page-index.sync="rowIndex"
      :pool-id="poolId"
      :is-seas="isSeas"
      class="d-view"
      @handle="handleHandle"
      @hide-view="showDview=false"/>
  </div>
</template>

<script>
import { crmCustomerPoolNameListAPI, crmCustomerPoolQueryAuthAPI } from '@/api/crm/customer'

import CustomerDetail from '../customer/Detail'
import TableMixin from '../mixins/Table'

export default {
  /** 客户管理 的 公海列表 */
  name: 'SeacIndex',
  components: {
    CustomerDetail
  },
  filters: {
    dealIcon(statu) {
      return statu == 1 ? 'wk wk-success deal-suc' : 'wk wk-close deal-un'
    },

    dealName(statu) {
      return statu == 1 ? '已成交' : '未成交'
    }
  },
  mixins: [TableMixin],
  data() {
    return {
      crmType: 'customer',
      isSeas: true, // 是公海
      poolId: '',
      poolAuth: {},
      poolList: []
    }
  },
  computed: {
    menuItems() {
      const temp = []
      if (this.crm && this.crm.customer) {
        temp.push({
          title: '客户',
          path: 'customer',
          icon: require('@/assets/img/crm/customer_not.png')
        })
      }

      if (this.crm && this.crm.pool) {
        temp.push({
          title: '公海',
          path: 'seas',
          icon: require('@/assets/img/crm/seas.png')
        })
      }

      if (this.crm && this.crm.customer && this.crm.customer.nearbyCustomer) {
        temp.push({
          title: '附近客户',
          path: 'nearby',
          icon: require('@/assets/img/crm/nearby_not.png')
        })
      }

      return temp
    }
  },
  watch: {
    poolId: {
      handler(newVal) {
        if (newVal) {
          this.getCustomerPoolAuth(newVal)
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.getPoolList()
  },
  activated() {
    if (this.isRequested) {
      this.getList()
    }
  },
  deactivated() {
    this.$refs.elMenu.activeIndex = 'seas'
  },
  methods: {
    /**
     * 获取公海权限
     */
    getCustomerPoolAuth(poolId) {
      crmCustomerPoolQueryAuthAPI({
        poolId: poolId
      })
        .then(res => {
          this.poolAuth = res.data || {}
        })
        .catch(() => {})
    },

    /**
     * 左侧菜单选择
     */
    menuSelect(key, keyPath) {
      this.$emit('menu-select', key, keyPath)
    },

    /**
     * 公海数据
     */
    getPoolList() {
      crmCustomerPoolNameListAPI()
        .then(res => {
          this.poolList = res.data || []
          this.poolId = this.poolList.length > 0 ? this.poolList[0].poolId : ''
        })
        .catch(() => {
        })
    },

    /**
     * 选择公海
     */
    poolChange() {
      this.currentPage = 1
      this.getFieldList(true)
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'customerName') {
        return 'can-visit--underline'
      } else if (column.property === 'businessCheck') {
        return 'can-visit'
      } else {
        return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/table.scss';
</style>
