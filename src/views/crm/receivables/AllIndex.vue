<template>
  <keep-alive>
    <component
      :is="componentName"
      @menu-select="menuSelect" />
  </keep-alive>
</template>

<script>
import ReceivablesIndex from './index'
import ReceivablesPlanIndex from '../receivablesPlan'

import { mapGetters } from 'vuex'
export default {
  name: 'CustomerAllIndex',
  components: {
    ReceivablesIndex,
    ReceivablesPlanIndex
  },
  props: {},
  data() {
    return {
      componentName: ''
    }
  },
  computed: {
    ...mapGetters(['crm'])
  },
  watch: {},
  mounted() {
    if (this.crm && this.crm.receivables) {
      this.componentName = 'ReceivablesIndex'
    } else if (this.crm && this.crm.receivablesPlan) {
      this.componentName = 'ReceivablesPlanIndex'
    }
  },

  beforeDestroy() {},
  methods: {
    /**
     * 左侧菜单选择
     */
    menuSelect(key, keyPath) {
      this.componentName = {
        receivables: 'ReceivablesIndex',
        receivablesPlan: 'ReceivablesPlanIndex'
      }[key]
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
