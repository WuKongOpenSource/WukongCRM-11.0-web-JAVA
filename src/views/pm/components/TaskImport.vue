<template>
  <el-dialog
    :visible="show"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="导入任务"
    width="750px"
    @close="closeView">
    <div class="dialog-body">
      <el-steps
        :active="stepsActive"
        simple>
        <el-step
          v-for="(item, index) in stepList"
          :key="index"
          :title="item.title"
          :icon="item.icon"
          :status="item.status" />
      </el-steps>

      <div v-if="stepsActive == 1" class="step-section">
        <div class="sections">
          <div class="sections__title">一、请按照数据模板的格式准备要导入的数据。<span
            class="download"
            @click="download">点击下载《任务导入模板》</span></div>
          <div class="sections__tips">一次最多导入1000条任务，超出的部分不予导入</div>
        </div>
        <div class="sections">
          <div class="sections__title">三、请选择需要导入的文件</div>
          <div class="content">
            <flexbox class="file-select">
              <el-input
                v-model="file.name"
                :disabled="true"/>
              <el-button
                type="primary"
                @click="selectFile">选择文件</el-button>
            </flexbox>
          </div>
        </div>
      </div>

      <div
        v-loading="loading"
        v-else-if="stepsActive == 2"
        element-loading-text="数据导入中"
        element-loading-spinner="el-icon-loading"
        class="step-section"/>

      <div
        v-loading="loading"
        v-else-if="stepsActive == 3"
        class="step-section">
        <div class="result-info">
          <i class="wk wk-success result-info__icon" />
          <p class="result-info__des">数据导入完成</p>
          <p v-if="resultData" class="result-info__detail">导入总数据<span class="result-info__detail--all">{{ resultData.totalSize }}</span>条，导入成功<span class="result-info__detail--suc">{{ resultData.totalSize - resultData.errSize }}</span>条，导入失败<span class="result-info__detail--err">{{ resultData.errSize }}</span>条</p>
          <el-button
            v-if="resultData && resultData.errSize > 0"
            class="result-info__btn--err"
            type="text"
            @click="downloadErrData">下载错误数据</el-button>
        </div>
      </div>

      <input
        id="importInputFile"
        type="file"
        @change="uploadFile">
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button
        :class="{ 'is-hidden': !showCancel }"
        @click="closeView">取消</el-button>
      <el-button
        v-if="sureTitle"
        type="primary"
        @click="sureClick">{{ sureTitle }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  workDownloadExcelAPI,
  workExcelImportAPI,
  workDownloadErrorExcelAPI
} from '@/api/pm/project'


import { downloadExcelWithResData, verifyFileTypeWithFileName } from '@/utils/index'

export default {
  name: 'TaskImport', // 文件导入
  components: {},
  props: {
    show: {
      type: Boolean,
      default: false
    },
    workId: {
      require: true,
      type: [String, Number]
    }
  },
  data() {
    return {
      loading: false,
      file: { name: '' },

      stepsActive: 1,
      stepList: [
        {
          icon: 'wk wk-upload',
          title: '上传文件',
          status: 'wait'
        },
        {
          icon: 'wk wk-data-import',
          title: '导入数据',
          status: 'wait'
        },
        {
          icon: 'wk wk-success',
          title: '导入完成',
          status: 'wait'
        }
      ],
      resultData: null
    }
  },
  computed: {

    sureTitle() {
      return {
        1: '立即导入',
        2: '',
        3: '确定'
      }[this.stepsActive]
    },

    showCancel() {
      return this.stepsActive != 2
    }
  },
  watch: {

    show: function(val) {
      if (!val) {
        if (this.stepsActive == 3) {
          this.resetData()
        }
      }
    },

    stepsActive() {
      this.$emit('status', {
        1: 'wait',
        2: 'process',
        3: 'finish'
      }[this.stepsActive])
    }

  },
  created() {},
  methods: {
    sureClick() {
      if (this.stepsActive == 1) {
        if (this.stepList[0].status == 'finish') {
          this.stepList[1].status = 'process'
          this.stepsActive = 2
          this.firstUpdateFile(res => {
            this.stepList[1].status = 'finish'
            this.stepsActive = 3
            if (res.data) {
              this.resultData = res.data
              if (this.resultData.errSize > 0) {
                this.stepList[2].status = 'error'
              } else {
                this.stepList[2].status = 'finish'
              }
            }
          })
        } else {
          if (!this.file.name) {
            this.$message.error('请选择导入文件')
          }
        }
      } else {
        this.closeView()
      }
    },


    /**
     * 第一步上传
     */
    firstUpdateFile(result) {
      var params = {}
      params.workId = this.workId
      params.file = this.file
      this.loading = true
      workExcelImportAPI(params)
        .then(res => {
          if (result) {
            result(res)
          }
          this.loading = false
          this.$emit('success')
        })
        .catch(() => {
          if (result) {
            result(false)
          }
          this.loading = false
        })
    },

    /**
     * 下载错误模板
     */
    downloadErrData() {
      this.loading = true
      workDownloadErrorExcelAPI({ token: this.resultData.token })
        .then(res => {
          downloadExcelWithResData(res)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    // 下载模板操作
    download() {
      workDownloadExcelAPI()
        .then(res => {
          downloadExcelWithResData(res)
        })
        .catch(() => {})
    },
    // 选择文件
    selectFile() {
      document.getElementById('importInputFile').click()
    },
    /** 图片选择出发 */
    uploadFile(event) {
      var files = event.target.files
      const file = files[0]
      if (verifyFileTypeWithFileName(file.name)) {
        this.file = file
        // 阶段一状态
        this.getFirstStepStatus()
      }
      event.target.value = ''
    },
    getFirstStepStatus() {
      // 阶段一状态
      const hasFile = this.file && this.file.size

      this.stepList[0].status = hasFile ? 'finish' : 'wait'
    },

    // 关闭操作
    closeView() {
      this.$emit('update:show', false)
      this.$emit('close', this.stepsActive == 3 ? 'finish' : '')
    },

    /**
     * 重置页面数据
     */
    resetData() {
      this.file = { name: '' }

      this.stepsActive = 1
      this.stepList = [
        {
          icon: 'wk wk-upload',
          title: '上传文件',
          status: 'wait'
        },
        {
          icon: 'wk wk-data-import',
          title: '导入数据',
          status: 'wait'
        },
        {
          icon: 'wk wk-success',
          title: '导入完成',
          status: 'wait'
        }
      ]
      this.resultData = null
    }
  }
}
</script>

<style scoped lang="scss">
.el-steps {
  margin-bottom: 15px;

  /deep/ .el-step__title {
    font-size: 14px;
  }

  /deep/ .el-step.is-simple .el-step__arrow::before,
  /deep/ .el-step.is-simple .el-step__arrow::after {
    height: 10px;
    width: 2px;
  }

  /deep/ .el-step.is-simple .el-step__arrow::after {
    transform: rotate(45deg) translateY(3px);
  }
  /deep/ .el-step.is-simple .el-step__arrow::before {
    transform: rotate(-45deg) translateY(-2px);
  }
}

.step-section {
  min-height: 300px;
  position: relative;

  /deep/ .el-loading-spinner {
    top: 45%;
    .el-icon-loading {
      font-size: 40px;
      color: #999;
    }

    .el-loading-text {
      color: #333;
      margin: 8px 0;
    }
  }

  &__tips {
    color: #999;
    font-size: 12px;
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    text-align: center;
    z-index: 3000;
  }
}

.sections {
  font-size: 14px;
  color: #333;

  &__title {
    font-weight: 600;
  }

  &__tips {
    padding-left: 30px;
    margin: 8px 0 15px;
    color: #999;
    font-size: 12px;
    line-height: 1.4;
  }

  .download {
    cursor: pointer;
    color: #2362FB;
  }

}

.sections__tips + .content {
  padding-top: 0;
}

.content {
  padding: 10px 10px 10px 30px;
  .el-select {
    width: 400px;
  }
  .user-cell {
    width: 400px;
  }
}

#importInputFile {
  display: none;
}

.file-select {
  .el-input {
    width: 400px;
  }
  button {
    margin-left: 20px;
  }
}

.is-hidden {
  visibility: hidden;
}


// 结果信息
.result-info {
  text-align: center;
  padding-top: 80px;

  &__icon {
    font-size: 40px;
    color: $xr-color-primary;
  }

  &__des {
    margin-top: 15px;
    color: #333;
    font-size: 14px;
  }

  &__detail {
    margin-top: 15px;
    font-size: 12px;
    color: #666;
    &--all {
      color: #333;
      font-weight: 600;
    }

    &--suc {
      color: $xr-color-primary;
      font-weight: 600;
    }

    &--err {
      color: #f94e4e;
      font-weight: 600;
    }
  }

  &__btn--err {
    margin-top: 10px;
  }
}
</style>
