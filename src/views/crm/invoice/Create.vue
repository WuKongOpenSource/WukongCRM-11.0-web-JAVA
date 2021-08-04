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
        :model="fieldForm"
        :rules="fieldRules"
        :validate-on-rule-change="false"
        class="wk-form"
        label-position="top">
        <wk-form-items
          v-for="(children, index) in fieldList"
          :key="index"
          :field-from="fieldForm"
          :field-list="children"
          :ignore-fields="ignoreFields"
          @change="formChange"
        >
          <template slot-scope="{ data, index }">
            <el-select
              v-if="data && data.field == 'invoiceType'"
              v-model="fieldForm[data.field]"
              style="width: 100%;"
              @change="formChange(data, index, $event)">
              <el-option
                v-for="item in invoiceTypeOptions"
                :key="item.value"
                :label="item.name"
                :value="item.value"/>
            </el-select>
            <crm-relative-cell
              v-if="data && data.formType == 'customer'"
              :value="fieldForm[data.field]"
              :disabled="data.disabled"
              relative-type="customer"
              @value-change="otherChange($event, data)"
            />
            <crm-relative-cell
              v-if="data && data.formType == 'contract'"
              :value="fieldForm[data.field]"
              :disabled="data.disabled"
              :relation="data.relation"
              :relative-type="data.formType"
              @value-change="otherChange($event, data)"
            />
          </template>
        </wk-form-items>
    </el-form></create-sections>

    <create-sections title="发票信息">
      <div style="padding: 10px 20px; text-align: right;">
        <el-button
          :disabled="!(fieldForm.customerId && fieldForm.customerId.length > 0)"
          type="primary"
          @click="showSelectView=true">选择发票信息</el-button>
        <crm-relative
          v-if="showSelectView"
          ref="crmrelative"
          :visible.sync="showSelectView"
          :action="titleAction"
          crm-type="invoiceTitle"
          radio
          @changeCheckout="titleSelectChange"/>
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
import { filedGetFieldAPI } from '@/api/crm/common'
import { crmInvoiceSaveAPI } from '@/api/crm/invoice'
import { crmCustomerInvoiceInfoAPI } from '@/api/crm/customer'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import WkFormItems from '@/components/NewCom/WkForm/WkFormItems'
import WkApprovalFlowApply from '@/components/Examine/WkApprovalFlowApply'
import WkApprovalFlowApplyMixin from '@/components/Examine/mixins/WkApprovalFlowApply'
import {
  XhInput,
  XhTextarea,
  XhSelect,
  XhDate,
  XhReceivablesPlan,
  CrmRelativeCell
} from '@/components/CreateCom'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import CustomFieldsMixin from '@/mixins/CustomFields'
import { objDeepCopy } from '@/utils'

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
    CrmRelative: () => import('@/components/CreateCom/CrmRelative'),
    WkApprovalFlowApply,
    XhReceivablesPlan,
    WkFormItems
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
  mixins: [CustomFieldsMixin, WkApprovalFlowApplyMixin],
  props: {
    action: {
      type: Object,
      default: () => {
        return {
          type: 'save', // save relative 新建 相关新建   update 编辑
          id: '',
          data: {}
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      titleFieldList: [
        { fieldName: 'titleType', formType: 'text', name: '抬头类型' },
        { fieldName: 'invoiceTitle', formType: 'text', name: '开票抬头' },
        { fieldName: 'taxNumber', formType: 'text', name: '纳税人识别号' },
        { fieldName: 'depositBank', formType: 'text', name: '开户行' },
        { fieldName: 'depositAccount', formType: 'text', name: '开户账号' },
        { fieldName: 'depositAddress', formType: 'text', name: '开票地址' },
        { fieldName: 'telephone', formType: 'text', name: '电话' }
      ],
      invoiceTypeOptions: [{
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
      }],
      ignoreFields: ['invoiceType'],
      baseFields: [],
      fieldList: [],
      fieldForm: {},
      fieldRules: {},
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
      return this.action.type == 'update' ? this.action.id : ''
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
    this.getField()
  },
  mounted() {},

  beforeDestroy() {},
  methods: {
    /**
     * 获取数据
     */
    getField() {
      this.loading = true
      const params = {
        label: crmTypeModel.invoice
      }

      if (this.action.type == 'update') {
        params.id = this.action.id
      }

      filedGetFieldAPI(params)
        .then(res => {
          const list = res.data || []

          const assistIds = this.getFormAssistIds(list)

          const baseFields = []
          const fieldList = []
          const fieldRules = {}
          const fieldForm = {}
          list.forEach(children => {
            const fields = []
            children.forEach(item => {
              const temp = this.getFormItemDefaultProperty(item)
              temp.show = !assistIds.includes(item.formAssistId)

              if (this.ignoreFields.includes(temp.field)) {
                // 防止影响普通单选的验证方式
                delete temp.optionsData
                delete item.optionsData
              }

              const canEdit = this.getItemIsCanEdit(item, this.action.type)
              // 是否能编辑权限
              if (temp.show && canEdit) {
              // 自动生成编号
                if (item.autoGeneNumber == 1) {
                  temp.placeholder = '根据编号规则自动生成，支持手动输入'
                  const copyItem = objDeepCopy(item)
                  copyItem.isNull = 0
                  fieldRules[temp.field] = this.getRules(copyItem)
                } else {
                  fieldRules[temp.field] = this.getRules(item)
                }
              }

              // 是否可编辑
              temp.disabled = !canEdit

              // 禁止某些业务组件选择
              if (
                temp.formType == 'contract' ||
                temp.formType == 'customer') {
                if (this.action.type === 'save') {
                  temp.disabled = item.formType === 'contract'
                } else if (this.action.type == 'relative') {
                  if (temp.formType == 'customer') {
                    // 客户下填充客户，禁止修改
                    const customerObj = this.action.data.customer
                    temp.disabled = !!customerObj
                  } else {
                    // 合同下填充合同，禁止修改客户和合同
                    const contractObj = this.action.data.contract
                    temp.disabled = !!contractObj
                  }
                }
              }

              // 合同金额字段展示用
              if (temp.field === 'contractMoney') {
                temp.disabled = true
              }

              // 处理关联
              if (this.action.type == 'update' ||
              this.action.type == 'relative') {
                if (item.formType == 'contract') { // 合同 需要客户信息
                  const customerObj = this.getItemRelatveInfo(list, 'customer')
                  if (customerObj) {
                    const customerItem = objDeepCopy(customerObj)
                    customerItem['moduleType'] = 'customer'
                    customerItem['params'] = { checkStatus: [1, 10] }
                    temp['relation'] = customerItem

                    this.$set(this.mailFrom, 'contactsName', customerItem.contactsName)
                    this.$set(this.mailFrom, 'contactsMobile', customerItem.contactsMobile)
                    this.$set(this.mailFrom, 'contactsAddress', customerItem.contactsAddress)

                    this.titleAction = {
                      type: 'invoiceTitle',
                      name: '关联发票抬头',
                      isCommon: true, // 是统一效果
                      fieldList: this.titleFieldList,
                      request: crmCustomerInvoiceInfoAPI,
                      showHeader: false,
                      rowKey: 'infoId',
                      radio: true,
                      tableFormatter: this.titleTableFormatter,
                      params: {
                        customerId: customerItem.customerId
                      }
                    }
                  }
                }
              }

              // 特殊字段允许多选
              this.getItemRadio(item, temp)

              // 获取默认值
              if (temp.show) {
                if (this.ignoreFields.includes(temp.field)) {
                  fieldForm[temp.field] = this.isEdit ? temp.value : temp.defaultValue
                } else {
                  fieldForm[temp.field] = this.getItemValue(item, this.action.data, this.action.type)
                }
              }
              fields.push(temp)
              baseFields.push(item)
            })
            fieldList.push(fields)
          })

          // 处理相关新建金额值的填充
          if (this.action.type == 'relative') {
            const contractItem = this.getItemRelatveInfo(list, 'contract')
            // 关联新建填充金额
            if (contractItem) {
              fieldForm.contractMoney = contractItem ? contractItem.money : ''
              fieldForm.invoiceMoney = contractItem ? contractItem.money : ''
            }
          }

          this.baseFields = baseFields
          this.fieldList = fieldList
          this.fieldForm = fieldForm
          this.fieldRules = fieldRules

          // 审核信息
          this.initWkFlowData({
            params: { label: 3 },
            fieldForm: this.fieldForm
          }, res => {
            this.wkFlowList = res.list
            this.flowRemarks = res.resData ? res.resData.remarks : ''
          })

          // 获取其他块字段
          this.getOtherField()
          // relative 下赋值联系人信息
          if (this.isEdit || this.action.type === 'relative') {
            const detail = this.action.detail

            const otherFrom = {}
            otherFrom.titleType = detail.titleType
            otherFrom.invoiceTitle = detail.invoiceTitle
            otherFrom.taxNumber = detail.taxNumber
            otherFrom.depositBank = detail.depositBank
            otherFrom.depositAccount = detail.depositAccount
            otherFrom.depositAddress = detail.depositAddress
            otherFrom.telephone = detail.telephone
            this.otherFrom = otherFrom

            const mailFrom = {}
            mailFrom.contactsName = detail.contactsName
            mailFrom.contactsMobile = detail.contactsMobile
            mailFrom.contactsAddress = detail.contactsAddress
            this.mailFrom = mailFrom
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    getOtherField() {
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

    // fieldValueChange(data) {
    //   const item = this.baseFields[data.index]
    //   const dataValue = data.value
    //   this.$set(this.fieldForm, item.field, dataValue)

    //   if (item.formType == 'customer') {
    //     const contractItem = this.baseFields[data.index + 1]
    //     if (dataValue.length) {
    //       contractItem.disabled = false
    //       const customerItem = dataValue[0]
    //       customerItem['moduleType'] = 'customer'
    //       customerItem['params'] = { checkStatus: [1, 10] }
    //       contractItem['relation'] = customerItem

    //       this.$set(this.mailFrom, 'contactsName', customerItem.contactsName)
    //       this.$set(this.mailFrom, 'contactsMobile', customerItem.contactsMobile)
    //       this.$set(this.mailFrom, 'contactsAddress', customerItem.contactsAddress)

    //       this.titleAction = {
    //         type: 'default',
    //         request: crmCustomerInvoiceInfoAPI,
    //         showScene: false,
    //         showSearch: false,
    //         showCreate: false,
    //         canShowDetail: true,
    //         params: {
    //           customerId: customerItem.customerId
    //         }
    //       }
    //     } else {
    //       contractItem.disabled = true
    //       contractItem['relation'] = {}
    //       // 重置发票信息
    //       this.otherFields.forEach(item => {
    //         if (item.field !== 'titleType') {
    //           this.otherFrom[item.field] = ''
    //         }
    //       })
    //     }

    //     this.$set(this.fieldForm, 'contractId', [])
    //     this.$set(this.fieldForm, 'invoiceMoney', '')
    //     this.$set(this.fieldForm, 'contractMoney', '')
    //     this.$refs.crmForm.validateField(item.field)
    //     this.debouncedGetWkFlowList('invoiceMoney', this.fieldForm)
    //   } else if (item.formType == 'contract') {
    //     const contractValue = dataValue && dataValue.length ? dataValue[0] : null
    //     this.$set(this.fieldForm, 'contractMoney', contractValue ? contractValue.money : '')
    //     this.$set(this.fieldForm, 'invoiceMoney', contractValue ? contractValue.money : '')
    //     this.$refs.crmForm.validateField(item.field)
    //     this.debouncedGetWkFlowList('invoiceMoney', this.fieldForm)
    //   } else {
    //     // 审批流逻辑
    //     this.debouncedGetWkFlowList(item.field, this.fieldForm)
    //   }
    // },

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
      this.loading = true
      const crmForm = this.$refs.crmForm
      crmForm.validate(valid => {
        if (valid) {
          const wkFlowResult = this.validateWkFlowData(this.wkFlowList)
          if (wkFlowResult.pass) {
            const params = this.getSubmiteParams(this.baseFields, this.fieldForm)

            if (wkFlowResult.data) {
              params.examineFlowData = wkFlowResult.data
            }

            const entityParams = params.entity // 系统字段
            for (let index = 0; index < this.otherFields.length; index++) {
              const element = this.otherFields[index]
              if (!element.disabled) {
                entityParams[element.field] = this.otherFrom[element.field]
              }
            }

            for (let index = 0; index < this.mailFields.length; index++) {
              const element = this.mailFields[index]
              if (!element.disabled) {
                entityParams[element.field] = this.mailFrom[element.field]
              }
            }

            if (this.isEdit) {
              entityParams.invoiceId = this.action.id
              entityParams.batchId = this.action.batchId
            }

            crmInvoiceSaveAPI(params)
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
        } else {
          this.loading = false
          // 提示第一个error
          this.getFormErrorMessage(crmForm)
          return false
        }
      })
    },

    /**
     * 验证唯一
     */
    UniquePromise({ field, value }) {
      return this.getUniquePromise(field, value, this.action)
    },

    /**
     * change
     */
    formChange(field, index, value, valueList) {
      // 审批流逻辑
      this.debouncedGetWkFlowList(field.field, this.fieldForm)

      if ([
        'select',
        'checkbox'
      ].includes(field.formType) &&
          field.remark === 'options_type' &&
          field.optionsData) {
        const { fieldForm, fieldRules } = this.getFormContentByOptionsChange(this.fieldList, this.fieldForm)
        this.fieldForm = fieldForm
        this.fieldRules = fieldRules
      }
    },

    /**
     * 地址change
     */
    otherChange(data, field) {
      if (field.formType === 'customer') {
        this.itemsForEach(this.fieldList, fieldItem => {
          if (fieldItem.formType === 'contract') {
            // 如果是合同 改变合同样式和传入客户ID
            if (data.value.length > 0) {
              fieldItem.disabled = false
              const customerItem = objDeepCopy(data.value[0])
              customerItem['moduleType'] = 'customer'
              customerItem['params'] = { checkStatus: [1, 10] }
              fieldItem['relation'] = customerItem

              this.$set(this.mailFrom, 'contactsName', customerItem.contactsName)
              this.$set(this.mailFrom, 'contactsMobile', customerItem.contactsMobile)
              this.$set(this.mailFrom, 'contactsAddress', customerItem.contactsAddress)

              this.titleAction = {
                type: 'invoiceTitle',
                name: '关联发票抬头',
                isCommon: true, // 是统一效果
                fieldList: this.titleFieldList,
                request: crmCustomerInvoiceInfoAPI,
                showHeader: false,
                rowKey: 'infoId',
                radio: true,
                tableFormatter: this.titleTableFormatter,
                params: {
                  customerId: customerItem.customerId
                }
              }
            } else {
              fieldItem.disabled = true
              fieldItem['relation'] = {}
              // 重置发票信息
              this.otherFields.forEach(item => {
                if (item.field !== 'titleType') {
                  this.otherFrom[item.field] = ''
                }
              })
            }
            this.fieldForm[fieldItem.field] = []
          }
        })


        // this.$set(this.fieldForm, 'contractId', [])
        this.$set(this.fieldForm, 'invoiceMoney', '')
        this.$set(this.fieldForm, 'contractMoney', '')
        this.debouncedGetWkFlowList('invoiceMoney', this.fieldForm)
      } else if (field.formType === 'contract') {
        const contractValue = data.value && data.value.length ? data.value[0] : null
        this.$set(this.fieldForm, 'contractMoney', contractValue ? contractValue.money : '')
        this.$set(this.fieldForm, 'invoiceMoney', contractValue ? contractValue.money : '')
        this.debouncedGetWkFlowList('invoiceMoney', this.fieldForm)
      }
      this.$set(this.fieldForm, field.field, data.value)
      this.$refs.crmForm.validateField(field.field)
    },

    /**
     * 抬头表格
     */
    titleTableFormatter(row, column, cellValue) {
      if (column.property == 'titleType') {
        return {
          1: '单位',
          2: '个人'
        }[row[column.property]]
      }
      return row[column.property] === '' || row[column.property] === null ? '--' : row[column.property]
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
