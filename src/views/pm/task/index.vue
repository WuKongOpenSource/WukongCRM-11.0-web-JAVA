<template>
  <div class="my-task">
    <xr-header
      icon-class="wk wk-task"
      icon-color="#D376FF"
      placeholder="请输入任务/描述"
      show-search
      ft-top="0"
      @search="searchClick">
      <span slot="label">我的任务</span>
      <el-popover
        slot="label"
        v-model="taskHandleShow"
        placement="bottom-start"
        width="182">
        <div class="project-list-popover-btn-list">
          <p @click="exportClick">导出任务</p>
        </div>
        <i
          slot="reference"
          class="wk wk-manage set-img" />
      </el-popover>
      <template slot="ft">
        <el-dropdown
          trigger="click"
          @command="filterClick">
          <div class="el-dropdown-link">
            {{ filterObj[filterValue.sort] }}<i class="el-icon-arrow-down el-icon--right"/>
          </div>
          <el-dropdown-menu slot="dropdown">
            <div class="el-dropdown-title">排序</div>
            <el-dropdown-item
              v-for="(item, index) in filterList"
              :key="index"
              :command="item.value">{{ item.label }}</el-dropdown-item>
            <flexbox class="el-dropdown-footer">
              已完成任务默认排在最后<el-switch
                v-model="filterValue.completedTask"
                @change="getList"/>
            </flexbox>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="primary" icon="wk wk-screening" class="filter-btn" @click="screeningShow = true">任务筛选</el-button>
      </template>
    </xr-header>
    <div class="my-task-body">
      <div
        v-loading="loading"
        v-scrollx="{ ignoreClass :['ignoreClass']}"
        class="content-box">
        <div
          v-for="(item, index) in taskList"
          :key="index"
          class="board-column">
          <flexbox
            orient="vertical"
            align="stretch"
            class="board-column-wrapper ignoreClass">
            <div class="board-column-header">
              <div>
                <span class="text"> {{ item.title }} </span>
                <span class="text-num">{{ item.checkedNum }} / {{ item.list.length }}</span>
              </div>
              <el-progress
                v-if="item.checkedNum == 0"
                :percentage="0"/>
              <el-progress
                v-else
                :percentage="item.checkedNum / item.list.length * 100"/>
            </div>
            <draggable
              :list="item.list"
              :options="{ group: 'mission', forceFallback: false, dragClass: 'sortable-drag' }"
              :id="index"
              class="board-column-content"
              @end="moveEndTask">
              <div
                v-for="(element, i) in item.list"
                ref="taskRow"
                :key="i"
                :class="element.checked ? 'board-item board-item-active' : 'board-item'"
                :style="{'border-color': getPriorityColor(element.priority).color }"
                @click="showDetailView(element, index, i)">
                <flexbox align="stretch">
                  <div @click.stop>
                    <el-checkbox
                      v-model="element.checked"
                      @change="checkboxChange(element, item)"/>
                  </div>
                  <div class="element-label">{{ element.name }}<span v-if="element.workName">（{{ element.workName }}）</span></div>
                  <xr-avatar
                    v-if="element.mainUser"
                    :name="element.mainUser.realname"
                    :id="element.mainUser.userId"
                    :size="24"
                    :src="element.mainUser.img"
                    :disabled="false"
                    trigger="hover"
                    class="head-png" />
                </flexbox>
                <div class="img-group">
                  <div
                    v-if="element.stopTime"
                    class="img-box">
                    <i
                      :style="{'color': element.isEnd == 1 && !element.checked ? 'red': '#999'}"
                      class="wukong wukong-time-task"/>
                    <span :style="{'color': element.isEnd == 1 && !element.checked ? 'red': '#999'}">{{ element.stopTime | moment("YYYY-MM-DD") }} 截止</span>
                  </div>
                  <div
                    v-if="element.childAllCount > 0"
                    class="img-box">
                    <i class="wukong wukong-sub-task"/>
                    <span>{{ element.childWCCount }}/{{ element.childAllCount }}</span>
                  </div>
                  <div
                    v-if="element.fileCount"
                    class="img-box">
                    <i class="wukong wukong-file"/>
                    <span>{{ element.fileCount }}</span>
                  </div>
                  <div
                    v-if="element.commentCount"
                    class="img-box">
                    <i class="wukong wukong-comment-task"/>
                    <span>{{ element.commentCount }}</span>
                  </div>

                  <template v-if="element.labelList.length <= 2">
                    <div
                      v-for="(k, j) in element.labelList"
                      :key="j"
                      :style="{'background': k.color}"
                      class="item-label">
                      {{ k.labelName }}
                    </div>
                  </template>
                  <template v-else>
                    <div
                      :style="{'background': element.labelList[0].color}"
                      class="item-label">{{ element.labelList[0].labelName }}</div>
                    <div
                      :style="{'background': element.labelList[1].color}"
                      class="item-label">{{ element.labelList[1].labelName }}</div>
                    <el-tooltip
                      placement="top"
                      effect="light"
                      popper-class="tooltip-change-border task-tooltip">
                      <div
                        slot="content"
                        style="margin: 10px 10px 10px 0;">
                        <div
                          v-for="(k, j) in element.labelList"
                          :key="j"
                          style="display: inline-block; margin-right: 10px;">
                          <span
                            v-if="j >= 2"
                            :style="{'background': k.color ? k.color: '#ccc'}"
                            class="k-name"
                            style="border-radius: 4px; color: #FFF; padding: 3px 10px;">{{ k.labelName }}</span>
                        </div>
                      </div>
                      <div class="color-label-more">
                        <i>...</i>
                      </div>
                    </el-tooltip>

                  </template>
                </div>
              </div>
            </draggable>
            <!-- 新建任务 -->
            <task-quick-add
              :params="{
                isTop: item.isTop
              }"
              show-style="hideBorder"
              style="margin: 0 10px;"
              @send="getList" />
          </flexbox>
        </div>
      </div>
    </div>
    <!-- 详情 -->
    <task-detail
      v-if="taskDetailShow"
      ref="particulars"
      :id="taskID"
      :detail-index="detailIndex"
      :detail-section="detailSection"
      :no-listener-class="['board-item']"
      @on-handle="detailHandle"
      @close="closeBtn"/>

    <!-- 筛选 -->
    <task-screening
      v-if="screeningShow"
      :props="screeningProps"
      :data="screeningValue"
      @change="taskScreeningChange"
      @close="screeningShow = false"/>
  </div>
</template>
<script>
import {
  workTaskMyTaskAPI,
  workTaskUpdateTopAPI,
  taskWorkbenchExportAPI,
  workQueryMemberListAPI
} from '@/api/pm/task'
import { workTaskStatusSetAPI } from '@/api/pm/projectTask'

import TaskQuickAdd from '@/views/taskExamine/task/components/TaskQuickAdd'
import TaskDetail from '@/views/taskExamine/task/components/TaskDetail'
import XrHeader from '@/components/XrHeader'
import TaskScreening from '../project/components/TaskScreening'

import draggable from 'vuedraggable'
import scrollx from '@/directives/scrollx'
import TaskMixin from '@/views/taskExamine/task/mixins/TaskMixin'
import { downloadExcelWithResData } from '@/utils'


export default {
  components: {
    draggable,
    TaskQuickAdd,
    TaskDetail,
    XrHeader,
    TaskScreening
  },

  directives: {
    scrollx
  },

  mixins: [TaskMixin],

  data() {
    return {
      // 任务设置
      taskHandleShow: false,

      taskList: [],
      // 加载中
      loading: true,
      filterObj: {},
      filterValue: {
        sort: 2,
        completedTask: true
      },
      filterList: [{
        label: '按手动拖拽',
        value: 1
      }, {
        label: '按最近创建',
        value: 2
      }, {
        label: '按最近截止',
        value: 3
      }, {
        label: '按最近更新',
        value: 4
      }, {
        label: '按最高优先级',
        value: 5
      }],
      search: '',
      screeningValue: {
        userIds: [],
        timeId: '',
        tagIds: []
      },
      screeningShow: false,
      screeningProps: {
        searchShow: false,
        userRequest: workQueryMemberListAPI
      },

      // 详情数据
      taskID: '',
      detailIndex: -1,
      detailSection: -1,
      taskDetailShow: false
    }
  },

  created() {
    this.filterList.forEach(item => {
      this.filterObj[item.value] = item.label
    })
    this.getList()
  },

  mounted() {
    // 为了防止火狐浏览器拖拽的时候以新标签打开，此代码真实有效
    document.body.ondrop = function(event) {
      event.preventDefault()
      event.stopPropagation()
    }
  },

  methods: {
    /**
     * 搜索操作
     */
    searchClick(search) {
      this.search = search
      this.getList()
    },

    /**
     * 任务筛选
     */
    taskScreeningChange(userIds, timeId, tagIds) {
      this.screeningValue = {
        userIds,
        timeId,
        tagIds
      }
      this.getList()
    },

    /**
     * 筛选操作
     */
    filterClick(command) {
      this.filterValue.sort = command
      this.getList()
    },

    /**
     * 获取数据列表
     */
    getList() {
      this.loading = true
      workTaskMyTaskAPI({
        name: this.search,
        sort: this.filterValue.sort,
        completedTask: this.filterValue.completedTask,
        userIdList: this.screeningValue.userIds,
        stopTimeType: this.screeningValue.timeId,
        labelIdList: this.screeningValue.tagIds
      })
        .then(res => {
          for (const item of res.data) {
            item.checkedNum = 0
            item.showTaskAdd = false
            for (const i of item.list) {
              if (i.status == 5) {
                i.checked = true
                item.checkedNum += 1
              } else {
                i.checked = false
              }
            }
          }
          this.taskList = res.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 移动任务
     */
    moveEndTask(evt) {
      document.dispatchEvent(new MouseEvent('mouseup'))
      if (evt) {
        const fromTop = evt.from.id
        const toTop = evt.to.id

        // 如果没有进行移动 不做处理
        if (fromTop == toTop && evt.oldIndex == evt.newIndex) {
          return
        }

        const fromTask = this.taskList[fromTop]
        const fromList = fromTask.list
        this.updateTaskListCheckNum(fromTask)

        const toTask = this.taskList[toTop]
        const toList = toTask.list
        this.updateTaskListCheckNum(toTask)

        let params = {}
        if (fromTop == toTop) {
          params = {
            toList: toList.map(item => {
              return item.taskId
            }),
            toTopId: toTop
          }
        } else {
          params = {
            fromList: fromList.map(item => {
              return item.taskId
            }),
            fromTopId: fromTop,
            toList: toList.map(item => {
              return item.taskId
            }),
            toTopId: toTop
          }
        }
        workTaskUpdateTopAPI(params)
          .then(res => {})
          .catch(() => {})
      }
    },


    /**
     * 更新勾选数字
     */
    updateTaskListCheckNum(task) {
      task.checkedNum = task.list.filter(item => {
        return item.checked
      }).length
    },

    /**
     * 勾选完成任务
     */
    checkboxChange(element, value) {
      if (element.checked) {
        value.checkedNum++
      } else {
        value.checkedNum--
      }

      workTaskStatusSetAPI({
        taskId: element.taskId,
        status: element.checked ? 5 : 1
      })
        .then(res => {})
        .catch(() => {
          if (element.checked) {
            value.checkedNum--
          } else {
            value.checkedNum++
          }
          element.checked = !element.checked
        })
    },

    /**
     * 点击显示详情
     */
    showDetailView(val, seciton, index) {
      this.taskID = val.taskId
      this.detailIndex = index
      this.detailSection = seciton
      this.taskDetailShow = true
    },

    /**
     * 详情操作
     */
    detailHandle(data) {
      if (data.index == 0 || data.index) {
        // 是否完成勾选
        if (data.type == 'title-check') {
          const sectionItem = this.taskList[data.section]
          this.$set(sectionItem.list[data.index], 'checked', data.value)
          if (data.value) {
            sectionItem.checkedNum++
          } else {
            sectionItem.checkedNum--
          }
          this.$set(sectionItem, 'checkedNum', sectionItem.checkedNum)
        } else if (data.type == 'delete') {
          this.taskList[data.section].list.splice(data.index, 1)
        } else if (data.type == 'change-stop-time') {
          // 86399 一天多总秒数 减 1
          const stopTime = new Date(data.value).getTime() / 1000 + 86399
          if (stopTime > new Date().getTime() / 1000) {
            this.taskList[data.section].list[data.index].isEnd = false
          } else {
            this.taskList[data.section].list[data.index].isEnd = true
          }
          this.taskList[data.section].list[data.index].stopTime = data.value
        } else if (data.type == 'change-priority') {
          this.taskList[data.section].list[data.index].priority = data.value.id
        } else if (data.type == 'change-name') {
          this.taskList[data.section].list[data.index].name = data.value
        } else if (data.type == 'change-comments') {
          const commentCount = this.taskList[data.section].list[data.index]
            .commentCount
          if (data.value == 'add') {
            this.taskList[data.section].list[data.index].commentCount =
              commentCount + 1
          } else {
            this.taskList[data.section].list[data.index].commentCount =
              commentCount - 1
          }
        } else if (data.type == 'change-sub-task') {
          this.taskList[data.section].list[data.index].childWCCount =
            data.value.subdonecount
          this.taskList[data.section].list[data.index].childAllCount =
            data.value.allcount
        } else if (data.type == 'change-main-user') {
          this.taskList[data.section].list[data.index].mainUser = data.value
        } else if (data.type == 'change-label') {
          this.taskList[data.section].list[data.index].labelList = data.value
        }
      }
    },

    /**
     * 关闭详情页
     */
    closeBtn() {
      this.taskDetailShow = false
    },

    /**
     * 审批导出
     */
    exportClick() {
      this.taskHandleShow = false
      this.loading = true
      taskWorkbenchExportAPI()
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

<style scoped lang="scss">
.my-task {
  height: 100%;
  overflow: hidden;
  user-select: none;
}

.xr-header {
  padding-top: 0;
  .el-dropdown-link {
    cursor: pointer;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    padding: 8px 10px;
    background-color: white;
  }

  .filter-btn {
    padding: 6px 12px;
    /deep/ i {
      margin-right: 5px;
    }
  }
}

.el-dropdown-menu {
  .el-dropdown-title {
    padding: 0px 20px 10px;
    color: #999;
    border-bottom: 1px solid $xr-border-color-base;
  }
  .el-dropdown-menu__item {
    color: #333;
  }

  .el-dropdown-footer {
    padding: 5px 20px 0;
    border-top: 1px solid $xr-border-color-base;
    font-size: 12px;
    .el-switch {
      margin-left: 5px;
    }
  }
}

.my-task-body {
  padding-left: 15px;
  height: calc(100% - 45px);
  position: relative;
  overflow-y: hidden;
  overflow-x: auto;
  white-space: nowrap;
}

// 设置
.project-list-popover-btn-list {
  margin: 0 -12px;
  p {
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    padding-left: 32px;
  }
  p:hover {
    background: #f7f8fa;
    color: #2362FB;
  }
}

.set-img {
  margin-left: 15px;
  font-size: 14px;
  color: #ccc;
  cursor: pointer;

  &:hover {
    color: $xr-color-primary;
  }
}

.content-box {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: hidden;
  overflow-x: auto;
}

.content-box > div:last-child {
  margin-right: 0;
}
.board-column {
  width: 280px;
  height: 100%;
  display: inline-block;
  margin: 0 7px;
  overflow: hidden;

  .board-column-wrapper {
    max-height: 100%;
    padding: 10px 0;
    vertical-align: top;
    border-radius: $xr-border-radius-base;
    border: 1px solid $xr-border-color-base;
    background: #fff;
    margin-right: 14px;
    position: relative;
    .board-column-header {
      padding: 10px 13px 17px;
      color: #333;
      .text {
        font-size: 15px;
        display: inline-block;
        padding-bottom: 5px;
      }
      .el-progress /deep/ .el-progress-bar {
        padding-right: 0;
      }
      .el-progress /deep/ .el-progress__text {
        display: none;
      }
      .text-num {
        margin-left: 10px;
        color: #999;
      }
    }
    .board-column-content {
      padding: 0 10px;
      max-height: calc(100% - 90px);
      overflow: auto;
      .board-item {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        padding: 10px 35px 0 10px;
        margin-bottom: 10px;
        margin-top: 1px;
        margin-left: 1px;
        border-radius: $xr-border-radius-base;
        border-left: 4px solid transparent;
        cursor: pointer;
        overflow: hidden;
        position: relative;
        .img-group {
          padding: 10px 0 0 20px;
          white-space: normal;
          word-wrap: break-word;
          .img-box {
            display: inline-block;
            margin-bottom: 7px;
            margin-right: 5px;
            font-size: 12px;
            color: #999;
            font-size: 12px;
            img {
              width: 15px;
              vertical-align: middle;
            }
          }
        }
        .head-png {
          vertical-align: middle;
          position: absolute;
          top: 8px;
          right: 5px;
        }
        .element-label {
          width: 180px;
          padding-left: 8px;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 18px;
          cursor: pointer;
          span {
            color: #999;
            font-size: 12px;
          }
          img {
            vertical-align: middle;
          }
        }
      }
      .board-item-active {
        color: #8f8f8f;
        background: #f3f3f3;
        .element-label {
          text-decoration: line-through;
        }
      }
    }
    .new-task {
      cursor: pointer;
      color: #999999;
      padding-top: 10px;
      font-size: 13px;
      padding-left: 14px;
      .el-icon-plus {
        color: #2362FB;
        font-weight: 700;
      }
    }
  }
}

.sortable-drag {
  background-color: white;
}

.wukong {
  font-size: 14px;
}

.item-label {
  display: inline-block;
  display: inline-block;
  height: 20px;
  line-height: 20px;
  padding: 0 10px;
  border-radius: $xr-border-radius-base;
  color: #fff;
  margin-right: 6px;
  font-size: 12px;
  margin-bottom: 6px;
}

.color-label-more {
  background: #eee;
  width: 34px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  display: inline-block;
  font-size: inherit;
  font-weight: 700;
  border-radius: $xr-border-radius-base;
  vertical-align: middle;
  position: relative;
  margin-bottom: 6px;
  i {
    position: absolute;
    left: 50%;
    line-height: 36px;
    top: 0%;
    height: 20px;
    transform: translate(-50%, -50%);
  }
}
</style>

