<template>
  <flexbox
    align="center"
    justify="center">
    <div class="empty">
      <p class="empty-title">{{ title }}</p>
      <el-button
        v-if="btnName"
        class="xr-btn--orange empty-btn"
        icon="el-icon-plus"
        type="primary"
        @click="click">{{ btnName }}</el-button>
    </div>
  </flexbox>
</template>

<script>

export default {
  // 重要信息为空
  name: 'ImportInfoEmpty',
  components: {},
  props: {
    title: {
      type: String,
      default: '暂无数据'
    },

    btnName: String
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    click() {
      this.$emit('add')
    }
  }
}
</script>

<style lang="scss" scoped>
.empty {
  text-align: center;

  &-title {
    color: #666;
    font-size: 15px;
  }

  &-btn {
    margin-top: 8px;
  }
}
</style>
