import {
  mapGetters
} from 'vuex'

import { crmLeadsNumAPI, crmLeadsStarAPI } from '@/api/crm/leads'
import { crmCustomerNumAPI, crmCustomerStarAPI } from '@/api/crm/customer'
import { crmContactsNumAPI, crmContactsStarAPI } from '@/api/crm/contacts'
import { crmBusinessNumAPI, crmBusinessStarAPI } from '@/api/crm/business'
import { crmContractNumAPI } from '@/api/crm/contract'
import { crmProductNumAPI } from '@/api/crm/product'
import { crmReceivablesNumAPI } from '@/api/crm/receivables'

import { debounce } from 'throttle-debounce'

export default {
  data() {
    return {
      showFirstDetail: true,
      detailData: null,
      // tabs Number
      tabsNumber: {},
      currentPageIndex: 0
    }
  },
  props: {
    /** 是公海 默认是客户 */
    isSeas: {
      type: Boolean,
      default: false
    },
    pageIndex: [String, Number],
    pageList: Array // 用于详情切换
  },

  computed: {
    ...mapGetters(['crm']),
    // 是否能新建跟进记录
    canCreateFollowRecord() {
      return this.crm && this.crm.followRecord && this.crm.followRecord.save
    },
    // 能否查看详情
    canShowDetail() {
      if (this.detailData && this.detailData.dataAuth === 0) {
        return false
      }

      return this.crm && this.crm[this.crmType] && this.crm[this.crmType].read
    },

    showTabsNumber() {
      return this.crmType !== 'visit'
    }
  },

  watch: {
    id: function() {
      if (this.canShowDetail) {
        this.detailData = null
        this.tabsNumber = {}
        this.getDetial()
        this.getTabsNum()
      }
    },

    detailData() {
      if (this.$refs.crmDetailMain && this.$refs.crmDetailMain.style.background == 'white') {
        this.$refs.crmDetailMain.style.background = 'inherit'
      }
    }
  },

  mounted() {
    this.$refs.crmDetailMain.style.background = 'white'
    this.debouncedGetTabsNum = debounce(300, this.getTabsNum)
  },

  beforeDestroy() {
    this.$bus.off('crm-tab-num-update', this.debouncedGetTabsNum)
  },

  methods: {
    /**
     * 详情页面切换
     */
    pageChange(type) {
      if (type === 'left') {
        if (this.pageIndex > 0) {
          let pageIndex = this.pageIndex
          this.$emit('update:pageIndex', --pageIndex)
          this.$emit('update:id', this.pageList[pageIndex][`${this.crmType}Id`])
        } else {
          this.$message.error('没有更多了')
        }
      } else {
        if (this.pageIndex < this.pageList.length - 1) {
          let pageIndex = this.pageIndex
          this.$emit('update:pageIndex', ++pageIndex)
          this.$emit('update:id', this.pageList[pageIndex][`${this.crmType}Id`])
        } else {
          this.$message.error('没有更多了')
        }
      }
    },

    viewAfterEnter() {
      if (this.canShowDetail) {
        this.getDetial()
        this.getTabsNum()
        this.$bus.on('crm-tab-num-update', this.debouncedGetTabsNum)
      }
    },

    /**
     * 顶部头 操作
     * @param {*} data
     */
    detailHeadHandle(data) {
      // 返回值为false 不继续执行
      if (this.detailHeadHandleClick(data) === false) {
        return
      }

      if (data.type === 'edit') {
        this.isCreate = true
      } else if (data.type === 'delete' ||
      data.type === 'exit-team' ||
      data.type === 'alloc' ||
      data.type === 'get' ||
      data.type === 'transfer' ||
      data.type === 'transform' ||
      data.type === 'delete' ||
      data.type === 'put_seas') {
        this.hideView()
      } else if (data.type === 'state_start' ||
      data.type === 'state_disable' ||
      data.type === 'deal_status' ||
      data.type === 'cancel' ||
      data.type === 'examine') {
        this.getDetial()
      } else if (data.type === 'save-success') {
        // 但字段编辑成功刷新
        this.editSaveSuccess()
        return
      }

      this.$emit('handle', data)
    },

    /**
     * 详情操作
     */
    detailHeadHandleClick() {},

    /**
     * 编辑成功
     */
    editSaveSuccess() {
      this.$bus.$emit('crm-detail-update', this.crmType)
      this.$emit('handle', { type: 'save-success' })
      this.detailData = null
      this.getDetial()
    },

    /**
     * 获取tab数量
     */
    getTabsNum() {
      if (!this.showTabsNumber) {
        return
      }
      const request = {
        leads: crmLeadsNumAPI,
        customer: crmCustomerNumAPI,
        contacts: crmContactsNumAPI,
        business: crmBusinessNumAPI,
        contract: crmContractNumAPI,
        product: crmProductNumAPI,
        receivables: crmReceivablesNumAPI
      }[this.crmType]

      if (!request) {
        return
      }

      const params = {}
      params[`id`] = this.id

      request(params)
        .then(res => {
          this.tabsNumber = res.data || {}
        })
        .catch(() => {
        })
    },

    /**
     * 获取tabs名字
     * @param {*} name
     * @param {*} num
     */
    getTabName(name, num) {
      return `${name}${num && num > 0 ? '（' + num + '）' : ''}`
    },

    /**
     * 切换关注状态
     * @param index
     * @param status
     */
    toggleStar() {
      this.loading = true

      const request = {
        leads: crmLeadsStarAPI,
        customer: crmCustomerStarAPI,
        contacts: crmContactsStarAPI,
        business: crmBusinessStarAPI
      }[this.crmType]

      const params = {}
      params[`id`] = this.detailData[`${this.crmType}Id`]
      request(params).then(() => {
        this.loading = false
        this.$message.success(this.detailData.star > 0 ? '取消关注成功' : '关注成功')
        this.detailData.star = this.detailData.star > 0 ? 0 : 1
        this.$emit('handle', { type: 'star' })
      }).catch(() => {
        this.loading = false
      })
    }
  },

  deactivated: function() { }

}
