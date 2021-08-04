<template>
  <el-dialog
    v-loading="loading"
    :title="title"
    :visible.sync="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="400px"
    @close="handleCancel">
    <div class="handle-box">
      <flexbox
        v-if="!members"
        class="handle-item"
        align="stretch">
        <div
          class="handle-item-name"
          style="margin-top: 8px;">选择团队成员：</div>
        <wk-user-select
          :radio="false"
          v-model="usersList"
          class="handle-item-content"
          placeholder="点击选择（多选）"/>
        <div
          v-if="!isCreate"
          class="tips">此操作不可移除数据负责人</div>
      </flexbox>
      <flexbox
        v-if="isCreate"
        class="handle-item">
        <div class="handle-item-name">权限：</div>
        <el-radio-group v-model="handleType">
          <el-radio :label="1">只读<el-tooltip
            style="margin-left: 3px;"
            content="支持查看详细资料、添加和查看活动中所有跟进记录"
            effect="dark"
            placement="top">
            <i class="wk wk-help wk-help-tips"/>
          </el-tooltip></el-radio>
          <el-radio :label="2">读写<el-tooltip
            style="margin-left: 3px;"
            content="支持编辑和查看详细资料、可以添加和查看活动中所有跟进记录"
            effect="dark"
            placement="top">
            <i class="wk wk-help wk-help-tips"/>
          </el-tooltip></el-radio>
        </el-radio-group>
      </flexbox>
      <flexbox
        v-if="addsTypesShow"
        :style="{ marginTop: isCreate ? 0 : '8px' }"
        class="handle-item">
        <div class="handle-item-name">{{ isCreate ? '同时添加至' : '同时移除' }}：</div>
        <el-checkbox-group v-model="addsTypes">
          <el-checkbox label="1">联系人</el-checkbox>
          <el-checkbox label="2">商机</el-checkbox>
          <el-checkbox label="3">合同</el-checkbox>
        </el-checkbox-group>
      </flexbox>
      <flexbox
        v-if="isCreate"
        class="handle-item">
        <div class="handle-item-name">有效时间：</div>
        <el-select v-model="validType">
          <el-option label="不限" value=""/>
          <el-option label="截止到" value="end"/>
        </el-select>
        <el-date-picker
          v-if="validType === 'end'"
          v-model="expiresTime"
          :picker-options="pickerOptions"
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
import {
  crmCustomerSettingTeamSaveAPI,
  crmCustomerSettingTeamDeleteAPI
} from '@/api/crm/customer'
import {
  crmContractSettingTeamSaveAPI,
  crmContractSettingTeamDeleteAPI
} from '@/api/crm/contract'
import {
  crmBusinessSettingTeamSaveAPI,
  crmBusinessSettingTeamDeleteAPI
} from '@/api/crm/business'
import {
  crmContactsSettingTeamSaveAPI,
  crmContactsSettingTeamDeleteAPI
} from '@/api/crm/contacts'
import {
  crmReceivablesSettingTeamSaveAPI,
  crmReceivablesSettingTeamDeleteAPI
} from '@/api/crm/receivables'

export default {
  /** 客户管理 的 勾选后的 团队成员 操作 移除操作不可移除客户负责人*/
  name: 'TeamsHandle',
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
    // add 添加 delete 移除
    type: {
      type: String,
      default: ''
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
    },
    // 选择的成员，该字段存在，将不展示员工选择
    members: Array
  },
  data() {
    return {
      loading: false, // 加载动画
      visible: false,

      pickerOptions: {
        disabledDate(time) {
          // 当前0点时间戳
          return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
        }
      },

      usersList: [], // 变更负责人
      handleType: 1, // 操作类型
      addsTypes: [], // 添加至
      validType: '', // 有效类型
      expiresTime: '' // 有效时间
    }
  },
  computed: {
    // 客户允许同时添加至联系人
    addsTypesShow() {
      return this.crmType === 'customer'
    },
    // 是新建
    isCreate() {
      return this.type === 'add'
    },
    title() {
      return {
        add: '添加团队成员',
        delete: '移除团队成员'
      }[this.type]
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
     * 重置数据
     */
    resetData() {
      this.usersList = [] // 变更负责人
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
      // 移除操作不可移除客户负责人
      if (!this.members && this.usersList.length === 0) {
        this.$message.error('请选择团队成员')
      } else if (this.validType === 'end' && !this.expiresTime) {
        this.$message.error('请选择截止日期')
      } else {
        const params = {
          ids: this.selectionList.map(item => item[this.crmType + 'Id']),
          memberIds: this.usersList
        }

        // 如果有传入成员，替换选择成员
        if (this.members) {
          params.memberIds = this.members.map(item => item.userId)
        }
        if (this.addsTypesShow) {
          // 只有客户下面同时添加到
          params.changeType = this.addsTypes.map(function(i) {
            return parseInt(i)
          })
        }

        params.expiresTime = this.validType === 'end' ? this.expiresTime : ''

        let request
        if (this.isCreate) {
          // 1只读，2读写
          params.power = this.handleType
          request = {
            customer: crmCustomerSettingTeamSaveAPI,
            contract: crmContractSettingTeamSaveAPI,
            business: crmBusinessSettingTeamSaveAPI,
            contacts: crmContactsSettingTeamSaveAPI,
            receivables: crmReceivablesSettingTeamSaveAPI
          }[this.crmType]
        } else {
          request = {
            customer: crmCustomerSettingTeamDeleteAPI,
            contract: crmContractSettingTeamDeleteAPI,
            business: crmBusinessSettingTeamDeleteAPI,
            contacts: crmContactsSettingTeamDeleteAPI,
            receivables: crmReceivablesSettingTeamDeleteAPI
          }[this.crmType]
        }

        this.loading = true

        request(params)
          .then(res => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.loading = false
            this.handleCancel()
            this.$emit('handle', {
              type: this.isCreate ? 'add_user' : 'delete_user'
            })
          })
          .catch(() => {
            this.loading = false
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tips {
  color: #777;
  font-size: 12px;
  position: absolute;
  bottom: -2px;
  right: 125px;
}
.handle-box {
  color: #333;
  font-size: 12px;
}
.handle-item {
  padding-bottom: 15px;
  position: relative;
  .handle-item-name {
    flex-shrink: 0;
    width: 90px;
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
