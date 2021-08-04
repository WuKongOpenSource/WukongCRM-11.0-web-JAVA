<template>
  <employee-fields-set
    v-if="isSet"
    :entry-status="entryStatus"
    @back="backMain"/>
  <div v-else>
    <div class="content-title">
      <span>新建员工字段设置</span>
    </div>
    <div
      class="content-body">
      <el-card class="el-title-card" @click.native="enterSet(1)">
        <div slot="header">
          <span>新建在职员工</span>
        </div>
        <div >
          设置【新建在职员工】时可填写的员工信息字段
        </div>
      </el-card>

      <el-card class="el-title-card" @click.native="enterSet(2)">
        <div slot="header">
          <span>新建待入职员工</span>
        </div>
        <div >
          设置【新建待入职员工】时可填写的员工信息字段
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import EmployeeFieldsSet from './EmployeeFieldsSet' // 员工档案设置

export default {
  // 新建员工字段设置
  name: 'EmployeeFields',

  components: {
    EmployeeFieldsSet
  },

  data() {
    return {
      loading: false, // 展示加载中效果
      list: [],
      isSet: false,
      entryStatus: 1 // 入职状态 1 在职 2 待入职
    }
  },

  computed: {
  },

  created() {
    const { entryStatus } = this.$route.query
    if (entryStatus) {
      this.enterSet(entryStatus)
    }
  },

  methods: {
    /**
     * 进入配置
     */
    enterSet(entryStatus) {
      this.entryStatus = entryStatus
      this.isSet = true
    },

    /**
     * 返回主页面
     */
    backMain() {
      this.isSet = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.el-title-card {
  display: inline-block;
  width: 250px;
  cursor: pointer;
  .el-card__header {
    padding: 12px 0px;
    font-weight: bold;
    margin: 0 15px;
  }
  .el-card__body {
    color: #999;
  }
}
</style>
<style rel="stylesheet/scss" lang="scss" scoped>
.content-title {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.content-title > span {
  display: inline-block;
  height: 36px;
  line-height: 36px;
  margin-left: 20px;
}

.content-body {
  height: calc(100% - 57px);
  padding: 30px;
  overflow-y: auto;
  .el-title-card + .el-title-card {
    margin-left: 15px;
  }
}
</style>
