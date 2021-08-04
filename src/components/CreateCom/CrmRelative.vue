<template>
  <el-dialog
    :visible="visible"
    :close-on-click-modal="false"
    :title="getTitle()"
    class="crm-ralative"
    width="60%"
    append-to-body
    @close="closeView">
    <div class="cr-contianer">
      <div style="position: relative;">
        <div
          v-if="crmType == '' && !commonConfig.isCommon"
          class="cr-body-side">
          <div
            v-for="(item, index) in leftSides"
            :key="index"
            :class="leftType===item.type? 'side-item-select' : 'side-item-default'"
            class="side-item"
            @click="sideClick(item)">{{ item.name }}
            <span v-if="item.num > 0" class="side-item__num">{{ `(${item.num})` }}</span>
          </div>
        </div>

        <div v-if="commonConfig.isCommon">
          <template v-for="(item, index) in leftSides">
            <crm-relative-table
              v-if="item.loaded"
              v-show="item.type == leftType"
              ref="moduleTable"
              :key="index"
              :props="commonConfig"
              :selected-data="currentSelectedData[item.type]"
              @selection-change="selectionChange($event, item)"
            />
          </template>
        </div>
        <div v-else :style="{ 'padding-left': crmType == '' ? '150px' : '0'}">
          <template v-for="(item, index) in leftSides">
            <component
              v-if="item.loaded"
              v-show="item.type == leftType"
              ref="moduleTable"
              :key="index"
              :props="componentConfig"
              :selected-data="currentSelectedData[item.type]"
              :is="getComponentsName(item.type)"
              @selection-change="selectionChange($event, item)"/>
          </template>
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
  </el-dialog>
</template>

<script type="text/javascript">
import { objDeepCopy } from '@/utils'
import merge from '@/utils/merge'

// 通用配置 含 CrmRelativeTable 声明的信息
const DefaultCommon = {
  isCommon: false,
  type: '',
  name: ''
}

export default {
  name: 'CrmRelatieve', // 相关
  components: {
    CustomerIndex: () => import('@/views/crm/customer'),
    ContactsIndex: () => import('@/views/crm/contacts'),
    BusinessIndex: () => import('@/views/crm/business'),
    ContractIndex: () => import('@/views/crm/contract'),
    LeadsIndex: () => import('@/views/crm/leads'),
    ProductIndex: () => import('@/views/crm/product'),
    CrmRelativeTable: () => import('./CrmRelativeTable')
  },
  props: {
    visible: Boolean,
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
  // 处理el-input 右侧展示删除按钮
  provide() {
    return {
      'elForm': '',
      'elFormItem': ''
    }
  },
  data() {
    return {
      leftType: '',
      leftSides: [],
      /** 各类型选择的值 */
      currentSelectedData: {}
    }
  },
  computed: {
    /**
     * 通用配置
     */
    commonConfig() {
      return merge({ ...DefaultCommon }, this.action || {})
    },

    /**
     * 模块配置
     */
    componentConfig() {
      const tableHeight = document.documentElement.clientHeight - 370

      const params = {}
      if (this.action && this.action.type === 'condition') {
        params[this.action.data.moduleType + 'Id'] = this.action.data[
          this.action.data.moduleType + 'Id'
        ]
        if (this.action.data.params) {
          for (const field in this.action.data.params) {
            params[field] = this.action.data.params[field]
          }
        }
      }
      return {
        isSelect: true,
        showModuleName: false,
        selectionHandle: false,
        radio: this.radio,
        params,
        tableHeight
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          this.getCurrentMainTable().getMainTable().doLayout()
        })
      }
    },
    selectedData: function(data) {
      this.handleCurrentSelectData(data)
    }
  },
  mounted() {
    // 获取传值
    this.handleCurrentSelectData(this.selectedData)
  },
  methods: {
    /**
     * 目前选择值
     */
    handleCurrentSelectData(data) {
      if (this.commonConfig.isCommon) {
        const tempData = {}
        tempData[this.commonConfig.type] = []
        this.currentSelectedData = tempData
      } else {
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
      }

      // 初始化
      if (this.commonConfig.isCommon) {
        this.leftSides.push({
          name: this.commonConfig.name,
          isCommon: true, // 是统一效果
          loaded: true,
          num: 0,
          type: this.commonConfig.type
        })
        this.leftType = this.commonConfig.type
      } else {
        if (this.leftSides.length === 0) {
          const leftItems = this.getLeftItems()
          if (this.crmType) {
            const leftItem = leftItems[this.crmType]
            leftItem.loaded = true
            this.leftSides.push(leftItem)
            this.leftType = this.crmType
          } else {
            for (let index = 0; index < this.showTypes.length; index++) {
              const leftItem = leftItems[this.showTypes[index]]
              const leftData = this.currentSelectedData[leftItem.type]
              leftItem.num = leftData ? leftData.length : 0
              this.leftSides.push(leftItem)
            }

            if (this.leftSides.length > 0) {
              const leftItem = this.leftSides[0]
              leftItem.loaded = true
              this.leftType = leftItem.type
            }
          }
        } else {
          // 更新多tabs 下数据
          if (!this.crmType) {
            for (let index = 0; index < this.leftSides.length; index++) {
              const leftItem = this.leftSides[index]
              const leftData = this.currentSelectedData[leftItem.type]
              leftItem.num = leftData ? leftData.length : 0
            }
          }
        }
      }
    },

    /**
     * 刷新列表
     */
    refreshList() {
      this.$refs['crm' + this.crmType][0].refreshList()
    },

    /**
     * 侧边点击
     */
    sideClick(item) {
      this.leftType = item.type
      item.loaded = true
    },

    /**
     * 关闭操作
     */
    closeView() {
      this.$emit('close')
      this.$emit('update:visible', false)
    },

    /**
     * 勾选change
     */
    selectionChange(data, item) {
      item.num = data.length
      this.currentSelectedData[this.leftType] = data
    },

    /**
     * 确定选择
     */
    confirmClick() {
      // 如果是单类型 在这里数据赋值
      if (this.crmType) {
        this.currentSelectedData[this.leftType] = this.getCurrentMainTable().selectionList
      }

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

      this.$nextTick(() => {
        this.closeView()
      })
    },

    /**
     * 获取当前主列表对象
     */
    getCurrentMainTable() {
      const list = this.$refs.moduleTable
      const opstionsName = this.getComponentsName(this.leftType)
      return list.find(item => item.$options && item.$options.name === opstionsName)
    },

    /**
     * 根据类型获取标题展示名称
     */
    getTitle() {
      if (this.commonConfig.isCommon) {
        return this.commonConfig.name
      }
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
      } else {
        return '关联相关信息'
      }
    },

    /**
     * 获取组件名称
     */
    getComponentsName(type) {
      if (type === 'customer') {
        return 'CustomerIndex'
      } else if (type === 'contacts') {
        return 'ContactsIndex'
      } else if (type === 'leads') {
        return 'LeadsIndex'
      } else if (type === 'business') {
        return 'BusinessIndex'
      } else if (type === 'contract') {
        return 'ContractIndex'
      } else if (type === 'product') {
        return 'ProductIndex'
      } else {
        return 'CrmRelativeTable'
      }
    },

    /**
     * 设置勾选值
     */
    setSelections(data) {
      this.getCurrentMainTable().setSelections(data)
    },

    /**
     * 切换某一行的选中状态
     */
    toggleRowSelection(rowKey, rowId, selected) {
      this.getCurrentMainTable().toggleRowSelection(rowKey, rowId, selected)
    },

    /**
     * 获取左侧菜单信息
     */
    getLeftItems() {
      return {
        customer: {
          name: '客户',
          loaded: false,
          num: 0,
          type: 'customer'
        },
        contacts: {
          name: '联系人',
          loaded: false,
          num: 0,
          type: 'contacts'
        },
        leads: {
          name: '线索',
          loaded: false,
          num: 0,
          type: 'leads'
        },
        business: {
          name: '商机',
          loaded: false,
          num: 0,
          type: 'business'
        },
        contract: {
          name: '合同',
          loaded: false,
          num: 0,
          type: 'contract'
        },
        product: {
          name: '产品',
          loaded: false,
          num: 0,
          type: 'product'
        }
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.cr-contianer {
  position: relative;
  height: 100%;
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

.el-dialog__wrapper {
  /deep/ .el-dialog {
    margin-top: 60px !important;
    height: calc(100% - 110px);
  }

  /deep/ .el-dialog__body {
    padding: 0;
    height: calc(100% - 100px);
  }
}
</style>
