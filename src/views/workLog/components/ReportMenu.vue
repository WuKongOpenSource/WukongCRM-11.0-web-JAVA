<template>
  <span class="report-menu">
    <span
      v-for="(item, index) in list"
      :key="index"
      class="report-menu-btn"
      @click="itemClick(item)">
      <i
        :class="getXrIcon(item.type)"
        :style="{ color: getXrIconColor(item.type) }"
        class="report-menu-btn__icon" />
      <span class="report-menu-btn__name">{{ item.name }}</span>
    </span>
  </span>
</template>

<script>
import XrSystemIconMixin from '@/mixins/XrSystemIcon'

export default {
  // 日志简报菜单
  name: 'ReportMenu',
  components: {},
  mixins: [XrSystemIconMixin],
  props: {
    list: Array
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    itemClick(item) {
      this.$emit('select', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.report-menu {

  &-btn {
    display: inline-block;
    padding: 5px 10px;
    background-color: $xr--background-color-base;
    font-size: 13px;
    color: #333;
    border-radius: 13px;
    cursor: pointer;

    &__icon {
      font-size: 12px;
    }

    &__name {
      margin-left: 3px;
    }

    &:hover {
      background-color: #ecf1ff;
    }
  }

  &-btn {
    margin-right: 20px;
    margin-bottom: 8px;
  }

}
</style>
