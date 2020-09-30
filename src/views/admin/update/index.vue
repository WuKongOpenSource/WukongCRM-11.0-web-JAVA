<template>
  <div class="crm-update">
    <div class="title-wrap">
      <i class="el-icon-setting"/>
      <div>
        <p class="title">系统更新</p>
        <p class="description">你可以随时检查使用系统是否是最新版本，并进行一键升级</p>
      </div>
    </div>

    <reminder
      class="warning-box"
      content="更新前，您需要备份您的数据，防止数据丢失。" />

    <!-- 登录状态 -->
    <div v-if="isLogin" class="login-box">
      <!-- 头像 -->
      <div class="face">
        <img v-if="userData.img" :src="userData.img" alt="">
        <span v-else>{{ userData.name }}</span>
      </div>

      <!-- 信息 -->
      <div class="info">
        <span class="name">{{ userData.name }}</span>
        <span class="title">{{ userData.title }}</span>
        <p>{{ userData.companyName }}</p>
        <p>
          <i class="el-icon-mobile-phone"/>
          {{ userData.mobile }}
        </p>
        <p>
          <i class="wk wk-icon-email-outline"/>
          {{ userData.email }}
        </p>
      </div>
      <!-- 按钮 -->
      <div>
        <el-button type="primary" plain @click="logoutHandle">注销</el-button>
      </div>
    </div>

    <!-- 未登录悟空账号的提示 -->
    <div v-else class="login-box">
      <!-- 头像 -->
      <div class="face">登录</div>
      <div class="info">
        <!-- 提示 -->
        <div class="login-box-title">
          <span @click="dialogVisible = true">请点击登</span>
          <p>更新前需要先登录悟空账号</p>
        </div>
      </div>
      <!-- 按钮 -->
      <el-button type="primary" plain @click="dialogVisible = true">登录</el-button>
    </div>

    <div v-loading="checkLoading" class="last-time">
      <el-button :disabled="isClick" type="primary" plain @click="checkHandle">检查更新</el-button>
    </div>

    <!-- 检查更新后展示 -->
    <div v-if="isCheckUpdate" class>
      <!-- 已经是最新版本 -->
      <div v-if="isNewest" class="version">
        <p class="text">您当前是最新版本</p>
        当前版本：{{ version }}
      </div>

      <!-- 有新版本 -->
      <div
        v-loading="updateLoading"
        v-else
        :element-loading-text="progressTooltip"
        class="version"
        element-loading-background="#fff"
      >
        <p class="text">有新的版本可升级</p>
        当前版本：{{ serverVersion }}，您可以升级到
        <span>{{ version }}</span>

        <div class="update-wrap">
          <el-badge :value="1" class="update-badge">
            <el-button :type="isCanUpdate ? 'primary' : 'info'" @click="updateHandle">现在更新</el-button>
          </el-badge>
        </div>

      </div>
    </div>
    <!-- 备份 -->
    <div class="data-back">
      <p class="text">数据备份</p>
      <div v-loading="backLoading" class="box" element-loading-text="努力备份中">
        <el-button type="primary" plain @click="queryDatabaseHandle">查询数据库</el-button>
        <el-button type="primary" plain @click="isCustom = 0">自定义数据库</el-button>
        <div v-if="isCustom === 1" class="database-wrap">
          <el-select v-model="database" placeholder="请选择">
            <el-option v-for="(item, index) in databaseList" :key="index" :value="item"/>
          </el-select>
          <p class="way">
            选择备份方式：
            <el-radio v-model="backupType" :label="1">本地备份</el-radio>
          </p>
          <el-button type="primary" @click="dataBackHandle">开始备份</el-button>
        </div>

        <!-- 自定义数据库 -->
        <el-form
          v-if="isCustom === 0"
          ref="databaseForm"
          :model="customDatabase"
          :rules="databaseRules"
          status-icon
          class="custom1"
        >
          <el-form-item prop="host">
            <el-input v-model="customDatabase.host" autocomplete="off" placeholder="请输入数据库地址"/>
          </el-form-item>
          <el-form-item prop="port">
            <el-input
              v-model.number="customDatabase.port"
              autocomplete="off"
              placeholder="请输入数据库端口号"
            />
          </el-form-item>
          <el-form-item prop="databaseName">
            <el-input
              v-model="customDatabase.databaseName"
              autocomplete="off"
              placeholder="请输入数据库名称"
            />
          </el-form-item>
          <el-form-item prop="DBUsername">
            <el-input
              v-model="customDatabase.DBUsername"
              autocomplete="off"
              placeholder="请输入数据库用户名"
            />
          </el-form-item>
          <el-form-item prop="DBPassword">
            <el-input
              v-model="customDatabase.DBPassword"
              type="password"
              autocomplete="off"
              placeholder="请输入数据库密码"
            />
          </el-form-item>
          <el-button type="primary" @click="submitForm">开始备份</el-button>
        </el-form>

        <div v-if="isBackSuccess" class="back-success">备份成功！文件路径：{{ sql }}</div>
        <div class="explain">
          <p>备份说明:</p>
          <p>1、本地备份将只备份SQL，并被备份到同级目录下</p>
          <p>2、云端备份数据将备份到云端，在个人中心可以查看备份记录，下载备份数据</p>
        </div>
      </div>
    </div>

    <!-- 登录悟空弹窗 -->
    <el-dialog :visible.sync="dialogVisible" title="登录悟空账号" width="500px">
      <div slot="title" class="el-dialog__title">
        登录悟空账号
        <p class="description">您可以登录悟空账号来进行一键升级</p>
      </div>
      <!-- 登录表单 -->
      <el-form
        ref="loginRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        label-position="top"
        class="login-form"
      >
        <div class="form-item">
          <el-form-item prop="username">
            <i class="wk wk-mobile"/>账号
            <el-input v-model="loginForm.username" placeholder="请输入您的悟空账号"/>
          </el-form-item>
        </div>
        <div class="form-item password">
          <el-form-item prop="password">
            <i class="wk wk-lock"/>密码
            <el-input v-model="loginForm.password" type="password" placeholder="请输入您的悟空账号的密码"/>
          </el-form-item>
        </div>
        <el-button type="primary" @click="loginHandle('loginRef')">确认登录</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import Lockr from 'lockr'
import {
  crmCheckVersionAPI,
  crmQueryDatabaseAPI,
  crmBackupDatabaseAPI,
  crmUpdateAPI,
  updateProgressAPI,
  loginWKAPI
} from '@/api/admin/update'

import Reminder from '@/components/Reminder'

export default {
  /** 系统升级 */
  name: 'Update',
  components: {
    Reminder
  },
  data() {
    var checkPort = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入数据库端口号'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (value > 65535 || value <= 0) {
            callback(new Error('请输入0~65535之间的端口号'))
          } else {
            callback()
          }
        }
      }, 1000)
    }
    return {
      isClick: false,
      isCanUpdate: false,
      isLogin: false, // 是否登录悟空账号
      dialogVisible: false, // 登录弹窗
      dialogVisibleH: false, // 历史备份弹窗
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入悟空账号', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      userData: {},
      isCheckUpdate: false, // 是否检查更新过
      isNewest: false, // 是否是最新版本
      checkLoading: false, // 检查更新loading
      version: '', // 最新版本
      serverVersion: '', // 服务器版本
      isCustom: -1, // 0: 自定义数据库 1:选择数据库
      backupType: 1, // 备份方式 1:本地 2:云端
      databaseList: [], // 数据库列表
      database: '', // 选中的数据库
      databaseRules: {
        host: [
          { required: true, message: '请输入数据库地址', trigger: 'blur' }
        ],
        port: [{ validator: checkPort, trigger: 'blur' }],
        databaseName: [
          { required: true, message: '请输入数据库名称', trigger: 'blur' }
        ],
        DBUsername: [
          { required: true, message: '请输入数据库账号', trigger: 'blur' }
        ],
        DBPassword: [
          { required: true, message: '请输入数据库密码', trigger: 'blur' }
        ]
      },
      customDatabase: {
        // 自定义数据库
        host: '', // 地址
        port: '', // 端口号
        databaseName: '', // 数据库名称
        DBUsername: '', // 数据库账号
        DBPassword: '' // 数据库密码
      },
      backLoading: false, // 数据库备份loading
      isBackSuccess: false,
      sql: '', // 数据库备份文件保存路径
      backType: 1, // 数据备份方式 1:本地 2:云端
      updateLoading: false,
      progressTooltip: '',
      progress: 0 // 进度
    }
  },

  created() {
    const _this = this
    async function decorator() {
      var { data } = await crmCheckVersionAPI()
      _this.checkIsNewest(data.version, data.serverVersion)

      _this.checkLoading = false

      _this.version = data.version
      _this.serverVersion = data.serverVersion

      _this.isCheckUpdate = true
    }
    decorator()
  },

  methods: {
    loginHandle(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var param = {
            username: this.loginForm.username,
            password: this.loginForm.password
          }
          loginWKAPI(param).then(res => {
            var { data } = res
            if (res.code === 0) {
              this.userData = data
              this.dialogVisible = false
              this.isLogin = true
              Object.assign(this.userData, this.loginForm)
            }
          }).catch(() => {
          })
        } else {
          return false
        }
      })
    },

    logoutHandle() {
      this.isLogin = false
      this.loginForm.username = ''
      this.loginForm.password = ''
    },

    async checkHandle() {
      this.checkLoading = true
      var { data } = await crmCheckVersionAPI()

      this.isNewest = this.checkIsNewest(data.version, data.serverVersion)
      this.checkLoading = false

      this.version = data.version
      this.serverVersion = data.serverVersion

      this.isCheckUpdate = true
      this.isClick = true
    },

    checkIsNewest(a, b) {
      var a = toNum(a)
      var b = toNum(b)

      if (a > b) {
        return false
      } else {
        return true
      }

      function toNum(a) {
        var a = a.toString()
        var c = a.split('.')
        var num_place = ['', '0', '00', '000', '0000']
        var r = num_place.reverse()
        for (var i = 0; i < c.length; i++) {
          var len = c[i].length
          c[i] = r[len] + c[i]
        }
        var res = c.join('')
        return res
      }
    },

    async queryDatabaseHandle() {
      this.isCustom = 1
      var res = await crmQueryDatabaseAPI()
      this.databaseList = res.data
      this.isShowDatabase = res.code === 0
    },

    submitForm() {
      this.$refs.databaseForm.validate((valid) => {
        if (valid) {
          this.dataBackHandle()
        } else {
          return false
        }
      })
    },

    async dataBackHandle() {
      if (!this.isLogin) {
        this.$message({
          showClose: true,
          message: '请登陆悟空账号',
          type: 'warning'
        })
        return
      }

      if (this.isCustom && !this.database) {
        this.$message({
          showClose: true,
          message: '请选择要备份的数据库',
          type: 'warning'
        })
        return
      }


      this.backLoading = true
      var data = this.isCustom
        ? {
          backupType: this.backupType,
          databaseName: this.database,
          username: this.loginForm.username,
          password: this.loginForm.password,
          isCustom: this.isCustom
        }
        : Object.assign(this.customDatabase, this.loginForm)
      var res = await crmBackupDatabaseAPI(data)

      this.backLoading = false
      if (res.code === 0) {
        this.isBackSuccess = true
        this.sql = res.data
        this.isCanUpdate = true
      }
    },

    async updateHandle() {
      if (!this.isLogin) {
        this.$message({
          message: '未进行登陆',
          type: 'warning'
        })
        return
      }
      if (!this.isBackSuccess) {
        this.$message({
          message: '未进行数据备份',
          type: 'warning'
        })
        return
      }

      this.updateLoading = true
      var data = this.isCustom
        ? {
          backupType: this.backupType,
          databaseName: this.database,
          username: this.loginForm.username,
          password: this.loginForm.password,
          isCustom: this.isCustom
        }
        : Object.assign(this.customDatabase, this.loginForm)
      var res = await crmUpdateAPI(data)
      if (res.code === 0) {
        this.progressTooltip = '更新准备中'
        var _this = this
        var timer = setInterval(function() {
          fn()
          async function fn() {
            var res = await updateProgressAPI()
            switch (res.data) {
              case 5:
                _this.progressTooltip = '获取更新信息中'
                break
              case 15:
                _this.progressTooltip = '备份数据库中'
                break
              case 25:
                _this.progressTooltip = '备份文件中'
                break
              case 50:
                _this.progressTooltip = '停止受影响的服务中'
                break
              case 70:
                _this.progressTooltip = '执行升级中'
                break
              case 100:
                _this.progressTooltip = '升级已完成'
                setTimeout(function() {
                  _this.updateLoading = false
                  _this.isNewest = true
                }, 500)
                clearInterval(timer)
                break
              default:
                _this.progressTooltip = '升级已完成'
                setTimeout(function() {
                  _this.updateLoading = false
                  _this.isNewest = true
                }, 500)
                clearInterval(timer)
                break
            }
          }
        }, 3000)
      }
    },

    // 更改每页展示数量
    handleSizeChange(val) {
      Lockr.set('crmPageSizes', val)
      this.pageSize = val
    },
    // 更改当前页数
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/table.scss";
$linkColor: #3b6ff1;

// 公共
.text {
  font-size: 18px;
  font-weight: bold;
  height: 38px;
  line-height: 38px;
  color: #000;
}
.link {
  color: $linkColor;
  cursor: pointer;
}

.crm-update {
  width: 100%;
  min-width: 1200px;
  height: 100%;
  padding: 15px 20px 20px;
  background: #fff;
  overflow: auto;
}

// 标题
.title-wrap {
  display: flex;
  padding: 0 15px;

  .el-icon-setting {
    width: 30px;
    height: 30px;
    margin-right: 12px;
    border-radius: 6px;
    line-height: 30px;
    text-align: center;
    background: #2362fb;
    color: #fff;
    font-size: 18px;
  }
  .title {
    font-size: 16px;
    font-weight: bold;
  }
  .description {
    height: 22px;
    line-height: 22px;
    color: #a2a2a2;
    font-size: 13px;
  }
}

.login-wrap {
  display: flex;
  height: 40px;
  align-items: center;
  .face {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
    }
  }
  .name {
    margin: 0 8px;
  }
  .phone {
    margin-right: 8px;
  }
}

// 未登录，警告框
.warning-box {
  margin-top: 10px;
  margin-bottom: 10px;
}


// 登录展示
.login-box {
  width: 600px;
  background: #f8f8f8;
  padding: 22px;
  display: flex;
  border-radius: 6px;
  justify-content: space-between;
  .face {
    width: 40px;
    height: 40px;
    margin-right: 14px;
    border-radius: 50%;
    overflow: hidden;
    line-height: 40px;
    background: #2362fb;
    font-size: 12px;
    color: #fff;
    text-align: center;
    flex-grow: 0;
    img {
      width: 100%;
    }
  }
  .info {
    flex-grow: 1;
    color: #a2a2a2;
    font-size: 12px;
    line-height: 20px;
  }
  .name {
    height: 22px;
    line-height: 22px;
    font-weight: bold;
    font-size: 16px;
    color: #000;
    margin-right: 10px;
  }

  .login-box-title {
    height: 22px;
    line-height: 22px;
    font-weight: bold;
    font-size: 16px;
    color: #333;
    cursor: pointer;
    p {
      height: 28px;
      font-size: 14px;
      color: #a2a2a2;
      line-height: 28px;
      font-weight: normal;
    }
  }
  .el-button {
    height: 31px;
  }
}

// 检查更新
.last-time {
  margin: 16px 0;
  padding: 16px 0;
}

.version {
  a {
    color: $linkColor;
  }
  button {
    display: block;
  }
}

// 数据备份
.data-back {
  margin-top: 40px;
  .link {
    margin-left: 20px;
  }
}

.box {
  width: 820px;
  // border: 1px solid #000;
  border-radius: 6px;
  padding: 14px;
  margin-top: 20px;
  background: #fafafa;
  .database-wrap {
    margin-top: 20px;
  }
  .way {
    margin: 14px 0;
    // margin-bottom: 14px;
  }
  .back-success {
    color: #f56c6c;
    height: 30px;
    line-height: 30px;
    font-size: 18px;
    margin-top: 12px;
  }
  .explain {
    margin-top: 14px;
    line-height: 22px;
    font-size: 12px;
    color: #aaa;
    img {
      width: 16px;
      vertical-align: middle;
    }
  }
}

// 数据库选择
.custom {
  width: 200px;
  p {
    width: 200px;
    margin: 14px 0;
  }
}
.custom1 {
  width: 200px;
  margin-top: 14px;
  .el-button {
  }
}

// dialog
.el-dialog__wrapper {
  /deep/ .el-dialog {
    padding-left: 25px;
    padding-right: 25px;
    border-radius: 6px;
    .el-dialog__title {
      .description {
        font-size: 14px;
        color: #a2a2a2;
        font-weight: normal;
      }
    }
  }
}

// 登陆表单
.login-form {
  .el-button {
    width: 100%;
    font-size: 16px;
    height: 45px;
  }
}
.form-item {
  &.password {
    margin-top: 28px;
  }
  p {
    margin-bottom: 8px;
  }
  .el-input {
    /deep/ input {
      height: 47px;
      background: #f8f8f8;
    }
  }
}

.forget {
  height: 40px;
  line-height: 40px;
  text-align: right;
  color: #2362fb;
}
.register {
  margin-top: 20px;
  text-align: center;
  color: #2362fb;
  font-size: 16px;
}

.time {
  display: flex;
  .el-input {
    width: 246px;
    margin-left: 108px;
  }
}

// 分页
.p-contianer {
  margin-top: 30px;
  border-top: none;
  .p-bar {
    margin-right: 0;
  }
}

// 标记
.update-wrap{
  // margin-top: 10px;
  // margin-right: 40px;
  margin-top: 20px;
}
</style>
