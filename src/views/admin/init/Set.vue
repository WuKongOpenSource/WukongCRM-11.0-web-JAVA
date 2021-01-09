<template>
  <div v-loading="loading" class="init-set">
    <xr-header
      icon-class="wk wk-results-solid"
      icon-color="#2362FB" >
      <template slot="label">初始化数据<span class="label-des">（试用悟空CRM后需要删除测试数据，正式管理企业信息）</span></template>
    </xr-header>
    <div class="init-set__body">
      <reminder
        :content="`提示：1、可以对单个应用或多个应用初始化，应用下的数据将全部删除；<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2、注意初始化单个应用后，将影响其他应用下与此应用关联的数据；<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style='color: red;'>初始化的数据不可恢复，请谨慎操作！</span>`"
        class="xr-reminder"/>
      <div class="init__label">初始化应用</div>
      <div class="init__body">
        <el-select v-model="value" multiple>
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
        <el-button :disabled="value.length == 0" type="primary" @click="saveClick">确定初始化</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  adminConfigVerifyPasswordAPI,
  adminConfigModuleInitDataAPI
} from '@/api/admin/init'

import Reminder from '@/components/Reminder'
import XrHeader from '@/components/XrHeader'

export default {
  // 初始化设置页面
  name: 'InitSet',
  components: {
    Reminder,
    XrHeader
  },
  data() {
    return {
      loading: false,
      value: [],
      optionsObj: {},
      options: [{
        value: 'all',
        label: '全部应用'
      }, {
        value: 'crm',
        label: '客户管理'
      }, {
        value: 'taskExamine',
        label: '任务/审批'
      }, {
        value: 'log',
        label: '日志'
      }, {
        value: 'project',
        label: '项目管理'
      }, {
        value: 'calendar',
        label: '日历'
      }
      ]
    }
  },
  computed: {},
  watch: {
    value(newVal, oldVal) {
      if (newVal.includes('all') && !oldVal.includes('all')) {
        this.value = this.options.map(item => item.value)
      } else if (!newVal.includes('all') && oldVal.includes('all') && oldVal.length === this.options.length) {
        this.value = []
      } else {
        if (!newVal.includes('all') && newVal.length === this.options.length - 1) {
          this.value = this.options.map(item => item.value)
        } else if (newVal.includes('all') && newVal.length === this.options.length - 1) {
          this.value = newVal.filter(item => item !== 'all')
        }
      }
    }
  },
  created() {
    this.options.forEach(item => {
      this.optionsObj[item.value] = item.label
    })
  },
  methods: {

    /**
     * 保存
     */
    saveClick() {
      this.$prompt('初始化数据需验证登录密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPlaceholder: '请输入密码',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.loading = true
        adminConfigVerifyPasswordAPI({
          password: value
        })
          .then(res => {
            this.loading = false
            const modules = this.value.filter(item => item != 'all')
            const modulesName = modules.map(item => `【${this.optionsObj[item]}】`).join('、')
            this.$confirm(`确定初始化应用${modulesName}吗？<br/>数据将永久删除，不可恢复！`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              dangerouslyUseHTMLString: true,
              type: 'warning'
            }).then(() => {
              this.loading = true
              adminConfigModuleInitDataAPI({
                password: value,
                temporaryCode: res.data,
                modules
              })
                .then(() => {
                  this.loading = false
                  this.value = []
                  this.$message({
                    type: 'success',
                    message: '操作成功'
                  })
                  setTimeout(() => {
                    window.location.reload()
                  }, 1500)
                })
                .catch(() => {
                  this.loading = false
                })
            }).catch(() => {})
          })
          .catch(() => {
            this.loading = false
          })
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.init-set {
  height:100%;

  /deep/ .xr-header {
    padding: 15px 30px;
  }

  &__body {
    height: calc(100% - 60px);
    padding: 10px 20px;
    background-color: white;
    border-top: 1px solid $xr-border-line-color;
    border-bottom: 1px solid $xr-border-line-color;
  }
}

.label-des {
  font-weight: normal;
  color: $xr-color-text-placeholder;
  font-size: 13px;
}

.init {
  &__label {
    margin: 30px 0 20px;
    font-weight: bold;
  }

  &__body {
    .el-select {
      width: 300px;
    }
  }
}

.xr-reminder {
  width: auto;
}
</style>
