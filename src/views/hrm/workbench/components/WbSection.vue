<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <el-card class="wk-section">
    <div v-if="headerShow" class="wk-section__header">
      <i :class="icon" class="wk-section__icon" />
      <span class="wk-section__label">{{ label }}</span>
      <span class="wk-section__des">{{ des }}</span>
    </div>
    <slot />
  </el-card>
</template>

<script>

export default {
  // 块
  name: 'WbSection',
  components: {},
  props: {
    headerShow: {
      type: Boolean,
      default: true
    },
    label: String,
    des: String,
    icon: {
      type: String,
      default: 'wk wk-funnel-solid'
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
.wk-section {
  border: none;
  &__header {
    margin-bottom: 20px;
  }
  &__icon {
    color: $xr-color-primary;
  }
  &__label {
    font-weight: bold;
  }
  &__des {
    color: #666;
    font-size: 12px;
  }
}
</style>
