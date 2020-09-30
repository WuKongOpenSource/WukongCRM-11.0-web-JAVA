import { crmQueryImportNumAPI } from '@/api/crm/common'

import Lockr from 'lockr'

export default {
  data() {
    return {
      showCRMImport: false,
      crmType: '',
      crmProps: null,
      crmImportStatus: '',
      cacheShow: false, // 缓存展示
      cacheDone: false // 缓存导入是否完成
    }
  },

  created() {
    this.addImportBus()

    // 处理上次缓存
    const beforeImportInfo = Lockr.get('crmImportInfo')
    if (beforeImportInfo && beforeImportInfo.messageId) {
      this.crmType = beforeImportInfo.crmType
      this.crmProps = beforeImportInfo.crmProps
      this.secondQueryNum(beforeImportInfo.messageId)
      this.cacheShow = true
    } else {
      this.cacheShow = false
    }
  },

  computed: {
    // 1.导入框展示 2.导入状态状态为空或者是等待状态  缩小框不展示
    showFixImport() {
      return !this.showCRMImport && this.crmImportStatus && this.crmImportStatus != 'wait'
    }
  },

  watch: {},

  methods: {
    addImportBus() {
      this.$bus.on('import-crm-bus', (crmType, props) => {
        if (this.crmType != crmType && this.showFixImport) {
          this.$message.error('请先处理当前导入的数据')
        } else {
          this.crmType = crmType
          this.crmProps = props
          this.showCRMImport = true
        }
      })
    },

    crmImportChange(status) {
      this.crmImportStatus = this.showCRMImport && status == 'finish' ? '' : status
    },

    fixImportClick() {
      this.showCRMImport = true
    },

    crmImportClose(status) {
      if (status == 'finish') {
        this.crmImportStatus = ''
      }
    },

    /**
     * 第二步查询数量
     */
    secondQueryNum(messageId) {
      crmQueryImportNumAPI({ messageId: messageId })
        .then(res => {
          if (res.data === null) { // 结束 否则 进行中
            this.crmImportStatus = 'finish'
            this.cacheDone = true
          } else {
            this.cacheDone = false
            this.crmImportStatus = 'process'
          }
          this.showCRMImport = false
        })
        .catch(() => {
          Lockr.rm('crmImportInfo')
        })
    }
  }

}
