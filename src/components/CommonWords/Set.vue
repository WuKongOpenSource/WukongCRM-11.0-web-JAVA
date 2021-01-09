<template>
  <el-dialog
    ref="wkDialog"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="常用语管理"
    width="600px"
    @close="close">
    <div class="set">
      <draggable
        v-model="setList"
        :options="{ group: 'list',forceFallback:false, fallbackClass:'draggingStyle',filter: '.el-input__inner', preventOnFilter: false }">
        <flexbox
          v-for="(item, index) in setList"
          :key="index"
          :class="{ 'is-drag': isDrag }"
          class="set-item">
          <el-input
            v-model="item.value"
            :maxlength="100">
            <div
              slot="suffix"
              class="drag-handle"
              @mouseenter="dragEnter"
              @mouseleave="dragLeave">⋮⋮</div>
          </el-input>
          <i
            class="el-icon-remove"
            @click="deleteClick(index)"/>
        </flexbox>
      </draggable>
      <el-button
        type="text"
        icon="el-icon-circle-plus"
        @click="addClick">添加常用语</el-button>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button
        v-debounce="sureClick"
        type="primary">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { sysConfigSetPhraseAPI } from '@/api/crm/common'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'
import draggable from 'vuedraggable'

export default {
  // 常用语设置
  name: 'Set',
  components: {
    draggable
  },
  mixins: [ElDialogLoadingMixin],
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    list: Array
  },
  data() {
    return {
      loading: false,
      setList: [],
      isDrag: false
    }
  },
  computed: {},
  watch: {
    list: {
      handler() {
        this.initInfo()
      },
      immediate: true
    },
    visible(value) {
      if (value) {
        this.initInfo()
      }
    }
  },
  created() {},

  beforeDestroy() {},
  methods: {
    initInfo() {
      this.setList = this.list.map(item => {
        return { value: item }
      })

      if (this.setList.length == 0) {
        this.setList = [{ value: '' }]
      }
    },

    /**
     * 取消选择
     */
    close() {
      this.$emit('update:visible', false)
    },

    addClick() {
      this.setList.push({ value: '' })
    },

    deleteClick(index) {
      this.setList.splice(index, 1)
    },

    sureClick() {
      const value = []
      for (let index = 0; index < this.setList.length; index++) {
        const element = this.setList[index]
        if (element.value) {
          value.push(element.value)
        }
      }

      if (value.length == 0) {
        this.$message.error('请输入常用语')
        return
      }

      this.loading = true
      sysConfigSetPhraseAPI(value)
        .then(res => {
          this.loading = false
          this.$emit('update', value)
          this.close()
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 拖动样式
     */
    dragEnter() {
      this.isDrag = true
    },

    dragLeave() {
      this.isDrag = false
    }

  }
}
</script>

<style lang="scss" scoped>
.set {
  padding: 8px;
  height: 30vh;
  overflow-y: auto;
}

.set-item.is-drag {
  /deep/ input {
    background-color: #f8f8f8;
  }

  .el-icon-remove {
    visibility: hidden !important;
  }
}

.set-item {
  margin-bottom: 10px;

  .el-input {
    flex: 1;
  }

  .el-icon-remove {
    visibility: hidden;
    color: #ff6767;
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 8px;
  }

  .drag-handle {
    padding: 0 8px;
    flex-shrink: 0;
    color: #333;
    cursor: move;
    margin-top: 9px;

    &:hover {

    }
    // visibility: hidden;
  }

  &:hover {
    .el-icon-remove {
      visibility: visible;
    }

    .drag-handle {
      visibility: visible;
    }
  }
}
</style>
