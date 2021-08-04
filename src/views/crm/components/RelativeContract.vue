<template>
  <div
    v-loading="loading"
    v-empty="nopermission"
    class="rc-cont"
    xs-empty-icon="nopermission"
    xs-empty-text="暂无权限">
    <flexbox
      v-if="!isSeas"
      class="rc-head"
      direction="row-reverse">
      <el-button
        v-if="contractSave"
        class="xr-btn--orange rc-head-item"
        icon="el-icon-plus"
        type="primary"
        @click="createClick">新建合同</el-button>
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
      :id="contractId"
      crm-type="contract"
      @handle="detailHandle"/>
    <c-r-m-all-create
      v-if="isCreate"
      :action="createActionInfo"
      crm-type="contract"
      @save-success="createSaveSuccess"
      @close="isCreate=false"/>
  </div>
</template>

<script type="text/javascript">
import CRMAllCreate from './CRMAllCreate'
import { crmCustomerQueryContractAPI } from '@/api/crm/customer'
import { crmBusinessQueryContractAPI } from '@/api/crm/business'
import CheckStatusMixin from '@/mixins/CheckStatusMixin'
import { separator } from '@/filters/vueNumeralFilter/filters'
import { getPermissionByKey } from '@/utils'

export default {
  name: 'RelativeContract', // 相关联系人  可能再很多地方展示 放到客户管理目录下
  components: {
    CRMFullScreenDetail: () => import('@/components/CRMFullScreenDetail'),
    CRMAllCreate
  },
  mixins: [CheckStatusMixin],
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
    /** 联系人人下 新建商机 需要联系人里的客户信息  合同下需要客户和商机信息 */
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      loading: false,
      nopermission: false,
      list: [],
      fieldList: [],
      tableHeight: '400px',
      showFullDetail: false,
      isCreate: false, // 控制新建
      contractId: '', // 查看全屏联系人详情的 ID
      // 创建的相关信息
      createActionInfo: { type: 'relative', crmType: this.crmType, data: {}}
    }
  },
  inject: ['rootTabs'],
  computed: {
    contractSave() {
      return !!getPermissionByKey('crm.contract.save')
    }
  },
  watch: {
    id(val) {
      this.list = []
      this.getDetail()
    },

    'rootTabs.currentName'(val) {
      if (val === 'RelativeContract') {
        this.getDetail(false)
      }
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {
    getFieldList() {
      this.fieldList.push({
        prop: 'contractName',
        width: '200',
        label: '合同名称'
      })
      this.fieldList.push({ prop: 'num', width: '200', label: '合同编号' })
      this.fieldList.push({
        prop: 'customerName',
        width: '200',
        label: '客户名称'
      })
      this.fieldList.push({ prop: 'money', width: '200', label: '合同金额' })
      this.fieldList.push({
        prop: 'startTime',
        width: '200',
        label: '开始日期'
      })

      this.fieldList.push({ prop: 'endTime', width: '200', label: '结束日期' })
      this.fieldList.push({ prop: 'checkStatus', width: '200', label: '状态' })
    },

    getDetail(loading = true) {
      this.loading = loading
      const request = {
        customer: crmCustomerQueryContractAPI,
        business: crmBusinessQueryContractAPI
      }[this.crmType]
      const params = { pageType: 0 }
      params[this.crmType + 'Id'] = this.id
      request(params)
        .then(res => {
          if (this.fieldList.length == 0) {
            this.getFieldList()
          }
          this.nopermission = false
          this.loading = false
          this.list = res.data.list
        })
        .catch(data => {
          if (data.code == 102) {
            this.nopermission = true
          }
          this.loading = false
        })
    },

    /**
     * 格式化字段
     */
    fieldFormatter(row, column) {
      // 如果需要格式化
      if (column.property === 'checkStatus') {
        return this.getStatusName(row.checkStatus)
      } else if (column.property == 'money') {
        return separator(row[column.property] || 0)
      }
      return row[column.property]
    },

    /**
     * 当某一行被点击时会触发该事件
     */
    handleRowClick(row, column, event) {
      if (column.property == 'contractName') {
        this.contractId = row.contractId
        this.showFullDetail = true
      }
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'contractName') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 新建
     */
    createClick() {
      // 客户 和 商机 下新建合同
      if (this.crmType == 'business') {
        this.createActionInfo.data['customer'] = this.detail
        this.createActionInfo.data['business'] = this.detail
      } else if (this.crmType == 'customer') {
        this.createActionInfo.data['customer'] = this.detail
      }
      this.isCreate = true
    },
    createSaveSuccess() {
      this.$bus.emit('crm-tab-num-update')
      this.getDetail()
    },

    /**
     * 详情操作
     */
    detailHandle(data) {
      if (data.type === 'delete') {
        this.getDetail()
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
