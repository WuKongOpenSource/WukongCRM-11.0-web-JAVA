<template>
  <div class="xh-user">
    <div v-if="headerShow" class="xh-user__hd">
      员工
    </div>
    <div class="xh-user__bd">
      <el-input
        v-model="searchInput"
        :disabled="disabled"
        placeholder="搜索成员"
        size="small"
        prefix-icon="el-icon-search"
        class="search-input"/>
      <div
        class="search-list">
        <el-checkbox
          :indeterminate="isIndeterminate"
          :disabled="radio || disabled"
          v-model="checkAll"
          class="all-check"
          @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group
          ref="checkboxGroup"
          v-model="dataValue"
          :max="max"
          :disabled="disabled"
          @change="checkboxChange">
          <el-checkbox
            v-for="(item, i) in showOptions"
            v-show="!item.isHide"
            :key="i"
            :label="item[props.value]"
            class="colleagues-list">
            <xr-avatar
              :name="item[props.label]"
              :size="24"
              :src="item.img"
              class="user-img" />
            <span>{{ item[props.label] }}</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div class="xh-user__ft">
      <span class="select-info">已选择<span class="select-info--num">{{ value ? value.length : 0 }}</span>项</span>
      <el-button type="text" @click="clearAll">清空</el-button>
    </div>
  </div>
</template>
<script type="text/javascript">
import PinyinMatch from 'pinyin-match'
import { valueEquals } from 'element-ui/lib/utils/util'
import { objDeepCopy } from '@/utils'

export default {
  name: 'WkUser', // 新建 user
  components: {},
  props: {
    radio: Boolean,
    headerShow: {
      type: Boolean,
      default: true
    },
    // isHide 可不显示 但数据源里包含
    options: Array,
    value: Array,
    // 取值字段
    props: {
      type: Object,
      default: () => {
        return {
          value: 'userId',
          label: 'realname'
        }
      }
    },
    max: Number,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dataValue: [],
      searchInput: '',
      checkAll: false,
      isIndeterminate: false
    }
  },
  computed: {
    showOptions() {
      return this.options.filter(item => {
        return PinyinMatch.match(item[this.props.label], this.searchInput)
      })
    }
  },
  watch: {
    value() {
      if (this.options && !this.radio) {
        const optionsLength = this.options.filter(item => !item.isHide).length
        if (this.value.length == optionsLength && (this.value.length > 0 || optionsLength > 0)) {
          this.checkAll = true
        } else {
          this.checkAll = false
        }

        this.isIndeterminate = !!(!this.checkAll && this.value.length)
      }

      if (!valueEquals(this.value, this.dataValue)) {
        this.dataValue = objDeepCopy(this.value)
      }
    }
  },
  created() {
    this.dataValue = objDeepCopy(this.value || [])
  },
  methods: {

    /**
     * 勾选
     */
    checkboxChange(val) {
      if (this.radio) {
        this.$emit('input', val.length ? [val[val.length - 1]] : [])

        // 单选直接关闭窗口
        this.$emit('close')
      } else {
        this.$emit('input', val)
      }
      this.$emit('change', val)
    },

    /**
     * 全部勾选
     */
    handleCheckAllChange(val) {
      if (val) {
        const ids = []
        this.options.forEach(item => {
          if (!item.isHide) {
            ids.push(item[this.props.value])
          }
        })
        this.$emit('input', ids)
      } else {
        this.$emit('input', [])
      }
      this.$emit('change', val)
    },

    /**
     * 清空全部
     */
    clearAll() {
      this.$emit('input', [])
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
