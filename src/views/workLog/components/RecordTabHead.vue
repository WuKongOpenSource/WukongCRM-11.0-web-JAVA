<template>
  <base-tabs-head
    v-bind="$attrs"
    class="Task-tabs-head"
    v-on="$listeners">
    <span
      slot="left"
      class="title">
      <i class="wk wk-message" />跟进记录（{{ count }}）
    </span>
  </base-tabs-head>
</template>

<script>
import BaseTabsHead from '@/components/BaseTabsHead'

export default {
  /** 任务切换头 */
  name: 'RecordTabHead',
  components: {
    BaseTabsHead
  },
  props: {
    count: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.title {
  margin-left: 30px;
  color: #333333;
  i {
    color: white;
    margin-right: 5px;
    padding: 3px;
    font-size: 12px;
    border-radius: $xr-border-radius-base;
    background-color: #487DFF;
  }
}
</style>
