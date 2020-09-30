<template>
  <div class="rc-cont">
    <flexbox
      v-if="!isSeas"
      class="rc-head"
      direction="row-reverse">
      <el-button
        class="xr-btn--orange rc-head-item"
        icon="el-icon-plus"
        type="primary"
        @click="createClick('plan')">新建回款计划</el-button>
    </flexbox>
    <el-table
      :data="palnList"
      :height="tableHeight"
      stripe
      style="width: 100%;border: 1px solid #E6E6E6;">
      <el-table-column
        v-for="(item, index) in planFieldList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        show-overflow-tooltip/>
      <el-table-column
        label="操作"
        fixed="right"
        width="100">
        <template slot-scope="scope">
          <flexbox justify="center">
            <el-button
              type="text"
              @click.native="handleFile('edit', scope)">编辑</el-button>
            <el-button
              type="text"
              @click.native="handleFile('delete', scope)">删除</el-button>
          </flexbox>
        </template>
      </el-table-column>
    </el-table>

    <flexbox
      class="rc-head"
      direction="row-reverse"
      style="margin-top: 15px;">
      <el-button
        v-if="!isSeas"
        class="xr-btn--orange rc-head-item"
        icon="el-icon-plus"
        type="primary"
        @click="createClick('money')">新建回款</el-button>
    </flexbox>
    <el-table
      :data="list"
      :height="tableHeight"
      :cell-class-name="cellClassName"
      stripe
      style="width: 100%;border: 1px solid #E6E6E6;"
      @row-click="handleRowClick">
      <el-table-column
        v-for="(item, index) in fieldList"
        :key="index"
        :prop="item.prop"
        :formatter="fieldFormatter"
        :label="item.label"
        show-overflow-tooltip/>
    </el-table>
    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :crm-type="showFullCrmType"
      :id="showFullId"
      @handle="detailHandle"/>


    <c-r-m-all-create
      v-if="isCreate"
      :crm-type="createCrmType"
      :action="createActionInfo"
      @save-success="saveSuccess"
      @close="isCreate=false"/>

  </div>
</template>

<script type="text/javascript">
import LoadingMixin from '../mixins/Loading'
import CRMAllCreate from './CRMAllCreate'
import {
  crmCustomerQueryReceivablesAPI,
  crmCustomerQueryReceivablesPlanAPI
} from '@/api/crm/customer'
import {
  crmContractQueryReceivablesAPI,
  crmContractQueryReceivablesPlanAPI
} from '@/api/crm/contract'
import {
  crmReceivablesPlanDeleteAPI
} from '@/api/crm/receivables'
/** 注意  需要删除接口 */
import { objDeepCopy } from '@/utils'
import CheckStatusMixin from '@/mixins/CheckStatusMixin'
import { separator } from '@/filters/vueNumeralFilter/filters'

export default {
  name: 'RelativeReturnMoney', // 相关回款  可能再很多地方展示 放到客户管理目录下

  components: {
    CRMAllCreate,
    CRMFullScreenDetail: () => import('@/components/CRMFullScreenDetail')
  },

  mixins: [LoadingMixin, CheckStatusMixin],

  props: {
    /** 模块ID */
    id: [String, Number],
    /** 没有值就是全部类型 有值就是当个类型 */
    crmType: {
      type: String,
      default: ''
    },
    /** 是公海 默认是客户 */
    isSeas: {
      type: Boolean,
      default: false
    },
    /** 客户和 合同下 可新建 回款计划 */
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      list: [],
      fieldList: [],
      tableHeight: '250px',
      showFullDetail: false,
      showFullCrmType: 'receivables',
      showFullId: '', // 查看全屏详情的 ID
      createCrmType: 'receivables_plan', // 创建回款计划
      isCreate: false, // 新建回款回款
      palnList: [],
      planFieldList: [],
      createActionInfo: {} // 新建回款计划的时候 在客户 合同下导入关联信息
    }
  },

  inject: ['rootTabs'],

  computed: {},

  watch: {
    id(val) {
      this.list = []
      this.palnList = []
      this.getList()
      this.getPlanList()
    },

    'rootTabs.currentName'(val) {
      if (val === 'RelativeReturnMoney') {
        this.getList(false)
        this.getPlanList(false)
      }
    }
  },

  mounted() {
    this.planFieldList = [
      { prop: 'num', width: '200', label: '期数' },
      { prop: 'customerName', width: '200', label: '客户名称' },
      { prop: 'contractNum', width: '200', label: '合同编号' },
      { prop: 'money', width: '200', label: '计划回款金额' },
      { prop: 'returnDate', width: '200', label: '计划回款日期' },
      { prop: 'returnType', width: '200', label: '计划回款方式' },
      { prop: 'remind', width: '200', label: '提前几日提醒' },
      { prop: 'remark', width: '200', label: '备注' }
    ]

    this.getPlanList()

    this.fieldList = [
      { prop: 'receivablesNum', width: '200', label: '回款编号' },
      { prop: 'contractName', width: '200', label: '合同名称' },
      { prop: 'contractMoney', width: '200', label: '合同金额' },
      { prop: 'receivablesMoney', width: '200', label: '回款金额' },
      { prop: 'planNum', width: '200', label: '期数' },
      { prop: 'ownerUserName', width: '200', label: '负责人' },
      { prop: 'checkStatus', width: '200', label: '状态' },
      { prop: 'returnTime', width: '200', label: '回款日期' }
    ]
    this.getList()
  },

  methods: {
    /**
     * 回款计划列表
     */
    getPlanList(loading = true) {
      this.loading = loading
      const request = {
        customer: crmCustomerQueryReceivablesPlanAPI,
        contract: crmContractQueryReceivablesPlanAPI
      }[this.crmType]
      request(this.getParams())
        .then(res => {
          this.loading = false
          this.palnList = res.data.list
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 回款列表
     */
    getList(loading = true) {
      this.loading = loading
      const request = {
        customer: crmCustomerQueryReceivablesAPI,
        contract: crmContractQueryReceivablesAPI
      }[this.crmType]
      request(this.getParams())
        .then(res => {
          this.loading = false
          this.list = res.data.list
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 获取上传参数
     */
    getParams() {
      if (this.crmType === 'customer') {
        return { customerId: this.id, pageType: 0 }
      } else if (this.crmType === 'contract') {
        return { contractId: this.id, pageType: 0 }
      }
      return {}
    },

    /**
     * 当某一行被点击时会触发该事件
     */
    handleRowClick(row, column, event) {
      if (column.property == 'receivablesNum') {
        this.showFullId = row.receivablesId
        this.showFullCrmType = 'receivables'
        this.showFullDetail = true
      }
    },

    /**
     * 新建回款和回款计划
     */
    createClick(type) {
      this.createActionInfo = {
        type: 'relative',
        crmType: this.crmType,
        data: {}
      }
      if (type == 'money') {
        if (this.crmType === 'contract') {
          this.createActionInfo.data['customer'] = objDeepCopy(this.detail)
          this.createActionInfo.data['contract'] = objDeepCopy(this.detail)
        } else if (this.crmType === 'customer') {
          this.createActionInfo.data['customer'] = this.detail
        }
        this.createCrmType = 'receivables'
        this.isCreate = true
      } else if (type == 'plan') {
        if (this.crmType === 'contract') {
          this.createActionInfo.data['customer'] = objDeepCopy(this.detail)
          this.createActionInfo.data['contract'] = objDeepCopy(this.detail)
        } else if (this.crmType === 'customer') {
          this.createActionInfo.data['customer'] = this.detail
        }
        this.createCrmType = 'receivables_plan'
        this.isCreate = true
      }
    },

    /**
     * 新建成功
     */
    saveSuccess() {
      if (this.createCrmType == 'receivables') {
        this.$bus.emit('crm-tab-num-update')
        this.getList()
      } else {
        this.getPlanList()
      }
    },

    /**
     * 编辑操作
     */
    handleFile(type, item) {
      if (type == 'edit') {
        this.createActionInfo = { type: 'update', id: item.row.planId }
        this.createCrmType = 'receivables_plan'
        this.isCreate = true
      } else if (type == 'delete') {
        this.$confirm('您确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            crmReceivablesPlanDeleteAPI([item.row.planId])
              .then(res => {
                this.palnList.splice(item.$index, 1)
                this.$message.success('删除成功')
              })
              .catch(() => {})
          })
          .catch(() => {})
      }
    },

    /**
     * 格式化字段
     */
    fieldFormatter(row, column) {
      // 如果需要格式化
      if (column.property === 'checkStatus') {
        return this.getStatusName(row.checkStatus)
      } else if (column.property == 'contractMoney' || column.property == 'receivablesMoney') {
        return separator(row[column.property] || 0)
      }
      return row[column.property]
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'receivablesNum') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 详情操作
     */
    detailHandle(data) {
      if (data.type === 'delete') {
        this.getList()
        this.$nextTick(() => {
          this.$bus.emit('crm-tab-num-update')
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../styles/relativecrm.scss';
</style>
