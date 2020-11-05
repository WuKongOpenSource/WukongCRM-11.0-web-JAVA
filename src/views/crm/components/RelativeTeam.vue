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
          @click.native="handleClick('remove')">移除</el-button>
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
        show-overflow-tooltip/>
    </el-table>
    <teams-handle
      :crm-type="crmType"
      :selection-list="[detail]"
      :dialog-visible.sync="teamsDialogShow"
      title="添加团队成员"
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
            <el-radio :label="1">只读</el-radio>
            <el-radio :label="2">读写</el-radio>
          </el-radio-group>
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
      fieldList: [],
      tableHeight: '400px',
      teamsDialogShow: false, // 是否展示添加团队成员窗口
      handleType: 1, // 权限类型
      editPermissionShow: false, // 编辑权限接口展示
      selectionList: [] // 勾选的数据
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
    this.fieldList.push({ prop: 'realname', width: '200', label: '姓名' })
    this.fieldList.push({ prop: 'post', width: '200', label: '职位' })
    this.fieldList.push({ prop: 'groupRole', width: '200', label: '团队角色' })
    this.fieldList.push({ prop: 'power', width: '200', label: '权限' })

    this.getDetail()
  },
  methods: {
    getDetail(loading = true) {
      this.loading = loading
      const request = {
        customer: crmCustomerTeamMembersAPI,
        business: crmBusinessTeamMembersAPI,
        contract: crmContractTeamMembersAPI
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

    /**
     * 当选择项发生变化时会触发该事件
     */
    handleSelectionChange(val) {
      this.selectionList = val
    },
    handleClick(type) {
      if (type == 'add') {
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
              contract: crmContractExitTeamAPI
            }[this.crmType]

            this.loading = true
            request({ id: this.id })
              .then(res => {
                this.$message({
                  type: 'success',
                  message: '操作成功'
                })
                this.$emit('on-handle', { type: 'exit-team' })
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
            this.editPermissionShow = true
          } else if (type == 'remove') {
            this.$confirm('此操作将移除这些团队成员是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                const request = {
                  customer: crmCustomerSettingTeamDeleteAPI,
                  contract: crmContractSettingTeamDeleteAPI,
                  business: crmBusinessSettingTeamDeleteAPI
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
      this.loading = true
      const request = {
        customer: crmCustomerUpdateMembersAPI,
        business: crmBusinessUpdateMembersAPI,
        contract: crmContractUpdateMembersAPI
      }[this.crmType]
      request({
        ids: [this.id],
        memberIds: this.selectionList.map(item => item.userId),
        power: this.handleType
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
      if (row.power == '负责人权限') {
        return false
      }
      return true
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../styles/relativecrm.scss';
</style>
