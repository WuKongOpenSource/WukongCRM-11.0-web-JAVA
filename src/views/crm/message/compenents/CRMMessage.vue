<template>
  <div class="ec-container">
    <div class="title">
      <i
        :class="['title-icon', iconData.iconClass]"
        :style="{ backgroundColor: iconData.color }" />{{ infoTitle }}
      <el-tooltip
        v-if="infoTips"
        :content="infoTips"
        effect="dark"
        placement="top">
        <i class="wk wk-help wk-help-tips"/>
      </el-tooltip>
    </div>
    <div class="option-bar">
      <flexbox
        v-if="selectionList.length == 0"
        justify="space-between">
        <el-tabs
          v-if="showOptions"
          v-model="optionsType" @tab-click="refreshList">
          <el-tab-pane
            v-for="item in options"
            :key="item.value"
            :label="item.name"
            :name="item.value">
            <el-badge
              slot="label"
              :value="item.num"
              :hidden="item.num <= 0">
              <span>
                {{ item.name }}
              </span>
            </el-badge>
          </el-tab-pane>
        </el-tabs>

        <div>
          <el-select
            v-if="showSubType"
            v-model="isSubType"
            :style="{'margin-left': showOptions ? '10px' : 0}"
            style="width: 120px;"
            @change="refreshList">
            <el-option
              v-for="item in [{name: '我的', value: 1}, {name: '我下属的', value: 2}]"
              :key="item.value"
              :label="item.name"
              :value="item.value"/>
          </el-select>
          <el-button
            v-if="showFilterView"
            style="margin-left: 10px;"
            type="primary"
            class="filter-button el-button--margin "
            icon="wk wk-screening"
            @click="getFilterFieldInfo">高级筛选</el-button>
          <filter-form
            :field-list="filterFieldList"
            :dialog-visible.sync="showFilter"
            :obj="filterObj"
            :crm-type="crmType"
            :save-scene="false"
            @filter="handleFilter"/>
          <el-button
            :disabled="!canMark"
            class="el-button--margin "
            icon="wk wk-tag"
            style="margin-left: 10px;"
            type="primary" plain @click="allMarkReadClick">全部标记已处理</el-button>
        </div>
      </flexbox>
      <flexbox
        v-else
        class="selection-bar">
        <div class="selected—title">已选中<span class="selected—count">{{ selectionList.length }}</span>项</div>
        <flexbox class="selection-items-box">
          <el-button
            v-for="(item, index) in selectionButtonList"
            :icon="item.icon"
            :key="index"
            type="primary"
            @click.native="selectionBarClick(item.type)">{{ item.name }}</el-button>
        </flexbox>
      </flexbox>
    </div>
    <filter-content
      v-if="filterObj.form && filterObj.form.length > 0"
      :obj="filterObj"
      @delete="handleDeleteField"/>
    <el-table
      v-loading="loading"
      id="crm-table"
      :data="list"
      :height="tableHeight"
      :cell-class-name="cellClassName"
      class="n-table--border"
      stripe
      border
      highlight-current-row
      style="width: 100%"
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange">
      <el-table-column
        :selectable="selectionDisabled"
        show-overflow-tooltip
        type="selection"
        align="center"
        width="55"/>
      <el-table-column
        v-for="(item, index) in fieldList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        show-overflow-tooltip>
        <template slot-scope="{ row, column, $index }">
          <template v-if="item.prop == 'dealStatus'">
            <i :class="row[item.prop] | dealIcon"/>
            <span>{{ row[item.prop] | dealName }}</span>
          </template>
          <template v-else-if="item.prop == 'status' && crmType === 'customer'">
            <i
              v-if="row.status == 2"
              class="wk wk-circle-password customer-lock"/>
          </template>
          <template v-else-if="item.prop == 'checkStatus'">
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
      <el-table-column :resizable="false"/>
    </el-table>
    <div class="p-contianer">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size.sync="pageSize"
        :total="total"
        class="p-bar"
        background
        layout="prev, pager, next, sizes, total, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"/>
    </div>

    <!-- 相关详情页面 -->
    <c-r-m-all-detail
      :visible.sync="showDview"
      :crm-type="rowType"
      :id="rowID"
      @handle="getList"/>
  </div>
</template>

<script>
import crmTypeModel from '@/views/crm/model/crmTypeModel'
import { filterIndexfieldsAPI } from '@/api/crm/common'
import { crmLeadsSetFollowAPI } from '@/api/crm/leads'
import { crmCustomerSetFollowAPI } from '@/api/crm/customer'
import {
  crmMessagAllDealAPI,
  crmMessagzealByIdAPI
} from '@/api/crm/message'

import FilterForm from '@/views/crm/components/FilterForm'
import FilterContent from '@/views/crm/components/FilterForm/FilterContent'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import WkFieldView from '@/components/NewCom/WkForm/WkFieldView'

import MessageTableMixin from '../mixins/MessageTable'

export default {
  /** 客户管理 的待审核系统 */
  name: 'CRMMessage',

  components: {
    FilterForm,
    FilterContent,
    CRMAllDetail,
    WkFieldView
  },

  filters: {
    dealIcon(statu) {
      return statu == 1 ? 'wk wk-success deal-suc' : 'wk wk-close deal-un'
    },

    dealName(statu) {
      return statu == 1 ? '已成交' : '未成交'
    }
  },

  mixins: [MessageTableMixin],

  props: {
    // crm类型
    crmType: {
      type: String,
      default: ''
    },
    // crm某个类型下的类型数据
    infoType: {
      type: String,
      default: ''
    },

    infoTitle: {
      type: String,
      default: ''
    },

    infoTips: {
      type: String,
      default: ''
    },

    // 标示信息
    iconData: Object,

    // 展示的时候 才发请求
    show: Boolean,

    // 待办模块 用于 标记
    model: Number
  },

  data() {
    return {
      optionsType: '0',
      options: [],
      isSubType: 1, // 是否是下属
      /** 高级筛选 */
      showFilter: false, // 控制筛选框
      filterFieldList: [],
      filterObj: { form: [] }, // 筛选确定数据
      /** 勾选数据操作 */
      selectionList: [], // 勾选的数据
      /** 控制详情展示 */
      rowID: '', // 行信息
      rowType: '', // 详情类型
      showDview: false
    }
  },
  computed: {
    // 展示勾选框
    showFollow() {
      if (this.infoType == 'followLeads' || this.infoType == 'followCustomer') {
        return true
      }

      return false
    },

    // 操作按钮列表
    selectionButtonList() {
      const temps = this.showFollow ? [{
        name: '已跟进',
        type: 'follow',
        icon: 'wk wk-edit'
      }] : []
      temps.push({
        name: '标记已处理',
        type: 'mark-deal',
        icon: 'wk wk-tag'
      })
      return temps
    },

    // 展示筛选
    showFilterView() {
      if (this.crmType == 'receivables_plan') {
        return false
      }
      return true
    },

    // 展示审核状态
    showCheckStatus() {
      if (this.crmType == 'contract' || this.crmType == 'receivables') {
        return true
      }
      return false
    },

    // 展示客户池天数
    showPoolDay() {
      if (this.crmType == 'customer') {
        return true
      }
      return false
    },

    // 展示我的/下属筛选
    showSubType() {
      if (
        this.infoType == 'todayCustomer' ||
        this.infoType == 'todayBusiness' ||
        this.infoType == 'todayLeads' ||
        this.infoType == 'putInPoolRemind' ||
        this.infoType == 'returnVisitRemind' ||
        this.infoType == 'followLeads' ||
        this.infoType == 'followCustomer'
      ) {
        return true
      }
      return false
    },

    /**
     * 能标记
     */
    canMark() {
      if (this.options.length) {
        if (this.showSubType && this.showOptions) {
          return this.optionsType == '1' && this.isSubType == 1
        }

        if (this.showSubType) {
          return this.isSubType == 1
        }

        if (this.showOptions) {
          return this.optionsType == '1'
        }
        return false
      }

      return true
    }
  },

  watch: {
    show() {
      this.options = this.getOption()

      if (this.showOptions && this.options.length > 0) {
        this.optionsType = this.options[0].value
      }
      this.initTableHead()
    }
  },

  mounted() {
    this.options = this.getOption()

    if (this.showOptions && this.options.length > 0) {
      this.optionsType = this.options[0].value
    }

    this.initTableHead()
  },

  methods: {
    /**
     * 初始化表头数据
     */
    initTableHead() {
      if (this.show) {
        this.currentPage = 1
        if (this.fieldList.length == 0) {
          this.getFieldList()
        } else {
          this.getList(false)
          this.$store.dispatch('GetMessageNum')
        }
      }
    },

    /**
     * 刷新列表
     */
    refreshList() {
      this.currentPage = 1
      if (this.fieldList.length > 0) {
        this.getList()
      } else {
        this.getFieldList()
      }
    },

    /**
     * 勾选数据
     */
    handleSelectionChange(val) {
      this.selectionList = val // 勾选的行
    },

    /**
     * 勾选后的操作
     */
    selectionBarClick(type) {
      if (type == 'follow') {
        this.$confirm('您确定此操作吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            const request = {
              followLeads: crmLeadsSetFollowAPI,
              followCustomer: crmCustomerSetFollowAPI
            }[this.infoType]
            request(
              this.selectionList
                .map(item => item[this.crmType + 'Id'])
            )
              .then(res => {
                this.$message.success('操作成功')
                this.refreshList()

                this.$emit('on-handle', {
                  type: 'follow',
                  value: this.selectionList.length,
                  infoType: this.infoType
                })

                this.$parent.requestNumCount()
              })
              .catch(() => {})
          })
          .catch(() => {})
      } else if (type == 'mark-deal') {
        const params = { model: this.model }
        params.list = this.selectionList
          .map(item => {
            const temp = {}
            const fieldKey = this.crmType === 'receivables_plan' ? 'planId' : `${this.crmType}Id`
            temp.typeId = item[fieldKey]
            // 待进入公海提醒 需要的公海id
            if (this.infoType == 'putInPoolRemind') {
              temp.poolIds = item.poolIds
            }
            return temp
          })
        crmMessagzealByIdAPI(params).then(res => {
          this.$message.success('操作成功')
          this.getList()
          this.$parent.requestNumCount()
        }).catch(() => {})
      }
    },

    /**
     * 获取高级筛选字段数据后展示
     */
    getFilterFieldInfo() {
      filterIndexfieldsAPI({
        label: crmTypeModel[this.crmType]
      })
        .then(res => {
          this.filterFieldList = res.data || []
          this.showFilter = true
        })
        .catch(() => {})
    },

    /**
     * 选择筛选字段
     */
    handleFilter(form) {
      this.filterObj = form
      this.showFilter = false
      this.updateTableHeight()
      this.refreshList()
    },

    /**
     * 删除筛选字段
     */
    handleDeleteField(data) {
      this.filterObj = data.obj
      this.updateTableHeight()
      this.refreshList()
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (
        (column.property === 'name' && this.crmType != 'contract') ||
        column.property === 'number' ||
        column.property === 'leadsName' ||
        column.property === 'customerName' ||
        column.property === 'businessName' ||
        column.property === 'contactsName' ||
        column.property === 'num' ||
        column.property === 'visitNumber' ||
        column.property === 'invoiceApplyNumber'
      ) {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 全部标记为已读
     */
    allMarkReadClick() {
      crmMessagAllDealAPI({
        model: this.model
      }).then(res => {
        this.$message.success('操作成功')
        this.$parent.requestNumCount()
        this.getList()
      }).catch(() => {})
    },

    /**
     * 不能进行勾选操作
     */
    selectionDisabled() {
      return this.canMark
    },

    /**
     * 获取option
     */
    getOption() {
      if (this.infoType == 'todayCustomer' ||
        this.infoType == 'todayBusiness' ||
        this.infoType == 'todayLeads') {
        return [
          { name: '今日需联系', value: '1', num: 0, isMenuNum: true },
          { name: '已逾期', value: '2', num: 0, key: 'overtime' },
          { name: '已联系', value: '3', num: 0 }
        ]
      } else if (
        this.infoType == 'followLeads' ||
        this.infoType == 'followCustomer'
      ) {
        return [{ name: '待跟进', value: '1', num: 0, isMenuNum: true }, { name: '已跟进', value: '2', num: 0 }]
      } else if (
        this.infoType == 'checkContract' ||
        this.infoType == 'checkReceivables' ||
        this.infoType == 'checkInvoice'
      ) {
        return [{ name: '待审核', value: '1', num: 0, isMenuNum: true }, { name: '已审核', value: '2', num: 0 }]
      } else if (this.infoType == 'remindReceivablesPlan') {
        return [
          { name: '待回款', value: '1', num: 0, isMenuNum: true },
          { name: '已回款', value: '2', num: 0, key: 'overtime' },
          { name: '已逾期', value: '3', num: 0 }
        ]
      } else if (this.infoType == 'endContract') {
        return [{ name: '即将到期', value: '1', num: 0, isMenuNum: true }, { name: '已到期', value: '2', num: 0 }]
      }

      return []
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../../styles/table.scss';
/** 场景和筛选 */
.filtrate-button {
  cursor: pointer;
  margin-left: 10px;
  display: inline-block;
  &-img {
    vertical-align: middle;
    margin: 0 5px;
    width: 12px;
  }
}
.filtrate-button:hover {
  color: $xr-color-primary;
}

.ec-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.title {
  padding: 10px 20px;
  font-size: 14px;
  color: #333;

  .title-icon {
    display: inline-block;
    font-size: 12px;
    padding: 6px;
    width: 25px;
    height: 25px;
    border-radius: $xr-border-radius-base;
    color: white;
    margin-right: 10px;
  }
  .wk-help {
    margin-left: 5px;
  }
}
.option-bar {
  padding: 15px 20px;
  .el-tabs {
    width: 280px;
    /deep/ .el-tabs__header {
      margin: 0;
      .el-tabs__nav-wrap::after {
        display: none;
      }
    }
  }

  .el-badge {
    line-height: initial;
  }
}

/** 勾选操作 */
.selection-bar {
  font-size: 12px;
  height: 35px;
  color: #777;

  .selected—title {
    flex-shrink: 0;
    padding-right: 20px;
    color: #333;
    .selected—count {
      color: $xr-color-primary;
    }
  }
}

.selection-items-box {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 15px;

  .el-button {
    color: #666;
    background-color: $xr--background-color-base;
    border-color: $xr--background-color-base;
    font-size: 12px;
    height: 28px;
    border-radius: 14px;
    /deep/ i {
      font-size: 12px;
      margin-right: 5px;
    }
  }

  .el-button--primary:hover {
    background: $xr-color-primary;
    border-color: $xr-color-primary;
    color: #ffffff;
  }

  .el-button + .el-button {
    margin-left: 15px;
  }
}

.n-table--border {
  border-top: 1px solid $xr-border-line-color;
}

.el-button--primary.is-plain {
  background-color: white;
}

.el-button--primary.is-plain:focus,
.el-button--primary.is-plain:active,
.el-button--primary.is-plain:hover {
  color: $xr-color-primary;
}

// 拉开图标与文字距离
.el-button--margin {
  /deep/ i {
    margin-right: 5px;
  }
}
</style>
