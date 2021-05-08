<template>
  <div v-loading="loading" class="rc-cont">
    <flexbox
      v-if="!isSeas"
      class="rc-head"
      direction="row-reverse">
      <template
        v-if="teamEditAuth">
        <el-button
          class="rc-head-item"
          type="primary"
          @click.native="handleClick('exit')">退出团队</el-button>
        <el-button
          class="rc-head-item"
          type="primary"
          @click.native="handleClick('delete')">移除</el-button>
        <el-button
          class="rc-head-item"
          type="primary"
          @click.native="handleClick('edit')">编辑</el-button>
        <el-button
          class="xr-btn--orange rc-head-item"
          icon="el-icon-plus"
          type="primary"
          @click="handleClick('add')">团队成员</el-button>
      </template>
    </flexbox>
    <el-table
      :data="list"
      :height="tableHeight"
      stripe
      style="width: 100%;border: 1px solid #E6E6E6;"
      @selection-change="handleSelectionChange">
      <el-table-column
        v-if="teamEditAuth"
        :selectable="handleSelectable"
        show-overflow-tooltip
        type="selection"
        align="center"
        width="55"/>
      <el-table-column
        v-for="(item, index) in fieldList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :min-width="item.width"
        :formatter="fieldFormatter"
        show-overflow-tooltip/>
      <el-table-column
        prop="power"
        label="权限"
        min-width="100"
        show-overflow-tooltip>
        <template slot-scope="{ row, column }">
          {{ fieldFormatter(row,column) }}<el-tooltip
            v-if="row.power === 1 || row.power === 2"
            :content="getPowerTips(row.power)"
            style="margin-left: 3px;"
            effect="dark"
            placement="top">
            <i class="wk wk-help wk-help-tips"/>
          </el-tooltip>

        </template>
      </el-table-column>

    </el-table>
    <teams-handle
      v-if="teamsDialogShow"
      :crm-type="crmType"
      :selection-list="[detail]"
      :dialog-visible.sync="teamsDialogShow"
      :type="teamsType"
      :members="teamsType === 'add' ? null : selectionList"
      @handle="handleCallBack"/>

    <el-dialog
      v-loading="loading"
      :visible.sync="editPermissionShow"
      :close-on-click-modal="false"
      :append-to-body="true"
      title="编辑权限"
      width="400px">
      <div class="handle-box">
        <flexbox class="handle-item">
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
        <el-button @click.native="editPermissionShow=false">取消</el-button>
        <el-button
          type="primary"
          @click.native="handleEditConfirm">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
import {
  crmCustomerTeamMembersAPI,
  crmCustomerUpdateMembersAPI,
  crmCustomerSettingTeamDeleteAPI,
  crmCustomerExitTeamAPI
} from '@/api/crm/customer'
import {
  crmBusinessTeamMembersAPI,
  crmBusinessUpdateMembersAPI,
  crmBusinessSettingTeamDeleteAPI,
  crmBusinessExitTeamAPI
} from '@/api/crm/business'
import {
  crmContractTeamMembersAPI,
  crmContractUpdateMembersAPI,
  crmContractSettingTeamDeleteAPI,
  crmContractExitTeamAPI
} from '@/api/crm/contract'
import {
  crmContactsTeamMembersAPI,
  crmContactsUpdateMembersAPI,
  crmContactsSettingTeamDeleteAPI,
  crmContactsExitTeamAPI
} from '@/api/crm/contacts'
import {
  crmReceivablesTeamMembersAPI,
  crmReceivablesUpdateMembersAPI,
  crmReceivablesSettingTeamDeleteAPI,
  crmReceivablesExitTeamAPI
} from '@/api/crm/receivables'

import TeamsHandle from './SelectionHandle/TeamsHandle' // 操作团队成员

import { mapGetters } from 'vuex'

export default {
  name: 'RelativeTeam', // 团队成员  可能再很多地方展示 放到客户管理目录下
  components: {
    TeamsHandle
  },
  mixins: [],
  props: {
    // 模块ID
    id: [String, Number],
    // 联系人人下 新建商机 需要联系人里的客户信息  合同下需要客户和商机信息
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 没有值就是全部类型 有值就是当个类型
    crmType: {
      type: String,
      default: ''
    },
    // 是公海 默认是客户
    isSeas: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      fieldList: [
        { prop: 'realname', width: '120', label: '姓名' },
        { prop: 'deptName', width: '100', label: '部门' },
        { prop: 'groupRole', width: '100', label: '团队角色' },
        { prop: 'expiresTime', width: '120', label: '有效时间' }
      ],

      pickerOptions: {
        disabledDate(time) {
          // 当前0点时间戳
          return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
        }
      },

      tableHeight: '400px',
      teamsDialogShow: false, // 是否展示添加团队成员窗口
      handleType: 1, // 权限类型
      validType: '', // 有效类型
      expiresTime: '', // 有效时间
      editPermissionShow: false, // 编辑权限接口展示
      selectionList: [], // 勾选的数据
      teamsType: ''
    }
  },
  inject: ['rootTabs'],
  computed: {
    ...mapGetters(['crm']),
    teamEditAuth() {
      return this.crm[this.crmType].teamsave
    }
  },
  watch: {
    id(val) {
      this.list = []
      this.getDetail()
    },

    'rootTabs.currentName'(val) {
      if (val === 'RelativeTeam') {
        this.getDetail(false)
      }
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {
    getDetail(loading = true) {
      this.loading = loading
      const request = {
        customer: crmCustomerTeamMembersAPI,
        business: crmBusinessTeamMembersAPI,
        contract: crmContractTeamMembersAPI,
        contacts: crmContactsTeamMembersAPI,
        receivables: crmReceivablesTeamMembersAPI
      }[this.crmType]
      const params = {}
      params['id'] = this.id
      request(params)
        .then(res => {
          this.loading = false
          this.list = res.data
        })
        .catch(() => {
          this.loading = false
        })
    },

    fieldFormatter(row, column, cellValue) {
      // 1 只读 2 读写 3 负责人
      if (column.property === 'power') {
        return {
          1: '只读',
          2: '读写',
          3: '负责人'
        }[row[column.property]]
      } else if (column.property === 'groupRole') {
        return row.power === 3 ? '负责人' : '普通员工'
      } else if (column.property === 'expiresTime') {
        return row.expiresTime || '不限'
      }

      return row[column.property] === '' || row[column.property] === null ? '--' : row[column.property]
    },

    /**
     * 当选择项发生变化时会触发该事件
     */
    handleSelectionChange(val) {
      this.selectionList = val
    },
    handleClick(type) {
      if (type == 'add') {
        this.teamsType = 'add'
        this.teamsDialogShow = true
      } else if (type == 'exit') {
        this.$confirm('确定退出团队?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            const request = {
              customer: crmCustomerExitTeamAPI,
              business: crmBusinessExitTeamAPI,
              contract: crmContractExitTeamAPI,
              contacts: crmContactsExitTeamAPI,
              receivables: crmReceivablesExitTeamAPI
            }[this.crmType]

            this.loading = true
            request({ id: this.id })
              .then(res => {
                this.$message({
                  type: 'success',
                  message: '操作成功'
                })
                this.$emit('handle', { type: 'exit-team' })
                this.loading = false
              })
              .catch(() => {
                this.loading = false
              })
          })
          .catch(() => {})
      } else {
        if (this.selectionList.length == 0) {
          this.$message.error('请勾选需要操作的团队成员')
        } else {
          if (type == 'edit') {
            this.handleType = 1
            this.validType = ''
            this.expiresTime = ''
            this.editPermissionShow = true
          } else if (type == 'delete') {
            if (this.crmType === 'customer') {
              this.teamsType = 'delete'
              this.teamsDialogShow = true
            } else {
              this.$confirm('此操作将移除这些团队成员是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                  const request = {
                    customer: crmCustomerSettingTeamDeleteAPI,
                    contract: crmContractSettingTeamDeleteAPI,
                    business: crmBusinessSettingTeamDeleteAPI,
                    contacts: crmContactsSettingTeamDeleteAPI,
                    receivables: crmReceivablesSettingTeamDeleteAPI
                  }[this.crmType]

                  var params = {
                    ids: [parseInt(this.id)],
                    memberIds: this.selectionList.map(item => item.userId)
                  }

                  this.loading = true
                  request(params)
                    .then(res => {
                      this.$message({
                        type: 'success',
                        message: '操作成功'
                      })
                      this.loading = false
                      this.$bus.emit('crm-tab-num-update')
                      this.getDetail()
                    })
                    .catch(() => {
                      this.loading = false
                    })
                })
                .catch(() => {})
            }
          }
        }
      }
    },

    /**
     * 添加操作
     */
    handleCallBack(data) {
      this.$bus.emit('crm-tab-num-update')
      this.getDetail()
    },

    /**
     * 编辑操作确定
     */
    handleEditConfirm() {
      if (this.validType === 'end' && !this.expiresTime) {
        this.$message.error('请选择截止日期')
        return
      }
      this.loading = true
      const request = {
        customer: crmCustomerUpdateMembersAPI,
        business: crmBusinessUpdateMembersAPI,
        contract: crmContractUpdateMembersAPI,
        contacts: crmContactsUpdateMembersAPI,
        receivables: crmReceivablesUpdateMembersAPI
      }[this.crmType]
      request({
        ids: [this.id],
        memberIds: this.selectionList.map(item => item.userId),
        power: this.handleType,
        expiresTime: this.validType === 'end' ? this.expiresTime : ''
      })
        .then(res => {
          this.editPermissionShow = false
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.loading = false
          this.getDetail()
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 返回值用来决定这一行的 CheckBox 是否可以勾选
     */
    handleSelectable(row, index) {
      if (row.power == '负责人权限' || row.power == 3) {
        return false
      }
      return true
    },

    getPowerTips(power) {
      return {
        1: '支持查看详细资料、添加和查看活动中所有跟进记录',
        2: '支持编辑和查看详细资料、可以添加和查看活动中所有跟进记录'
      }[power]
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../styles/relativecrm.scss';
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
</style>
