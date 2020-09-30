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
        icon-class="wk wk-label"
        label="标签看板" />

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
          :collect="false"
          icon-class="wk wk-label"
          @click.native="enterDetail(item)" />
      </draggable>
    </section>
  </el-drawer>
</template>

<script>
import { workTasklableIndexAPI, workTasklableUpdateOrderAPI } from '@/api/pm/tag'

import ProjectCell from '../components/ProjectCell'
import SectionHead from '../components/SectionHead'
import Draggable from 'vuedraggable'

import { on, off } from '@/utils/dom'

export default {
  // 任务看板
  name: 'TagBoard',
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
  mounted() {
    on(document, 'click', this.handleDocumentClick)
  },

  beforeDestroy() {
    off(document, 'click', this.handleDocumentClick)
  },
  methods: {
    /**
     * 获取列表
     */
    getList() {
      workTasklableIndexAPI()
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
        name: 'tag-list',
        params: {
          id: item.labelId
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
        workTasklableUpdateOrderAPI({
          labelIds: this.list.map(item => item.labelId)
        })
          .then(res => {})
          .catch(() => {})
      }
    },

    /**
     * 关闭
     */
    handleClose() {
      this.$emit('update:visible', false)
    },

    /**
     * 控制导航管理隐藏
     */
    handleDocumentClick(e) {
      const contentDom = document.querySelector('.el-drawer__body')
      if (!contentDom ||
         contentDom.contains(e.target) ||
         (e.target.className && e.target.className.indexOf('wk-label') != -1) ||
         (e.target.innerHTML && e.target.innerHTML.indexOf('wk-label') != -1)) return
      this.handleClose()
    }
  }
}
</script>

<style lang="scss" scoped>
.section {
  margin: 15px 0;
}
</style>
