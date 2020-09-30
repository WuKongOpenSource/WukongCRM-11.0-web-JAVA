<template>
  <el-container
    v-loading="loading"
    :class="{ 'is-perview': isPreview }"
    class="wk-print-container">
    <el-header >
      <template v-if="isPreview">
        <el-button type="primary" @click="handleClick('download')">{{ `${perviewTypeName} 下载` }}</el-button>
        <el-button type="primary" @click="handleClick('print')">打印</el-button>
        <el-button @click="handleClick('goback')">取消</el-button>
      </template>
      <template v-else>
        <span class="select-label">选择模版</span>
        <el-select
          v-model="templateId"
          style="width: 170px;"
          class="handle-item-content"
          @change="getDetail">
          <el-option
            v-for="item in templateOptions"
            :key="item.templateId"
            :label="item.templateName"
            :value="item.templateId"/>
        </el-select>
        <span class="select-label">选择模版</span>
        <el-select
          v-model="perviewType"
          style="width: 80px;"
          class="handle-item-content">
          <el-option
            v-for="item in previewOptions"
            :key="item"
            :label="item"
            :value="item"/>
        </el-select>

        <el-button class="preview-button" type="primary" @click="printPreviewClick">打印预览</el-button>
      </template>
    </el-header>
    <el-main>
      <div class="main-container">
        <div class="main-content">
          <iframe
            v-show="isPreview"
            id="wkPrint"
            :height="iframeHeight"
            :src="iframeUrl"
            style="width: 100%;margin-top: 54px;"
            scrolling="no"
            frameborder="0"/>
        </div>
        <div v-show="!isPreview" class="main-tips">您可以在当前页面对模版文字进行调整，确认无误后可进行打印</div>
        <div v-show="!isPreview" class="main-content">
          <tinymce
            ref="editor" :toolbar="[]" v-model="content" :init="{
              statusbar: false,
              plugins: 'print autoresize',
              extended_valid_elements: 'span[class|title|wktag|style|contenteditable]',
              content_style: ' body {padding: 60px !important;width: 595px; margin: 0 auto;} p { margin: 5px 0;}',
          }" class="rich-txt" />
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import {
  printPrintAPI,
  printRecordDetailAPI,
  printSaveRecordAPI,
  printTemplateListAPI,
  printPreviewAPI
} from '@/api/admin/crm'
import { crmFileDownByPathAPI, downloadFileAPI } from '@/api/common'

import Tinymce from '@/components/Tinymce'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import { downloadFileWithBuffer } from '@/utils'

export default {
  name: 'Print',
  components: {
    Tinymce
  },
  props: {},
  data() {
    return {
      loading: false,
      isPreview: false, // 是编辑 还是打印预览
      templateOptions: [],
      templateId: '',
      typeId: '', // 模块对应的id
      previewOptions: ['word', 'pdf'],
      perviewType: 'word',
      content: '',
      historyData: null,

      // 预览
      iframeUrl: '',
      iframeHeight: document.documentElement.clientHeight - 170,
      srcData: null
    }
  },
  computed: {
    perviewTypeName() {
      return {
        word: 'Word',
        pdf: 'PDF'
      }[this.perviewType]
    }
  },
  created() {
    if (this.$route.query.type == 'history') {
      this.getRecordDetail()
    } else {
      this.typeId = this.$route.query.id
      this.getTemplateOptions(crmTypeModel.convertKeyToType(this.$route.query.module))
    }

    window.addEventListener('resize', this.changeIframeHeight)
  },
  beforeRouteUpdate(to, from, next) {
    this.content = ''
    next()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.changeIframeHeight)
  },
  methods: {
    changeIframeHeight() {
      this.iframeHeight = document.documentElement.clientHeight - 170
    },

    /**
     * 获取模板配置
     */
    getTemplateOptions(type) {
      this.loading = true
      printTemplateListAPI({
        type: type,
        pageType: 0
      })
        .then(res => {
          this.templateOptions = res.data.list || []
          if (this.$route.query.type != 'history') {
            if (this.templateOptions.length) {
              this.templateId = this.templateOptions[0].templateId
              this.getDetail()
            } else {
              this.templateId = ''
            }
          }

          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 详情
     */
    getDetail() {
      this.loading = true
      printPrintAPI({
        templateId: this.templateId,
        id: this.typeId
      })
        .then(res => {
          this.loading = false
          this.content = res.data
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 详情
     */
    getRecordDetail() {
      this.loading = true
      printRecordDetailAPI({
        recordId: this.$route.query.recordId
      })
        .then(res => {
          this.loading = false
          const data = res.data || {}
          this.historyData = data
          this.templateId = data.templateId
          this.typeId = data.typeId

          this.getTemplateOptions(data.crmType)
          this.content = data.recordContent || ''
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
       * 打印
       */
    compactPrint() {
      this.$refs.editor.editor.execCommand('mcePrint')
      this.savePrintRecord()
    },

    /**
     * 打印预览
     */
    printPreviewClick() {
      this.loading = true
      printPreviewAPI({
        type: this.perviewType,
        content: this.content
      })
        .then(res => {
          this.loading = false
          const data = res.data
          const iframeUrl = `/crmPrint/preview.pdf?type=1&key=${data}`
          downloadFileAPI(iframeUrl).then(res => {
            this.iframeUrl = window.URL.createObjectURL(res.data)
          }).catch(() => {})

          this.srcData = data
          this.isPreview = true
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     *保存打印记录
     */
    savePrintRecord() {
      if (this.templateId && this.typeId) {
        printSaveRecordAPI({
          templateId: this.templateId,
          typeId: this.typeId,
          recordContent: this.content
        })
          .then(res => {
          })
          .catch(() => {
          })
      }
    },

    hidenView() {
      this.$emit('close')
    },

    /** 预览页面逻辑 */

    handleClick(type) {
      if (type == 'goback') {
        this.isPreview = false
      } else if (type == 'print') {
        document.getElementById('wkPrint').contentWindow.print() // 调用浏览器的打印功能打印指定区域
        this.savePrintRecord()
      } else if (type == 'download') {
        if (this.srcData) {
          var ext = this.perviewType
          const path = this.srcData
          var data = {
            key: path,
            type: ext === 'word' ? 2 : 1
          }
          ext = ext === 'word' ? 'doc' : 'pdf'
          crmFileDownByPathAPI(data).then(res => {
            const blob = new Blob([res.data], {
              type: ''
            })
            downloadFileWithBuffer(blob, `文档.${ext}`)
          }).catch(() => {})
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-print-container {
  .el-header {
    background-color: white;
    box-shadow: 0px 1px 2px #dbdbdb;
    line-height: 60px;
    padding: 0 70px;
    z-index: 1;
    position: relative;

    .select-label {
      margin-right: 15px;
    }

    .el-select + .select-label {
      margin-left: 30px;
    }
  }

  .preview-button {
    position: absolute;
    right: 70px;
    top: 16px;
  }

  .el-main {
    padding: 0;
  }

  &.is-perview {
    .el-header {
      text-align: right;
    }
  }
}

.main-container {
  height: 100%;
  overflow: auto;

  .main-tips {
    text-align: center;
    font-size: 13px;
    margin: 20px 0;
    color: #BFBFBF;
  }

  .main-content {
    width: 66%;
    margin: 0 auto;
  }
}

</style>
