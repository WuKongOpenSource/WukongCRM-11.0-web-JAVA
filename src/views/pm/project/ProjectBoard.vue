<template>
  <el-drawer
    :visible="visible"
    :before-close="handleClose"
    :append-to-body="false"
    custom-class="project-drawer"
    size="250px"
    direction="ltr">
    <el-input
      v-model="searchInput"
      placeholder="请输入内容"/>
    <section class="section">
      <section-head
        icon-class="wk wk-focus-on"
        label="加星标的看板" />

      <project-cell
        v-for="(item, index) in showCollectList"
        :key="index"
        :drag="false"
        :label="item.name"
        :icon-color="item.color"
        is-collect
        icon-class="wk wk-project"
        @click.native="enterDetail(item)"
        @collect="collectClick(item)" />
    </section>

    <section class="section">
      <section-head
        icon-class="wk wk-project"
        label="项目看板" />

      <draggable
        v-model="list"
        :options="{ forceFallback: false, disabled: searchInput.length > 0 }"
        @end="moveItem">
        <project-cell
          v-for="(item, index) in showList"
          :key="index"
          :drag="searchInput.length == 0"
          :label="item.name"
          :icon-color="item.color"
          :is-collect="item.collect == 1"
          icon-class="wk wk-project"
          @click.native="enterDetail(item)"
          @collect="collectClick(item)" />
      </draggable>
    </section>
  </el-drawer>
</template>

<script>
import { workIndexWorkListAPI } from '@/api/pm/task'
import { workWorkCollectAPI, workUpdateWorkOrderAPI } from '@/api/pm/project'

import ProjectCell from '../components/ProjectCell'
import SectionHead from '../components/SectionHead'
import Draggable from 'vuedraggable'

export default {
  // 项目看板
  name: 'ProjectBoard',
  components: {
    ProjectCell,
    SectionHead,
    Draggable
  },
  props: {
    visible: Boolean
  },
  data() {
    return {
      searchInput: '',
      list: []
    }
  },
  computed: {
    showList() {
      return this.list.filter(item => {
        return item.name.indexOf(this.searchInput) != -1
      })
    },

    collectList() {
      return this.list.filter(item => {
        return item.collect == 1
      })
    },

    showCollectList() {
      return this.collectList.filter(item => {
        return item.name.indexOf(this.searchInput) != -1
      })
    }
  },
  watch: {
    visible(value) {
      if (value) {
        this.getList()
      }
    }
  },
  created() {
    this.getList()
  },

  beforeDestroy() {},
  methods: {
    /**
     * 获取列表
     */
    getList() {
      workIndexWorkListAPI()
        .then(res => {
          this.list = res.data
        })
        .catch(() => {})
    },

    /**
     * 进入详情
     */
    enterDetail(item) {
      this.$router.push({
        name: 'project-list',
        params: {
          id: item.workId
        }
      })

      this.handleClose()
    },

    /**
     * 拖拽
     */
    moveItem(evt) {
      if (evt) {
        // 如果没有进行移动 不做处理
        if (evt.oldIndex == evt.newIndex) {
          return
        }

        workUpdateWorkOrderAPI(this.list.map(item => item.workId))
          .then(res => {})
          .catch(() => {})
      }
    },

    /**
     * 收藏
     */
    collectClick(item) {
      workWorkCollectAPI(item.workId)
        .then(res => {
          item.collect = item.collect == 0 ? 1 : 0
        })
        .catch(() => {})
    },

    /**
     * 关闭
     */
    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.section {
  margin: 15px 0;
}
</style>
