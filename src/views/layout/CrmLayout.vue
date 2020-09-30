<template>
  <el-container>
    <el-header class="nav-container">
      <navbar
        nav-index="/crm"
        @nav-items-click="navClick"/>
    </el-header>
    <el-container>
      <sidebar
        :items="crmRouters"
        :add-offset="quickAddOffset"
        create-button-title="快速创建"
        main-router="crm"
        @select="handleSelect">
        <div
          slot="add"
          class="quick-add">
          <div class="quick-add-content">
            <p
              v-for="(item, index) in quickAddList"
              :key="index"
              @click="addSkip(item)">
              <i
                :class="['wk', 'wk-' + item.icon]"/><span>{{ item.label }}</span></p>
          </div>
        </div>
      </sidebar>

      <el-main
        id="crm-main-container"
        style="padding: 0;">
        <app-main/>
      </el-main>
    </el-container>
    <c-r-m-all-create
      v-if="isCreate"
      :crm-type="createCRMType"
      :action="createAction"
      @save-success="createSaveSuccess"
      @close="isCreate=false"
    />
  </el-container>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import CRMAllCreate from '@/views/crm/components/CRMAllCreate'

import { mapGetters } from 'vuex'

export default {
  name: 'CrmLayout',

  components: {
    Navbar,
    Sidebar,
    AppMain,
    CRMAllCreate
  },

  data() {
    return {
      isCreate: false,
      createAction: null,
      createCRMType: ''

    }
  },

  computed: {
    ...mapGetters(['crm', 'crmRouters']),
    // 快捷添加
    quickAddList() {
      var addItems = []
      if (this.crm.leads && this.crm.leads.save) {
        addItems.push({
          icon: 'leads',
          index: 'leads',
          label: '线索'
        })
      }
      if (this.crm.customer && this.crm.customer.save) {
        addItems.push({
          icon: 'customer',
          index: 'customer',
          label: '客户'
        })
      }
      if (this.crm.contacts && this.crm.contacts.save) {
        addItems.push({
          icon: 'contacts',
          index: 'contacts',
          label: '联系人'
        })
      }
      if (this.crm.business && this.crm.business.save) {
        addItems.push({
          icon: 'business',
          index: 'business',
          label: '商机'
        })
      }

      if (this.crm.contract && this.crm.contract.save) {
        addItems.push({
          icon: 'contract',
          index: 'contract',
          label: '合同'
        })
      }
      if (this.crm.receivables && this.crm.receivables.save) {
        addItems.push({
          icon: 'receivables',
          index: 'receivables',
          label: '回款'
        })
      }
      if (this.crm.invoice && this.crm.invoice.save) {
        addItems.push({
          icon: 'invoice',
          index: 'invoice',
          label: '发票'
        })
      }
      if (this.crm.visit && this.crm.visit.save) {
        addItems.push({
          icon: 'house',
          index: 'visit',
          label: '回访'
        })
      }
      if (this.crm.product && this.crm.product.save) {
        addItems.push({
          icon: 'product',
          index: 'product',
          label: '产品'
        })
      }
      return addItems
    },
    quickAddOffset() {
      return Math.round(this.quickAddList.length / 2) * 25
    }
  },

  created() {
    this.getcrmMessagNum()
  },

  mounted() {},

  methods: {
    navClick(index) {},

    addSkip(item) {
      this.createAction = {
        type: 'save',
        id: '',
        data: {}
      }
      this.createCRMType = item.index
      this.isCreate = true
    },

    /**
     * 获取消息数
     */
    getcrmMessagNum() {
      this.$store
        .dispatch('GetMessageNum')
        .then(res => {})
        .catch(() => {})
    },

    /**
     * 菜单钢鞭
     */
    handleSelect() {
      this.$store.dispatch('GetMessageNum')
    },

    /**
     * 新建客户同时新建联系人
     */
    // 创建数据页面 保存成功
    createSaveSuccess(data) {
      if (data && data.createContacts) {
        if (data.type == 'customer') {
          this.createCRMType = 'contacts'
          this.createAction = {
            type: 'relative',
            crmType: 'customer',
            data: {
              customer: data.data
            }
          }
          this.isCreate = true
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/common.scss';
.el-container {
  min-height: 0;
  height: 100%;
}
.aside-container {
  position: relative;
  background-color: #2d3037;
  box-sizing: border-box;
}

.nav-container {
  padding: 0;
  box-shadow: 0px 1px 2px #dbdbdb;
  z-index: 100;
  min-width: 1200px;
}
</style>
