<template>
  <flexbox
    style="width: auto;"
    justify="space-between"
    align="center"
    class="wk-backgroud-tabs">
    <flexbox align="center" style="width: auto;z-index: 1;">
      <slot name="left" />
    </flexbox>
    <div class="wk-tabs__wrap">
      <div class="wk-tabs">
        <div
          v-for="(item, index) in options"
          :key="index"
          :class="{ 'active' : item.value === value}"
          class="wk-tabs__item"
          @click="tabsClick(item, index)">
          {{ item.label }}
        </div>
      </div>
    </div>
    <flexbox align="center" style="width: auto;z-index: 1;">
      <slot name="right" />
    </flexbox>
  </flexbox>
</template>

<script>
export default {
  // 切换菜单
  name: 'WkBackgroudTabs',

  components: {},

  props: {
    value: [String, Number],
    options: Array
  },

  data() {
    return {

    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {
    tabsClick(item, index) {
      this.$emit('input', item.value)
      this.$emit('tab-click', item, index)
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-backgroud-tabs {
  position: relative;
  height: 60px;
  font-size: 14px;
  box-shadow: 0 1px 2px #dbdbdb;
  padding: 0 20px;
  background: #fff;
  z-index: 1;

  .wk-tabs__wrap {
    position: absolute;
    text-align: center;
    left: 0;
    right: 0;
    .wk-tabs {
      position: relative;
      display: inline-block;
      height: 100%;
      line-height: 60px;

      &__item {
        display: inline-block;
        padding: 0 30px;
        cursor: pointer;
        &.active {
          background: #f6f8fa;
        }
      }
    }
  }
}
</style>
