<template>
  <el-dialog
    ref="wkDialog"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :title="title"
    width="500px"
    class="invoice-title-set"
    @close="handleCancel">
    <div
      :style="{ height: contentHeight }"
      class="handle-box">
      <el-form ref="form" :model="form" label-width="100px">
        <template v-for="(item, index) in fieldList">
          <el-form-item v-if="item.field == 'titleType'" :key="index" :label="item.name" :prop="item.field">
            <el-select
              v-model="form[item.field]"
              :clearable="false"
              style="width: 100%;"
              @change="valueChange">
              <el-option
                v-for="(subItem, subIndex) in item.setting"
                :key="subIndex"
                :label="subItem.name"
                :value="subItem.value"/>
            </el-select>
          </el-form-item>
          <el-form-item v-else v-show="!item.hidden" :key="index" :label="item.name" :prop="item.field">
            <el-input v-model="form[item.field]"/>
          </el-form-item>
        </template>
      </el-form>
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
import { crmInvoiceSaveInvoiceInfoAPI, crmInvoiceUpdateInvoiceInfoAPI } from '@/api/crm/invoice'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'

export default {
  name: 'InvoiceTitleSet', // 标记为开票
  components: {
  },
  mixins: [ElDialogLoadingMixin],
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    customerId: [String, Number],
    detail: Object
  },
  data() {
    return {
      form: {
        titleType: 1
      },
      fieldList: []
    }
  },
  computed: {
    title() {
      return this.detail ? '编辑发票抬头' : '新建发票抬头'
    },

    contentHeight() {
      return this.form.titleType == 2 ? '190px' : '300px'
    }
  },
  watch: {
    visible() {
      if (this.visible) {
        if (this.detail) {
          this.form = {
            ...this.detail
          }
        }
        this.getFieldList()
      }
    }
  },
  mounted() {},
  methods: {
    getFieldList() {
      const hidden = this.detail && this.detail.titleType == 2
      this.fieldList = [{
        name: '抬头类型',
        field: 'titleType',
        formType: 'select',
        setting: [{
          name: '单位',
          value: 1
        }, {
          name: '个人',
          value: 2
        }]
      }, {
        name: '开票抬头',
        field: 'invoiceTitle',
        formType: 'text',
        setting: []
      },
      {
        name: '纳税人识别号',
        field: 'taxNumber',
        formType: 'text',
        hidden: hidden,
        setting: []
      },
      {
        name: '开户行',
        field: 'depositBank',
        formType: 'text',
        hidden: hidden,
        setting: []
      }, {
        name: '开户账号',
        field: 'depositAccount',
        formType: 'text',
        hidden: hidden,
        setting: []
      }, {
        name: '开票地址',
        field: 'depositAddress',
        formType: 'text',
        hidden: hidden,
        setting: []
      }, {
        name: '电话',
        field: 'telephone',
        formType: 'text',
        setting: []
      }]
    },

    /**
     * 取消选择
     */
    handleCancel() {
      // 重置状态
      this.form = {
        titleType: 1
      }
      this.$emit('update:visible', false)
    },

    valueChange() {
      const hidden = this.form.titleType == 2
      this.fieldList[2].hidden = hidden
      this.fieldList[3].hidden = hidden
      this.fieldList[4].hidden = hidden
      this.fieldList[5].hidden = hidden
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      var params = {
        customerId: this.customerId
      }

      if (this.form.titleType == 2) {
        params.titleType = this.form.titleType
        params.invoiceTitle = this.form.invoiceTitle
        params.telephone = this.form.telephone
      } else {
        params = {
          ...params,
          ...this.form
        }
      }

      if (this.detail) {
        params.infoId = this.detail.infoId
      }

      this.loading = true
      const request = this.detail ? crmInvoiceUpdateInvoiceInfoAPI : crmInvoiceSaveInvoiceInfoAPI
      request(params)
        .then(res => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.loading = false
          this.handleCancel()
          this.$emit('change')
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss">
.invoice-title-set {
  .el-dialog__body {
    padding: 30px 15px;
  }

  .handle-box {
    padding: 0 10px;
    color: #333;
    font-size: 12px;
    height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .handle-item {
    padding-bottom: 15px;
    .handle-item-name {
      flex-shrink: 0;
      width: 110px;
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
}
</style>
