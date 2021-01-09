<template>
  <div>
    <c-r-m-list-head
      :search.sync="search"
      :crm-type="crmType"
      :create-fun="createClick"
      title="客户管理"
      placeholder="请输入客户名称/手机/电话"
      main-title="新建客户"
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
    </c-r-m-list-head>
    <div
      v-empty="!crm.customer.index"
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
          :resizable="false"
          prop="businessCheck"
          fixed
          label=""
          width="38">
          <template
            slot="header"
            slot-scope="slot">
            <i
              class="wk wk-business"
              style="cursor: not-allowed; color: #9DA9C2;"/>
          </template>
          <template slot-scope="scope">
            <el-popover
              :disabled="scope.row.businessCount == 0"
              :offset="250"
              placement="right"
              popper-class="no-padding-popover"
              width="500"
              trigger="click">
              <business-check
                :data="scope"
                :show="scope.row.show"
                @click="relativeBusinessClick"
                @close="businessClose($event, scope)"/>
              <i
                slot="reference"
                :style="{'opacity' :scope.row.businessCount > 0 ? 1 : 0}"
                class="wk wk-business"
                style="color: #FC6E51"
                @click="businessCheckClick($event, scope)"/>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :fixed="index==0"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :sortable="item.prop != 'poolDay' ? 'custom' : false"
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
        <wk-empty
          slot="empty"
          :props="{
            buttonTitle: '新建客户',
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
    <!-- 相关详情页面 -->
    <c-r-m-all-detail
      :visible.sync="showDview"
      :crm-type="rowType"
      :id="rowID"
      class="d-view"
      @handle="handleHandle"/>

    <!-- 新建 -->
    <c-r-m-all-create
      v-if="createShow"
      :crm-type="createType"
      :action="createAction"
      @close="createShow = false"
      @save-success="saveSuccess"
    />
  </div>
</template>

<script>
import CRMAllCreate from '../components/CRMAllCreate'
import { mapGetters } from 'vuex'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import BusinessCheck from './components/BusinessCheck' // 相关商机
import TableMixin from '../mixins/Table'

export default {
  /** 客户管理 的 客户列表 */
  name: 'CustomerIndex',
  components: {
    CRMAllDetail,
    BusinessCheck,
    CRMAllCreate
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
      createType: 'customer',
      createAction: {
        type: 'save',
        id: '',
        data: {}
      },
      createShow: false
    }
  },
  computed: {
    ...mapGetters(['CRMConfig']),
    menuItems() {
      const temp = []
      if (this.crm && this.crm.customer) {
        temp.push({
          title: '客户',
          path: 'customer',
          icon: require('@/assets/img/crm/customer.png')
        })
      }

      if (this.crm && this.crm.pool) {
        temp.push({
          title: '公海',
          path: 'seas',
          icon: require('@/assets/img/crm/seas_not.png')
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
  mounted() {},
  activated() {
    if (this.isRequested) {
      this.getList()
    }
  },
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

    relativeBusinessClick(data) {
      this.rowID = data.businessId
      this.rowType = 'business'
      this.showDview = true
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
    },
    // 商机信息查看
    businessCheckClick(e, scope) {
      if (scope.row.businessCount == 0) {
        return
      }

      const popoverEl = e.target.parentNode
      this.$set(scope.row, 'show', !scope.row.show)
      popoverEl.__vue__.showPopper = !scope.row.show
    },
    businessClose(e, scope) {
      const popoverEl = e.parentNode
      popoverEl.__vue__.showPopper = false
      this.$set(scope.row, 'show', false)
    },

    /**
     * 新建点击
     */
    createClick() {
      this.createType = this.crmType
      this.createAction = {
        type: 'save',
        id: '',
        data: {}
      }
      this.createShow = true
    },

    /**
     * 创建成功
     */
    saveSuccess(data) {
      if (data.type == 'customer') {
        this.handleHandle(data)
        if (data.createContacts) {
          this.createType = 'contacts'
          this.createAction = {
            type: 'relative',
            crmType: 'customer',
            data: {
              customer: data.data
            }
          }
          this.createShow = true
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/table.scss';
</style>
