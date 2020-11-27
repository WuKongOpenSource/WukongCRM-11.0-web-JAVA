<template>
  <div
    :class="[disabled ? 'is_disabled' : 'is_valid']"
    class="xh-files-cont xh-form-border">
    <flexbox
      :class="[disabled ? 'is_disabled' : 'is_valid']"
      class="f-header"
      @click.native="selectImage">
      <i
        v-if="!disabled"
        class="wukong wukong-file f-logo" />

      <div class="f-name">附件</div>
      <!-- <input
        :id="idKey"
        type="file"
        class="bar-iput"
        accept="*.*"
        multiple
        @change="xhUploadFile" > -->
    </flexbox>
    <div class="f-body">
      <flexbox
        v-for="(item, index) in dataValue"
        :key="index"
        class="f-item">
        <i class="wukong wukong-file f-img" />
        <div class="f-name">{{ item | fileName }}</div>
        <div
          v-if="!disabled"
          class="close-button"
          @click="deleteFile(item, index)">×</div>
      </flexbox>
    </div>
  </div>
</template>
<script type="text/javascript">
import arrayMixin from './arrayMixin'
import { crmFileDeleteAPI } from '@/api/common'
import { fileSize } from '@/utils/index'

export default {
  name: 'XhFiles', // 新建 file  以数组的形式上传
  components: {},
  filters: {
    fileName(file) {
      const name = file.name && file.name.length > 10 ? (file.name.substring(0, 10) + '...') : file.name
      return name + '(' + fileSize(file.size) + ')'
    }
  },
  mixins: [arrayMixin],
  props: {},
  data() {
    return {
      batchId: '' // 批次ID
    }
  },
  computed: {},
  watch: {
    dataValue: {
      handler() {
        if (!this.batchId && this.dataValue && this.dataValue.length) {
          this.batchId = this.dataValue[0].batchId
        }
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    selectImage() {
      if (!this.disabled) {
        this.$wkFile.select().then(ev => {
          this.xhUploadFile(ev)
        })
      }
    },

    /**
     * 图片选择出发
     */
    xhUploadFile(event) {
      var files = event.target.files
      var firstFile = files[0]
      this.sendFileRequest(firstFile, () => {
        for (let index = 1; index < files.length; index++) {
          const file = files[index]
          this.sendFileRequest(file)
        }
        event.target.value = ''
      })
    },
    // 发送请求
    sendFileRequest(file, result) {
      this.$wkUploadFile.upload({
        file: file,
        params: {
          batchId: this.batchId
        }
      }).then(({ res }) => {
        const data = res.data || {}
        if (this.batchId == '') {
          this.batchId = data.batchId
        }
        data.size = fileSize(data.size)
        this.dataValue.push(data)
        this.$emit('value-change', {
          index: this.index,
          value: this.dataValue
        })
        if (result) {
          result()
        }
      }).catch(() => {})
    },
    /** 删除图片 */
    deleteFile(item, index) {
      this.$confirm('您确定要删除该文件吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          crmFileDeleteAPI({
            id: item.fileId
          })
            .then(res => {
              this.dataValue.splice(index, 1)
              this.$emit('value-change', {
                index: this.index,
                value: this.dataValue
              })
              this.$message.success('操作成功')
            })
            .catch(() => {})
        })
        .catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
/** 附件  */
.xh-files-cont {
  position: relative;
  display: inline-block;
  border-radius: 3px;
  width: 100%;
  border: 1px solid #ddd;
  padding: 3.5px 5px;
  margin: 3px;
  line-height: 15px;
}

.xh-files-cont.is_disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
  .f-name {
    background-color: #f0f4f8ea;
    color: #c0c4cc;
    cursor: not-allowed;
  }
}

.xh-files-cont.is_valid:hover {
  border-color: #c0c4cc;
}

.f-header {
  cursor: pointer;
  padding: 5px 0 5px;
  .f-logo {
    position: block;
    margin-right: 8px;
    font-size: 12px;
    color: $xr-color-primary;
  }
  .f-name {
    color: #2362FB;
    font-size: 12px;
  }
}
.f-header.is_disabled {
  cursor: not-allowed;
}

.f-body {
  .f-item {
    padding: 3px 0;
    height: 25px;
    .f-img {
      position: block;
      margin-right: 8px;
      font-size: 12px;
      color: $xr-color-primary;
    }
    .f-name {
      color: #666;
      font-size: 12px;
    }
    .close-button {
      cursor: pointer;
    }
  }
}

.bar-iput {
  position: absolute;
  top: 0;
  left: 0;
  height: 0;
  width: 0;
  opacity: 0;
}
</style>
