<template>
  <div class="xh-stru">
    <div class="xh-stru__hd">
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
            @click="enterChildren(item)">{{ item.name }}</div>
          <div
            v-if="item.children"
            class="el-icon-arrow-right stru-enter"/>
        </flexbox>
      </div>
    </div>
    <div class="xh-stru__ft">
      <span class="select-info">已选择<span class="select-info--num">{{ selectItems.length }}</span>项</span>
      <el-button type="text" @click="clearAll">清空</el-button>
    </div>
  </div>
</template>
<script type="text/javascript">
import { depListAPI } from '@/api/common'
import PinyinMatch from 'pinyin-match'

export default {
  name: 'XhStructure', // 新建 structure
  components: {},
  props: {
    show: {
      type: Boolean,
      default: true
    },
    value: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 多选框 只能选一个
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
    }
  },
  data() {
    return {
      breadcrumbList: [], // 面包屑数据
      selectItems: [], // 选择项
      dataList: [], // 展示数据
      loading: false, // 加载动画
      searchInput: ''
    }
  },
  computed: {
    showDataList() {
      return this.dataList.filter(item => {
        return PinyinMatch.match(item.name, this.searchInput)
      })
    }
  },
  watch: {
    selectedData() {
      this.selectItems = this.selectedData
      this.dataList = this.handelCheck(this.dataList)
    },

    show(value) {
      if (this.dataList && this.dataList.length == 0) {
        this.getStructureList()
      }
    }
  },
  mounted() {
    this.selectItems = this.selectedData
    if (this.show) {
      this.getStructureList()
    }
  },
  methods: {
    /**
     * 部门列表数据
     */
    getStructureList() {
      this.loading = true
      depListAPI({
        type: 'tree'
      })
        .then(res => {
          const allList = this.handelCheck(this.addIsCheckProp(res.data))
          this.dataList = allList
          this.breadcrumbList.push({ label: '全部', data: allList })

          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 面包屑点击事件
     */
    breadcrumbBtn(item, index) {
      if (this.radio && this.selectItems.length == 1) return
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
      this.$set(this.dataList, aindex, item)
      var removeIndex = -1
      for (let index = 0; index < this.selectItems.length; index++) {
        const element = this.selectItems[index]
        if (item.id == element.id) {
          removeIndex = index
        }
      }
      if (removeIndex == -1 && item.isCheck) {
        this.selectItems.push(item)
      } else if (removeIndex != -1) {
        this.selectItems.splice(removeIndex, 1)
      }

      // 单选逻辑
      if (this.radio) {
        if (item.isCheck) {
          this.dataList = this.dataList.map(function(element, index, array) {
            if (element.id == item.id) {
              element.disabled = false
            } else {
              element.disabled = true
            }
            return element
          })
        } else {
          this.dataList = this.dataList.map(function(item, index, array) {
            item.disabled = false
            return item
          })
        }
      }

      this.$emit('changeCheckout', this.selectItems)
    },

    /**
     * 数据重新刷新时 循环标记展示数组
     */
    handelCheck(list) {
      let disabled = false
      if (this.radio) {
        // 如果有勾选其他为false
        disabled = this.selectItems.length > 0
      }

      list = list.map((item, index, array) => {
        item.isCheck = this.selectItemsHasItem(item)
        if (this.radio && item.isCheck) {
          item.disabled = false
        } else {
          item.disabled = disabled
        }
        return item
      })
      return list
    },
    selectItemsHasItem(item) {
      if (this.selectItems.length == 0) {
        return false
      }
      var hasItem = false
      for (let index = 0; index < this.selectItems.length; index++) {
        const element = this.selectItems[index]
        if (item.id == element.id) {
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
      if (item.children && !(this.radio && this.selectItems.length == 1)) {
        this.dataList = []
        this.dataList = this.handelCheck(this.addIsCheckProp(item.children))
        this.breadcrumbList.push({ label: item.label, data: this.dataList })
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
      this.selectItems = []
      this.dataList = this.dataList.map(item => {
        item.isCheck = false
        return item
      })
      this.$emit('changeCheckout', this.selectItems)
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
