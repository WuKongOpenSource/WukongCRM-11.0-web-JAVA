<template>
  <div class="main">
    <task-tabs-head
      :tabs="tabs"
      :title="title"
      :select-value.sync="tabsSelectValue"
      @change="tabsChange"
      @export="exportClick" />

    <div
      class="content-wrapper"
      direction="column"
      align="stretch">
      <flexbox
        justify="space-around"
        class="content-wrapper__hd">
        <flexbox>
          <xr-avatar
            v-if="taskType == 1"
            :name="userInfo.realname"
            :size="40"
            :src="userInfo.img"
            class="head-img" />
          <i
            v-else
            class="wk wk-multi-user user-icon head-img" />
          <el-progress
            :percentage="progressValue"
            :format="progressFormat" />
        </flexbox>
        <flexbox class="header-right" justify="flex-end">
          <el-input
            v-model="search"
            placeholder="请输入任务名称"
            prefix-icon="el-icon-search"
            @input="debouncedRefreshList"/>
          <el-popover
            v-model="taskFilterShow"
            popper-class="no-padding-popover"
            placement="bottom"
            width="300"
            trigger="click">
            <task-filter
              v-if="taskFilterShow"
              :due-date="dueDate"
              :priority="priority"
              :done="showDone"
              :users="userList"
              @close="taskFilterShow = false"
              @save="taskFilterSave"
            />
            <el-button
              slot="reference"
              icon="wk wk-screening"
              @click="taskFilterShow = true">筛选</el-button>
          </el-popover>

        </flexbox>
      </flexbox>

      <div class="cell-section">
        <div
          v-infinite-scroll="getList"
          :key="`${scrollKey}${tabsSelectValue}`"
          infinite-scroll-distance="100"
          infinite-scroll-disabled="scrollDisabled">
          <task-cell
            v-for="(item, index) in list"
            :key="index"
            :data="item"
            :data-index="index"
            @on-handle="taskCellHandle" />
        </div>
        <p
          v-if="loading"
          class="scroll-bottom-tips">加载中...</p>
        <p
          v-if="noMore"
          class="scroll-bottom-tips">没有更多了</p>
      </div>

      <div class="task-add">
        <task-quick-add @send="refreshList" />
      </div>

    </div>



    <task-detail
      v-if="taskDetailShow"
      ref="particulars"
      :id="taskID"
      :detail-index="detailIndex"
      :no-listener-class="['task-cell']"
      @on-handle="detailHandle"
      @close="taskDetailShow = false" />
  </div>
</template>

<script>
import { taskListAPI, taskOaExportAPI } from '@/api/task/task'

import TaskTabsHead from './components/TaskTabsHead'
import TaskCell from './components/TaskCell'
import TaskDetail from './components/TaskDetail'
import TaskQuickAdd from './components/TaskQuickAdd'
import TaskFilter from './components/TaskFilter'

import { mapGetters } from 'vuex'
import { downloadExcelWithResData } from '@/utils'
import { debounce } from 'throttle-debounce'

export default {
  /** 任务列表 */
  name: 'Index',
  components: {
    TaskTabsHead,
    TaskCell,
    TaskDetail,
    TaskQuickAdd,
    TaskFilter
  },
  props: {},
  data() {
    return {
      tabsSelectValue: '0',
      // 任务类型 区分我的任务和下属任务
      taskType: '',
      list: [],
      loading: false,
      noMore: false,
      scrollKey: Date.now(),
      page: 1,
      dueDate: '',
      search: '',
      priority: '',
      showDone: true,
      userList: [],
      taskFilterShow: false,
      // 任务总进程
      progress: {
        stopTask: 0,
        // 总数量
        allTask: 0
      },

      // 跟多操作
      moreTypes: [
        {
          type: 'show/hide',
          name: '显示已完成任务/隐藏已完成任务',
          icon: 'eye'
        }
      ],

      // 详情
      // 详情数据
      taskID: '',
      detailIndex: -1,
      taskDetailShow: false
    }
  },
  computed: {
    ...mapGetters(['userInfo']),

    tabs() {
      if (this.taskType == 1) {
        return [
          {
            label: '全部',
            name: '0'
          },
          {
            label: '我负责的',
            name: '1'
          },
          {
            label: '我参与的',
            name: '3'
          }
        ]
      } else {
        return [
          {
            label: '全部',
            name: '0'
          },
          {
            label: '下属负责的',
            name: '1'
          },
          {
            label: '下属参与的',
            name: '3'
          }
        ]
      }
    },

    title() {
      return this.taskType == 1 ? '我的任务' : '下属的任务'
    },

    // 无线滚动控制
    scrollDisabled() {
      return this.loading || this.noMore
    },

    /**
     * 子任务完成进度
     */
    progressValue() {
      if (this.progress.stopTask == 0) {
        return 0
      }
      return parseInt((this.progress.stopTask / this.progress.allTask) * 100)
    }
  },
  watch: {},
  created() {
    this.debouncedRefreshList = debounce(300, this.refreshList)
  },
  mounted() {
    this.taskType = this.$route.params.type
  },
  beforeRouteUpdate(to, from, next) {
    this.taskType = to.params.type
    this.showDone = true
    this.progress = {
      stopTask: 0,
      // 总数量
      allTask: 0
    }
    this.tabsSelectValue = '0'
    this.dueDate = ''
    this.priority = ''
    this.userList = []
    this.search = ''

    this.refreshList()
    next()
  },

  beforeDestroy() {},
  methods: {
    /**
     * 总完成进度展示
     */
    progressFormat(percentage) {
      return `${this.progress.stopTask}/${this.progress.allTask}`
    },

    /**
     * 刷新列表
     */
    refreshList() {
      this.page = 1
      this.list = []
      this.noMore = false
      this.scrollKey = Date.now()
    },

    taskFilterSave(dueDate, priority, showDone, users) {
      this.priority = priority
      this.dueDate = dueDate
      this.showDone = showDone
      this.userList = users
      this.refreshList()
    },

    /**
     * 获取数据列表
     */
    getList() {
      this.loading = true
      const params = {
        page: this.page,
        limit: 15,
        type: this.tabsSelectValue,
        priority: this.priority,
        dueDate: this.dueDate,
        status: this.showDone ? '' : '1',
        mainUserId: this.userList && this.userList.length ? this.userList[0].userId : ''
      }

      if (this.search) {
        params.search = this.search
      }

      if (this.taskType != 1) {
        params.mold = 1 // 下属任务
      }

      taskListAPI(params)
        .then(res => {
          this.loading = false
          if (this.tabsSelectValue == params.type) {
            if (!this.noMore) {
              for (const item of res.data.page.list) {
                if (item.status == 5) {
                  item.checked = true
                }
              }
              this.list = this.list.concat(res.data.page.list)
              this.page++
            }
            this.noMore = res.data.page.lastPage
            this.progress = res.data
          } else {
            this.refreshList()
          }
        })
        .catch(() => {
          this.noMore = true
          this.loading = false
        })
    },

    /**
     * 中间tabs改变
     */
    tabsChange(type) {
      this.refreshList()
    },

    /**
     * 任务cell 操作
     */
    taskCellHandle(type, data, index) {
      if (type == 'view') {
        this.taskID = data.taskId
        this.detailIndex = index
        this.taskDetailShow = true
      } else if (type == 'complete') {
        this.progress.stopTask = data.checked
          ? ++this.progress.stopTask
          : --this.progress.stopTask
      }
    },

    /**
     * 详情操作
     */
    detailHandle(data) {
      if (data.type == 'delete') {
        this.list.splice(data.index, 1)
      } else {
        // 获取5条数据
        let page = 1
        if (data.index > 0) {
          page = Math.ceil(data.index / 5)
        }
        const params = {
          page: page,
          limit: 5,
          type: this.tabsSelectValue,
          priority: this.priority,
          dueDate: this.dueDate,
          status: this.showDone ? '' : '1'
        }

        if (this.taskType != 1) {
          params.mold = 1 // 下属任务
        }

        taskListAPI(params)
          .then(res => {
            const task = this.list[data.index]
            for (let index = 0; index < res.data.page.list.length; index++) {
              const element = res.data.page.list[index]
              if (element.taskId == task.taskId) {
                if (element.status == 5) {
                  element.checked = true
                }
                this.list.splice(index, 1, element)
                break
              }
            }
            this.progress = res.data
          })
          .catch(() => {})
      }
    },

    /**
     * 审批导出
     */
    exportClick() {
      this.loading = true
      const params = {
        type: this.tabsSelectValue,
        priority: this.priority,
        dueDate: this.dueDate,
        status: this.showDone ? '' : '1'
      }

      if (this.taskType != 1) {
        params.mold = 1 // 下属任务
      }

      taskOaExportAPI(params)
        .then(res => {
          downloadExcelWithResData(res)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  position: relative;
  height: 100%;
  width: 920px;
}

.examine-tabs-head {
  margin-bottom: 15px;
}

.content-wrapper {
  height: calc(100% - 70px);
  overflow: hidden;
  position: relative;
  margin-top: 15px;
  padding: 70px 0 76px;
  background-color: white;
  border-radius: $xr-border-radius-base;
  border: 1px solid $xr-border-line-color;

  &__hd {
    position: absolute;
    left: 1px;
    top: 0;
    right: 1px;
    z-index: 5;
    padding: 15px;

    .head-img {
      margin-right: 30px;
    }

    .el-date-editor {
      width: 150px;
    }

    .el-select {
      width: 80px;
    }

    .el-progress {
      width: 300px;
    }

    .label {
      color: #999999;
      font-size: 12px;
      margin: 0 10px 0 20px;
    }

    .label.margin-left {
      margin-left: 30px;
    }

    .header-right {
      .el-input {
        width: 200px;
        margin-right: 10px;
      }
      .el-button {
        /deep/ i {
          margin-right: 5px;
        }
      }
    }
  }
}

.cell-section {
  height: 100%;
  overflow: auto;
}


// 快捷添加
.task-add {
  position: absolute;
  left: 1px;
  bottom: 0;
  right: 1px;
  z-index: 5;
  background-color: white;
  padding: 15px;
}

.user-icon {
  background: $xr-color-primary;
  color: white;
  padding: 8px 10px;
  border-radius: 50%;
  font-size: 20px;
}
</style>
