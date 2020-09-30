<template>
  <div class="task-sub">
    <div
      v-clickoutside="subtasksSubmit"
      class="subtasks-content">
      <div class="checkbox-box subtasks-box">
        <el-checkbox
          v-model="checkboxData"
          disabled/>
      </div>
      <div class="subtasks-content-box">
        <el-input
          :maxlength="50"
          v-model="subtasksTextarea"
          type="textarea"
          autosize
          placeholder="请输入内容"
          @keyup.enter.native="subtasksSubmit"/>
      </div>
      <flexbox class="subtasks-content-png">
        <div class="time">
          <el-date-picker
            ref="subtasksDate"
            v-model="subtasksDate"
            :style="{'width': subtasksDate ? '54px': '28px'}"
            type="date"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"/>
          <span
            v-if="subtasksDate"
            class="bg-color">{{ subtasksDate | moment("YYYY-MM-DD") }}</span>
          <i
            v-else
            class="wukong wukong-time-task"
            @click="subtasksDateFun"/>
        </div>
        <!-- 选择负责人 -->
        <el-popover
          v-model="showUserPopover"
          placement="bottom-end"
          width="280"
          popper-class="no-padding-popover"
          trigger="click">
          <xh-user
            ref="xhuser"
            :info-request="ownerListRequest"
            :info-params="ownerListParams"
            :selected-data="xhUserData"
            radio
            @changeCheckout="xhUserCheckout"/>
          <div
            slot="reference"
            class="select-box">
            <template v-if="xhUserData && xhUserData.length">
              <span
                v-for="(item, index) in xhUserData"
                :key="index">
                <el-tooltip
                  placement="bottom"
                  effect="light"
                  popper-class="tooltip-change-border">
                  <div slot="content">
                    <span @click="showUserPopover = true">{{ item.realname }}</span>
                  </div>
                  <xr-avatar
                    :name="item.realname"
                    :size="24"
                    :src="item.img" />
                </el-tooltip>
              </span>
            </template>
            <i
              v-else
              class="wukong wukong-user"/>
          </div>
        </el-popover>
      </flexbox>
    </div>
  </div>
</template>

<script>
import { workSubTaskAddAPI, workSubTaskUpdateAPI } from '@/api/pm/projectTask'
import XhUser from '@/components/CreateCom/XhUser'
import { workWorkOwnerListAPI } from '@/api/pm/project'

import { mapGetters } from 'vuex'

export default {
  components: {
    XhUser
  },
  props: {
    taskData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 子任务输入内容
    text: String,
    time: [String, Number],
    subData: Object,
    subTaskCom: {
      type: String,
      default: ''
    },
    taskId: [Number, String],
    checkboxData: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 子任务选择时间
      subtasksDate: '',
      // 子任务数据
      xhUserData: [],
      // 子任务人员
      isRequesting: false, // 是请求中
      subtasksTextarea: '',
      showUserPopover: false
    }
  },
  computed: {
    ownerListRequest() {
      return this.workId ? workWorkOwnerListAPI : null
    },

    ownerListParams() {
      return this.workId ? { workId: this.workId } : null
    },

    workId() {
      return this.taskData.workId
    },

    isChangeUser() {
      const oldUserData = this.subData.mainUser ? [this.subData.mainUser] : []
      if (this.xhUserData.length != oldUserData.length) {
        return true
      }

      if (this.xhUserData.length) {
        if (this.xhUserData[0].userId != this.subData.mainUser.userId) {
          return true
        }
      }

      return false
    },

    ...mapGetters([
      'userInfo'
    ])
  },
  watch: {},
  created() {
    if (this.subTaskCom == 'edit') {
      this.subtasksTextarea = this.text ? this.text : ''
      this.subtasksDate = this.time
      if (JSON.stringify(this.subData) !== '{}') {
        if (this.subData.mainUser) {
          this.xhUserData = [this.subData.mainUser]
        }
      } else {
        this.xhUserData = []
      }
    }
  },
  methods: {
    subtasksSubmit(event) {
      this.subtasksTextarea = this.subtasksTextarea.split(/[\n]/).join('')
      if (this.subtasksTextarea && !this.isRequesting) {
        this.isRequesting = true
        if (this.subTaskCom == 'new') {
          // this.$emit('on-handle', { type: 'add', result: 'success' })
          workSubTaskAddAPI({
            pid: this.taskData.taskId,
            name: this.subtasksTextarea,
            stopTime: this.subtasksDate,
            mainUserId:
              this.xhUserData.length != 0 ? this.xhUserData[0].userId : ''
          })
            .then(res => {
              this.taskData.childTask.push({
                name: this.subtasksTextarea,
                stopTime: this.subtasksDate,
                taskId: res.data.taskId,
                mainUser: this.xhUserData.length > 0 ? this.xhUserData[0] : this.userInfo
              })
              this.$message.success('子任务创建成功')
              // 创建成功 -- 清除选择
              this.subtasksTextarea = ''
              this.subtasksDate = ''
              this.isRequesting = false
              this.$emit('on-handle', { type: 'add', result: 'success' })
            })
            .catch(() => {
              this.$emit('on-handle', { type: 'add', result: 'error' })
              this.$message.error('子任务创建失败')
              this.isRequesting = true
            })
        } else if (this.subTaskCom == 'edit') {
          if (
            this.isChangeUser == 1 ||
            this.text != this.subtasksTextarea ||
            this.subtasksDate != this.time
          ) {
            // this.$emit('on-handle', { type: 'edit', result: 'success' })
            workSubTaskUpdateAPI({
              taskId: this.taskId,
              stopTime: this.subtasksDate,
              mainUserId:
                this.xhUserData.length > 0 ? this.xhUserData[0].userId : '',
              name: this.subtasksTextarea
            })
              .then(res => {
                const dataList = this.taskData.childTask
                for (const i in dataList) {
                  if (dataList[i].taskId == this.taskId) {
                    const list = dataList[i]
                    list.name = this.subtasksTextarea
                    list.stopTime = this.subtasksDate
                    list.mainUser =
                      this.xhUserData.length > 0 ? this.xhUserData[0] : null
                    dataList.splice(i, 1, list)
                    break
                  }
                }
                this.isRequesting = false
                this.$emit('on-handle', { type: 'edit', result: 'success' })
                this.$message.success('子任务编辑成功')
              })
              .catch(() => {
                this.$emit('on-handle', { type: 'edit', result: 'error' })
                this.$message.error('子任务编辑失败')
                this.isRequesting = false
              })
          } else {
            this.$emit('on-handle', { type: 'cancel' })
          }
        }
      } else {
        this.$emit('on-handle', { type: 'cancel' })
      }
    },
    xhUserCheckout(data) {
      this.xhUserData = data
      this.showUserPopover = false
    },
    // 子任务 -- 时间弹框
    subtasksDateFun() {
      this.$refs.subtasksDate.change()
    }
  }
}
</script>

<style scoped lang="scss">
.wukong {
  color: #666;
}
.subtasks-content {
  border: 1px solid #2362FB;
  border-radius: 3px;
  display: flex;
  flex-direction: row;
  align-items: center;
  // margin-top: 10px;
  height: 40px;
  .subtasks-box {
    line-height: 40px;
  }
  .subtasks-content-box {
    flex: 1;
    .el-textarea /deep/ .el-textarea__inner {
      border-width: 0;
      resize: none;
    }
  }
  .subtasks-content-png {
    width: auto;
    img {
      margin-right: 10px;
      cursor: pointer;
      vertical-align: middle;
    }
    .time {
      display: inline-block;
      position: relative;
      vertical-align: middle;
      .el-date-editor {
        position: absolute;
        right: 0;
        width: 28px;
        opacity: 0;
        bottom: 0;
        top: 0;
      }
      .el-date-editor /deep/ .el-input__inner {
        padding: 0;
        height: 100%;
      }
      .el-date-editor /deep/ .el-input__suffix {
        display: none;
      }
      .el-date-editor /deep/ .el-input__prefix {
        left: 0;
        right: 0;
      }
      .bg-color {
        padding: 2px 10px;
      }
      .wukong-time-task {
        margin-right: 10px;
        cursor: pointer;
        vertical-align: middle;
      }
    }
    .select-box {
      display: inline-block;
      .wukong-user {
        margin-right: 10px;
        cursor: pointer;
        vertical-align: middle;
      }
    }
  }
  .checkbox-box {
    margin-left: 10px;
  }
  .subtask-popover-span {
    padding: 0 10px 0 5px;
  }
}
</style>
