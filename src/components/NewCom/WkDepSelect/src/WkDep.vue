<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @Date: 2020-05-20 09:58:31
 * @LastEditTime: 2020-07-02 16:37:47
 * @LastEditors: yang
-->
<template>
  <div class="xh-stru">
    <div v-if="headerShow" class="xh-stru__hd">
      部门
    </div>
    <div class="xh-stru__bd">
      <el-input
        v-model="searchInput"
        placeholder="搜索部门名称"
        size="small"
        prefix-icon="el-icon-search"
        class="search-input"/>
      <div
        v-loading="loading"
        class="search-list">
        <el-breadcrumb
          style="padding: 5px 0;"
          separator-class="el-icon-arrow-right">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbList"
            :key="index">
            <a
              href="javascript:;"
              @click="breadcrumbBtn(item, index)">{{ item.label }}</a>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <flexbox
          v-for="(item, index) in showDataList"
          :key="index"
          class="stru-list">
          <el-checkbox
            v-model="item.isCheck"
            :disabled="item.disabled"
            class="stru-check"
            @change="checkChange(item, index)"/>
          <div
            class="stru-name"
            @click="enterChildren(item)">{{ item[props.label] }}</div>
          <div
            v-if="item.children"
            class="el-icon-arrow-right stru-enter"/>
        </flexbox>
      </div>
    </div>
    <div class="xh-stru__ft">
      <span class="select-info">已选择<span class="select-info--num">{{ value.length }}</span>项</span>
      <el-button type="text" @click="clearAll">清空</el-button>
    </div>
  </div>
</template>
<script type="text/javascript">
import PinyinMatch from 'pinyin-match'
import { valueEquals } from 'element-ui/lib/utils/util'
import { objDeepCopy } from '@/utils'

export default {
  name: 'WkDep', // 新建 dep
  components: {},
  props: {
    headerShow: {
      type: Boolean,
      default: true
    },
    options: Array,
    value: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 取值字段
    props: {
      type: Object,
      default: () => {
        return {
          value: 'id',
          label: 'name'
        }
      }
    },
    // 多选框 只能选一个
    radio: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dataValue: [],
      breadcrumbList: [], // 面包屑数据
      dataList: [], // 展示数据
      loading: false, // 加载动画
      searchInput: ''
    }
  },
  computed: {
    showDataList() {
      return this.dataList.filter(item => {
        return PinyinMatch.match(item[this.props.label], this.searchInput)
      })
    }
  },
  watch: {
    value: {
      handler() {
        if (!valueEquals(this.value, this.dataValue)) {
          this.dataValue = objDeepCopy(this.value)
          this.handelCheck(this.dataList)
        }
      },
      immediate: true
    },

    options: {
      handler() {
        this.initInfo()
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    initInfo() {
      this.dataList = this.options
      this.breadcrumbList = [{ label: '全部', data: this.options }]

      // options获取默认执行一次
      this.dataValue = objDeepCopy(this.value)
      this.handelCheck(this.dataList)
    },

    /**
     * 面包屑点击事件
     */
    breadcrumbBtn(item, index) {
      if (index + 1 <= this.breadcrumbList.length - 1) {
        this.breadcrumbList.splice(index + 1, this.breadcrumbList.length - 1)
      }
      this.dataList = []
      this.dataList = this.handelCheck(item.data)
    },

    /**
     * 点击checkbox选中
     */
    checkChange(item, aindex) {
      // 单选逻辑
      if (this.radio) {
        if (item.isCheck && this.dataValue.length) {
          this.dataList.forEach(cItem => {
            if (cItem[this.props.value] !== item[this.props.value]) {
              cItem.isCheck = false
            }
          })
        }
        this.dataValue = item.isCheck ? [item[this.props.value]] : []
      } else {
        var removeIndex = -1
        for (let index = 0; index < this.dataValue.length; index++) {
          const element = this.dataValue[index]
          if (item[this.props.value] == element) {
            removeIndex = index
            break
          }
        }
        if (removeIndex == -1 && item.isCheck) {
          this.dataValue.push(item[this.props.value])
        } else if (removeIndex != -1) {
          this.dataValue.splice(removeIndex, 1)
        }
      }

      this.$emit('change', this.dataValue)
      this.$emit('input', this.dataValue)
    },

    /**
     * 数据重新刷新时 循环标记展示数组
     */
    handelCheck(list) {
      list.forEach(item => {
        const isCheck = this.valueHasItem(item)
        if (isCheck !== item.isCheck) {
          item.isCheck = isCheck
        }
      })
      return list
    },
    valueHasItem(item) {
      if (this.dataValue.length == 0) {
        return false
      }
      var hasItem = false
      for (let index = 0; index < this.dataValue.length; index++) {
        const element = this.dataValue[index]
        if (item[this.props.value] == element) {
          hasItem = true
          break
        }
      }
      return hasItem
    },


    /**
     * 点击进入子数组
     */
    enterChildren(item) {
      // 保证单选环境下 没有选中 才可进入children
      if (item.children) {
        this.dataList = []
        this.dataList = this.handelCheck(this.addIsCheckProp(item.children))
        this.breadcrumbList.push({ label: item[this.props.label], data: this.dataList })
      }
    },

    /**
     * 给默认数据加isCheck属性
     */
    addIsCheckProp(list) {
      if (list.length > 0) {
        var item = list[0]
        if (item.hasOwnProperty('isCheck')) {
          return list
        } else {
          return list.map(function(item, index, array) {
            item.disabled = false
            item.isCheck = false
            item.show = true
            return item
          })
        }
      }
      return list
    },

    clearAll() {
      this.dataValue = []
      this.dataList = this.dataList.map(item => {
        item.isCheck = false
        return item
      })
      this.$emit('input', this.dataValue)
    }
  }
}
</script>
<style lang="scss" scoped>
.search-list {
  padding: 5px;
  height: 248px;
  overflow: auto;
}
.stru-list {
  padding: 5px;
  font-size: 13px;
  .stru-check {
    margin-right: 8px;
  }
  .stru-name {
    flex: 1;
  }
  .stru-enter {
    margin-right: 8px;
  }
}

// 框子
.xh-stru {
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
.el-checkbox {
  /deep/ .el-checkbox__label {
    color: #333;
  }
}

.search-input {
  /deep/ .el-input__inner {
    background-color: #F4F4F4;
    border: none;
  }
}
</style>
