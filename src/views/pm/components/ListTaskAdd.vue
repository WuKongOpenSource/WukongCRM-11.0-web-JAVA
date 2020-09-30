<template>
  <div v-loading="sendLoading" class="list-task-add">
    <el-input
      :rows="2"
      :maxlength="100"
      v-model="sendContent"
      type="textarea"
      placeholder="请输入内容" />
    <flexbox
      v-if="canSetTime || canSetMainUser"
      class="add-info"
      justify="flex-end">
      <el-date-picker
        v-if="canSetTime"
        ref="endTime"
        :class="{ 'no-time-top': !sendStopTime }"
        v-model="sendStopTime"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="" />
      <xh-user-cell
        v-if="canSetMainUser"
        ref="userCell"
        :value="mainUser"
        :info-request="ownerListRequest"
        :info-params="ownerListParams"
        :disabled="!canSetMainUser"
        placement="top"
        @value-change="selectMainUser">
        <div
          slot="reference"
          class="select-user">
          <i
            v-if="!createMainUser"
            class="wk wk-persons add-info--person" />
          <xr-avatar
            v-else
            :name="createMainUser.realname"
            :size="24"
            :src="createMainUser.img"
            class="user-img" />
        </div>

      </xh-user-cell>
    </flexbox>
    <div class="btn-box">
      <el-button
        v-debounce="send"
        size="mini"
        type="primary">确定</el-button>
      <el-button
        size="mini"
        @click="close">取消</el-button>
    </div>
  </div>
</template>

<script>
import { workWorkOwnerListAPI } from '@/api/pm/project'
import { XhUserCell } from '@/components/CreateCom'
import { workTaskSaveAPI } from '@/api/pm/projectTask'

export default {
  // 项目列底部任务快捷添加
  name: 'ListTaskAdd',
  components: {
    XhUserCell
  },
  props: {
    workId: [String, Number],
    userId: [String, Number],
    classId: [String, Number],
    isTop: [String, Number],
    // 项目权限
    permission: {
      type: Object,
      default: () => {
        return {
        }
      }
    }
  },
  data() {
    return {
      // 添加
      sendLoading: false,
      sendContent: '',
      sendStopTime: '',
      mainUser: []
    }
  },
  computed: {
    /**
     * 负责人
     */
    createMainUser() {
      return this.mainUser.length ? this.mainUser[0] : null
    },

    ownerListRequest() {
      return this.workId ? workWorkOwnerListAPI : null
    },

    ownerListParams() {
      return this.workId ? { workId: this.workId } : null
    },

    // 是否能分配负责人
    canSetMainUser() {
      if (!this.workId) {
        return true
      }
      // 负责人视图下会有userId 着不展示负责人选择
      return this.permission && this.permission.setTaskMainUser && !this.userId
    },

    // 是否能设置时间
    canSetTime() {
      if (!this.workId) {
        return true
      }
      return this.permission && this.permission.setTaskTime
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    /**
     * 选择负责人
     */
    selectMainUser(data) {
      this.mainUser = data.value
    },

    /**
     * 创建任务
     */
    send() {
      if (!this.sendContent.length) {
        this.$message.error('请填写任务标题')
      } else {
        this.sendLoading = true
        const params = {
          name: this.sendContent,
          stopTime: this.sendStopTime
        }
        if (this.userId) {
          params.mainUserId = this.userId
        } else {
          params.mainUserId = this.createMainUser ? this.createMainUser.userId : ''
        }
        if (this.workId) {
          params.workId = this.workId
        }
        if (this.classId) {
          params.classId = this.classId
        }
        if (this.isTop) {
          params.isTop = this.isTop
        }

        workTaskSaveAPI(params)
          .then(res => {
            this.sendLoading = false
            this.$message.success('新建成功')
            this.resetSendData()
            this.$emit('send')
          })
          .catch(() => {
            this.sendLoading = false
          })
      }
    },

    resetSendData() {
      this.sendContent = ''
      this.sendStopTime = ''
      this.mainUser = []
    },

    /**
     * 关闭
     */
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.list-task-add {
  padding: 10px 10px 0;
  .btn-box {
    text-align: right;
  }
  .el-textarea /deep/ .el-textarea__inner {
    resize: none;
  }
}

.add-info {
  padding: 0 8px;
  margin: 8px 0;
  .el-date-editor {
    width: 110px;
    font-size: 12px;
    margin-right: 8px;
    /deep/ .el-input__prefix {
      left: 0;
      .el-icon-date {
        width: 24px;
        line-height: 24px;
      }
    }

    /deep/ .el-input__suffix {
      top: -4px;
    }

    /deep/ .el-input__inner {
      border-radius: 12px;
      line-height: 24px;
      height: 24px;
      padding-left: 20px;
      padding-right: 5px;
      border: none;
      background-color: #f0f0f0;
    }
  }

  &--person {
    margin-left: 5px;
    border: 1px solid #e6e6e6;
    color: #c0c4cc;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    display: inline-block;
    text-align: center;
    line-height: 24px;
    font-size: 12px;
    cursor: pointer;
  }

  &--person:hover {
    border-color: $xr-color-primary;
    color: $xr-color-primary;
  }

  .no-time-top {
    width: 24px;
    cursor: pointer;
    /deep/ .el-input__inner {
      background-color: white;
      border: 1px solid $xr-border-line-color;
      padding: 0;
      line-height: 24px;
      height: 24px;
    }
  }

  .no-time-top:hover {
    /deep/ .el-input__inner {
      border-color: $xr-color-primary;
    }

    /deep/ .el-icon-date {
      color: $xr-color-primary;
    }
  }
}

// 选择负责人
.select-user {
  display: inline-block;
}
</style>
