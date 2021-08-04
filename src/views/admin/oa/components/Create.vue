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
        :validate-on-rule-change="false"
        @change="formChange"
      >
        <template slot-scope="{ data }">
          <xh-icon-select
            v-if="data && data.formType == 'icon'"
            :value="fieldsForm[data.field]"
            @value-change="oldChange($event, data)"
          />
        </template>
      </base-info-set>
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

import WkBackgroudTabs from '../../examine/components/WkBackgroudTabs'
import BaseInfoSet from '../../examine/components/BaseInfoSet'
import { WkApproveFlow } from '@/components/ApprovalFlow'
import XhIconSelect from './XhIconSelect'

import { getMaxIndex } from '@/utils'
import { examineModel } from '@/components/ApprovalFlow'
import { objDeepCopy } from '@/utils'
import GenerateRulesMixin from '@/components/NewCom/WkForm/GenerateRules'
import ExamineInfoMinxin from '../../examine/mixins/ExamineInfo'

export default {
  name: 'OaApproveFlowCreate',
  components: {
    WkBackgroudTabs,
    BaseInfoSet,
    WkApproveFlow,
    XhIconSelect
  },
  filters: {},
  mixins: [GenerateRulesMixin, ExamineInfoMinxin],
  props: {
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
      fields: [],
      fieldsForm: {},
      rangeObj: {}, // 范围对象
      fieldsRules: {},
      flowList: [] // 数据源
    }
  },
  computed: {
    approveFlowConfig() {
      return {
        conditionSelectRequest: examinesQueryFieldAPI,
        conditionSelectParams: {
          label: 0,
          categoryId: this.examineId
        }
      }
    },
    sendNode() {
      const { userList, deptList } = this.rangeObj
      const structures = deptList || []
      const strNames = structures.map(item => item.name)

      const users = userList || []
      const userNames = users.map(item => item.realname)

      const name = strNames.concat(userNames).join('、')

      return {
        name: '发起人',
        content: name || '全公司'
      }
    },

    examineId() {
      return this.detail ? this.detail.examineId : null
    }
  },
  created() {
    this.getBaseField()
    if (this.detail) {
      this.rangeObj = {
        userList: this.detail.userList,
        deptList: this.detail.deptList
      }
    }
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
     * 获取自定义字段
     */
    getBaseField() {
      const field = []

      field.push({
        field: 'examineName',
        formType: 'text',
        isNull: 1,
        name: '审批类型名称',
        setting: [],
        inputTips: '',
        value: this.detail ? this.detail.examineName : ''
      })

      field.push({
        field: 'examineIcon',
        formType: 'icon',
        isNull: 1,
        name: '审批类型图标',
        setting: [],
        inputTips: '',
        value: this.detail ? this.detail.examineIcon || '' : 'wk wk-l-record,#3ABCFB'
      })

      field.push({
        field: 'dept',
        formType: 'userDep',
        isNull: 0,
        name: '发起人范围',
        setting: [],
        inputTips: '默认全公司',
        value: {
          userList: this.detail && this.detail.userList ? this.detail.userList.map(item => item.userId) : [],
          deptList: this.detail && this.detail.deptList ? this.detail.deptList.map(item => item.id) : []
        }
      })

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
        value: this.detail ? this.detail.managerList : []
      })

      field.push({
        field: 'remarks',
        formType: 'textarea',
        isNull: 0,
        name: '审批类型说明',
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
          fieldForm.userList = item.value.userList
          fieldForm.deptList = item.value.deptList
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
      if (item.formType === 'userDep') {
        this.rangeObj = value
      }
    },

    /**
     * 旧change回调
     */
    oldChange(dataValue, field) {
      this.$set(this.fieldsForm, field.field, dataValue.value)
      this.$refs.baseInfoSet.form.validateField(field.field)
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
              label: 0, // oa
              dataList: flowParams.list
            }

            if (this.examineId) {
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
        this.$emit('success')
        if (!this.examineId) {
          // 如果是新建 提示去创建表单
          this.$confirm('您将继续完成审批表单的创建', '创建成功', {
            showCancelButton: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            showClose: false,
            confirmButtonText: '确定',
            type: 'warning',
            callback: action => {
              this.closeClick()
              if (action === 'confirm') {
                this.$router.push({
                  name: 'workbenchHandlefield',
                  params: {
                    type: 'oa_examine',
                    label: '10',
                    id: res.data.examineId
                  }
                })
              }
            }
          })
        } else {
          this.$message.success('创建成功')
          this.closeClick()
        }
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
