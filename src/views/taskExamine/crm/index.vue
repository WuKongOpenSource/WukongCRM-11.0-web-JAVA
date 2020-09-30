<template>
  <div class="main">
    <base-tabs-head
      :tabs="tabs"
      :select-value.sync="tabsSelectValue"
      @change="tabsChange" />

    <div
      v-infinite-scroll="getList"
      :key="`${scrollKey}${tabsSelectValue}`"
      infinite-scroll-distance="100"
      infinite-scroll-disabled="scrollDisabled"
      class="cell-section">
      <crm-cell
        v-for="(item, index) in list"
        :crm-type="crmType"
        :key="index"
        :data="item"
        :index="index"
        @handle="cellHandle" />
      <p
        v-if="loading"
        class="scroll-bottom-tips">加载中...</p>
      <p
        v-if="noMore"
        class="scroll-bottom-tips">没有更多了</p>
    </div>

    <!-- 查看详情 -->
    <c-r-m-all-detail
      :visible.sync="showCrmDetail"
      :crm-type="detailCrmType"
      :id="rowID"
      :no-listener-class="['relate-cell', 'examine-content']" />

    <!-- 审批操作 -->
    <examine-handle
      :show="showExamineHandle"
      :id="rowID"
      :record-id="rowData.examineRecordId"
      :detail="rowData"
      :status="examineStatus"
      :examine-type="`crm_${crmType}`"
      @close="showExamineHandle = false"
      @save="examineHandleCallBack" />
  </div>
</template>

<script>
import {
  crmExamineMyExamineAPI
} from '@/api/crm/common'
import BaseTabsHead from '@/components/BaseTabsHead'
import CrmCell from './components/CrmCell'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import ExamineHandle from '@/components/Examine/ExamineHandle'

export default {
  // 回款和合同审批
  name: 'Index',
  components: {
    BaseTabsHead,
    CrmCell,
    CRMAllDetail,
    ExamineHandle
  },
  mixins: [],
  props: {},
  data() {
    return {
      crmType: '',
      // 待我审批的
      tabsSelectValue: '1',
      tabs: [
        {
          label: '全部',
          name: 'all'
        },
        {
          label: '待我审批的',
          name: '1'
        },
        {
          label: '我已审批的',
          name: '2'
        }
      ],
      list: [],
      loading: false,
      noMore: false,
      scrollKey: Date.now(),
      page: 1,

      // 控制详情展示
      detailIndex: 0,

      // 相关详情的查看
      rowID: '',
      rowData: {}, // 行全部信息
      detailCrmType: '',
      showCrmDetail: false,

      // 撤回操作
      showExamineHandle: false,
      recordId: '',
      // 审核操作 1 审核通过 2 审核拒绝 4 已撤回
      examineStatus: 1
    }
  },
  computed: {
    // 无线滚动控制
    scrollDisabled() {
      return this.loading || this.noMore
    }
  },
  watch: {},
  mounted() {
    this.crmType = this.$route.params.type
  },

  beforeRouteUpdate(to, from, next) {
    this.crmType = to.params.type
    this.tabsSelectValue = '1'

    this.refreshList()
    next()
  },

  beforeDestroy() {},
  methods: {
    /**
     * 刷新列表
     */
    refreshList() {
      this.page = 1
      this.list = []
      this.noMore = false
      this.scrollKey = Date.now()
    },

    /**
     * 获取数据列表
     */
    getList() {
      this.loading = true
      const params = {
        page: this.page,
        limit: 15,
        status: this.tabsSelectValue == 'all' ? '' : this.tabsSelectValue
      }

      // 1合同 2 回款 3 发票
      if (this.crmType == 'contract') {
        params.categoryType = 1
      } else if (this.crmType == 'receivables') {
        params.categoryType = 2
      } else if (this.crmType == 'invoice') {
        params.categoryType = 3
      }

      crmExamineMyExamineAPI(params)
        .then(res => {
          this.loading = false
          const status = this.tabsSelectValue == 'all' ? '' : this.tabsSelectValue
          if (params.status == status) {
            if (!this.noMore) {
              this.list = this.list.concat(res.data.list)
              this.page++
            }
            this.noMore = res.data.lastPage
          } else {
            this.refreshList()
          }
        })
        .catch(() => {
          this.noMore = true
          this.loading = false
        })
    },

    /**
     * 中间tabs改变
     */
    tabsChange(type) {
      this.refreshList()
    },

    /**
     * cell 操作
     */
    cellHandle(type, data, index) {
      this.detailIndex = index

      if (type == 'detail') {
        this.detailCrmType = this.crmType
        this.rowID = data.catagoryId
        this.showCrmDetail = true
      } else if (type == 'relate-detail') {
        this.showDview = false
        this.rowID = data.id
        this.detailCrmType = data.type
        this.showCrmDetail = true
      } else if (type == 'reject' || type == 'pass' || type == 'withdraw') {
        // 审核操作 1 审核通过 2 审核拒绝 4 已撤回
        this.rowID = data.catagoryId
        this.examineStatus = {
          pass: 1,
          reject: 2,
          withdraw: 4
        }[type]
        this.rowData = data
        this.showExamineHandle = true
      }
    },

    /**
     * 审批操作回调
     */
    examineHandleCallBack(data) {
      // 1 通过 2 拒绝 4 撤回
      this.refreshDataByHandle()
    },

    /**
     * 根据请求刷新数据
     */
    refreshDataByHandle() {
      this.refreshList()
      // 获取5条数据
      // let page = 1
      // if (this.detailIndex > 0) {
      //   page = Math.ceil(this.detailIndex / 5)
      // }

      // const params = {
      //   page: page,
      //   limit: 5,
      //   status: this.status
      // }

      // if (this.crmType == 'contract') {
      //   params.categoryType = 1
      // } else if (this.crmType == 'receivables') {
      //   params.categoryType = 2
      // }

      // crmExamineMyExamineAPI(params)
      //   .then(res => {
      //     const crmData = this.list[this.detailIndex]
      //     for (let index = 0; index < res.data.list.length; index++) {
      //       const element = res.data.list[index]
      //       if (element.catagoryId == crmData.catagoryId) {
      //         this.list.splice(this.detailIndex, 1, element)
      //         break
      //       }
      //     }
      //   })
      //   .catch(() => {
      //   })
    },

    detailHandleCallBack(data, index) {
      this.detailIndex = index
      this.refreshDataByHandle()
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  position: relative;
  height: 100%;
  width: 920px;
}

.base-tabs-head {
  margin-bottom: 15px;
}

.cell-section {
  height: calc(100% - 70px);
  overflow: auto;
}
</style>
