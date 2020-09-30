<template>
  <keep-alive>
    <component
      :is="componentName"
      @menu-select="menuSelect" />
  </keep-alive>
</template>

<script>
import LeadsIndex from './index'

import { mapGetters } from 'vuex'
export default {
  name: 'LeadsAllIndex',
  components: {
    LeadsIndex

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
    if (this.crm && this.crm.leads) {
      this.componentName = 'LeadsIndex'
    }
  },

  beforeDestroy() {},
  methods: {
    /**
     * 左侧菜单选择
     */
    menuSelect(key, keyPath) {
      this.componentName = {
        leads: 'LeadsIndex'
      }[key]
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
