<template>
  <div class="cr-contianer">
    <div class="title">{{ getTitle() }}</div>
    <div style="height: 100%;position: relative;">
      <div
        v-if="crmType == ''"
        class="cr-body-side">
        <div
          v-for="(item, index) in leftSides"
          :key="index"
          :class="leftType===item.type? 'side-item-select' : 'side-item-default'"
          class="side-item"
          @click="sideClick(item)">{{ item.name }}
          <span v-if="getMenuCrmNum(item.type)" class="side-item__num">{{ `(${getMenuCrmNum(item.type)})` }}</span>
        </div>
      </div>
      <div :style="{ 'padding-left': crmType == '' ? '150px' : '0'}">
        <crm-relative-table
          v-for="(item, index) in leftSides"
          v-show="item.type == leftType"
          :key="index"
          :ref="'crm'+item.type"
          :show="show && item.type == leftType"
          :radio="radio"
          :crm-type="item.type"
          :selected-data="currentSelectedData"
          :action="action"
          @changeCheckout="checkCrmTypeInfos" />
      </div>
    </div>
    <div
      class="dialog-footer">
      <el-button @click="closeView">取消</el-button>
      <el-button
        type="primary"
        @click="confirmClick">确定</el-button>
    </div>
  </div>
</template>

<script type="text/javascript">
import CrmRelativeTable from './CrmRelativeTable'
import { objDeepCopy } from '@/utils'

export default {
  name: 'CrmRelatieve', // 相关
  components: {
    CrmRelativeTable
  },
  props: {
    /** 多选框 只能选一个 */
    radio: {
      type: Boolean,
      default: true
    },
    acceptEmail: {
      type: String,
      default: ''
    },
    /** 没有值就是全部类型 有值就是当个类型 */
    crmType: {
      type: String,
      default: ''
    },
    /** 需要展示哪些类型 默认关键字数组 */
    showTypes: {
      type: Array,
      default: () => {
        return [
          'customer',
          'contacts',
          'leads',
          'business',
          'contract',
          'product'
        ]
      }
    },
    /** 已选信息 */
    selectedData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    /** true 的时候 发请求 */
    show: {
      type: Boolean,
      default: true
    },
    /**
     * default 默认  condition 固定条件筛选 moduleType 下的
     * relative: 相关 添加
     */
    action: {
      type: Object,
      default: () => {
        return {
          type: 'default',
          data: {}
        }
      }
    }
  },
  data() {
    return {
      leftType: 'customer',
      leftSides: [],
      /** 各类型选择的值 */
      currentSelectedData: {}
    }
  },
  computed: {},
  watch: {
    selectedData: function(data) {
      this.handleCurrentSelectData(data)
    },
    // 刷新标记
    show(val) {
      if (val) {
        this.handleCurrentSelectData(this.selectedData)
      }
    }
  },
  mounted() {
    var leftItems = {
      customer: {
        name: '客户',
        type: 'customer'
      },
      contacts: {
        name: '联系人',
        type: 'contacts'
      },
      leads: {
        name: '线索',
        type: 'leads'
      },
      business: {
        name: '商机',
        type: 'business'
      },
      contract: {
        name: '合同',
        type: 'contract'
      },
      product: {
        name: '产品',
        type: 'product'
      },
      invoiceTitle: {
        name: '发票抬头',
        type: 'invoiceTitle'
      }
    }
    if (this.crmType) {
      this.leftType = this.crmType
      this.leftSides.push(leftItems[this.crmType])
    } else {
      for (let index = 0; index < this.showTypes.length; index++) {
        const element = this.showTypes[index]
        this.leftSides.push(leftItems[element])
      }
    }
    this.currentSelectedData = objDeepCopy(this.selectedData)
  },
  methods: {
    /**
     * 目前选择值
     */
    handleCurrentSelectData(data) {
      if (data && Object.keys(data).length) {
        this.currentSelectedData = objDeepCopy(data)
      } else {
        const tempData = {}
        if (this.crmType) {
          tempData[this.crmType] = []
          this.currentSelectedData = tempData
        } else {
          for (let index = 0; index < this.showTypes.length; index++) {
            const key = this.showTypes[index]
            tempData[key] = []
          }
          this.currentSelectedData = tempData
        }
      }
    },

    /**
     * 刷新列表
     */
    refreshList() {
      this.$refs['crm' + this.crmType][0].refreshList()
    },

    sideClick(item) {
      this.leftType = item.type
    },
    clearAll() {
      if (this.crmType) {
        this.$refs['crm' + this.crmType][0].clearAll()
      }
    },

    /**
     * 当用户手动勾选全选 Checkbox 时触发的事件
     */
    selectAll() {},

    /**
     * 关闭操作
     */
    closeView() {
      this.$emit('close')
    },
    checkCrmTypeInfos(data) {
      this.currentSelectedData[data.type] = data.data
    },

    /**
     * 确定选择
     */
    confirmClick() {
      if (this.crmType) {
        if (this.acceptEmail == 'receive') {
          this.$emit('changeCheckout', { data: this.currentSelectedData[this.crmType], type: 'receive' })
        } else if (this.acceptEmail == 'sent') {
          this.$emit('changeCheckout', { data: this.currentSelectedData[this.crmType], type: 'sent' })
        } else {
          // 以单类型传值
          this.$emit('changeCheckout', {
            data: this.currentSelectedData[this.crmType]
              ? this.currentSelectedData[this.crmType]
              : []
          })
        }
      } else {
        this.$emit('changeCheckout', { data: this.currentSelectedData })
      }

      this.$emit('close')
    },

    /**
     * 获取菜单数量
     */
    getMenuCrmNum(type) {
      return this.currentSelectedData[type]
        ? this.currentSelectedData[type].length
        : 0
    },

    /**
     * 根据类型获取标题展示名称
     */
    getTitle() {
      if (this.crmType == 'leads') {
        return '关联线索模块'
      } else if (this.crmType == 'customer') {
        return '关联客户模块'
      } else if (this.crmType == 'contacts') {
        return '关联联系人模块'
      } else if (this.crmType == 'business') {
        return '关联商机模块'
      } else if (this.crmType == 'product') {
        return '关联产品模块'
      } else if (this.crmType == 'contract') {
        return '关联合同模块'
      } else if (this.crmType == 'invoiceTitle') {
        return '关联发票抬头'
      } else {
        return '关联相关信息'
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.cr-contianer {
  // height: 450px;
  position: relative;
  padding: 50px 0 10px 0;
}

.title {
  padding: 0 20px;
  font-size: 16px;
  font-weight: 600;
  line-height: 50px;
  height: 50px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  border-bottom: 1px solid $xr-border-line-color;
}

.dialog-footer {
  text-align: right;
  margin-top: 10px;
  margin-right: 10px;
}

.cr-body-side {
  flex-shrink: 0;
  z-index: 3;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 150px;
  font-size: 12px;
  background-color: white;
  height: 100%;
  border-right: 1px solid $xr-border-line-color;
  .side-item {
    position: relative;
    height: 40px;
    line-height: 40px;
    padding: 0 20px;
    font-size: 14px;
    color: #333;
    cursor: pointer;

    &__num {
      color: #666;
      font-size: 12px;
      position: absolute;
      top: 0;
      right: 5px;
    }
  }

  .side-item::before {
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 2px;
  }
}

.side-item-default {
  color: #333;
}

.side-item-select {
  background-color: $xr--background-color-base;
}

.side-item-select::before {
  background-color: $xr-color-primary;
}
</style>
