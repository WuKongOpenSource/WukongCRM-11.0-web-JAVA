<template>
  <div
    v-loading="sendLoading"
    :class="['add', { 'unfold': isUnfold, 'is-close': !isUnfold }]"
    class="task-quick-add">
    <i
      v-if="isUnfold"
      class="wk wk-close"
      @click="addClose" />
    <el-input
      ref="input"
      v-model="sendContent"
      :maxlength="100"
      :prefix-icon="isUnfold ? '' : 'el-icon-plus'"
      class="input"
      placeholder="添加任务"
      @focus="inputFocus" />

    <flexbox class="add-info">
      <el-date-picker
        ref="endTime"
        :class="{ 'no-time-top': !sendStopTime }"
        v-model="sendStopTime"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="" />
      <xh-user-cell
        :value="mainUser"
        radio
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
            :src="createMainUser.img" />
        </div>

      </xh-user-cell>
    </flexbox>

    <el-button
      v-debounce="send"
      icon="wk wk-top"
      class="send-btn"
      type="primary">发布</el-button>
  </div>
</template>

<script>
import { XhUserCell } from '@/components/CreateCom'
import { setTaskAPI } from '@/api/task/task'

export default {
  // 任务快捷添加
  name: 'TaskQuickAdd',
  components: {
    XhUserCell
  },
  props: {
    // 管理业务参数
    params: Object
  },
  data() {
    return {
      // 添加
      sendLoading: false,
      // 默认闭合
      isUnfold: false,
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
      return this.mainUser && this.mainUser.length ? this.mainUser[0] : null
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    /**
     * 任务添加
     */
    inputFocus() {
      this.$emit('focus')
      this.isUnfold = true
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },

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
        let params = {
          name: this.sendContent,
          stopTime: this.sendStopTime,
          mainUserId: this.createMainUser ? this.createMainUser.userId : ''
        }
        if (this.params) {
          params = { ...params, ...this.params }
        }
        setTaskAPI(params)
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
      this.isUnfold = false
    },

    /**
     * 关闭
     */
    addClose() {
      this.isUnfold = false
    }
  }
}
</script>

<style lang="scss" scoped>
// 添加
.add {
  position: relative;
  background-color: white;
  border-radius: $xr-border-radius-base;
  border: 1px solid $xr-border-line-color;
  padding: 5px;

  .input {
    width: calc(100% - 50px);

    /deep/.el-input__inner {
      border: none;
    }
  }

  .add-info {
    padding: 0 8px;
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
}

.add.is-close {
  .add-info {
    display: none;
  }
}

// 闭合
.add.is-close:hover {
  cursor: pointer;
  border-color: #c0c4cc;
  .input {
    /deep/ .el-icon-plus {
      color: $xr-color-primary;
    }
  }
}

// 展开
.add.unfold {
  .input {
    margin-bottom: 15px;
  }
}

.send-btn {
  position: absolute;
  z-index: 1;
  right: 10px;
  bottom: 5px;

  /deep/ i {
    font-size: 13px;
    margin-right: 5px;
  }
}

// 选择负责人
.select-user {
  display: inline-block;
}

// 关闭按钮
.wk-close {
  border: 0;
  color: #d9d9d9;
  font-size: 22px;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  padding: 4px;
  transform: scale(0.8);
}

.wk-close:hover {
  color: #2362fb;
}
</style>
