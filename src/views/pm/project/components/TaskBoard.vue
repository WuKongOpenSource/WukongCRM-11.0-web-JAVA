<template>
  <div
    v-loading="loading"
    class="content-box">
    <draggable
      v-scrollx="{ ignoreClass :['ignoreClass']}"
      id="task-board-body"
      :list="taskList"
      :options="{
        group: 'mission',
        forceFallback: false,
        disabled: orderTaskClassDisabled,
        dragClass: 'sortable-parent-drag',
        filter: '.ignore-elements'
      }"
      :move="moveParentTask"
      handle=".board-column-wrapper"
      class="board-column-content-parent"
      @end="moveEndParentTask">
      <div
        v-for="(item, index) in taskList"
        :key="index"
        :class="{'ignore-elements': item.classId == -1}"
        class="board-column">
        <flexbox
          orient="vertical"
          align="stretch"
          class="board-column-wrapper ignoreClass">
          <div class="board-column-header">
            <div>
              <span class="text"> {{ item[tableNameField] }} </span>
              <span class="text-num">{{ item.checkedNum }} / {{ item.list.length }}</span>
              <el-popover
                v-if="showMoreBtn && item.classId != -1"
                v-model="item.taskHandleShow"
                placement="bottom-start"
                width="150"
                trigger="click">
                <div class="omit-popover-box">
                  <!-- 重命名 -->
                  <el-popover
                    v-if="permission.updateTaskClass && isBoardShow"
                    v-model="item.renameShow"
                    :visible-arrow="false"
                    placement="bottom-start"
                    width="250"
                    popper-class="task-board-rechristen-popover"
                    trigger="click">
                    <div class="task-board-rechristen-box">
                      <div class="title">
                        <span>重命名</span>
                        <span
                          class="el-icon-close rt"
                          @click="item.renameShow = false"/>
                      </div>
                      <div class="content">
                        <el-input
                          v-model="editTaskListName"
                          :maxlength="10"
                          size="mini"/>
                        <div class="btn-box">
                          <el-button
                            size="mini"
                            type="primary"
                            @click="renameTaskListSubmit(item)">保存</el-button>
                          <el-button
                            size="mini"
                            @click="item.renameShow = false">取消</el-button>
                        </div>
                      </div>
                    </div>
                    <p
                      slot="reference"
                      @click="renameTaskListClick(item)">重命名</p>
                  </el-popover>
                  <p
                    v-if="permission.saveTask"
                    @click="createSubTaskClick(item)">新建任务</p>
                  <p
                    v-if="permission.archiveTask"
                    @click="archiveTaskListClick(item)">归档已完成任务</p>
                  <p
                    v-if="permission.deleteTaskClass && isBoardShow"
                    @click="delectTaskListClick(item, index)">删除列表</p>
                </div>
                <i
                  slot="reference"
                  class="el-icon-more img-gd"/>
              </el-popover>
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
            :options="{
              group: {
                name: 'missionSon',
                put: item.classId != -1
              },
              forceFallback: false,
              disabled: orderTaskDisabled,
              filter: '.board-item-active',
              dragClass: 'sortable-drag'
            }"
            :id="item.classId"
            class="board-column-content"
            @end="moveEndSonTask">
            <div
              v-for="(element, i) in item.list"
              ref="taskRow"
              :key="i"
              :class="element.checked ? 'board-item board-item-active' : 'board-item'"
              :style="{'border-color': getPriorityColor(element.priority).color}"
              @click="showDetailView(element, index , i)">
              <xr-avatar
                v-if="element.mainUser"
                :name="element.mainUser.realname"
                :id="element.mainUser.userId"
                :size="24"
                :src="element.mainUser.img"
                :disabled="false"
                class="head-png"
                trigger="hover" />
              <flexbox align="stretch">
                <div
                  style="display: inline-block;"
                  @click.stop>
                  <el-checkbox
                    v-model="element.checked"
                    :disabled="!permission.setTaskStatus"
                    @change="debouncedCheckboxChange(element, item, i)"/>
                </div>
                <div class="element-label">{{ element.name }}</div>
              </flexbox>
              <div class="img-group">
                <div
                  v-if="element.stopTime"
                  class="img-box">
                  <i
                    :style="{'color': element.isEnd == 1 && !element.checked ? 'red': '#999'}"
                    class="wukong wukong-time-task"/>
                  <span :style="{'color': element.isEnd == 1 && !element.checked ? 'red': '#999'}">{{ element.stopTime | moment("YYYY-MM-DD") }}截止</span>
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
            v-if="permission.saveTask && item[tableField] != -1"
            :params="{
              workId,
              classId: item.classId,
            }"
            show-style="hideBorder"
            style="margin: 0 10px;"
            @send="addSubTaskSuc" />
        </flexbox>
      </div>

      <!-- 新建列表 -->
      <div
        v-if="permission.saveTaskClass && isBoardShow"
        class="board-column-new-list">
        <div
          v-if="!createTaskListShow && loading == false"
          class="new-list"
          @click="createTaskListShow = true">
          <span class="el-icon-plus"/>
          <span>新建列表</span>
        </div>
        <div
          v-else-if="createTaskListShow && loading == false"
          class="input-btn">
          <el-input
            v-model="taskListName"
            :maxlength="10"
            size="small"
            placeholder="列表名"/>
          <div class="button-box">
            <el-button
              size="mini"
              type="primary"
              @click="createTaskListSave">保存</el-button>
            <el-button
              size="mini"
              @click="createTaskListShow = false">取消</el-button>
          </div>
        </div>
      </div>
    </draggable>

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

    <!-- 任务新建 -->
    <task-create
      v-if="taskCreateShow"
      :action="createAction"
      @save="addSubTaskSuc"
      @close="taskCreateShow = false"
    />
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import scrollx from '@/directives/scrollx'

import BoardMixin from './Board'

export default {
  components: {
    draggable
  },

  directives: {
    scrollx
  },

  mixins: [BoardMixin],

  props: {
    showType: String
  },

  data() {
    return {
    }
  },

  computed: {},

  watch: {
    showType() {
      this.createTaskListShow = false
      this.taskDetailShow = false
      this.taskList = []
      this.getList()
    }
  },

  created() {
  },

  mounted() {
    // 为了防止火狐浏览器拖拽的时候以新标签打开
    document.body.ondrop = function(event) {
      event.preventDefault()
      event.stopPropagation()
    }
  },

  methods: {}
}
</script>

<style scoped lang="scss">
.content-box {
  height: 100%;
  overflow-y: hidden;
  overflow-x: auto;
  position: relative;
  white-space: nowrap;
  user-select: none;

  .board-column-content-parent {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow-y: hidden;
    overflow-x: auto;
  }
}

.omit-popover-box {
  margin-left: -12px;
  margin-right: -12px;
  p {
    font-size: 13px;
    color: #333;
    height: 40px;
    line-height: 40px;
    padding-left: 20px;
    cursor: pointer;
  }
  p:hover {
    background: #f7f8fa;
    color: #2362FB;
  }
}

.task-board-rechristen-popover {
  padding: 0;
  .task-board-rechristen-box {
    .title {
      border-bottom: 1px solid #e6e6e6;
      padding: 15px;
      .el-icon-close {
        margin-right: 0px;
      }
    }
    .content {
      padding: 0 15px;
      .el-input {
        margin: 15px 0;
      }
      .btn-box {
        text-align: right;
        margin-bottom: 15px;
      }
    }
  }
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
      .img-gd {
        float: right;
        color: #666;
        cursor: pointer;
      }
    }
    .board-column-content {
      // min-height: 20px;
      padding: 0 10px;
      flex: 1;
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
          overflow: auto;
          font-size: 12px;
          .img-box {
            display: inline-block;
            margin-right: 5px;
            margin-bottom: 7px;
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
        }
      }
      .board-item-active {
        box-shadow: none;
        background: #f3f3f3;
        color: #8f8f8f;
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

.board-column-new-list {
  width: 280px;
  background: #fff;
  vertical-align: top;
  display: inline-block;
  border-radius: $xr-border-radius-base;
  .new-list {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    cursor: pointer;
    .el-icon-plus {
      color: #2362FB;
      font-size: 12px;
      font-weight: 700;
      margin-right: 10px;
    }
  }
  .input-btn {
    height: 100px;
    padding: 20px;
    .button-box {
      float: right;
      margin-top: 10px;
    }
  }
}

.sortable-drag {
  background-color: white;
}

.sortable-parent-drag {
  background-color: transparent;
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

