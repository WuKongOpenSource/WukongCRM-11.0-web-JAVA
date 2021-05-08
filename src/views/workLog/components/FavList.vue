<template>
  <flexbox class="fav-list">
    <div
      :class="{'is-fav': isFavour}"
      class="good-btn"
      @click="faveClick">
      <i class="wk wk-good" />
    </div>
    <template v-if="data && data.length > 0">
      <div class="fav-user">
        <el-popover
          v-for="(user, index) in data"
          :key="index"
          v-model="user.show"
          placement="bottom"
          width="250"
          trigger="click">
          <xr-user-view
            v-if="user.show"
            :id="user.userId"
            :data="user"/>
          <span slot="reference" class="can-visit--underline">{{ user.realname }}{{ data.length -1 === index ? '' : '、' }}</span>
        </el-popover>
      </div>
      <span v-if="data.length > 10" class="fav-total">等<el-popover
        v-model="contentVisible"
        popper-class="no-padding-popover"
        placement="top"
        width="200"
        trigger="click">
        <div v-if="contentVisible" class="fav-users">
          <flexbox class="fav-users__header">
            <div class="title">{{ `共${data.length}人点赞` }}</div>
            <i class="el-icon-close" @click="contentVisible = false" />
          </flexbox>
          <div class="fav-users__body">
            <flexbox
              v-for="(user, index) in data"
              :key="index"
              class="user">
              <el-popover
                v-model="user.favShow"
                placement="bottom"
                width="250"
                trigger="click">
                <xr-user-view
                  v-if="user.favShow"
                  :id="user.userId"
                  :data="user"/>
                <xr-avatar
                  slot="reference"
                  :src="user.img"
                  :name="user.realname"
                  :size="34"
                  class="user__img"/>
              </el-popover>
              <div class="text-one-line user__name">{{ user.realname }}</div>
            </flexbox>
          </div>
        </div>
        <span slot="reference">{{ data.length }}</span>
      </el-popover>人点赞</span>
    </template>
  </flexbox>
</template>

<script>

export default {
  // 点赞列表
  name: 'FavList',

  components: {
    XrUserView: () => import('@/components/XrUserView')
  },

  props: {
    isFavour: Boolean,
    data: Array
  },

  data() {
    return {
      contentVisible: false
    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {
    faveClick() {
      this.$emit('fav', this.data)
    }
  }
}
</script>

<style lang="scss" scoped>
.fav-list {
  padding-right: 8px;
  font-size: 13px;

  .fav-user {
    flex: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 0;
    color: #666;
  }

  .fav-total {
    margin-left: 8px;
    flex-shrink: 0;
    span {
      color: $xr-color-primary;
      cursor: pointer;
    }
  }
}

.fav-users {
  &__header {
    padding: 10px 20px;
    .title {
      flex: 1;
    }

    .el-icon-close {
      font-size: 17px;
      cursor: pointer;
      color: #909399;

      &:hover {
        color: $xr-color-primary;
      }
    }

    border-bottom: 1px solid $xr-border-color-base;
  }

  &__body {
    height: 300px;
    overflow-y: auto;
  }
}

.user {
  padding: 8px 20px;

  &__img {
    margin-right: 10px;
  }

  &__name {
    flex: 1;
  }
}
.good-btn {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 17px;
  background: #999;
  margin-right: 8px;
  cursor: pointer;
  i {
    color: white;
    font-size: 13px;
  }

  &.is-fav {
    background: $xr-color-primary;
  }

  &:hover {
    background: #4f81fc;
  }
}
</style>
