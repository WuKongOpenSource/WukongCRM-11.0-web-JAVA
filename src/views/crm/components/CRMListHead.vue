<template>
  <div class="c-container">
    <flexbox v-if="!$slots.icon && showTitle" class="title"><img
      :src="titleIcon"
      class="title-icon">{{ title }}</flexbox>
    <slot name="icon" />
    <el-input
      v-if="showSearch"
      :placeholder="placeholder"
      v-model="inputContent"
      class="sc-container"
      @input="inputChange"
      @keyup.enter.native="searchInput">
      <el-button
        slot="append"
        type="primary"
        @click.native="searchInput">搜索</el-button>
    </el-input>
    <div class="right-container">
      <el-button
        v-if="canSave"
        class="xr-btn--orange"
        icon="el-icon-plus"
        type="primary"
        @click="createClick">{{ mainTitle }}</el-button>
      <slot name="ft" />
      <el-button
        v-if="showDupCheck"
        class="dup-check-btn"
        @click="dupCheckShow = true">查重</el-button>
      <el-dropdown
        v-if="moreTypes.length > 0"
        trigger="click"
        @command="handleTypeDrop">
        <el-button icon="el-icon-more"/>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(item, index) in moreTypes"
            :key="index"
            :icon="item.icon | wkIconPre"
            :command="item.type">{{ item.name }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <c-r-m-all-create
      v-if="isCreate"
      :crm-type="createCRMType"
      :action="createActionInfo"
      @save-success="createSaveSuccess"
      @close="hideView"/>
    <!-- 查重 -->
    <duplicate-check :visible.sync="dupCheckShow" />
  </div>
</template>

<script type="text/javascript">
import { mapGetters } from 'vuex'
import CRMAllCreate from './CRMAllCreate'
import DuplicateCheck from './DuplicateCheck'

export default {
  name: 'CRMListHead', // 客户管理下 重要提醒 回款计划提醒
  components: {
    CRMAllCreate,
    DuplicateCheck
  },
  props: {
    showTitle: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    },
    mainTitle: {
      type: String,
      default: ''
    },
    // CRM类型
    crmType: {
      type: String,
      default: ''
    },
    /** 是公海 */
    isSeas: {
      type: Boolean,
      default: false
    },
    poolId: [String, Number],
    // 公海权限
    poolAuth: Object,
    showSearch: {
      type: Boolean,
      default: true
    },
    search: String, // 用于联动
    // 自定义方法
    createFun: Function
  },
  data() {
    return {
      inputContent: '',
      // 创建的相关信息
      createActionInfo: { type: 'save' },
      createCRMType: '',
      isCreate: false, // 是创建
      // 查重
      dupCheckShow: false
    }
  },
  computed: {
    ...mapGetters(['crm', 'userInfo']),
    canSave() {
      if (this.isSeas) {
        return false
      }

      return this.crm[this.crmType].save
    },

    titleIcon() {
      return require(`@/assets/img/crm/${this.crmType}.png`)
    },

    showDupCheck() {
      return ['leads', 'customer', 'contacts'].includes(this.crmType) && !this.isSeas
    },

    // 更多操作
    moreTypes() {
      const moreTypes = []
      let importAuth = this.crm[this.crmType] && this.crm[this.crmType].excelimport
      if (this.isSeas && this.poolId) {
        importAuth = this.poolAuth && this.poolAuth.excelexport
      }
      if (importAuth) {
        moreTypes.push({ type: 'enter', name: '导入', icon: 'import' })
      }

      let exportAuth = this.crm[this.crmType] && this.crm[this.crmType].excelexport
      if (this.isSeas && this.poolId) {
        exportAuth = this.poolAuth && this.poolAuth.excelexport
      }
      if (exportAuth) {
        moreTypes.push({ type: 'out', name: '导出', icon: 'export' })
      }
      return moreTypes
    }
  },
  mounted() {
    // 监听导入
    this.$bus.on('import-crm-done-bus', (type) => {
      if (this.crmType == type) {
        this.$emit('on-handle', { type: 'import-crm' })
      }
    })
  },
  beforeDestroy() {
    this.$bus.off('import-crm-done-bus')
  },
  methods: {
    handleTypeDrop(command) {
      if (command == 'out') {
        this.$emit('on-export')
      } else if (command == 'enter') {
        this.$wkImport.import(this.crmType, {
          ownerSelectShow: false, // 去除选择负责人逻辑
          poolSelectShow: this.isSeas,
          userInfo: this.userInfo
        })
      }
    },
    createClick() {
      if (this.createFun) {
        this.createFun()
      } else {
        this.createCRMType = this.crmType
        this.createActionInfo = { type: 'save' }
        this.isCreate = !this.isCreate
      }
    },
    inputChange() {
      this.$emit('update:search', this.inputContent)
    },
    // 进行搜索操作
    searchInput() {
      this.$emit('on-search', this.inputContent)
    },
    // 创建数据页面 保存成功
    createSaveSuccess(data) {
      if (data && data.createContacts) {
        if (data.type == 'customer') {
          this.createCRMType = 'contacts'
          this.createActionInfo = {
            type: 'relative',
            crmType: 'customer',
            data: {}
          }
          this.createActionInfo.data['customer'] = data.data
          this.isCreate = true
        }
      } else {
        // 回到保存成功
        this.$emit('on-handle', { type: 'save-success' })
      }
    },
    hideView() {
      this.isCreate = false
    }
  }
}
</script>
<style lang="scss" scoped>
.c-container {
  height: 60px;
  position: relative;
  z-index: 100;
  .title-icon {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }

  .title {
    float: left;
    width: auto;
    padding-left: 28px;
    font-size: 16px;
    font-weight: 600;
    height: 100%;
  }
  .sc-container {
    width: 300px;
    margin: -16px 0 0 -150px;
    position: absolute;
    left: 50%;
    top: 50%;
  }

  .el-input {
    /deep/ .el-input-group__append {
      background-color: $xr-color-primary;
      border-color: $xr-color-primary;
      color: white;
    }
  }

  .right-container {
    margin-right: -10px;
    float: right;
    margin: 15px 20px 0 0;
    position: relative;

    .dup-check-btn,
    .xr-btn--orange {
      margin-left: 0;
      margin-right: 10px;
    }

    .right-item {
      float: left;
      margin-right: 10px;
      padding: 8px 10px;
      font-size: 13px;
      border-radius: 2px;
    }
  }
}
</style>
