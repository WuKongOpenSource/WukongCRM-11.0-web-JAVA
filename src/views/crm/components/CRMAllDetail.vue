<template>
  <component
    v-if="id&&visible"
    :is="tabName"
    :crm-type="crmType"
    :id="id"
    :listener-ids="listenerIDs"
    :no-listener-ids="noListenerIDs"
    :no-listener-class="noListenerClass"
    class="d-view"
    @handle="detailHandle"
    @hide-view="hiddenView"/>
</template>

<script type="text/javascript">
import { getMaxIndex } from '@/utils/index'
import LeadsDetail from '../leads/Detail'
import CustomerDetail from '../customer/Detail'
import ContactsDetail from '../contacts/Detail'
import BusinessDetail from '../business/Detail'
import ContractDetail from '../contract/Detail'
import ProductDetail from '../product/Detail'
import ReceivablesDetail from '../receivables/Detail'
import VisitDetail from '../visit/Detail'
import InvoiceDetail from '../invoice/Detail'

export default {
  name: 'CRMAllDetail', // 详情
  components: {
    LeadsDetail,
    CustomerDetail,
    ContactsDetail,
    BusinessDetail,
    ContractDetail,
    ProductDetail,
    ReceivablesDetail,
    VisitDetail,
    InvoiceDetail
  },
  props: {
    /** 模块ID */
    id: [String, Number],
    /** 没有值就是全部类型 有值就是当个类型 */
    crmType: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    // 监听的dom 进行隐藏详情
    listenerIDs: {
      type: Array,
      default: () => {
        return ['crm-main-container']
      }
    },
    // 不监听
    noListenerIDs: {
      type: Array,
      default: () => {
        return []
      }
    },
    noListenerClass: {
      type: Array,
      default: () => {
        return ['el-table__body']
      }
    }
  },
  data() {
    return {
      tabName: '' // 组件名
    }
  },
  computed: {},
  watch: {
    crmType: function(type) {
      if (this.crmType == 'leads') {
        this.tabName = 'LeadsDetail'
      } else if (this.crmType == 'customer') {
        this.tabName = 'CustomerDetail'
      } else if (this.crmType == 'contacts') {
        this.tabName = 'ContactsDetail'
      } else if (this.crmType == 'business') {
        this.tabName = 'BusinessDetail'
      } else if (this.crmType == 'contract') {
        this.tabName = 'ContractDetail'
      } else if (this.crmType == 'product') {
        this.tabName = 'ProductDetail'
      } else if (this.crmType == 'receivables') {
        this.tabName = 'ReceivablesDetail'
      } else if (this.crmType == 'visit') {
        this.tabName = 'VisitDetail'
      } else if (this.crmType == 'invoice') {
        this.tabName = 'InvoiceDetail'
      } else {
        this.tabName = ''
      }
    }
  },
  mounted() {
    if (this.visible) {
      document.body.appendChild(this.$el)
      this.$el.style.zIndex = getMaxIndex()
    }
  },
  destroyed() {
    // remove DOM node after destroy
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    hiddenView() {
      this.$emit('update:visible', false)
    },

    /**
     * 详情操作
     */
    detailHandle(data) {
      if (data.type === 'alloc' || data.type === 'get' || data.type === 'transfer' || data.type === 'transform' || data.type === 'delete' || data.type === 'put_seas') {
        this.hiddenView()
      }
      this.$emit('handle', data)
    }
  }
}
</script>
<style lang="scss" scoped>
.full-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.3);
}

.d-view {
  position: fixed;
  min-width: 926px;
  width: 75%;
  top: 0px;
  bottom: 0px;
  right: 0px;
}
</style>
