<template>
  <div class="file-list-view">
    <div
      v-for="(file, fileIndex) in list"
      :key="fileIndex"
      class="file-item">
      <img
        :src="getFileTypeIcon(file.name)"
        alt=""
        class="pic-icon">
      <div class="file-name text-one-line">{{ file.name }}</div>
      <div class="file-size">( {{ file.size | fontSizeValue }} )</div>
      <div class="down">
        <span @click="previewClick(file, fileIndex)">预览</span>
        <span @click="downloadClick(file)">下载</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 文件列表
 * @props list {Array} 文件列表
 */
import { downloadFile, getFileIconWithSuffix } from '@/utils'

import { fileSize } from '@/utils/index'

export default {
  name: 'FileListView',
  filters: {
    fontSizeValue(size) {
      return fileSize(size)
    }
  },
  props: {
    list: {
      type: Array,
      required: true
    }
  },
  data() {
    return {

    }
  },
  methods: {
    getFileTypeIcon(url) {
      if (!url) return ''
      const temps = url ? url.split('.') : []
      let ext = ''
      if (temps.length > 0) {
        ext = temps[temps.length - 1]
      } else {
        ext = ''
      }

      return getFileIconWithSuffix(ext)
    },

    downloadClick(file) {
      downloadFile({ path: file.filePath || file.url, name: file.name })
    },

    previewClick(file, fileIndex) {
      this.$wkPreviewFile.preview({
        index: fileIndex,
        data: this.list.map(function(item) {
          return {
            url: item.filePath || item.url,
            name: item.name
          }
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .file-list-view {
    .file-item {
      width: 100%;
      font-size: 12px;
      line-height: 1.5;
      box-sizing: border-box;
      padding: 5px 0;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      .pic-icon {
        width: 12px;
        margin-right: 8px;
        flex-shrink: 0;
      }
      .file-name {
        margin-right: 14px;
        // width: 0;
        // flex: 1;
      }
      .file-size {
        color: #999;
        margin-right: 15px;
        flex-shrink: 0;
      }
      .down {
        color: #2362FB;
        cursor: pointer;
        flex-shrink: 0;
        span:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
