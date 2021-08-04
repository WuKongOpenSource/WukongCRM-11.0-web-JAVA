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
            <xh-customer-address
              v-if="data && data.formType == 'map_address'"
              :value="fieldForm[data.field]"
              @value-change="otherChange($event, data)"
            />
          </template>
        </wk-form-items>
      </el-form>
    </create-sections>

    <el-button
      v-if="action.type == 'save' && contactsSaveAuth"
      slot="footer"
      class="handle-button"
      type="primary"
      @click="debouncedSaveField(true)">保存并新建联系人</el-button>

    <!-- 新建 -->
    <contacts-create
      v-if="contactsCreateShow"
      :action="contactsCreateAction"
      @close="close"
      @save-success="close"
    />

  </xr-create>
</template>

<script>
import { filedGetFieldAPI } from '@/api/crm/common'
import { crmCustomerSaveAPI } from '@/api/crm/customer'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import WkFormItems from '@/components/NewCom/WkForm/WkFormItems'


import crmTypeModel from '@/views/crm/model/crmTypeModel'
import CustomFieldsMixin from '@/mixins/CustomFields'
import ContactsCreate from '../contacts/Create'

import { debounce } from 'throttle-debounce'
import { isEmpty } from '@/utils/types'
import { mapGetters } from 'vuex'

export default {
  // 新建编辑
  name: 'CustomerCreate',

  components: {
    XrCreate,
    CreateSections,
    WkFormItems,
    XhCustomerAddress: () => import('@/components/CreateCom/XhCustomerAddress'),
    ContactsCreate
  },

  mixins: [CustomFieldsMixin],

  props: {
    phone: String,
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
      contactsCreateAction: {
        type: 'save',
        id: '',
        data: {}
      },
      contactsCreateShow: false
    }
  },

  computed: {
    ...mapGetters(['crm']),
    contactsSaveAuth() {
      return this.crm.contacts && this.crm.contacts.save
    },
    title() {
      return this.action.type === 'update' ? '编辑客户' : '新建客户'
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
        label: crmTypeModel.customer
      }

      if (this.action.type == 'update') {
        params.id = this.action.id
      }

      filedGetFieldAPI(params)
        .then(res => {
          const list = res.data || []
          if (!isEmpty(this.phone)) {
            list.forEach(item => {
              if (item.formType === 'mobile') {
                item.defaultValue = this.phone
              }
            })
          }
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

              // 特殊字段允许多选
              this.getItemRadio(item, temp)

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
    saveClick(createContacts = false) {
      this.loading = true
      const crmForm = this.$refs.crmForm
      crmForm.validate(valid => {
        if (valid) {
          const params = this.getSubmiteParams([].concat.apply([], this.fieldList), this.fieldForm)
          this.submiteParams(params, createContacts)
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
    submiteParams(params, createContacts) {
      if (this.action.type == 'update') {
        params.entity.customerId = this.action.id
        params.entity.batchId = this.action.batchId
      }

      // 相关添加时候的多余提交信息
      if (
        this.action.relativeData &&
        Object.keys(this.action.relativeData).length
      ) {
        params = { ...params, ...this.action.relativeData }
      }
      crmCustomerSaveAPI(params)
        .then(res => {
          this.loading = false
          this.$store.dispatch('GetMessageNum')

          if (createContacts) {
            this.contactsCreateAction = {
              type: 'relative',
              crmType: 'customer',
              data: {
                customer: res.data || {}
              }
            }
            this.contactsCreateShow = true
          } else {
            this.$message.success(
              this.action.type == 'update' ? '编辑成功' : '添加成功'
            )
            this.close()
          }

          // 保存成功
          this.$emit('save-success', {
            type: 'customer',
            data: res.data || {}
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
      this.$set(this.fieldForm, field.field, data.value)
      this.$refs.crmForm.validateField(field.field)
    },

    /**
     * 关闭
     */
    close() {
      this.contactsCreateShow = false
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-form {
  /deep/ .el-form-item.is-map_address {
    flex: 0 0 100%;
  }
}
</style>
