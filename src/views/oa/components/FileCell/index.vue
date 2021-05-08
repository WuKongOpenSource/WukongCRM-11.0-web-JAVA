<template>
  <flexbox class="cell">
    <img
      :src="fileIcon"
      class="cell-head"
      alt>
    <div
      :class="{'cursor-pointer' :cursorPointer}"
      class="cell-body text-one-line">
      <span>{{ data.name.length > 20 ? data.name.substring(0, 20) + '...' : data.name }}</span>
    </div>
    <div class="size">
      ({{ data.size | getFileSize }})
    </div>
    <div class="cell-foot">
      <span
        v-if="previewShow"
        class="xr-text-btn primary"
        @click="previewClick">预览</span>
      <span
        class="xr-text-btn primary"
        @click="downloadClick">下载</span>
      <span
        v-if="showDelete"
        class="xr-text-btn delete"
        @click="deleteClick">删除</span>
    </div>
  </flexbox>
</template>

<script type="text/javascript">
import { downloadFile, getFileIconWithSuffix, fileSize, canPreviewFile, wkPreviewFile } from '@/utils'
import { crmFileDeleteAPI } from '@/api/common'

export default {
  name: 'FileCell',
  filters: {
    getFileSize(size) {
      return fileSize(size)
    }
  },
  props: {
    cellIndex: Number,
    data: Object,
    // 完整数据
    list: Array,
    showFoot: {
      type: Boolean,
      default: true
    },
    cursorPointer: {
      type: Boolean,
      default: false
    },
    showDelete: {
      type: Boolean,
      default: false
    },
    module_id: [String, Number]
  },
  data() {
    return {}
  }, // 附件展示效果
  computed: {
    fileIcon() {
      const temps = this.data.name ? this.data.name.split('.') : []
      var ext = ''
      if (temps.length > 0) {
        ext = temps[temps.length - 1]
      } else {
        ext = ''
      }
      return getFileIconWithSuffix(ext)
    },

    previewShow() {
      return this.list
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    /**
     * 下载
     */
    downloadClick() {
      downloadFile({ path: this.data.filePath || this.data.url, name: this.data.name })
    },

    /**
     * 附件预览
     */
    previewClick() {
      if (canPreviewFile(this.data.name)) {
        wkPreviewFile(this.data.filePath || this.data.url, this.data.name)
      } else {
        this.$wkPreviewFile.preview({
          index: this.cellIndex || 0,
          data: this.list.map(function(item) {
            return {
              url: item.filePath || item.url,
              name: item.name
            }
          })
        })
      }
    },

    /**
     * 删除
     */
    deleteClick() {
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          crmFileDeleteAPI({
            id: this.data.fileId
          })
            .then(res => {
              this.$message.success('操作成功')
              this.$emit('delete', this.cellIndex, this.data)
            })
            .catch(() => {})
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.cell {
  padding: 8px;
  background-color: #f8faff;
  border-radius: $xr-border-radius-base;
  position: relative;
  margin-bottom: 5px;

  .cell-head {
    display: block;
    width: 16px;
  }

  .cell-body {
    margin-left: 12px;
    color: $xr-color-primary;
    font-size: 14px;
  }

  .size {
    margin-left: 8px;
    flex-shrink: 0;
    font-size: 12px;
    color: #ccc;
  }

  .cell-foot {
    display: none;
    margin-left: 15px;
    flex-shrink: 0;
    margin-right: 8px;
    cursor: pointer;
    i {
      color: #ccc;
      padding: 0 2px;
    }
  }
}

.cell:hover {
  .cell-foot {
    display: block;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
