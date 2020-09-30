<template>
  <div class="xh-user">
    <div class="xh-user__hd">
      员工
    </div>
    <div class="xh-user__bd">
      <el-input
        v-model="searchInput"
        placeholder="搜索成员"
        size="small"
        prefix-icon="el-icon-search"
        class="search-input"/>
      <div
        v-loading="loading"
        class="search-list">
        <el-checkbox
          :indeterminate="isIndeterminate"
          :disabled="radio"
          v-model="checkAll"
          class="all-check"
          @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group
          ref="checkboxGroup"
          v-model="selectIds"
          :max="max"
          @change="changeCheckout">
          <el-checkbox
            v-for="(item, i) in showList"
            :key="i"
            :label="item.userId"
            class="colleagues-list">
            <xr-avatar
              :name="item.realname"
              :size="24"
              :src="item.img"
              class="user-img" />
            <span>{{ item.realname }}</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div class="xh-user__ft">
      <span class="select-info">已选择<span class="select-info--num">{{ selectIds.length }}</span>项</span>
      <el-button type="text" @click="clearAll">清空</el-button>
    </div>
  </div>
</template>
<script type="text/javascript">
import { userListAPI } from '@/api/common'
import { objDeepCopy } from '@/utils'
import PinyinMatch from 'pinyin-match'

export default {
  name: 'XhUser', // 新建 user
  components: {},
  props: {
    show: {
      type: Boolean,
      default: true
    },
    radio: {
      type: Boolean,
      default: false
    },
    // 已选信息
    selectedData: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 请求加强
    infoType: {
      type: String,
      default: 'default' // 返回全部  crm_contract crm_receivables oa_examine 合同审核人自选列表
    },
    // 自定义请求
    infoRequest: Function,
    infoParams: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      list: [],
      selectIds: [], // 选择项
      loading: false, // 加载动画
      searchInput: '',
      checkAll: false,
      isIndeterminate: false
    }
  },
  computed: {
    showList() {
      return this.list.filter(item => {
        return PinyinMatch.match(item.realname || '', this.searchInput)
      })
    },

    max() {
      return this.radio ? 1 : undefined
    }
  },
  watch: {
    selectedData: function(value) {
      if (this.show) {
        this.checkItems(value)
      }
    },

    show(value) {
      if (value) {
        if (this.list && this.list.length == 0) {
          this.getUserList()
        } else {
          this.checkItems(this.selectedData)
        }
      }
    }
  },
  mounted() {
    if (this.show) {
      this.getUserList()
    }
  },
  methods: {
    /**
     * 获取数据
     */
    getUserList() {
      this.loading = true
      this.getRequest()(this.getParams())
        .then(res => {
          this.list = res.data.list || res.data
          this.checkItems(this.selectedData)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 请求
     */
    getRequest() {
      if (this.infoRequest) {
        return this.infoRequest
      } else if (this.infoType === 'default') {
        return userListAPI
      } else if (
        this.infoType === 'crm_contract' ||
        this.infoType === 'crm_invoice' ||
        this.infoType === 'crm_receivables' ||
        this.infoType === 'oa_examine'
      ) {
        return userListAPI
      }
    },

    getParams() {
      const params =
        this.infoParams && Object.keys(this.infoParams.length !== 0)
          ? this.infoParams
          : {}
      if (this.infoType === 'default') {
        params.pageType = 0
        return params
      } else if (
        this.infoType === 'crm_contract' ||
        this.infoType === 'crm_invoice' ||
        this.infoType === 'crm_receivables' ||
        this.infoType === 'oa_examine'
      ) {
        params.pageType = 0
        return params
      }
    },

    /**
     * 勾选
     */
    changeCheckout(val) {
      this.refreshAllCheck(val.length)
      const selectItems = []
      for (let index = 0; index < this.list.length; index++) {
        const item = this.list[index]
        if (val.includes(item.userId)) {
          selectItems.push(item)
        }
      }
      this.$emit('changeCheckout', selectItems, val)
    },

    /**
     * 全部勾选
     */
    handleCheckAllChange(val) {
      this.selectIds = val
        ? this.list.map(item => {
          return item.userId
        })
        : []
      this.isIndeterminate = false
      const selectItems = val ? this.list : []
      this.$emit('changeCheckout', objDeepCopy(selectItems), this.selectIds)
    },

    /**
     * 刷新总check
     */
    refreshAllCheck(checkedCount) {
      this.checkAll = checkedCount === this.list.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.list.length
    },

    /**
     * 标记勾选
     */
    checkItems(items) {
      this.selectIds = items.map(item => {
        return item.userId
      })
      this.refreshAllCheck(this.selectIds.length)
    },

    /**
     * 清空全部
     */
    clearAll() {
      this.selectItems = []
      this.$emit('changeCheckout', [], [])
    }
  }
}
</script>
<style lang="scss" scoped>
/* 选择员工 */
.user-img {
  margin-right: 8px;
  vertical-align: middle;
}
.search-list {
  padding: 5px 0;
  height: 200px;
  overflow: auto;
}
.colleagues-list {
  padding: 5px 0;
  display: block;
  margin-left: 0;
}

.xh-user {
  color: #333;
  font-size: 12px;
  &__hd {
    padding: 0 15px;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid $xr-border-line-color;
  }

  &__bd {
    padding: 10px 12px;
  }

  &__ft {
    padding: 5px 12px;
    background: #f7f8fa;
    border-top: 1px solid $xr-border-line-color;
    .el-button {
      font-size: 12px;
    }
  }
}

// 选择信息
.select-info {
  display: inline-block;
  width: calc(100% - 30px);

  &--num {
    color: $xr-color-primary;
  }
}

// check样式
.el-checkbox-group {
  overflow-x: hidden;
}

.el-checkbox {
  /deep/ .el-checkbox__label {
    color: #333;
  }
}

.all-check {
  display: inline-block;
  padding: 5px 0;
}

.search-input {
  /deep/ .el-input__inner {
    background-color: #F4F4F4;
    border: none;
  }
}
</style>
