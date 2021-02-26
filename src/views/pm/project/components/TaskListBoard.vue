<template>
  <div class="task-list-board">
    <el-collapse v-model="collapseValue">

      <template v-for="(item, index) in taskList">
        <el-collapse-item
          :name="index"
          :key="index">
          <template slot="title">
            <span class="list-text"> {{ item[tableNameField] }} </span>
            <span class="list-text-num">{{ item.checkedNum }} / {{ item.list.length }}</span>
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
                class="el-icon-more img-gd"
                @click.stop=""/>
            </el-popover>
          </template>
          <task-cell
            v-for="(item, sIndex) in item.list"
            :key="sIndex"
            :checkbox-disabled="!permission.setTaskStatus"
            :data-section="index"
            :data="item"
            :data-index="sIndex"
            @on-handle="taskCellHandle" />
        </el-collapse-item>
        <div :key="'add' + index">
          <!-- 新建任务 -->
          <task-quick-add
            v-if="permission.saveTask && item[tableField] != -1"
            :params="{
              workId,
              classId: item.classId,
            }"
            show-style="hideBorder"
            style="width: 280px;"
            @send="addSubTaskSuc" />
        </div>
      </template>
    </el-collapse>

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
import TaskCell from '@/views/taskExamine/task/components/TaskCell'

import BoardMixin from './Board'

export default {
  // 任务列表看板
  name: 'TaskListBoard',
  components: {
    TaskCell
  },
  mixins: [BoardMixin],
  props: {
    workId: [String, Number],
    permission: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      showType: 'board',
      loading: false,
      // 新建任务弹出框
      createTaskListShow: false,
      createSubTaskClassId: 'hidden',
      // 新建列表
      taskListName: '',
      // 重命名
      editTaskListName: '',
      // 主数据
      taskList: [],
      // 详情对应的任务对象数据 -- 用于更新数据
      // 详情数据
      taskID: '',
      detailIndex: -1,
      detailSection: -1,
      taskDetailShow: false,

      collapseValue: []
    }
  },
  computed: {},
  watch: {},
  created() {},

  mounted() {
  },

  beforeDestroy() {
  },
  methods: {
    /**
     * 全部展开
     */
    getListRest() {
      this.collapseValue = this.taskList.map((item, index) => {
        return index
      })
    },
    /**
     * 任务cell 操作
     */
    taskCellHandle(type, data, index, section) {
      if (type == 'view') {
        this.taskID = data.taskId
        this.detailIndex = index
        this.detailSection = section
        this.taskDetailShow = true
      } else if (type == 'complete') {
        const value = this.taskList[section]
        this.changeListCompleteOrder(data, value, index)
        this.updateTaskListCheckNum(value)
      }
    },

    /**
     * 点击空白处关闭详情
     */
    taskShowHandle(e) {
      if (
        this.$refs.particulars &&
        !this.$refs.particulars.$el.contains(e.target)
      ) {
        let hidden = true
        const items = document.getElementsByClassName('board-item')
        for (let index = 0; index < items.length; index++) {
          const element = items[index]
          if (element.contains(e.target)) {
            hidden = false
            break
          }
        }
        this.taskDetailShow = !hidden
      }
    }

  }
}
</script>

<style lang="scss" scoped>
.task-list-board {
  background: #fff;
  height: 100%;
  border: 1px solid #e6e6e6;
  border-radius: $xr-border-radius-base;
  padding: 15px;
  position: relative;
  overflow: auto;
  user-select: none;
}

/deep/ .el-collapse {
  border-top: none;
  border-bottom: none;
  .el-collapse-item__header,
  .el-collapse-item__wrap {
    border-bottom: none;
  }

  .el-collapse-item__content {
    padding-bottom: 0px;
    border-bottom: 1px solid #EBEEF5;
    margin-bottom: 5px;
  }
}

.list-text {
  display: inline-block;
}
.el-progress /deep/ .el-progress-bar {
  padding-right: 0;
}
.el-progress /deep/ .el-progress__text {
  display: none;
}
.list-text-num {
  margin-left: 10px;
  color: #ccc;
}
.img-gd {
  margin-left: 15px;
  color: #ccc;
  cursor: pointer;
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

// 新建按钮
.new-list-task {
  cursor: pointer;
  color: #999999;
  padding: 10px 0;
  font-size: 13px;
  .el-icon-plus {
    color: #2362FB;
    font-weight: 700;
  }
}

// 新建列表
.board-column-new-list {
  width: 280px;
  background: #fff;
  vertical-align: top;
  display: inline-block;
  border-radius: $xr-border-radius-base;
  .new-list {
    height: 50px;
    line-height: 50px;
    color: #999;
    cursor: pointer;
    .el-icon-plus {
      color: #2362FB;
      font-size: 12px;
      font-weight: 700;
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
</style>
