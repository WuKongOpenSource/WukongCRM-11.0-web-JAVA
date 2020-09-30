<template>
  <flexbox class="xr-import">
    <div
      v-loading="loading"
      v-if="loading"
      class="xr-import__icon" />
    <i
      v-else
      class="wk wk-success xr-import__icon" />
    <p
      :class="{ 'is-loading': loading }"
      class="xr-import__label">{{ processLabel }}</p>
  </flexbox>
</template>

<script>
export default {
  // 导入缩小框子
  name: 'XrImport',
  components: {},
  props: {
    // wait / process / finish / error / success
    processStatus: {
      type: String,
      default: 'wait'
    }
  },
  data() {
    return {
    }
  },
  computed: {
    loading() {
      return this.processStatus == 'process'
    },

    processLabel() {
      return this.loading ? '导入中' : '导入完成'
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.xr-import {
  position: fixed;
  right: 50px;
  bottom: 150px;
  z-index: 999999;
  cursor: pointer;

  width: 130px;
  height: 50px;
  padding: 10px;
  border-radius: 25px;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  &__icon {
    font-size: 30px;
    margin-right: 5px;
  }

  &__label {
    font-size: 14px;
    color: #333;
  }

  &__label.is-loading {
    margin-left: 35px;
  }

  /deep/ .el-loading-spinner .circular {
    width: 30px;
    height: 30px;
  }

  /deep/ .el-loading-spinner {
    margin-top: -15px;
  }
}

.wk-success {
  color: $xr-color-primary;
}
</style>
