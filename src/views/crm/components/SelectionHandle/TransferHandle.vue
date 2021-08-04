<template>
  <el-dialog
    v-loading="loading"
    :visible.sync="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="批量转移"
    width="450px"
    @close="handleCancel">
    <div class="handle-box">
      <flexbox class="handle-item">
        <div class="handle-item-name">变更负责人为：</div>
        <wk-user-select
          v-model="ownerUserId"
          radio
          class="handle-item-content"/>
      </flexbox>
      <flexbox
        v-if="showRemoveType"
        class="handle-item">
        <div class="handle-item-name">将原负责人：</div>
        <el-radio-group v-model="removeType">
          <el-radio :label="1">移出</el-radio>
          <el-radio :label="2">转为团队成员</el-radio>
        </el-radio-group>
      </flexbox>
      <flexbox
        v-if="removeType == 2"
        class="handle-item">
        <div class="handle-item-name">权限：</div>
        <el-radio-group v-model="handleType">
          <el-radio :label="1">只读</el-radio>
          <el-radio :label="2">读写</el-radio>
        </el-radio-group>
      </flexbox>
      <!-- 仅客户下可进行同时变成负责人 -->
      <flexbox
        v-if="crmType === 'customer'"
        class="handle-item">
        <div class="handle-item-name">同时变更负责人至：</div>
        <el-checkbox-group v-model="addsTypes">
          <el-checkbox label="1">联系人</el-checkbox>
          <el-checkbox label="2">商机</el-checkbox>
          <el-checkbox label="3">合同</el-checkbox>
        </el-checkbox-group>
      </flexbox>
      <flexbox
        v-if="removeType === 2"
        class="handle-item">
        <div class="handle-item-name">有效时间：</div>
        <el-select v-model="validType">
          <el-option label="不限" value=""/>
          <el-option label="截止到" value="end"/>
        </el-select>
        <el-date-picker
          v-if="validType === 'end'"
          v-model="expiresTime"
          value-format="yyyy-MM-dd"
          style="margin-left: 8px;"
          type="date"
          placeholder="选择日期"/>
      </flexbox>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="handleCancel">取消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import { crmCustomerTransferAPI } from '@/api/crm/customer'
import { crmContactsTransferAPI } from '@/api/crm/contacts'
import { crmBusinessTransferAPI } from '@/api/crm/business'
import { crmContractTransferAPI } from '@/api/crm/contract'
import { crmLeadsTransferAPI } from '@/api/crm/leads'
import { crmProductTransferAPI } from '@/api/crm/product'
import { crmReceivablesTransferAPI } from '@/api/crm/receivables'
import { crmInvoiceTransferAPI } from '@/api/crm/invoice'

export default {
  /** 客户管理 的 勾选后的 转移 操作*/
  name: 'TransferHandle',
  components: {
    WkUserSelect
  },
  mixins: [],
  props: {
    dialogVisible: {
      type: Boolean,
      required: true,
      default: false
    },
    /** 没有值就是全部类型 有值就是当个类型 */
    crmType: {
      type: String,
      default: ''
    },
    /** 转移数据 */
    selectionList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      loading: false, // 加载动画
      visible: false,

      ownerUserId: '', // 变更负责人
      removeType: 1, // 移动类型
      handleType: 1, // 操作类型
      addsTypes: [], // 添加至
      validType: '', // 有效类型
      expiresTime: '' // 有效时间
    }
  },
  computed: {
    // 是否展示移除操作类型
    showRemoveType() {
      if (this.crmType == 'leads' ||
         this.crmType == 'product' ||
         this.crmType == 'invoice') {
        return false
      }
      return true
    }
  },
  watch: {
    dialogVisible: {
      handler(val) {
        this.visible = val
        if (!val) {
          this.resetData()
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.visible = this.dialogVisible
  },
  methods: {
    /**
     * 重置信息
     */
    resetData() {
      this.ownerUserId = ''
      this.removeType = 1 // 移动类型
      this.handleType = 1 // 操作类型
      this.addsTypes = [] // 添加至
    },

    /**
     * 取消选择
     */
    handleCancel() {
      this.visible = false
      this.$emit('update:dialogVisible', false)
    },

    handleConfirm() {
      if (!this.ownerUserId) {
        this.$message.error('请选择变更负责人')
      } else if (this.validType === 'end' && !this.expiresTime) {
        this.$message.error('请选择截止日期')
      } else {
        this.loading = true
        this.getRequest()(this.getParams())
          .then(res => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.loading = false
            this.handleCancel()

            // 刷新待办
            if (
              this.crmType == 'customer' ||
              this.crmType == 'contract' ||
              this.crmType == 'leads'
            ) {
              this.$store.dispatch('GetMessageNum')
            }

            this.$emit('handle', { type: 'transfer' })
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
    getRequest() {
      if (this.crmType === 'leads') {
        return crmLeadsTransferAPI
      } else if (this.crmType === 'customer') {
        return crmCustomerTransferAPI
      } else if (this.crmType === 'contacts') {
        return crmContactsTransferAPI
      } else if (this.crmType === 'business') {
        return crmBusinessTransferAPI
      } else if (this.crmType === 'contract') {
        return crmContractTransferAPI
      } else if (this.crmType === 'receivables') {
        return crmReceivablesTransferAPI
      } else if (this.crmType === 'product') {
        return crmProductTransferAPI
      } else if (this.crmType === 'invoice') {
        return crmInvoiceTransferAPI
      }
    },
    getParams() {
      var params = {
        ownerUserId: this.ownerUserId
      }

      if (this.showRemoveType) {
        params.transferType = this.removeType
        if (this.removeType === 2) { // 转团队
          params.expiresTime = this.validType === 'end' ? this.expiresTime : ''
        }
      }

      if (this.removeType === 2) {
        // 1移出，2转为团队成员
        params.power = this.handleType
      }

      params['ids'] = this.selectionList.map(item => parseInt(item[this.crmType + 'Id']))
      if (this.crmType === 'customer') {
        // 只有客户下面有同时变更
        params.changeType = this.addsTypes.map(item => parseInt(item))
      }
      return params
    }
  }
}
</script>

<style lang="scss" scoped>
.handle-box {
  color: #333;
  font-size: 12px;
}
.handle-item {
  padding-bottom: 15px;
  .handle-item-name {
    flex-shrink: 0;
    width: 115px;
  }
  .handle-item-content {
    flex: 1;
  }
}
.handle-bar {
  position: relative;
  margin-top: 10px;
  height: 30px;
  button {
    float: right;
    margin-right: 10px;
  }
}
</style>
