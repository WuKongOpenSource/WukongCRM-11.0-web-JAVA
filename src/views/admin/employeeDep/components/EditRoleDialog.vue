<template>
  <el-dialog
    ref="wkDialog"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="500px"
    @close="close">
    <div slot="title" class="el-dialog__title">
      {{ title }}<el-tooltip
        v-if="userShow"
        effect="dark"
        placement="top">
        <div slot="content">1、可以将员工角色复制给其他员工。<br >
          2、若选择的员工已有角色，原角色会被覆盖。<br >
          3、若选择部门，该部门所有员工的角色将相同，<br >
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;可保存后再对员工独立调整。
        </div>
        <i class="wk wk-help wk-help-tips" style="margin-left: 3px;"/>
      </el-tooltip>
    </div>
    <el-form
      ref="editRoleForm"
      :model="ruleForm"
      :rules="rules"
      label-width="100px"
      label-position="top">
      <el-form-item v-if="userShow" label="选择员工和部门" prop="userIds">
        <wk-user-dep-select
          :user-value.sync="ruleForm.userIds"
          :dep-value.sync="ruleForm.deptIds"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="设置角色" prop="roleList">
        <role-employee-select
          v-model="ruleForm.roleList"
          :props="roleSelectProps"
          style="width: 100%;"
          multiple
        />
      </el-form-item>
    </el-form>
    <div class=""/>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="sureClick">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  adminRoleRelatedDeptUserAPI
} from '@/api/admin/role'
import { adminRoleGetRoleListAPI } from '@/api/admin/employeeDep'

import RoleEmployeeSelect from './RoleEmployeeSelect'
import WkUserDepSelect from '@/components/NewCom/WkUserDepSelect'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'

export default {
  // 编辑角色
  name: 'EditRoleDialog',
  components: {
    RoleEmployeeSelect,
    WkUserDepSelect
  },
  mixins: [ElDialogLoadingMixin],
  props: {
    selectionList: Array,
    userShow: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      roleValue: [],
      ruleForm: {
        roleList: [],
        userIds: [],
        deptIds: []
      }
    }
  },
  computed: {
    title() {
      return this.userShow ? '复制角色' : '编辑角色'
    },

    rules() {
      const validateUserIds = (rule, value, callback) => {
        if ((this.ruleForm.userIds && this.ruleForm.userIds.length > 0) ||
        (this.ruleForm.deptIds && this.ruleForm.deptIds.length > 0)) {
          callback()
        } else {
          callback(new Error('请选择'))
        }
      }
      const temp = {
        roleList: [
          { required: true, message: '请选择', trigger: 'change' }
        ] }
      if (this.userShow) {
        temp.userIds = [
          { validator: validateUserIds, trigger: '' }
        ]
      }

      return temp
    },

    roleSelectProps() {
      return {
        roleRequest: adminRoleGetRoleListAPI
      }
    }
  },
  watch: {
  },
  created() {
    if ((this.userShow && this.selectionList.length > 0) || (!this.userShow && this.selectionList.length === 1)) {
      const userData = this.selectionList[0]
      this.ruleForm.roleList = userData.roleId ? this.selectionList[0].roleId.split(',').map(item => parseFloat(item)) : []
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },

    sureClick() {
      this.$refs.editRoleForm.validate((valid) => {
        if (valid) {
          const roleIdList = []
          let userRoleIds = []
          this.ruleForm.roleList.forEach(item => {
            if (typeof item === 'string') {
              if (item.includes('@')) {
                const temps = item.split('@')
                if (temps.length > 1) {
                  const tempsIds = temps[1].split(',').map(item => parseFloat(item))
                  userRoleIds = userRoleIds.concat(tempsIds)
                }
              }
            } else {
              roleIdList.push(item)
            }
          })

          const roleIds = Array.from(new Set(roleIdList.concat(userRoleIds)))

          const params = {
            roleIds
          }
          if (this.userShow) {
            params.userIds = this.ruleForm.userIds
            params.deptIds = this.ruleForm.deptIds
          } else {
            params.userIds = this.selectionList.map(item => item.userId)
          }

          adminRoleRelatedDeptUserAPI(params)
            .then(res => {
              this.$message.success('操作成功')
              this.$emit('change')
              this.close()
            })
            .catch(() => {})
        } else {
          return false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-form {
  margin-top: 10px;
  /deep/ .el-form-item__label {
    line-height: 30px;
    padding-bottom: 0;
  }
}

</style>
