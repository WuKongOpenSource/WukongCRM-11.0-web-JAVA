<template>
  <div
    ref="taskRow"
    class="list task-cell"
    @click="rowFun(data)">
    <div
      ref="listLeft"
      class="list-left">
      <div
        :class="data.checked ? 'title title-active' : 'title'"
        @click.stop>
        <el-checkbox
          v-model="data.checked"
          @change="taskOverClick(data)" />
      </div>
      <span
        :style="{ backgroundColor: priority.color }"
        class="priority">{{ priority.label }}</span>
      <el-tooltip
        placement="bottom"
        effect="light"
        popper-class="task-tooltip tooltip-change-border">
        <div slot="content">
          <span>{{ data.name }}</span>
        </div>
        <span
          ref="itemSpan"
          :class="data.checked ? 'item-name-active' : 'item-name'">
          {{ data.name }}
        </span>
      </el-tooltip>
    </div>
    <div class="list-right">
      <div
        v-if="data.labelList && data.labelList.length > 0"
        class="tag-box">
        <span
          v-for="(item, index) in showLabels"
          :key="index"
          :style="{'background': item.color}"
          class="k-name">{{ item.labelName }}</span>
        <el-tooltip
          v-if="hideShowLabels.length"
          placement="top"
          effect="light"
          popper-class="tooltip-change-border">
          <div
            slot="content"
            class="tooltip-content">
            <div
              v-for="(item, index) in hideShowLabels"
              :key="index"
              class="item-label"
              style="display: inline-block; margin-right: 10px;">
              <span
                :style="{'background': item.color || '#ccc'}"
                class="k-name"
                style="border-radius: 3px; color: #FFF; padding: 3px 10px;">{{ item.labelName }}</span>
            </div>
          </div>
          <el-button class="more-btn" icon="el-icon-more"/>
        </el-tooltip>
      </div>

      <span
        v-if="data.stopTime"
        :class="[ 'due-time', { 'is-past': data.isEnd == 1 } ]">
        截止时间{{ data.stopTime | moment("YYYY-MM-DD") }}
      </span>

      <div class="img-group">
        <div
          v-if="data.relationCount"
          class="img-box">
          <i class="wukong wukong-relevance" />
          <span>{{ data.relationCount }}</span>
        </div>
        <div
          v-if="data.childAllCount > 0"
          class="img-box">
          <i class="wukong wukong-sub-task" />
          <span>{{ data.childWCCount }}/{{ data.childAllCount }}</span>
        </div>
        <div
          v-if="data.fileCount"
          class="img-box">
          <i class="wukong wukong-file" />
          <span>{{ data.fileCount }}</span>
        </div>
        <div
          v-if="data.commentCount"
          class="img-box">
          <i class="wukong wukong-comment-task" />
          <span>{{ data.commentCount }}</span>
        </div>
      </div>

      <xr-avatar
        v-if="data.mainUser && data.mainUser.userId"
        :name="data.mainUser.realname"
        :id="data.mainUser.userId"
        :size="24"
        :src="data.mainUser.img"
        :disabled="false"
        trigger="hover"
        class="user-img"
        @click.stop="" />
    </div>
  </div>
</template>
<script type="text/javascript">
// API
import { workTaskStatusSetAPI } from '@/api/pm/projectTask'

import TaskMixin from '@/views/taskExamine/task/mixins/TaskMixin'

export default {
  name: 'TaskCell', // 任务cell
  components: {},
  mixins: [TaskMixin],
  props: {
    data: Object,
    dataIndex: Number,
    dataSection: Number
  },
  data() {
    return {}
  },
  computed: {
    priority() {
      if (this.data.priority == 0 || !this.data.priority) {
        return this.priorityList[3] // 默认读取 priorityList 返回
      }
      return this.getPriorityColor(this.data.priority)
    },

    showLabels() {
      if (this.data.labelList.length > 3) {
        return this.data.labelList.slice(0, 3)
      }
      return this.data.labelList
    },

    hideShowLabels() {
      if (this.data.labelList.length > 3) {
        return this.data.labelList.slice(3)
      }
      return []
    }
  },
  watch: {},
  mounted() {},
  methods: {
    // 列表标记任务
    taskOverClick(val) {
      workTaskStatusSetAPI({
        taskId: val.taskId,
        status: val.checked ? 5 : 1
      })
        .then(res => {
          // this.$store.dispatch('GetOAMessageNum', 'task')
          this.$emit('on-handle', 'complete', this.data, this.dataIndex, this.dataSection)
        })
        .catch(() => {
          val.checked = false
        })
    },
    // 点击显示详情
    rowFun(val) {
      this.$emit('on-handle', 'view', this.data, this.dataIndex, this.dataSection)
    },
    onmouseoverFun(item) {
      if (
        this.$refs.itemSpan.offsetWidth >
        this.$refs.listLeft.offsetWidth - 21
      ) {
        this.$set(item, 'show', true)
      } else {
        this.$set(item, 'show', false)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@mixin v-align {
  vertical-align: middle;
}
@mixin cursor {
  cursor: pointer;
}
@mixin color9 {
  color: #999;
}
.popover-btn-group {
  margin: -12px;
  padding: 10px 0;
  p {
    font-size: 13px;
    height: 26px;
    line-height: 26px;
    padding-left: 20px;
    @include cursor;
  }
}
.popover-btn-group p:hover {
  background: #f7f8fa;
  color: #2362fb;
}

.list {
  padding: 0 10px;
  cursor: pointer;
  position: relative;
  height: 40px;
  line-height: 40px;
  display: flex;
  .header {
    margin-bottom: 15px;
    img {
      width: 32px;
      margin-right: 14px;
      vertical-align: middle;
    }
    .name-time {
      display: inline-block;
      vertical-align: middle;
      .time {
        color: #999;
        margin-top: 5px;
        font-size: 12px;
      }
    }
  }
  .title {
    cursor: pointer;
    color: #333;
    display: inline-block;
    .el-checkbox {
      padding-right: 7px;
    }
  }
  .title-active {
    color: #666;
    text-decoration: line-through;
    text-decoration-color: #aaa;
  }
  .img-group {
    color: #999;
    font-size: 12px;
    vertical-align: middle;
    display: inline-block;
    .img-box {
      display: inline-block;
      margin-right: 6px;
      .wukong {
        font-size: 12px;
      }
      .priority-btn {
        width: 68px;
        font-size: 12px;
        display: inline-block;
        text-align: center;
        border-radius: 10px;
        color: #fff;
        height: 16px;
        line-height: 16px;
      }
    }
  }
  .item-name-active {
    color: #8f8f8f;
    text-decoration: line-through;
  }
  .list-left,
  .list-right {
    display: inline-block;
  }
  .list-left {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 10px;

    .priority {
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: $xr-border-radius-base;
      margin-right: 20px;
    }
  }
  .list-right {
    flex-shrink: 0;
    .user-img {
      vertical-align: text-top;
      margin-left: 12px;
    }
    .tag-box {
      display: inline-block;
      margin-right: 20px;
      .item-label {
        display: inline-block;
      }
      .k-name {
        display: inline-block;
        height: 20px;
        line-height: 20px;
        padding: 0 10px;
        border-radius: 3px;
        color: #fff;
        margin-right: 6px;
        font-size: 12px;
      }
    }
  }
}

.more-btn {
  padding: 3px 8px;
  margin-right: 6px;
}

.list:hover {
  background: #fafafa;
}

.list:before {
  content: ' ';
  position: absolute;
  top: 0;
  right: 0;
  height: 1px;
  border-top: 1px solid $xr-border-line-color;
  color: $xr-border-line-color;
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  left: 0;
  z-index: 2;
}
.list:first-child:before {
  display: none;
}

// 截止时间
.due-time {
  color: #999999;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: $xr-border-radius-base;
  background-color: #F1F1F1;
  margin-right: 10px;
}

.due-time.is-past {
  color: #F95A5A;
  background-color: #FFF2F2;
}

.tooltip-content {
  margin: 10px 10px 10px 0;
}
</style>
