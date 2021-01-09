<template>
  <div class="container">
    <flexbox
      class="t-section"
      align="stretch">
      <img
        :src="crmIcon"
        class="t-section__hd">
      <div class="t-section__bd">
        <div class="type-name">{{ typeName }}</div>
        <p class="name"><el-tooltip
          :disabled="!name"
          :content="name"
          effect="dark"
          placement="top-start">
          <span>{{ name }}</span>
        </el-tooltip><slot name="name" /></p>
      </div>
      <div class="t-section__ft">
        <el-button
          v-if="showTransfer"
          class="head-handle-button"
          type="primary"
          icon="wk wk-transfer"
          @click.native="handleTypeClick('transfer')">转移</el-button>

        <el-button
          v-if="showEdit"
          class="head-handle-button xr-btn--green"
          icon="wk wk-circle-edit"
          type="primary"
          @click.native="handleTypeClick('edit')">编辑</el-button>

        <el-button
          v-if="showGet"
          class="head-handle-button"
          icon="wk wk-receive"
          type="primary"
          @click.native="handleTypeClick('get')">领取</el-button>

        <el-button
          v-if="showAlloc"
          class="head-handle-button xr-btn--green"
          type="primary"
          icon="wk wk-alloc"
          @click.native="handleTypeClick('alloc')">分配</el-button>

        <el-button
          v-if="showDealStatus"
          class="head-handle-button"
          type="primary"
          icon="wk wk-success"
          @click.native="handleTypeClick('deal_status')">更改成交状态</el-button>

        <el-dropdown
          v-if="permissionMoreTypes && permissionMoreTypes.length > 0"
          trigger="click"
          @command="handleTypeClick">
          <el-button
            icon="el-icon-more"
            class="t-more" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(item, index) in permissionMoreTypes"
              :key="index"
              :icon="item.icon | wkIconPre"
              :command="item.type">{{ item.name }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </flexbox>
    <flexbox
      class="h-section"
      align="stretch">
      <flexbox-item
        v-for="(item, index) in headDetails"
        v-show="item.title"
        :key="index"
        class="h-item"
        span="200">
        <div class="h-title">{{ item.title }}</div>
        <div class="h-value text-one-line"><i
          v-if="item.showIcon"
          :style="item.style"
          :class="item.icon" />{{ item.value }}</div>
      </flexbox-item>
    </flexbox>
    <slot />
    <transfer-handle
      :crm-type="crmType"
      :selection-list="[detail]"
      :dialog-visible.sync="transferDialogShow"
      @handle="handleCallBack" />
    <alloc-handle
      :crm-type="crmType"
      :pool-id="poolId"
      :selection-list="[detail]"
      :dialog-visible.sync="allocDialogShow"
      @handle="handleCallBack" />
    <deal-status-handle
      :value="detail.dealStatus"
      :crm-type="crmType"
      :selection-list="[detail]"
      :visible.sync="dealStatusShow"
      @handle="handleCallBack" />
    <put-pool-handle
      :visible.sync="putPoolShow"
      :selection-list="[detail]"
      @handle="handleCallBack" />
  </div>
</template>
<script type="text/javascript">
import { mapGetters } from 'vuex'
import {
  crmLeadsTransformAPI,
  crmLeadsDeleteAPI
} from '@/api/crm/leads'
import {
  crmCustomerLockAPI,
  crmCustomerDeleteAPI,
  crmCustomerPoolDeleteAPI,
  crmCustomerReceiveAPI
} from '@/api/crm/customer'
import { crmContactsDeleteAPI } from '@/api/crm/contacts'
import { crmBusinessDeleteAPI } from '@/api/crm/business'
import {
  crmContractDeleteAPI,
  crmContractCancelAPI
} from '@/api/crm/contract'
import { crmReceivablesDeleteAPI } from '@/api/crm/receivables'
import { crmReturnVisitDeleteAPI } from '@/api/crm/visit'
import {
  crmProductStatusAPI,
  crmProductDeleteAPI
} from '@/api/crm/product'
import { crmInvoiceDeleteIdsAPI } from '@/api/crm/invoice'
import TransferHandle from './SelectionHandle/TransferHandle' // 转移
import AllocHandle from './SelectionHandle/AllocHandle' // 公海分配操作
import DealStatusHandle from './SelectionHandle/DealStatusHandle' // 客户状态修改操作
import PutPoolHandle from './SelectionHandle/PutPoolHandle' // 放入公海

export default {
  name: 'CRMDetailHead',
  components: {
    TransferHandle,
    AllocHandle,
    DealStatusHandle,
    PutPoolHandle
  },
  props: {
    /** 模块ID */
    id: [String, Number],
    poolId: [String, Number],
    // 公海权限
    poolAuth: Object,
    /** 没有值就是全部类型 有值就是当个类型 */
    crmType: {
      type: String,
      default: ''
    },
    // 辅助 使用
    isSeas: {
      type: Boolean,
      default: false
    },
    /** 联系人人下 新建商机 需要联系人里的客户信息  合同下需要客户和商机信息 合同作废需要合同状态*/
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    },
    headDetails: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      moreTypes: [], // 更多操作
      transferDialogShow: false, // 转移操作
      allocDialogShow: false, // 公海分配操作提示框
      dealStatusShow: false, // 成交状态修改框
      putPoolShow: false // 客户放入公海
    }
  },
  computed: {
    ...mapGetters(['crm']),
    crmIcon() {
      return require(`@/assets/img/crm/${this.crmType}.png`)
    },
    typeName() {
      return (
        {
          leads: '线索',
          customer: '客户',
          contacts: '联系人',
          product: '产品',
          business: '商机',
          contract: '合同',
          receivables: '回款',
          visit: '回访',
          invoice: '发票'
        }[this.crmType] || ''
      )
    },
    name() {
      if (this.crmType === 'receivables') {
        return this.detail.number
      } else if (this.crmType === 'customer') {
        return this.detail.customerName
      } else if (this.crmType === 'business') {
        return this.detail.businessName
      } else if (this.crmType === 'visit') {
        return this.detail.visitNumber
      } else if (this.crmType === 'invoice') {
        return this.detail.invoiceApplyNumber
      }
      return this.detail.name
    },
    // 展示转移
    showTransfer() {
      if (
        this.crmType === 'customer' ||
         this.crmType === 'visit' ||
        this.isSeas
      ) {
        return false
      }

      if (this.crmType === 'contract') {
        return (
          this.detail &&
          this.detail.checkStatus != 8 &&
          this.crm[this.crmType].transfer
        )
      }

      return this.crm[this.crmType].transfer
    },
    showEdit() {
      //  8 已作废 的合同可以编辑
      return this.isSeas ? false : this.crm[this.crmType].update
    },

    // 展示领取
    showGet() {
      return this.isSeas && this.whetherTypeShowByPermision('get')
    },

    // 展示分配
    showAlloc() {
      return this.isSeas && this.whetherTypeShowByPermision('alloc')
    },

    /**
     * 客户是否锁定
     */
    isLock() {
      if (this.detail) {
        return this.detail.status == 2 // 1是正常 2 是锁定
      }
      return false
    },

    /**
     * 展示成交按钮
     */
    showDealStatus() {
      return (
        !this.isSeas &&
        this.crmType == 'customer' &&
        this.crm[this.crmType].dealStatus
      )
    },

    /**
     * 权限内的更多按钮
     */
    permissionMoreTypes() {
      return this.moreTypes.filter(item => {
        return this.whetherTypeShowByPermision(item.type)
      })
    }
  },
  watch: {
    isSeas() {
      this.moreTypes = this.getSelectionHandleItemsInfo()
    }
  },
  mounted() {
    this.moreTypes = this.getSelectionHandleItemsInfo()
  },
  methods: {
    /** 更多操作 */
    handleTypeClick(type) {
      if (type == 'edit') {
        // 编辑
        this.$emit('handle', { type: 'edit' })
      } else if (type == 'transfer') {
        // 转移
        this.transferDialogShow = true
      } else if (
        type == 'transform' ||
        type == 'delete' ||
        type == 'lock' ||
        type == 'unlock' ||
        type == 'start' ||
        type == 'disable' ||
        type == 'get' ||
        type == 'cancel'
      ) {
        var message = ''
        if (type == 'transform') {
          message = '确定将这些线索转换为客户吗?'
        } else if (type == 'delete') {
          message = this.isSeas ? '若客户下有联系人，联系人将一并删除。确定删除？' : '确定删除?'
        } else if (type == 'lock') {
          message = '确定要锁定该客户吗？锁定后将不会掉入公海。'
        } else if (type == 'unlock') {
          message = '确定要解锁该客户吗？'
        } else if (type == 'start') {
          message = '确定要上架该产品吗?'
        } else if (type == 'disable') {
          message = '确定要下架该产品吗?'
        } else if (type == 'get') {
          message = '确定要领取该客户吗?'
        } else if (type == 'cancel') {
          message = '确定要作废此合同吗?'
          if (this.detail.receivablesCount) {
            message = '合同下有相关回款,确定要作废吗?'
          }
        }

        this.$confirm(message, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.confirmHandle(type)
          })
          .catch(() => {})
      } else if (type == 'alloc') {
        // 公海分配操作
        this.allocDialogShow = true
      } else if (type == 'deal_status') {
        // 客户成交状态操作
        this.dealStatusShow = true
      } else if (type == 'put_seas') {
        // 客户放入公海
        this.putPoolShow = true
      } else if (type == 'print') {
        // 打印
        const id = this.detail[`${this.crmType}Id`]
        const routeData = this.$router.resolve(`/print/?module=${this.crmType}&id=${id}`)
        window.open(routeData.href, '_blank')
      } else if (type == 'copyContract') {
        this.$emit('handle-click', { type })
      }
    },
    confirmHandle(type) {
      if (type === 'lock' || type === 'unlock') {
        crmCustomerLockAPI({
          status: type === 'lock' ? '2' : '1', // 1是正常 2 是锁定
          ids: this.id
        })
          .then(res => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.$emit('handle', { type: type })
          })
          .catch(() => {})
      } else if (type === 'transform') {
        crmLeadsTransformAPI([this.id])
          .then(res => {
            this.$message({
              type: 'success',
              message: '转化成功'
            })
            // 刷新待办
            this.$store.dispatch('GetMessageNum')

            this.$emit('handle', { type: type })
          })
          .catch(() => {})
      } else if (type === 'start' || type === 'disable') {
        crmProductStatusAPI({
          ids: [this.id],
          status: type === 'start' ? '1' : '0'
        })
          .then(res => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.$emit('handle', { type: type })
          })
          .catch(() => {})
      } else if (type === 'delete') {
        const request = {
          leads: crmLeadsDeleteAPI,
          customer: this.isSeas ? crmCustomerPoolDeleteAPI : crmCustomerDeleteAPI,
          contacts: crmContactsDeleteAPI,
          business: crmBusinessDeleteAPI,
          contract: crmContractDeleteAPI,
          receivables: crmReceivablesDeleteAPI,
          visit: crmReturnVisitDeleteAPI,
          product: crmProductDeleteAPI,
          invoice: crmInvoiceDeleteIdsAPI
        }[this.crmType]
        const params = {}
        if (this.isSeas) {
          params.poolId = this.poolId
        }
        params.ids = [parseInt(this.id)]
        request(this.isSeas ? params : params.ids)
          .then(res => {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.$emit('handle', { type: type })
          })
          .catch(() => {})
      } else if (type === 'get') {
        // 领取
        crmCustomerReceiveAPI({
          ids: [this.id],
          poolId: this.poolId
        })
          .then(res => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            // 刷新待办
            this.$store.dispatch('GetMessageNum')

            this.$emit('handle', { type: type })
          })
          .catch(() => {})
      } else if (type === 'cancel') {
        crmContractCancelAPI({
          contractId: this.id
        })
          .then(res => {
            this.$message.success('操作成功')
            this.$emit('handle', { type })
          })
          .catch(() => {})
      }
    },
    // 子组件 回调的 结果
    handleCallBack(data) {
      this.$emit('handle', { type: data.type })
    },

    /** 更多操作 */
    /** 获取展示items */
    getSelectionHandleItemsInfo() {
      const handleInfos = {
        transfer: {
          name: '转移',
          type: 'transfer',
          icon: 'transfer'
        },
        transform: {
          name: '转化为客户',
          type: 'transform',
          icon: 'transform'
        },
        export: {
          name: '导出选中',
          type: 'export',
          icon: 'export'
        },
        delete: {
          name: '删除',
          type: 'delete',
          icon: 'delete'
        },
        put_seas: {
          name: '放入公海',
          type: 'put_seas',
          icon: 'seas'
        },
        lock: {
          name: '锁定',
          type: 'lock',
          icon: 'lock'
        },
        unlock: {
          name: '解锁',
          type: 'unlock',
          icon: 'unlock'
        },
        add_user: {
          name: '添加团队成员',
          type: 'add_user',
          icon: 'add'
        },
        delete_user: {
          name: '移除团队成员',
          type: 'delete_user',
          icon: 'remove'
        },
        alloc: {
          name: '分配',
          type: 'alloc',
          icon: 'alloc'
        },
        get: {
          name: '领取',
          type: 'get',
          icon: 'receive'
        },
        start: {
          name: '上架',
          type: 'start',
          icon: 'shelves'
        },
        disable: {
          name: '下架',
          type: 'disable',
          icon: 'sold-out'
        },
        deal_status: {
          name: '更改成交状态',
          type: 'deal_status',
          icon: 's-status'
        },
        cancel: {
          name: '合同作废',
          type: 'cancel',
          icon: 'invalid'
        },
        print: {
          name: '打印',
          type: 'print',
          icon: 'print'
        },
        copyContract: {
          name: '复制合同',
          type: 'copyContract',
          icon: 'icon-double-note'
        }
      }
      if (this.crmType == 'leads') {
        return this.forSelectionHandleItems(handleInfos, [
          'transform',
          'delete'
        ])
      } else if (this.crmType == 'customer') {
        if (this.isSeas) {
          return this.forSelectionHandleItems(handleInfos, [
            'delete'
          ])
        } else {
          return this.forSelectionHandleItems(handleInfos, [
            'transfer',
            'put_seas',
            'lock',
            'unlock',
            'delete'
          ])
        }
      } else if (this.crmType == 'contacts') {
        return this.forSelectionHandleItems(handleInfos, ['delete'])
      } else if (this.crmType == 'business') {
        return this.forSelectionHandleItems(handleInfos, ['print', 'delete'])
      } else if (this.crmType == 'contract') {
        return this.forSelectionHandleItems(handleInfos, ['print', 'delete', 'cancel', 'copyContract'])
      } else if (this.crmType == 'receivables') {
        return this.forSelectionHandleItems(handleInfos, ['print', 'delete'])
      } else if (this.crmType == 'product') {
        return this.forSelectionHandleItems(handleInfos, ['delete', 'start', 'disable'])
      } else if (this.crmType == 'visit') {
        return this.forSelectionHandleItems(handleInfos, [
          'delete'
        ])
      } else if (this.crmType == 'invoice') {
        return this.forSelectionHandleItems(handleInfos, [
          'delete'
        ])
      }
      return []
    },
    forSelectionHandleItems(handleInfos, array) {
      var tempsHandles = []
      for (let index = 0; index < array.length; index++) {
        tempsHandles.push(handleInfos[array[index]])
      }
      return tempsHandles
    },
    // 判断是否展示
    whetherTypeShowByPermision(type) {
      if (type == 'transfer') {
        return this.crm[this.crmType].transfer
      } else if (type == 'transform') {
        return this.crm[this.crmType].transform
      } else if (type == 'export') {
        if (this.isSeas) {
          if (this.poolId) {
            return this.poolAuth.excelexport
          }
          return this.crm.pool && this.crm.pool.excelexport
        }
        return this.crm[this.crmType].excelexport
      } else if (type == 'delete') {
        if (this.isSeas) {
          if (this.poolId) {
            return this.poolAuth && this.poolAuth.delete
          }
          return this.crm.pool && this.crm.pool.delete && this.poolId
        }
        return this.crm[this.crmType].delete
      } else if (type == 'put_seas') {
        // 放入公海(客户)
        return this.crm[this.crmType].putinpool
      } else if (type == 'lock' || type == 'unlock') {
        // 锁定解锁(客户)
        return this.crm[this.crmType].lock
      } else if (type == 'add_user' || type == 'delete_user') {
        // 添加 移除团队成员
        return this.crm[this.crmType].teamsave
      } else if (type == 'alloc') {
        // 分配(公海)
        if (this.poolId) {
          return this.poolAuth && this.poolAuth.distribute
        }
        return this.crm.pool && this.crm.pool.distribute
      } else if (type == 'get') {
        // 领取(公海)
        if (this.poolId) {
          return this.poolAuth && this.poolAuth.receive
        }
        return this.crm.pool && this.crm.pool.receive && this.poolId
      } else if (type == 'start' || type == 'disable') {
        // 上架 下架(产品)
        return this.crm[this.crmType].status
      } else if (type == 'deal_status') {
        // 客户状态修改
        return this.crm[this.crmType].dealStatus
      } else if (type == 'cancel') {
        // 合同作废
        if (this.crm[this.crmType].discard && this.detail.checkStatus === 1) {
          return true
        }
        return false
      } else if (type == 'print') {
        // 打印
        return this.crm[this.crmType].print
      } else if (type == 'copyContract') {
        // 合同复制
        return this.crm[this.crmType].save
      }

      return true
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  position: relative;
  background-color: white;
  border-bottom: 1px solid $xr-border-line-color;
}

.t-section {
  position: relative;
  padding: 30px 20px 5px;
  min-height: 60px;
  &__hd {
    display: block;
    width: 40px;
    height: 40px;
    margin-right: 15px;
  }
  &__bd {
    flex: 1;
    .type-name {
      color: #999;
      font-size: 12px;
      margin-bottom: 5px;
    }

    .name {
      color: #333;
      font-size: 16px;
      font-weight: 600;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &__ft {
    flex-shrink: 0;
    margin-left: 20px;
  }

  .t-more {
    margin-left: 15px;
  }

  .t-close {
    display: block;
    width: 40px;
    height: 40px;
    margin-left: 20px;
    padding: 10px;
    cursor: pointer;
  }
}

.h-section {
  position: relative;
  padding: 8px 20px 15px;
  .h-item {
    .h-title {
      font-size: 12px;
      color: #666;
    }
    .h-value {
      min-height: 14px;
      margin-top: 8px;
      font-size: 13px;
      color: #333;
      padding-bottom: 2px;
    }
  }
}

.el-button + .el-button {
  margin-left: 15px;
}

.head-handle-button {
  /deep/ i {
    font-size: 13px;
    margin-right: 5px;
  }
}
</style>
