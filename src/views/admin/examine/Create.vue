<template>
  <transition name="opacity-fade">
    <div class="business-approve-flow-create">
      <wk-backgroud-tabs
        :options="tabs"
        v-model="tabIndex"
      >
        <template slot="right">
          <el-button type="primary" @click="sendClick">发布</el-button>
          <i
            class="el-icon-close create-close"
            @click="closeClick" />
        </template>
      </wk-backgroud-tabs>
      <base-info-set
        v-show="tabIndex === 'base'"
        ref="baseInfoSet"
        :fields="fields"
        :fields-form="fieldsForm"
        :fields-rules="fieldsRules"
        @change="formChange"
      />
      <wk-approve-flow
        v-show="tabIndex === 'flow'"
        ref="wkApproveFlow"
        :props="approveFlowConfig"
        :list="flowList"
        :send-node="sendNode" />
    </div>
  </transition>
</template>

<script type="text/javascript">
import {
  examinesQueryFieldAPI,
  examinesAddAPI,
  examinesQueryExamineFlowAPI
} from '@/api/examine'

import WkBackgroudTabs from './components/WkBackgroudTabs'
import BaseInfoSet from './components/BaseInfoSet'
import { WkApproveFlow } from '@/components/ApprovalFlow'

import { getMaxIndex } from '@/utils'
import { examineModel } from '@/components/ApprovalFlow'
import { objDeepCopy } from '@/utils'
import GenerateRulesMixin from '@/components/NewCom/WkForm/GenerateRules'
import ExamineInfoMinxin from './mixins/ExamineInfo'

export default {
  name: 'BusinessApproveFlowCreate',
  components: {
    WkBackgroudTabs,
    BaseInfoSet,
    WkApproveFlow
  },
  filters: {},
  mixins: [GenerateRulesMixin, ExamineInfoMinxin],
  props: {
    isCopy: {
      type: Boolean,
      default: false
    },
    detail: Object
  },
  data() {
    return {
      loading: false,
      height: document.documentElement.clientHeight - 100,
      tabs: [{
        label: '1.配置基础信息',
        value: 'base'
      }, {
        label: '2.配置流程',
        value: 'flow'
      }],
      tabIndex: 'base',
      sendNode: {
        name: '发起人',
        content: '具有新建权限的员工'
      },
      fields: [],
      fieldsForm: {},
      fieldsRules: {},
      flowList: [], // 数据源
      conditionFields: null
    }
  },
  computed: {
    approveFlowConfig() {
      return {
        conditionSelectRequest: examinesQueryFieldAPI,
        conditionSelectParams: {
          label: this.fieldsForm.label
        },
        conditionSelectList: this.fieldsForm.label === 3 ? [{
          fieldId: -1,
          fieldName: 'invoiceMoney',
          fieldType: 1,
          name: '开票金额',
          setting: null,
          type: 6
        }, {
          fieldId: -1,
          fieldName: 'invoiceType',
          fieldType: 1,
          name: '开票类型',
          setting: [{
            label: '增值税专用发票',
            value: '1'
          }, {
            label: '增值税普通发票',
            value: '2'
          }, {
            label: '国税通用机打发票',
            value: '3'
          }, {
            label: '地税通用机打发票',
            value: '4'
          }, {
            label: '收据',
            value: '5'
          }],
          type: 3
        }] : null
      }
    },

    examineId() {
      return this.detail ? this.detail.examineId : null
    }
  },
  created() {
    this.getBaseField()
    if (this.examineId) {
      this.getFlowList(this.examineId)
    } else {
      this.flowList = [objDeepCopy(examineModel)]
    }
  },
  mounted() {
    this.$el.style.zIndex = getMaxIndex()
    document.body.appendChild(this.$el)

    window.onresize = () => {
      this.height = document.documentElement.clientHeight - 100
    }
  },
  destroyed() {
    // remove DOM node after destroy
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    /**
     * 获取流程详情
     */
    getFlowList(examineId) {
      examinesQueryExamineFlowAPI({ examineId }).then(res => {
        const list = res.data || []
        const dataList = []
        this.getListInfo(list, dataList)
        this.flowList = dataList
      }).catch(() => {})
    },

    /**
     * 验证数据
     */
    validateSetting(item) {
      this.requestConditionFields().then(fields => {
        const field = fields.find(fieldItem => fieldItem.fieldName === item.fieldName)
        item.setting = field ? field.setting : []
      })
    },

    requestConditionFields() {
      const { conditionSelectRequest, conditionSelectParams, conditionSelectList } = this.approveFlowConfig
      if (conditionSelectList) {
        return Promise.resolve(conditionSelectList)
      }

      if (this.conditionFields) {
        return Promise.resolve(this.conditionFields)
      }
      return new Promise((resolve, reject) => {
        conditionSelectRequest(conditionSelectParams).then(res => {
          const list = res.data || []
          this.conditionFields = list
          resolve(list)
        }).catch(() => {
          resolve([])
        })
      })
    },


    /**
     * 获取自定义字段
     */
    getBaseField() {
      const field = []
      const labelList = [
        { name: '合同', value: 1 },
        { name: '回款', value: 2 },
        { name: '发票', value: 3 },
        { name: '薪资', value: 4 },
        { name: '采购审批', value: 5 },
        { name: '采购退货审批', value: 6 },
        { name: '销售审批', value: 7 },
        { name: '销售退货审批', value: 8 },
        { name: '付款审批', value: 9 },
        { name: '回款审批', value: 10 },
        { name: '盘点审批', value: 11 },
        { name: '调拨审批', value: 12 }
      ]

      field.push({
        field: 'examineName',
        formType: 'text',
        isNull: 1,
        name: '审批流名称',
        setting: [],
        inputTips: '',
        value: this.detail ? this.detail.examineName : ''
      })

      // 新建审批类型 默认为 oa_examine
      field.push({
        field: 'label',
        formType: 'select',
        isNull: 0,
        name: '关联对象',
        setting: labelList,
        value: this.detail ? this.detail.label : 1
      })

      // field.push({
      //   field: 'dept',
      //   formType: 'userDep',
      //   isNull: 0,
      //   name: '应用部门',
      //   setting: [],
      //   inputTips: '默认全公司',
      //   value: {
      //     users: this.detail ? this.detail.userList : [],
      //     strucs: this.detail ? this.detail.deptList : []
      //   }
      // })

      field.push({
        field: 'recheckType',
        formType: 'select',
        isNull: 0,
        name: '审批被拒后重新提交',
        setting: [
          { name: '返回审批流初始层级', value: 1 },
          { name: '跳过审批流已通过的层级，返回拒绝的层级', value: 2 }
        ],
        inputTips: '',
        value: this.detail ? this.detail.recheckType : 1
      })

      field.push({
        field: 'managerList',
        formType: 'user',
        isNull: 1,
        name: '审批流管理员',
        setting: [],
        radio: false,
        tipType: 'tooltip',
        inputTips: '<div>1、可以在"配置流程"设置当审批人为空，审批<br>自动转交给审批流管理员；当管理员也请假/离<br>职，审批将转交给超级管理员。</div><div>2、可指定多个管理员，审批方式为或签。</div>',
        value: this.detail ? this.detail.managerList : 1
      })

      field.push({
        field: 'remarks',
        formType: 'textarea',
        isNull: 0,
        name: '流程说明',
        maxlength: 200,
        setting: [],
        inputTips: '请填写相关注意事项，方便员工在申请时查阅，限制输入200字',
        value: this.detail ? this.detail.remarks : ''
      })

      this.handleFields(field)
    },

    /**
     * 调整字段
     */
    handleFields(list) {
      const fieldRules = {}
      const fieldForm = {}
      list.forEach(item => {
        if (item.formType === 'userDep') {
          fieldForm.userList = []
          fieldForm.deptList = []
        } else {
          fieldRules[item.field] = this.getRules(item)
          fieldForm[item.field] = item.value
        }
      })

      this.fields = objDeepCopy(list)
      this.fieldsForm = fieldForm
      this.fieldsRules = fieldRules
    },

    /**
     * change
     */
    formChange(item, index, value) {
      if (item.field === 'label') {
        this.flowList = [objDeepCopy(examineModel)]
      }
    },

    /**
     * 发布点击
     */
    sendClick() {
      this.$refs.baseInfoSet.validate().then(valid => {
        if (valid) {
          const flowParams = this.$refs.wkApproveFlow.getParams()
          if (flowParams.isError) {
            this.$message.error('请完善信息')
          } else {
            const params = {
              ...this.fieldsForm,
              dataList: flowParams.list
            }

            if (this.examineId && !this.isCopy) {
              params.examineId = this.examineId
            }

            this.submiteRequest(params)
          }
        }
      })
    },

    /**
     * 发送请求
     */
    submiteRequest(params) {
      examinesAddAPI(params).then(res => {
        this.$message.success('创建成功')
        this.$emit('success')
        this.closeClick()
      }).catch(() => {})
    },

    /**
     * 关闭
     */
    closeClick() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
.opacity-fade-enter-active,
.opacity-fade-leave-active {
  transition: all 0.2s;
}
.opacity-fade-enter,
.opacity-fade-leave-to {
  opacity: 0;
}

.business-approve-flow-create {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: #f5f5f7;

  .create-close {
    display: block;
    font-size: 24px;
    color: #909399;
    padding: 10px;
    cursor: pointer;
  }

  .create-close:hover {
    color: $xr-color-primary;
  }

  .base-info-set {
    width: 900px;
    margin: 20px auto 0;
    height: calc(100% - 100px);
  }

  .wk-approve-flow-wrap {
    top: 60px;
  }

}


</style>
