<template>
  <component
    :is="componentName"
    v-bind="$attrs"
    v-on="$listeners"
    @save-success="createSaveSuccess"
    @hiden-view="hiddenView"
    @close="hiddenView"/>
</template>

<script type="text/javascript">
import InvoiceCreate from '@/views/crm/invoice/Create'
import CustomerCreate from '@/views/crm/customer/Create'
import ContactsCreate from '@/views/crm/contacts/Create'
import LeadsCreate from '@/views/crm/leads/Create'
import BusinessCreate from '@/views/crm/business/Create'
import ContractCreate from '@/views/crm/contract/Create'
import ReceivablesCreate from '@/views/crm/receivables/Create'
import ReceivablesPlanCreate from '@/views/crm/receivables/PlanCreate'
import VisitCreate from '@/views/crm/visit/Create'
import ProductCreate from '@/views/crm/product/Create'

export default {
  name: 'CRMAllCreate',
  components: {
    InvoiceCreate,
    CustomerCreate,
    ContactsCreate,
    BusinessCreate,
    ContractCreate,
    ReceivablesCreate,
    ReceivablesPlanCreate,
    VisitCreate,
    LeadsCreate,
    ProductCreate
  },
  inheritAttrs: false,
  props: {
    crmType: String
  },
  data() {
    return {
    }
  },
  computed: {
    componentName() {
      return {
        invoice: 'InvoiceCreate',
        customer: 'CustomerCreate',
        contacts: 'ContactsCreate',
        leads: 'LeadsCreate',
        business: 'BusinessCreate',
        contract: 'ContractCreate',
        receivables: 'ReceivablesCreate',
        visit: 'VisitCreate',
        product: 'ProductCreate',
        receivables_plan: 'ReceivablesPlanCreate'
      }[this.crmType]
    }
  },
  watch: {

  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    hiddenView() {
      this.$emit('close')
    },

    createSaveSuccess(data) {
      this.$emit('save-success', data)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
