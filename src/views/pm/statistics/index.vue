<template>
  <div class="project">
    <xr-header
      icon-class="wk wk-results-solid"
      icon-color="#2362FB"
      label="统计分析" />
    <div
      v-loading="loading"
      class="project-body">
      <statistical-overview
        :data="detailData.taskStatistics"
        :list="detailData.ownerList"
        class="statistical-overview">
        <el-select
          v-model="workId"
          class="project-body-select"
          @change="getDetail">
          <el-option
            v-for="item in projectList"
            :key="item.workId"
            :label="item.name"
            :value="item.workId"/>
        </el-select>
      </statistical-overview>
      <flexbox
        v-if="workId != 'all'"
        class="statistical-task">
        <statistical-task
          :list="detailData.classStatistics"
          class="statistical-task-item"
          type="task"
          title="任务列表"/>
        <statistical-task
          :list="detailData.labelStatistics"
          class="statistical-task-item"
          type="label"
          title="标签分析"/>
      </flexbox>
      <statistical-member
        :list="detailData.memberTaskStatistics"
        class="statistical-member"/>
    </div>
  </div>
</template>

<script>
import { workIndexWorkListAPI } from '@/api/pm/task'
import { workWorkStatisticAPI } from '@/api/pm/statistics'

import StatisticalOverview from '@/views/pm/components/StatisticalOverview'
import StatisticalTask from '@/views/pm/components/StatisticalTask'
import StatisticalMember from '@/views/pm/components/StatisticalMember'
import XrHeader from '@/components/XrHeader'

export default {
  components: {
    StatisticalOverview,
    StatisticalTask,
    StatisticalMember,
    XrHeader
  },

  data() {
    return {
      loading: false,
      detailData: {},
      projectList: [{ workId: 'all', name: '全部' }],
      workId: 'all'
    }
  },
  created() {
    this.getProjectList()
    this.getDetail()
  },

  methods: {
    /**
     * 获取详情
     */
    getDetail() {
      this.loading = true
      workWorkStatisticAPI(this.workId)
        .then(res => {
          this.detailData = res.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 项目列表
     */
    getProjectList() {
      workIndexWorkListAPI()
        .then(res => {
          this.projectList = [{ workId: 'all', name: '全部' }].concat(res.data)
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.project {
  height: 100%;
  overflow: hidden;
  user-select: none;
  position: relative;
}

.project-body {
  position: absolute;
  top: 60px;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: auto;
  .project-body-select {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}

.statistical-overview {
  position: relative;
  background-color: white;
  border-radius: 3px;
  border: 1px solid #e6e6e6;
  overflow: hidden;
  padding-top: 5px;
}

.statistical-task {
  margin-top: 10px;
  .section {
    margin-top: 0;
  }
  .statistical-task-item {
    background-color: white;
    border-radius: 3px;
    border: 1px solid #e6e6e6;
    overflow: hidden;
    padding-top: 5px;
    flex: 1;
  }

  .statistical-task-item:first-child {
    margin-right: 10px;
  }
}

.statistical-member {
  background-color: white;
  border-radius: 3px;
  border: 1px solid #e6e6e6;
  overflow: hidden;
  padding-top: 5px;
}
</style>
