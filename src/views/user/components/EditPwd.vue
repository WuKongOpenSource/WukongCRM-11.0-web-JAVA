<template>
  <div class="edit-pwd">
    <div class="head">
      <span class="wk wk-circle-password icon" />
      <span class="text">账号密码</span>
    </div>
    <el-form
      v-loading="loading"
      ref="form"
      :model="form"
      :rules="rules"
      label-position="left"
      label-width="120px">
      <el-form-item label="原密码" prop="oldPwd">
        <el-input
          v-model.trim="form.oldPwd"
          :maxlength="20"
          type="password" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPwd">
        <el-input
          v-model.trim="form.newPwd"
          :maxlength="20"
          type="password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPwd">
        <el-input
          v-model.trim="form.confirmPwd"
          :maxlength="20"
          type="password" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { adminUsersResetPasswordAPI } from '@/api/user/personCenter'
import { removeAuth } from '@/utils/auth'

export default {
  name: 'EditPwd',
  data() {
    const pwdReg = /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/
    return {
      loading: false,
      form: {},
      rules: {
        oldPwd: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { pattern: pwdReg, message: '密码必须由6-20位字母、数字组成', trigger: 'blur' }
        ],
        newPwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { pattern: pwdReg, message: '密码必须由6-20位字母、数字组成', trigger: 'blur' }
        ],
        confirmPwd: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: this.validatedConfirmPwd, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  methods: {
    validatedConfirmPwd(rule, value, callback) {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.newPwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {
            id: this.userInfo.userId,
            oldPwd: this.form.oldPwd,
            newPwd: this.form.newPwd
          }
          adminUsersResetPasswordAPI(params).then(() => {
            this.loading = false
            removeAuth().then(() => {
              this.$confirm('修改成功, 请重新登录', '提示', {
                confirmButtonText: '确定',
                showCancelButton: false,
                type: 'warning'
              }).then(() => {
                this.$router.push('/login')
              }).catch(() => {
                this.$router.push('/login')
              })
            })
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
  @import "./style";
  .edit-pwd {
    width: 100%;
    background-color: white;
    padding: 22px 25px;
  }
</style>
