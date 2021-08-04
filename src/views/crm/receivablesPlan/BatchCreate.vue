<template>
  <xr-create
    :loading="loading"
    :confirm-disabled="tableData.length === 0"
    title="批量新建回款计划"
    @close="close"
    @save="saveClick">
    <create-sections title="基本信息">
      <wk-form
        ref="crmForm"
        :model="fieldForm"
        :rules="fieldRules"
        :field-from="fieldForm"
        :field-list="fieldList"
        label-position="top"
        @change="formChange"
      >
        <template slot-scope="{ data, index }">
          <crm-relative-cell
            v-if="data && (data.formType == 'customer' || data.formType == 'contract')"
            :value="fieldForm[data.field]"
            :relative-type="data.formType"
            :disabled="data.disabled"
            :relation="data.relation"
            @value-change="otherChange($event, data)"
          />
          <el-input-number
            v-else-if="data.formType == 'count'"
            v-model="fieldForm[data.field]"
            :placeholder="data.placeholder"
            :min="1"
            :max="100"
            :controls="false"
            @change="formChange(data, index, $event)" />
          <wk-plan-date
            v-else-if="data.formType == 'planDate'"
            v-model="fieldForm[data.field]"
            :count="fieldForm.count"
          />
        </template>
      </wk-form>
      <el-button
        class="xr-btn--orange"
        type="primary"
        style="margin-left: 20px;"
        @click="applyClick">应用</el-button>
      <div class="wk-table-content">
        <el-table
          ref="wkTable"
          :row-height="40"
          :data="tableData"
          :height="400"
          use-virtual
          style="width: 100%;">
          <el-table-column
            type="index"
            width="45"/>
          <el-table-column
            prop="returnDate"
            label="计划回款日期"
            width="160">
            <template slot-scope="{row}">
              <el-date-picker
                v-model="row.returnDate"
                :clearable="false"
                style="width: 100%;"
                type="date"
                value-format="yyyy-MM-dd"/>
            </template>
          </el-table-column>
          <el-table-column
            prop="money"
            label="计划回款金额"
            width="120">
            <template slot-scope="{row}">
              <el-input-number
                v-model="row.money"
                :controls="false"
                :min="0" />
            </template>
          </el-table-column>
          <el-table-column
            prop="returnType"
            label="计划回款方式"
            width="120">
            <template slot-scope="{row}">
              <el-select v-model="row.returnType" placeholder="请选择">
                <el-option
                  v-for="item in returnTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column
            prop="remind"
            label="提前几天提醒"
            width="120">
            <template slot-scope="{row}">
              <el-input-number
                v-model="row.remind"
                :controls="false"
                :step-strictly="true"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="备注"
            width="180">
            <template slot-scope="{row}">
              <el-input
                v-model="row.remark"
                :maxlength="800" />
            </template>
          </el-table-column>
          <el-table-column
            :resizable="false"
            fixed="right"
            label="操作"
            width="60">
            <template slot-scope="{ row, column, $index }">
              <el-button
                icon="wk wk-icon-bin" type="text" @click="deleteClick($index)"/>
            </template>

          </el-table-column>
        </el-table>
        <div><el-button
          :disabled="tableData.length > 100"
          icon="el-icon-plus"
          style="margin-left: 20px;"
          type="text"
          @click="addLineClick">添加一行</el-button></div>
      </div>
    </create-sections>
  </xr-create>
</template>

<script>
import { filedGetFieldAPI } from '@/api/crm/common'
import { crmReceivablesPlanBatchSaveAPI } from '@/api/crm/receivablesPlan'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import WkForm from '@/components/NewCom/WkForm'
import WkPlanDate from './components/WkPlanDate'

import CustomFieldsMixin from '@/mixins/CustomFields'
import { objDeepCopy } from '@/utils'
import crmTypeModel from '@/views/crm/model/crmTypeModel'

export default {
  // 新建编辑
  name: 'ReceivablesPlanBatchCreate',

  components: {
    XrCreate,
    CreateSections,
    CrmRelativeCell: () => import('@/components/CreateCom/CrmRelativeCell'),
    WkForm,
    WkPlanDate
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
      fieldRules: {},

      tableData: [],
      lineObj: null,
      returnTypeOptions: []
    }
  },

  computed: {},

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
    async getField() {
      const list = await this.getFields()
      const fieldList = []
      const fieldRules = {}
      const fieldForm = {}
      list.forEach(item => {
        const temp = this.getFormItemDefaultProperty(item)

        const canEdit = this.getItemIsCanEdit(item, this.action.type)
        // 是否能编辑权限
        if (canEdit) {
          fieldRules[temp.field] = this.getRules(item)
        }

        // 是否可编辑
        temp.disabled = !canEdit || temp.formType == 'contract'

        // 处理关联
        temp['relation'] = {}

        // 特殊字段允许多选
        this.getItemRadio(item, temp)

        // 获取默认值
        fieldForm[temp.field] = this.getItemValue(item, this.action.data, this.action.type)
        fieldList.push(temp)
      })

      this.baseFields = list
      this.fieldList = fieldList
      this.fieldForm = fieldForm
      this.fieldRules = fieldRules
    },

    /**
     * 保存
     */
    saveClick() {
      const contractObj = this.fieldForm.contractId[0]
      const customerObj = this.fieldForm.customerId[0]
      const { customerId } = customerObj
      const { contractId } = contractObj
      this.tableData.forEach(item => {
        item.customerId = customerId
        item.contractId = contractId
      })

      this.submiteParams(this.tableData)
    },

    /**
     * 提交上传
     */
    submiteParams(params) {
      crmReceivablesPlanBatchSaveAPI(params)
        .then(res => {
          this.loading = false

          this.$message.success('添加成功')

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
    formChange(item, index, value, valueList) {},

    /**
     * 地址change
     */
    otherChange(data, field) {
      if (field.formType === 'customer') {
        this.fieldList.forEach(fieldItem => {
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
      this.$refs.crmForm.instance.validateField(field.field)
    },

    /**
     * 关闭
     */
    close() {
      this.$emit('close')
    },

    /**
     * 获取新建字段
     */
    async getFields() {
      this.loading = true
      const res = await filedGetFieldAPI({
        label: crmTypeModel.receivablesPlan,
        type: 1
      })

      this.loading = false
      if (res && res.data) {
        const resData = res.data
        const returnTypeObj = resData.find(item => item.fieldName === 'returnType')
        if (returnTypeObj) {
          this.returnTypeOptions = returnTypeObj.setting || []
          return [{
            'fieldName': 'customerId',
            'formType': 'customer',
            'name': '客户名称',
            'type': 15,
            'defaultValue': null,
            'isUnique': null,
            'isNull': 1,
            'setting': [],
            'authLevel': 3,
            'value': '',
            'precisions': 2,
            'remark': null
          }, {
            'fieldName': 'contractId',
            'formType': 'contract',
            'name': '合同编号',
            'type': 20,
            'defaultValue': null,
            'isUnique': null,
            'isNull': 1,
            'setting': [],
            'authLevel': 3,
            'value': '',
            'precisions': 2,
            'remark': null
          }, {
            'fieldName': 'count',
            'formType': 'count',
            'name': '计划回款条数',
            'type': 4,
            'defaultValue': undefined,
            'isUnique': null,
            'isNull': 1,
            'setting': [],
            'authLevel': 3,
            'value': undefined,
            'precisions': 2,
            'remark': null
          }, {
            'fieldName': 'money',
            'formType': 'number',
            'name': '计划回款金额',
            'type': 5,
            'defaultValue': null,
            'isUnique': null,
            'isNull': 1,
            'setting': [],
            'authLevel': 3,
            'value': '',
            'precisions': 2,
            'remark': null
          }, {
            'fieldName': 'planDate',
            'formType': 'planDate',
            'name': '计划回款日期',
            'type': 5,
            'defaultValue': [],
            'isUnique': null,
            'isNull': 1,
            'setting': [],
            'authLevel': 3,
            'value': [],
            'precisions': 2,
            'remark': null
          }, {
            'fieldName': 'returnType',
            'formType': 'select',
            'name': '计划回款方式',
            'type': 3,
            'defaultValue': null,
            'isUnique': null,
            'isNull': 1,
            'setting': this.returnTypeOptions,
            'authLevel': 3,
            'value': null,
            'precisions': 2,
            'remark': null
          }, {
            'fieldName': 'remind',
            'formType': 'number',
            'name': '提前几天提醒',
            'type': 5,
            'defaultValue': null,
            'isUnique': null,
            'isNull': 0,
            'setting': [],
            'authLevel': 3,
            'value': '',
            'precisions': 2,
            'remark': null
          }, {
            'fieldName': 'remark',
            'formType': 'textarea',
            'name': '备注',
            'type': 2,
            'defaultValue': null,
            'isUnique': null,
            'isNull': 0,
            'setting': [],
            'authLevel': 3,
            'value': '',
            'precisions': 2,
            'remark': null
          }]
        }
        return []
      } else {
        return []
      }
    },

    /**
     * 应用
     */
    applyClick() {
      this.loading = true
      setTimeout(() => {
        const crmForm = this.$refs.crmForm.instance
        crmForm.validate(valid => {
          if (valid) {
            const planDate = this.fieldForm.planDate
            this.tableData = planDate.map(item => {
              return this.getLineItem(item, this.fieldForm)
            })
            this.lineObj = objDeepCopy(this.tableData[0])
            this.$nextTick(() => {
              this.loading = false
            })
          } else {
            this.loading = false
            // 提示第一个error
            this.getFormErrorMessage(crmForm)
            return false
          }
        })
      }, 100)
    },

    /**
     * 获取行信息
     */
    getLineItem(returnDate, data) {
      return {
        returnDate,
        money: data.money,
        returnType: data.returnType,
        remind: data.remind,
        remark: data.remark
      }
    },

    /**
     * 添加一行
     */
    addLineClick() {
      this.tableData.push(objDeepCopy(this.lineObj))
      this.$nextTick(() => {
        const container = this.$refs.wkTable.bodyWrapper
        container.scrollTop = container.scrollHeight
      })
    },

    /**
     * 删除一行
     */
    deleteClick(index) {
      this.tableData.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-input-number {
  width: 100%;
  /deep/ .el-input__inner {
    text-align: left;
    padding: 0 8px;
  }
}

.wk-form {
  /deep/ .el-form-item.is-planDate {
    flex: 0 0 100%;
  }

  /deep/ .el-radio-group {
    display: block;

    .el-radio {
      display: block;
    }

    .el-radio + .el-radio {
      margin-top: 10px;
    }
  }
}

.wk-table-content {
  margin: 20px;
  border: 1px solid #e6e6e6;
  border-radius: 3px;
}
</style>
