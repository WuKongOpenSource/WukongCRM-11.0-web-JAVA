<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @Date: 2020-05-27 15:35:01
 * @LastEditTime: 2020-06-01 17:01:35
 * @LastEditors: yang
-->
<template>
  <div class="wk-base-detail">
    <create-sections
      v-for="(mainItem, mainIndex) in list"
      :key="mainIndex"
      :title="mainItem.name"
      :dropdown-items="dropdownItems"
      class="wk-base-detail__section"
      content-height="auto"
      @command-select="sectionCommandSelect">
      <wk-base-detail-section
        :list="mainItem.list"
      />
      <slot />
    </create-sections>
  </div>
</template>

<script>
import CreateSections from '@/components/CreateSections'
import WkBaseDetailSection from './WkBaseDetailSection'

export default {
  // 基本详情
  name: 'WkBaseDetail',
  components: {
    CreateSections,
    WkBaseDetailSection
  },
  props: {
    list: Array,
    dropdownItems: Array
  },
  data() {
    return {

    }
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    sectionCommandSelect(type) {
      this.$emit('top-command-select', type)
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-base-detail {
  &__section {
    margin-top: 25px;
  }
  /deep/ .create-sections-content {
    padding: 0 20px;
  }
}
</style>
