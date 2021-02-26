<template>
  <xr-create
    :loading="loading"
    :title="title"
    :confirm-button-text="sureBtnTitle"
    @close="close"
    @save="saveClick">
    <create-sections title="基本信息">
      <el-form
        ref="crmForm"
        :model="fieldForm"
        :rules="fieldRules"
        class="wk-form"
        label-position="top">
        <wk-form-items
          v-for="(children, index) in fieldList"
          :key="index"
          :field-from="fieldForm"
          :field-list="children"
          @change="formChange"
        >
          <template slot-scope="{ data }">
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
            <xh-receivables-plan
              v-if="data && data.formType == 'receivables_plan'"
              :value="fieldForm[data.field]"
              :receivables-id="editId"
              :relation="data.relation"
              @value-change="otherChange($event, data)"
            />
          </template>
        </wk-form-items>
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

    <el-button
      slot="footer"
      type="primary"
      plain
      @click.native="debouncedSaveField(true)">保存草稿</el-button>
  </xr-create>
</template>

<script>
import { filedGetFieldAPI } from '@/api/crm/common'
import { crmReceivablesSaveAPI } from '@/api/crm/receivables'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import WkFormItems from '@/components/NewCom/WkForm/WkFormItems'
import {
  XhReceivablesPlan,
  CrmRelativeCell
} from '@/components/CreateCom'
import WkApprovalFlowApply from '@/components/Examine/WkApprovalFlowApply'
import WkApprovalFlowApplyMixin from '@/components/Examine/mixins/WkApprovalFlowApply'


import crmTypeModel from '@/views/crm/model/crmTypeModel'
import CustomFieldsMixin from '@/mixins/CustomFields'
import { debounce } from 'throttle-debounce'
import { objDeepCopy } from '@/utils'

export default {
  // 新建编辑
  name: 'ReceivablesCreate',

  components: {
    XrCreate,
    CreateSections,
    CrmRelativeCell,
    XhReceivablesPlan,
    WkApprovalFlowApply,
    WkFormItems
  },

  mixins: [CustomFieldsMixin, WkApprovalFlowApplyMixin],

  props: {
    action: {
      type: Object,
      default: () => {
        return {
          type: 'save',
          id: '',
          data: {}
        }
      }
    }
  },

  data() {
    return {
      loading: false,
      baseFields: [],
      fieldList: [],
      fieldForm: {},
      fieldRules: {},

      // 审批信息
      flowRemarks: '',
      wkFlowList: null // 有值有审批流
    }
  },

  computed: {
    title() {
      return this.action.type === 'update' ? '编辑回款' : '新建回款'
    },

    editId() {
      return this.action.type == 'update' ? this.action.id : ''
    },

    // 确认名称
    sureBtnTitle() {
      if (this.wkFlowList) {
        return '提交审核'
      }
      return '保存'
    }
  },

  watch: {},

  created() {
    this.debouncedSaveField = debounce(300, this.saveClick)

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
        label: crmTypeModel.receivables
      }

      if (this.action.type == 'update') {
        params.id = this.action.id
      }

      filedGetFieldAPI(params)
        .then(res => {
          const list = res.data || []

          const baseFields = []
          const fieldList = []
          const fieldRules = {}
          const fieldForm = {}
          list.forEach(children => {
            const fields = []
            children.forEach(item => {
              const temp = this.getFormItemDefaultProperty(item)

              const canEdit = this.getItemIsCanEdit(item, this.action.type)
              // 是否能编辑权限
              if (canEdit) {
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
              if (temp.formType == 'receivables_plan' ||
                temp.formType == 'contract' ||
                temp.formType == 'customer') {
                if (this.action.type == 'relative') {
                  const relativeDisInfos = {
                    contacts: { customer: true },
                    customer: { customer: true },
                    business: { customer: true },
                    contract: { customer: true, contract: true }
                  }

                  // 在哪个类型下添加
                  const relativeTypeDisInfos = relativeDisInfos[this.action.crmType]
                  if (relativeTypeDisInfos) {
                  // 包含的字段值
                    temp.disabled = relativeTypeDisInfos[item.formType] || false
                  }
                } else if (this.action.type != 'update') {
                  temp.disabled = item.formType === 'contract' || item.formType === 'receivables_plan'
                }
              }

              // 处理关联
              if (this.action.type == 'relative' || this.action.type == 'update') {
              // 回款计划 需要合同信息
                if (item.formType === 'receivables_plan') {
                  const contractItem = this.getItemRelatveInfo(list, 'contract')
                  if (contractItem) {
                    contractItem['moduleType'] = 'contract'
                    temp['relation'] = contractItem
                  }
                // 合同 需要客户信息
                } else if (item.formType == 'contract') {
                  const customerItem = this.getItemRelatveInfo(list, 'customer')
                  if (customerItem) {
                    customerItem['moduleType'] = 'customer'
                    customerItem['params'] = { checkStatus: 1 }
                    temp['relation'] = customerItem
                  }
                }
              }

              // 特殊字段允许多选
              this.getItemRadio(item, temp)

              // 获取默认值
              fieldForm[temp.field] = this.getItemValue(item, this.action.data, this.action.type)
              fields.push(temp)
              baseFields.push(item)
            })
            fieldList.push(fields)
          })

          this.baseFields = baseFields
          this.fieldList = fieldList
          this.fieldForm = fieldForm
          this.fieldRules = fieldRules

          // 审核信息
          this.initWkFlowData({
            params: { label: 2 },
            fieldForm: this.fieldForm
          }, res => {
            this.wkFlowList = res.list
            this.flowRemarks = res.resData ? res.resData.remarks : ''
          })

          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 保存
     */
    saveClick(isDraft = false) {
      this.loading = true
      const crmForm = this.$refs.crmForm
      crmForm.validate(valid => {
        if (valid) {
          const wkFlowResult = this.validateWkFlowData(this.wkFlowList)
          if (wkFlowResult.pass) {
            const params = this.getSubmiteParams(this.baseFields, this.fieldForm)
            if (isDraft) {
              params.entity.checkStatus = 5
            }
            if (wkFlowResult.data) {
              params.examineFlowData = wkFlowResult.data
            }
            this.submiteParams(params)
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
     * 提交上传
     */
    submiteParams(params) {
      if (this.action.type == 'update') {
        params.entity.receivablesId = this.action.id
        params.entity.batchId = this.action.batchId
      }

      // 相关添加时候的多余提交信息
      if (
        this.action.relativeData &&
        Object.keys(this.action.relativeData).length
      ) {
        params = { ...params, ...this.action.relativeData }
      }

      crmReceivablesSaveAPI(params)
        .then(res => {
          this.loading = false

          this.$message.success(
            this.action.type == 'update' ? '编辑成功' : '添加成功'
          )

          this.close()

          // 保存成功
          this.$emit('save-success', {
            type: 'receivables'
          })
        })
        .catch(() => {
          this.loading = false
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
              const customerItem = data.value[0]
              customerItem['moduleType'] = 'customer'
              customerItem['params'] = { checkStatus: 1 }
              fieldItem['relation'] = customerItem
            } else {
              fieldItem.disabled = true
              fieldItem['relation'] = {}
            }
            this.fieldForm[fieldItem.field] = []
          } else if (fieldItem.formType === 'receivables_plan') {
            fieldItem.disabled = true
            fieldItem['relation'] = {}
            this.fieldForm[fieldItem.field] = ''
          }
        })
      } else if (field.formType === 'contract') {
        const planItem = this.getItemWithFromType(this.fieldList, 'receivables_plan')
        if (planItem) {
          if (data.value.length > 0) {
            planItem.disabled = false
            var contractItem = data.value[0]
            contractItem['moduleType'] = 'contract'
            planItem['relation'] = contractItem
          } else {
            planItem.disabled = true
            planItem['relation'] = {}
          }
          this.fieldForm[planItem.field] = ''
        }
      } else if (field.formType === 'receivables_plan') {
        const dataValue = data.data || {}
        this.fieldForm.returnTime = dataValue.returnDate
        this.fieldForm.money = dataValue.money
        this.fieldForm.returnType = dataValue.returnType
      }
      this.$set(this.fieldForm, field.field, data.value)
      this.$refs.crmForm.validateField(field.field)
    },

    /**
     * 关闭
     */
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-form {
  /deep/ .el-form-item.is-product {
    flex: 0 0 100%;
    width: 0;
  }
}
</style>
