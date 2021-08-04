<template>
  <xr-create
    :loading="loading"
    :title="title"
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
          @change="formChange"
        >
          <template slot-scope="{ data }">
            <crm-relative-cell
              v-if="data && (data.formType == 'customer' || data.formType == 'contract')"
              :value="fieldForm[data.field]"
              :relative-type="data.formType"
              :disabled="data.disabled"
              :relation="data.relation"
              @value-change="otherChange($event, data)"
            />
          </template>
        </wk-form-items>
      </el-form>
    </create-sections>
  </xr-create>
</template>

<script>
import { filedGetFieldAPI } from '@/api/crm/common'
import { crmReceivablesPlanSaveAPI } from '@/api/crm/receivables'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import WkFormItems from '@/components/NewCom/WkForm/WkFormItems'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import CustomFieldsMixin from '@/mixins/CustomFields'

export default {
  // 新建编辑
  name: 'ReceivablesPlanCreate',

  components: {
    XrCreate,
    CreateSections,
    CrmRelativeCell: () => import('@/components/CreateCom/CrmRelativeCell'),
    WkFormItems
  },

  mixins: [CustomFieldsMixin],

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
      fieldRules: {}
    }
  },

  computed: {
    title() {
      return this.action.type === 'update' ? '编辑回款计划' : '新建回款计划'
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
        label: crmTypeModel.receivablesPlan
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

              const canEdit = this.getItemIsCanEdit(item, this.action.type)
              // 是否能编辑权限
              if (temp.show && canEdit) {
                fieldRules[temp.field] = this.getRules(item)
              }

              // 是否可编辑
              temp.disabled = !canEdit

              // 禁止某些业务组件选择
              if (temp.formType == 'contract' || temp.formType == 'customer') {
                if (this.action.type == 'relative') {
                  const relativeDisInfos = {
                    contract: { customer: true, contract: true },
                    customer: { customer: true }
                  }

                  // 在哪个类型下添加
                  const relativeTypeDisInfos = relativeDisInfos[this.action.crmType]
                  if (relativeTypeDisInfos) {
                  // 包含的字段值
                    temp.disabled = relativeTypeDisInfos[item.formType] || false
                  }
                } else {
                  if (this.action.type === 'update') {
                    temp.disabled = true
                  } else {
                    temp.disabled = item.formType === 'contract'
                  }
                }
              }

              // 处理关联
              if ((this.action.type == 'relative' || this.action.type == 'update') && item.formType == 'contract') {
                const customerItem = this.getItemRelatveInfo(list, 'customer')
                if (customerItem) {
                  customerItem['moduleType'] = 'customer'
                  customerItem['params'] = { checkStatus: [0, 1, 3, 10] } // 待审核 0 通过 1 审核中 3 正常 10
                  temp['relation'] = customerItem
                }
              } else {
                temp['relation'] = {}
              }

              // 特殊字段允许多选
              this.getItemRadio(item, temp)

              // 获取默认值
              // 获取默认值
              if (temp.show) {
                fieldForm[temp.field] = this.getItemValue(item, this.action.data, this.action.type)
              }
              fields.push(temp)
              baseFields.push(item)
            })
            fieldList.push(fields)
          })

          this.baseFields = baseFields
          this.fieldList = fieldList
          this.fieldForm = fieldForm
          this.fieldRules = fieldRules


          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 保存
     */
    saveClick() {
      this.loading = true
      const crmForm = this.$refs.crmForm
      crmForm.validate(valid => {
        if (valid) {
          const params = this.getSubmiteParams([].concat.apply([], this.fieldList), this.fieldForm)
          this.submiteParams(params)
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
        params.entity.receivablesPlanId = this.action.id
        params.entity.batchId = this.action.batchId
      }

      // 相关添加时候的多余提交信息
      if (
        this.action.relativeData &&
        Object.keys(this.action.relativeData).length
      ) {
        params = { ...params, ...this.action.relativeData }
      }
      crmReceivablesPlanSaveAPI(params)
        .then(res => {
          this.loading = false

          this.$message.success(
            this.action.type == 'update' ? '编辑成功' : '添加成功'
          )

          this.close()

          // 保存成功
          this.$emit('save-success', {
            type: 'receivablesPlan'
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
              const customerItem = data.value[0]
              customerItem['moduleType'] = 'customer'
              customerItem['params'] = { checkStatus: [0, 1, 3, 10] } // 待审核 0 通过 1 审核中 3 正常 10
              fieldItem['relation'] = customerItem
            } else {
              fieldItem.disabled = true
              fieldItem['relation'] = {}
            }
            this.fieldForm[fieldItem.field] = []
          }
        })
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
</style>
