<template>
  <div class="xr-user-view">
    <div v-if="data" class="xr-mian">
      <flexbox class="xr-mian__hd user">
        <div class="user-info">
          <div class="user-info__name">
            <span>{{ data.realname }}</span>
            <i v-if="sexIcon" :class="sexIcon" />
          </div>
          <div class="user-info__company">
            {{ data.companyName }}
          </div>
        </div>

        <el-avatar
          :src="dataSrc"
          :size="44"
          class="user-img">{{ showName }}</el-avatar>
      </flexbox>
      <div class="xr-mian__bd">
        <flexbox class="info-cell">
          <i class="wk wk-department" />
          <div class="info-cell__label">部门</div>
          <div class="info-cell__value text-one-line">{{ data.deptName }}</div>
        </flexbox>
        <flexbox class="info-cell">
          <i class="wk wk-tie" />
          <div class="info-cell__label">岗位</div>
          <div class="info-cell__value text-one-line">{{ data.post }}</div>
        </flexbox>
        <flexbox class="info-cell">
          <i class="wk wk-b-mobile" />
          <div class="info-cell__label">手机</div>
          <div :title="data.mobile" class="info-cell__value text-one-line">{{ data.mobile }}</div>
        </flexbox>
        <flexbox class="info-cell">
          <i class="wk wk-email" />
          <div class="info-cell__label">邮箱</div>
          <div :title="data.email" class="info-cell__value text-one-line">{{ data.email }}</div>
        </flexbox>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  // 弹窗详情
  name: 'XrUserView',
  components: {},
  props: {
    data: Object,
    src: String
  },
  data() {
    return {}
  },
  computed: {
    showName() {
      return this.data.realname && this.data.realname.length > 2 ? this.data.realname.slice(-2) : this.data.realname
    },

    sexIcon() {
      // 1 男 2 女
      if (this.data.sex === 1) {
        return 'wk wk-man'
      } else if (this.data.sex === 2) {
        return 'wk wk-woman'
      }
      return ''
    },

    dataSrc() {
      return this.src || this.data.img
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.xr-user-view {
  min-height: 235px;
}

.xr-mian {
  min-height: 235px;
  &__hd {
    padding: 20px 15px;
    background-color: #F7F8FA;
  }

  &__bd {
    padding-top: 1px solid $xr-border-line-color;
    padding: 20px 15px;
  }
}

.user {
  &-info {
    flex: 1;
    &__name {
      font-size: 16px;
      color: #333;
      font-weight: bold;

      i {
        font-size: 14px;
        margin-left: 8px;
      }

      .wk-woman {
        color: #FF3838;
      }

      .wk-man {
        color: #3875ff;
      }
    }

    &__company {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
    }
  }

  &-img {
    flex-shrink: 0;
    margin-left: 15px;
  }
}

.info-cell {
  font-size: 12px;
  i {
    font-size: 12px;
    color: #999;
    flex-shrink: 0;
  }

  &__label {
    margin-left: 5px;
    color: #666;
    width: 50px;
    flex-shrink: 0;
  }

  &__value {
    color: #333;
    margin-left: 30px;
  }

  & + & {
    margin-top: 15px;
  }
}
</style>
