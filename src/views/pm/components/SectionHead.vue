<template>
  <div class="section-head">
    <i :class="['section-head__icon', iconClass]" />
    <span>{{ label }}</span>
  </div>
</template>

<script>

export default {
  // 块头 主要用于项目和标签列表头
  name: 'SectionHead',
  components: {},
  props: {
    iconClass: String,
    label: String
  },
  data() {
    return {

    }
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.section-head {
  font-size: 12px;
  color: #333;
  margin: 10px 0;
  &__icon {
    font-size: 12px;
    color: #666;
    margin-right: 3px;
  }
}
</style>
