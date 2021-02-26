<template>
  <el-dialog
    :visible.sync="showDialog"
    :append-to-body="true"
    :show-close="showCancel"
    :close-on-click-modal="false"
    title="批量导入"
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
      <div
        v-if="stepsActive == 1"
        class="sections">
        <div>请选择需要导入的文件</div>
        <div class="content">
          <flexbox class="file-select">
            <el-input
              v-model="file.name"
              :disabled="true" />
            <el-button
              type="primary"
              @click="selectFile">选择文件</el-button>
          </flexbox>
        </div>
        <div
          class="download"
          @click="download">
          点击下载《员工导入模板》</div>
        <div class="content content-tips">
          <div>操作步骤：</div>
          <div>1、下载《员工导入模板》</div>
          <div>2、打开《员工导入模板》将对应字段信息输入或粘贴进本表。为保障粘贴信息被有效导入，请使用纯文本或数字</div>
          <div>3、信息输入完毕，点击“选择文件”按钮，选择excel文件上传</div>
          <div>4、点击“确定”开始进行员工导入</div>
        </div>
      </div>

      <div
        v-loading="loading"
        v-else-if="stepsActive == 2"
        element-loading-text="数据导入中"
        element-loading-spinner="el-icon-loading"
        class="sections" />

      <div
        v-loading="loading"
        v-else-if="stepsActive == 3"
        class="sections">
        <div class="result-info">
          <i class="wk wk-success result-info__icon" />
          <p class="result-info__des">数据导入完成</p>
          <p class="result-info__detail">导入总数据<span class="result-info__detail--all">{{ resultData.totalSize }}</span>条，导入成功<span class="result-info__detail--suc"><template v-if="resultData">{{ resultData.totalSize - (resultData.errSize || 0) }}</template></span>条，导入失败<span class="result-info__detail--err">{{ resultData.errSize || 0 }}</span>条</p>
          <el-button
            v-if="resultData && resultData.errSize > 0"
            class="result-info__btn--err"
            type="text"
            @click="downloadErrData">下载错误数据</el-button>
        </div>
      </div>
      <input
        id="importInputFile"
        ref="userFileInput"
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
  userImportTemplateURL,
  userExcelImportAPI,
  userErrorExcelDownAPI
} from '@/api/admin/employeeDep'

import { downloadExcelWithResData, verifyFileTypeWithFileName } from '@/utils'

export default {
  // 批量导入员工股
  name: 'BulkImportUser',
  components: {},
  props: {
    show: {
      type: Boolean,
      default: false
    },
    // CRM类型
    crmType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      showDialog: false,
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
      this.showDialog = val
      this.resetData()
    }
  },
  mounted() {},
  methods: {
    sureClick() {
      if (this.stepsActive == 1) {
        if (this.stepList[0].status == 'finish') {
          this.stepList[1].status = 'process'
          this.stepsActive = 2
          this.updateFile(res => {
            this.stepList[1].status = 'finish'
            this.stepsActive = 3
            if (res.data) {
              this.resultData = res.data
              if (res.data.errSize > 0) {
                this.stepList[2].status = 'error'
              } else {
                this.stepList[2].status = 'finish'
              }
            }
          })
        } else {
          this.$message.error('请选择导入文件')
        }
      } else if (this.stepsActive == 3) {
        this.closeView()
      }
    },

    updateFile(result) {
      if (!this.file.name) {
        this.$message.error('请选择导入文件')
      } else {
        this.loading = true
        userExcelImportAPI({
          file: this.file
        })
          .then(res => {
            this.loading = false
            if (result) {
              result(res)
            }
            this.$emit('success')
          })
          .catch(() => {
            if (result) {
              result(false)
            }
            this.loading = false
          })
      }
    },

    /**
     * 下载错误
     */
    downloadErrData() {
      this.getImportError(this.resultData.token)
    },

    /**
     * 导入错误下载
     */
    getImportError(token) {
      this.loading = true
      userErrorExcelDownAPI({
        token
      })
        .then(res => {
          downloadExcelWithResData(res)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 下载模板操作
     */
    download() {
      window.open(userImportTemplateURL)
    },

    /**
     * 选择文件选择文件
     */
    selectFile() {
      this.$refs.userFileInput.click()
    },

    /**
     * 选择触发
     */
    uploadFile(event) {
      var files = event.target.files
      const file = files[0]
      if (verifyFileTypeWithFileName(file.name)) {
        this.file = file
        this.stepList[0].status = 'finish'
      }
      event.target.value = ''
    },

    /**
     * 关闭
     */
    closeView() {
      this.$emit('close')
    },

    /**
     * 重置数据
     */
    resetData() {
      this.file = { name: '' }
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
      this.stepsActive = 1
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

.sections {
  font-size: 14px;
  min-height: 215px;
  .download {
    cursor: pointer;
    color: #2362fb;
    margin-bottom: 15px;
  }

  /deep/ .el-loading-spinner {
    top: 45%;
    .el-icon-loading {
      font-size: 40px;
      color: #999;
    }

    .el-loading-text {
      color: #333;
    }
  }
}

.content {
  padding: 10px 0;
}

.content-tips {
  font-size: 12px;
  color: #999;
  line-height: 15px;
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
  padding-top: 30px;

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
