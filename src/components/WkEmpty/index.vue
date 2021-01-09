<template>
  <div class="wk-empty">
    <div class="wk-empty__title">{{ config.emptyText || '暂无数据' }}</div>
    <el-button
      v-if="config.showButton"
      :icon="config.buttonIcon"
      class="wk-empty__button xr-btn--orange"
      type="primary"
      @click="btnClick">{{ config.buttonTitle || '新建' }}</el-button>
  </div>
</template>

<script>
import merge from '@/utils/merge'

const DefaultEmptyProps = {
  emptyText: '', // 是否搜索
  showButton: false,
  buttonIcon: 'el-icon-plus', // 员工列表请求
  buttonTitle: '' // 空参数
}

export default {
  // 空数据
  name: 'WkEmpty',

  components: {},

  props: {
    props: Object
  },

  data() {
    return {
    }
  },

  computed: {
    config() {
      return merge({ ...DefaultEmptyProps }, this.props || {})
    }
  },

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {
    btnClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss">
.wk-empty {
  color: #999;

  &__button {
    margin-top: 8px;
  }
}
</style>
