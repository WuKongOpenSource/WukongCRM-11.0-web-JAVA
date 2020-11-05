<template>
  <div
    v-loading="loading"
    v-empty="nopermission"
    class="rc-cont"
    xs-empty-icon="nopermission"
    xs-empty-text="暂无权限">
    <flexbox
      class="rc-head"
      direction="row-reverse">
      <el-button
        class="xr-btn--orange rc-head-item"
        icon="el-icon-plus"
        type="primary"
        @click="createClick">新建回访</el-button>
    </flexbox>
    <el-table
      v-show="fieldList.length > 0"
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
        :min-width="item.width"
        :label="item.label"
        show-overflow-tooltip />
    </el-table>
    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :id="detailId"
      crm-type="visit"
      @handle="detailHandle" />
    <c-r-m-all-create
      v-if="isCreate"
      :action="createActionInfo"
      crm-type="visit"
      @save-success="createSaveSuccess"
      @close="isCreate=false" />
  </div>
</template>

<script type="text/javascript">
import CRMAllCreate from './CRMAllCreate'
import {
  crmCustomerQueryVisitAPI
} from '@/api/crm/customer'
import {
  crmContractQueryVisitAPI
} from '@/api/crm/contract'
import {
  filedGetTableFieldAPI
} from '@/api/crm/common'

export default {
  name: 'RelativeVisit', // 相关回访
  components: {
    CRMFullScreenDetail: () => import('@/components/CRMFullScreenDetail'),
    CRMAllCreate
  },
  mixins: [],
  props: {
    // 模块ID
    id: [String, Number],
    // 客户类型
    crmType: {
      type: String,
      default: ''
    },
    // 回访人下 新建商机 需要回访里的客户信息  合同下需要客户和商机信息
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
      // 控制新建
      isCreate: false,
      // 查看全屏回访详情的 ID
      detailId: '',
      // 创建的相关信息
      createActionInfo: { type: 'relative', crmType: this.crmType, data: {}},
      // 关联的逻辑
      showRelativeView: false,
      selectionList: []
    }
  },
  inject: ['rootTabs'],
  computed: {},
  watch: {
    id: function(val) {
      this.list = []
      this.getDetail()
    },

    'rootTabs.currentName'(val) {
      if (val === 'RelativeVisit') {
        this.getDetail(false)
      }
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {

    /**
     * 表头数据
     */
    getFieldList() {
      // this.fieldList.push({
      //   prop: 'visitNumber',
      //   width: '200',
      //   label: '回访编号'
      // })
      // this.fieldList.push({ prop: 'visitTime', width: '200', label: '回访时间' })
      // this.fieldList.push({ prop: 'ownerUserName', width: '200', label: '回访人' })
      // this.fieldList.push({ prop: 'returnVisitType', width: '200', label: '回访形式' })
      // this.fieldList.push({ prop: '客户满意度', width: '200', label: '客户满意度' })
      // this.fieldList.push({ prop: 'contractNum', width: '200', label: '合同编号' })
      filedGetTableFieldAPI({
        label: 17
      }).then(res => {
        const list = res.data || []
        const fieldList = []
        for (let index = 0; index < list.length; index++) {
          const element = list[index]
          if (element.fieldId) {
            fieldList.push({ prop: element.fieldName, width: '150', label: element.name })
          }
        }
        this.fieldList = fieldList
      }).catch(() => {})
    },

    /**
     * 获取数据
     */
    getDetail(loading = true) {
      if (this.fieldList.length == 0) {
        this.getFieldList()
      }
      this.loading = loading
      const request = {
        customer: crmCustomerQueryVisitAPI,
        contract: crmContractQueryVisitAPI
      }[this.crmType]
      const params = { pageType: 0 }
      params[this.crmType + 'Id'] = this.id
      request(params)
        .then(res => {
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
     * 当某一行被点击时会触发该事件
     */
    handleRowClick(row, column, event) {
      if (column.property == 'visitNumber') {
        this.detailId = row.visitId
        this.showFullDetail = true
      }
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'visitNumber') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 新建
     */
    createClick() {
      //  客户 下新建回访
      if (this.crmType == 'customer') {
        this.createActionInfo.data['customer'] = this.detail
      } else if (this.crmType == 'contract') {
        this.createActionInfo.data['customer'] = this.detail
        this.createActionInfo.data['contract'] = this.detail
        this.createActionInfo.relativeData = {
          contractId: this.detail.contractId
        }
      }
      this.isCreate = true
    },
    createSaveSuccess() {
      if (this.canRelation) {
        this.$refs.crmrelative.refreshList()
      } else {
        this.$bus.emit('crm-tab-num-update')
        this.getDetail()
      }
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
