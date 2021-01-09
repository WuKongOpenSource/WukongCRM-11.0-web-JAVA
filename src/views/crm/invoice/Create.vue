<template>
  <xr-create
    v-loading="loading"
    :title="title"
    :confirm-button-text="confirmButtonText"
    @close="close"
    @save="saveClick">
    <create-sections title="基本信息">
      <el-form
        ref="crmForm"
        :model="baseFrom"
        :rules="rules"
        label-position="top">
        <el-form-item
          v-for="(item, index) in baseFields"
          :key="item.key"
          :prop="item.field">
          <span slot="label">
            {{ item.name }}
            <span style="color:#999;">
              {{ item.tips || '' }}
            </span>
          </span>
          <component
            :is="item.formType | typeToComponent"
            :value="baseFrom[item.field]"
            :index="index"
            :item="item"
            :relation="item.relation"
            :relative-type="item.formType"
            :disabled="item.disabled"
            :clearable="false"
            @value-change="fieldValueChange"/>
        </el-form-item>
      </el-form>
    </create-sections>

    <create-sections title="发票信息">
      <div style="padding: 10px 20px; text-align: right;">
        <el-popover
          v-model="showPopover"
          placement="top"
          width="700"
          style="padding: 0 !important;"
          trigger="click">
          <crm-relative
            v-if="showSelectView"
            ref="crmrelative"
            :show="showPopover"
            :action="titleAction"
            radio
            crm-type="invoiceTitle"
            @close="showPopover=false"
            @changeCheckout="titleSelectChange"/>
          <el-button
            slot="reference"
            :disabled="!(baseFrom.customerId && baseFrom.customerId.length > 0)"
            type="primary"
            @click="showSelectView=true">选择发票信息</el-button>
        </el-popover>
      </div>
      <el-form
        ref="otherFrom"
        :model="otherFrom"
        :rules="otherRules"
        label-position="top">
        <el-form-item
          v-for="(item, index) in otherFields"
          v-show="!item.hidden"
          :key="item.key"
          :prop="item.field">
          <span slot="label">
            {{ item.name }}
            <span style="color:#999;">
              {{ item.tips || '' }}
            </span>
          </span>
          <component
            :is="item.formType | typeToComponent"
            :value="otherFrom[item.field]"
            :index="index"
            :item="item"
            :relative-type="item.formType"
            :disabled="item.disabled"
            :clearable="false"
            @value-change="otherFieldValueChange"/>
        </el-form-item>
      </el-form>
    </create-sections>

    <create-sections title="邮寄信息">
      <el-form
        ref="mailFrom"
        :model="mailFrom"
        :rules="mailRules"
        label-position="top">
        <el-form-item
          v-for="(item, index) in mailFields"
          :key="item.key"
          :prop="item.field">
          <span slot="label">
            {{ item.name }}
            <span style="color:#999;">
              {{ item.tips || '' }}
            </span>
          </span>
          <component
            :is="item.formType | typeToComponent"
            :value="mailFrom[item.field]"
            :index="index"
            :item="item"
            :relative-type="item.formType"
            :disabled="item.disabled"
            :clearable="false"
            @value-change="mailFieldValueChange"/>
        </el-form-item>
      </el-form>
    </create-sections>

    <create-sections
      v-if="wkFlowList"
      title="审核信息">
      <template slot="header">
        <el-tooltip
          v-if="flowRemarks"
          :content="flowRemarks"
          effect="dark"
          placement="top">
          <i class="wk wk-help wk-help-tips" style="margin-left: 8px;"/>
        </el-tooltip>
      </template>
      <wk-approval-flow-apply
        :data="wkFlowList"
        style="padding: 15px;"
      />
    </create-sections>
  </xr-create>
</template>

<script>
import { crmInvoiceSaveAPI, crmInvoiceUpdateAPI, crmInvoiceNumberConfigAPI } from '@/api/crm/invoice'
import { crmCustomerInvoiceInfoAPI } from '@/api/crm/customer'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import WkApprovalFlowApply from '@/components/Examine/WkApprovalFlowApply'
import WkApprovalFlowApplyMixin from '@/components/Examine/mixins/WkApprovalFlowApply'

import {
  XhInput,
  XhTextarea,
  XhSelect,
  XhDate,
  CrmRelativeCell
} from '@/components/CreateCom'
import CrmRelative from '@/components/CreateCom/CrmRelative'

export default {
  // 订单创建
  name: 'InvoiceCreate',
  components: {
    XrCreate,
    CreateSections,
    XhInput,
    XhTextarea,
    XhSelect,
    XhDate,
    CrmRelativeCell,
    CrmRelative,
    WkApprovalFlowApply
  },
  filters: {
    /** 根据type 找到组件 */
    typeToComponent(formType) {
      if (formType == 'text' || formType == 'floatnumber') {
        return 'XhInput'
      } else if (formType == 'select') {
        return 'XhSelect'
      } else if (formType == 'contract' || formType == 'customer') {
        return 'CrmRelativeCell'
      } else if (formType == 'date') {
        return 'XhDate'
      } else if (formType == 'textarea') {
        return 'XhTextarea'
      }
    }
  },
  mixins: [WkApprovalFlowApplyMixin],
  props: {
    detail: Object
  },
  data() {
    return {
      loading: false,
      baseFields: [],
      rules: {
        customerId: [
          { required: true, message: '请选择客户名称', trigger: 'change' }
        ],
        contractId: [
          { required: true, message: '请选择合同编号', trigger: 'change' }
        ],
        invoiceMoney: [
          { required: true, message: '请输入开票金额', trigger: ['blur', 'change'] }
        ],
        invoiceType: [
          { required: true, message: '请选择开票类型', trigger: 'change' }
        ]
      },
      baseFrom: {
      },
      showPopover: false,
      titleAction: {
        type: 'default'
      },
      showSelectView: false,
      // 发票信息
      otherFields: [],
      otherRules: {},
      otherFrom: {
        titleType: 1
      },

      // 邮寄信息
      mailFields: [],
      mailRules: {},
      mailFrom: {},
      // 审批信息
      flowRemarks: '',
      wkFlowList: null // 有值有审批流
    }
  },
  computed: {
    editId() {
      if (this.detail) {
        return this.detail.invoiceId
      }
      return ''
    },

    title() {
      return this.isEdit ? '编辑发票' : '新建发票'
    },

    isEdit() {
      return !!this.editId
    },

    confirmButtonText() {
      if (this.wkFlowList) {
        return '提交审核'
      }
      return '保存'
    }
  },
  watch: {},
  created() {
    this.getInvoiceNumberConfig()

    // 是编辑
    if (this.detail) {
      const baseFrom = {}
      baseFrom.invoiceApplyNumber = this.detail.invoiceApplyNumber
      baseFrom.customerId = this.detail.customerId ? [{
        customerName: this.detail.customerName,
        customerId: this.detail.customerId
      }] : []

      if (this.detail.customerId) {
        this.titleAction = {
          type: 'default',
          request: crmCustomerInvoiceInfoAPI,
          showScene: false,
          showSearch: false,
          showCreate: false,
          canShowDetail: true,
          params: {
            customerId: this.detail.customerId
          }
        }
      }

      baseFrom.contractId = this.detail.contractId ? [{
        num: this.detail.contractNum,
        contractId: this.detail.contractId
      }] : []

      baseFrom.contractMoney = this.detail.contractMoney
      baseFrom.invoiceMoney = this.detail.invoiceMoney
      baseFrom.invoiceDate = this.detail.invoiceDate
      baseFrom.invoiceType = this.detail.invoiceType
      baseFrom.remark = this.detail.remark
      this.baseFrom = baseFrom

      const otherFrom = {}
      otherFrom.titleType = this.detail.titleType
      otherFrom.invoiceTitle = this.detail.invoiceTitle
      otherFrom.taxNumber = this.detail.taxNumber
      otherFrom.depositBank = this.detail.depositBank
      otherFrom.depositAccount = this.detail.depositAccount
      otherFrom.depositAddress = this.detail.depositAddress
      otherFrom.telephone = this.detail.telephone
      this.otherFrom = otherFrom

      const mailFrom = {}
      mailFrom.contactsName = this.detail.contactsName
      mailFrom.contactsMobile = this.detail.contactsMobile
      mailFrom.contactsAddress = this.detail.contactsAddress
      this.mailFrom = mailFrom
    }

    // 审核信息
    this.initWkFlowData({
      params: { label: 3 },
      fieldForm: this.baseFrom
    }, res => {
      this.wkFlowList = res.list
      this.flowRemarks = res.resData ? res.resData.remarks : ''
    })
  },
  mounted() {},

  beforeDestroy() {},
  methods: {

    getInvoiceNumberConfig() {
      crmInvoiceNumberConfigAPI().then(res => {
        this.getField(res.data.status)
      }).catch(() => {})
    },

    getField(status) {
      if (status != 1) {
        this.$set(this.rules, 'invoiceApplyNumber', [
          { required: true, message: '请输入发票申请编号', trigger: ['blur', 'change'] }
        ])
      }
      this.baseFields = [
        {
          name: '发票申请编号',
          field: 'invoiceApplyNumber',
          formType: 'text',
          autoGeneNumber: status,
          setting: []
        },
        {
          name: '客户名称',
          field: 'customerId',
          formType: 'customer',
          setting: []
        },
        {
          name: '合同编号',
          field: 'contractId',
          formType: 'contract',
          disabled: !(this.detail && this.detail.customerId),
          relation: this.detail && this.detail.customerId ? {
            moduleType: 'customer',
            params: { checkStatus: 1 },
            customerName: this.detail.customerName,
            customerId: this.detail.customerId
          } : null,
          setting: []
        },
        {
          name: '合同金额',
          field: 'contractMoney',
          formType: 'text',
          disabled: true,
          setting: []
        },
        {
          name: '开票金额（元）',
          field: 'invoiceMoney',
          formType: 'floatnumber',
          setting: []
        },
        {
          name: '开票日期',
          field: 'invoiceDate',
          formType: 'date',
          setting: []
        },
        {
          name: '开票类型',
          field: 'invoiceType',
          formType: 'select',
          setting: [{
            name: '增值税专用发票',
            value: 1
          }, {
            name: '增值税普通发票',
            value: 2
          }, {
            name: '国税通用机打发票',
            value: 3
          }, {
            name: '地税通用机打发票',
            value: 4
          }, {
            name: '收据',
            value: 5
          }]
        },
        {
          name: '备注',
          field: 'remark',
          formType: 'textarea',
          setting: []
        }]


      this.otherFields = [
        {
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
          hidden: false,
          setting: []
        },
        {
          name: '开户行',
          field: 'depositBank',
          formType: 'text',
          hidden: false,
          setting: []
        }, {
          name: '开户账号',
          field: 'depositAccount',
          formType: 'text',
          hidden: false,
          setting: []
        }, {
          name: '开票地址',
          field: 'depositAddress',
          formType: 'text',
          hidden: false,
          setting: []
        }, {
          name: '电话',
          field: 'telephone',
          formType: 'text',
          setting: []
        }]

      this.mailFields = [{
        name: '联系人',
        field: 'contactsName',
        formType: 'text',
        setting: []
      },
      {
        name: '联系方式',
        field: 'contactsMobile',
        formType: 'text',
        setting: []
      },
      {
        name: '邮寄地址',
        field: 'contactsAddress',
        formType: 'text',
        setting: []
      }]
    },

    titleSelectChange(data) {
      const dataValue = data.data
      if (dataValue && dataValue.length) {
        const titleData = dataValue[0]
        for (let index = 0; index < this.otherFields.length; index++) {
          const element = this.otherFields[index]
          this.$set(this.otherFrom, element.field, titleData[element.field])
        }

        const hidden = titleData.titleType == 2
        this.otherFields[2].hidden = hidden
        this.otherFields[3].hidden = hidden
        this.otherFields[4].hidden = hidden
        this.otherFields[5].hidden = hidden
      }
    },

    fieldValueChange(data) {
      const item = this.baseFields[data.index]
      const dataValue = data.value
      this.$set(this.baseFrom, item.field, dataValue)

      if (item.formType == 'customer') {
        const contractItem = this.baseFields[data.index + 1]
        if (dataValue.length) {
          contractItem.disabled = false
          const customerItem = dataValue[0]
          customerItem['moduleType'] = 'customer'
          customerItem['params'] = { checkStatus: 1 }
          contractItem['relation'] = customerItem

          this.$set(this.mailFrom, 'contactsName', customerItem.contactsName)
          this.$set(this.mailFrom, 'contactsMobile', customerItem.contactsMobile)
          this.$set(this.mailFrom, 'contactsAddress', customerItem.contactsAddress)

          this.titleAction = {
            type: 'default',
            request: crmCustomerInvoiceInfoAPI,
            showScene: false,
            showSearch: false,
            showCreate: false,
            canShowDetail: true,
            params: {
              customerId: customerItem.customerId
            }
          }
        } else {
          contractItem.disabled = true
          contractItem['relation'] = {}
          // 重置发票信息
          this.otherFields.forEach(item => {
            if (item.field !== 'titleType') {
              this.otherFrom[item.field] = ''
            }
          })
        }

        this.$set(this.baseFrom, 'contractId', [])
        this.$set(this.baseFrom, 'invoiceMoney', '')
        this.$set(this.baseFrom, 'contractMoney', '')
        this.$refs.crmForm.validateField(item.field)
        this.debouncedGetWkFlowList('invoiceMoney', this.baseFrom)
      } else if (item.formType == 'contract') {
        const contractValue = dataValue && dataValue.length ? dataValue[0] : null
        this.$set(this.baseFrom, 'contractMoney', contractValue ? contractValue.money : '')
        this.$set(this.baseFrom, 'invoiceMoney', contractValue ? contractValue.money : '')
        this.$refs.crmForm.validateField(item.field)
        this.debouncedGetWkFlowList('invoiceMoney', this.baseFrom)
      } else {
        // 审批流逻辑
        this.debouncedGetWkFlowList(item.field, this.baseFrom)
      }
    },

    otherFieldValueChange(data) {
      const item = this.otherFields[data.index]
      const dataValue = data.value
      if (item.field == 'titleType') {
        const hidden = dataValue == 2
        this.otherFields[2].hidden = hidden
        this.otherFields[3].hidden = hidden
        this.otherFields[4].hidden = hidden
        this.otherFields[5].hidden = hidden
      }
      this.$set(this.otherFrom, item.field, dataValue)
    },

    mailFieldValueChange(data) {
      const item = this.mailFields[data.index]
      const dataValue = data.value
      this.$set(this.mailFrom, item.field, dataValue)
    },


    close() {
      this.$emit('close')
    },

    saveClick() {
      this.$refs.crmForm.validate(valid => {
        if (valid) {
          const wkFlowResult = this.validateWkFlowData(this.wkFlowList)
          if (wkFlowResult.pass) {
            const params = {}

            if (wkFlowResult.data) {
              params.examineFlowData = wkFlowResult.data
            }

            for (let index = 0; index < this.baseFields.length; index++) {
              const element = this.baseFields[index]
              if (!element.disabled) {
                if (element.formType == 'customer') {
                  const customerValue = this.baseFrom.customerId && this.baseFrom.customerId.length ? this.baseFrom.customerId[0] : null
                  params[element.field] = customerValue ? customerValue.customerId : ''
                } else if (element.formType == 'contract') {
                  const contractValue = this.baseFrom.contractId && this.baseFrom.contractId.length ? this.baseFrom.contractId[0] : null
                  params[element.field] = contractValue ? contractValue.contractId : ''
                } else {
                  params[element.field] = this.baseFrom[element.field]
                }
              }
            }

            for (let index = 0; index < this.otherFields.length; index++) {
              const element = this.otherFields[index]
              if (!element.disabled) {
                params[element.field] = this.otherFrom[element.field]
              }
            }

            for (let index = 0; index < this.mailFields.length; index++) {
              const element = this.mailFields[index]
              if (!element.disabled) {
                params[element.field] = this.mailFrom[element.field]
              }
            }

            if (this.isEdit) {
              params.invoiceId = this.detail.invoiceId
              params.batchId = this.detail.batchId
            }

            const request = this.isEdit ? crmInvoiceUpdateAPI : crmInvoiceSaveAPI
            this.loading = true
            request(params)
              .then(res => {
                this.loading = false
                this.close()
                // 回到保存成功
                this.$emit('save-success')
              })
              .catch(() => {
                this.loading = false
              })
          } else {
            this.loading = false
            this.$message.error('请完善审批信息')
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -23px;
  /deep/ .el-form-item.is-required .el-form-item__label:before {
    margin-right: 0;
  }
}

.el-form-item {
  flex: 0 0 50%;
  flex-shrink: 0;
  padding: 0 40px;
  padding-bottom: 10px;
  margin-bottom: 4px;
  /deep/ .el-form-item__label {
    color: #333333;
    padding: 5px 0;
    line-height: inherit;
  }

  /deep/ .el-form-item__error {
    padding-top: 2px;
  }
}

.xh-product {
  padding: 0 15px;
}

// 审核信息 里的审核类型
.examine-type {
  font-size: 12px;
  color: white;
  background-color: #fd715a;
  padding: 0 8px;
  margin-left: 5px;
  height: 16px;
  line-height: 16px;
  border-radius: 8px;
  transform: scale(0.8, 0.8);
}
</style>
