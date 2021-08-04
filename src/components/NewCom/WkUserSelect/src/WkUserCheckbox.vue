<template>
  <el-checkbox-group
    ref="checkboxGroup"
    v-model="currentValue"
    :disabled="disabled"
    class="wk-user-checkbox"
    @change="userChange">
    <el-checkbox
      v-for="(item, i) in data"
      :key="i"
      :label="item[config.value]"
      class="xh-user__item">
      <xr-avatar
        :name="item[config.label]"
        :size="24"
        :src="item.img"
        class="user-img" />
      <div class="user-info">
        <div class="user-name text-one-line">{{ item[config.label] }}</div>
        <div class="user-post">{{ item.post || '暂无岗位' }}</div>
      </div>
    </el-checkbox>
  </el-checkbox-group>
</template>

<script>
import UserDepMixin from './UserDepMixin'

export default {
  // 员工选择
  name: 'WkUserCheckbox',

  components: {},

  mixins: [UserDepMixin],

  props: {},

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
    userChange(val) {
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-user-checkbox {
  .xh-user {
    &__item {
      height: 40px;
      display: flex;
      align-items: center;

      /deep/ .el-checkbox__input {
        flex-shrink: 0;
      }

      /deep/ .el-checkbox__label {
        flex: 1;
        display: flex;
      }

      .dep-name {
        flex: 1;
        padding-right: 8px;
      }

      .el-checkbox {
        margin-right: 8px;
      }
      .el-button--text {
        position: relative;
        color: #ccc;
        padding: 0 12px;
        flex-shrink: 0;
        /deep/ i {
          font-size: 13px;
          margin-right: 3px;
        }

        &:before {
          content: ' ';
          position: absolute;
          top: 2px;
          left: 0;
          bottom: 2px;
          width: 1px;
          background-color: $xr-border-color-base;
        }

        &:hover {
          color: $xr-color-primary;
        }

        &.is-disabled {
          color: #C0C4CC;
        }
      }
      .user {
        &-img {
          flex-shrink: 0;
        }

        &-info {
          flex: 1;
          padding: 0 8px;
        }

        &-name {
          max-width: 200px;
        }

        &-post {
          color: #999;
          margin-top: 2px;
          font-size: 12px;
        }
      }

    }
  }
}
</style>
