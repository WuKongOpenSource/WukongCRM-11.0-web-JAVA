<template>
  <div class="main">
    <examine-tabs-head
      ref="tabsHead"
      :tabs="tabs"
      :select-list="selectList"
      :select-value.sync="tabsSelectValue"
      @change="tabsChange"
      @select="tabsSelect"
      @add="createClick"
      @export="exportClick" />

    <div
      v-infinite-scroll="getList"
      :key="`${scrollKey}${tabsSelectValue}`"
      infinite-scroll-distance="100"
      infinite-scroll-disabled="scrollDisabled"
      class="cell-section">
      <examine-cell
        v-for="(item, index) in list"
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

    <!-- 创建 -->
    <examine-category-select
      :show="showCategorySelect"
      @select="selcetExamineCategory"
      @close="showCategorySelect=false" />
    <examine-create-view
      v-if="isCreate"
      :category-id="createInfo.categoryId"
      :type="createInfo.type"
      :category-title="createInfo.categoryTitle"
      :action="createAction"
      @save-success="refreshList"
      @hiden-view="createHideView" />

    <!-- 列表操作 -->
    <examine-detail
      v-if="showDview"
      :id="rowID"
      :detail-index="detailIndex"
      :no-listener-class="['examine-content']"
      class="d-view"
      @hide-view="showDview=false"
      @on-examine-handle="detailHandleCallBack" />

    <c-r-m-all-detail
      :visible.sync="showRelatedDetail"
      :crm-type="relatedCRMType"
      :id="relatedID"
      :no-listener-class="['relate-cell']" />

    <examine-handle
      :show="showExamineHandle"
      :id="rowID"
      :record-id="rowData.examineRecordId"
      :detail="rowData"
      :status="examineStatus"
      examine-type="oa_examine"
      @close="showExamineHandle = false"
      @save="examineHandleCallBack" />
  </div>
</template>

<script>
import {
  oaExamineMyCreateIndexAPI,
  oaExamineDeleteAPI,
  oaExamineExportAPI
} from '@/api/oa/examine'
import {
  examinesQueryPartListAPI,
  examineWaitingQueryOaExamineListAPI
} from '@/api/examine'
import ExamineTabsHead from './components/ExamineTabsHead'
import ExamineCell from './components/ExamineCell'
import ExamineMixin from './components/ExamineMixin'
import ExamineCategorySelect from '@/views/oa/examine/components/ExamineCategorySelect'
import ExamineCreateView from '@/views/oa/examine//components/ExamineCreateView'

import ExamineDetail from '@/views/oa/examine/components/ExamineDetail'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import ExamineHandle from '@/components/Examine/ExamineHandle'

import { downloadExcelWithResData } from '@/utils/index'

export default {
  /** 审批 */
  name: 'Index',
  components: {
    ExamineTabsHead,
    ExamineCell,
    ExamineCategorySelect,
    ExamineCreateView,

    ExamineDetail,
    CRMAllDetail,
    ExamineHandle
  },
  mixins: [ExamineMixin],
  props: {},
  data() {
    return {
      tabsSelectValue: '',
      selectList: [],
      examineType: '',
      list: [],
      loading: false,
      noMore: false,
      scrollKey: Date.now(),
      page: 1,
      // 空是全部
      selectId: '',

      // 新建
      showCategorySelect: false,
      isCreate: false, // 是创建
      createAction: { type: 'save' },
      createInfo: {}, // 创建所需要的id 标题名信息

      // 控制详情展示
      // 目前选中单元格(从cell 回调中 获取)
      detailIndex: 0,
      rowID: '',
      rowData: {}, // 行全部信息
      showDview: false,

      // 相关详情的查看
      relatedID: '',
      relatedCRMType: '',
      showRelatedDetail: false,

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
    },

    tabs() {
      if (this.examineType == 'my') {
        // status
        return [
          {
            label: '全部',
            name: 'all'
          },
          {
            label: '待审批',
            name: '0'
          },
          {
            label: '审批通过',
            name: '1'
          },
          {
            label: '审批拒绝',
            name: '2'
          }
        ]
      } else if (this.examineType == 'wait') {
        // status
        return [
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
        ]
      }
      return []
    }
  },
  watch: {},
  mounted() {
    this.examineType = this.$route.params.type
    this.getSelectList()
    this.tabsSelectValue = this.examineType == 'my' ? '0' : '1'
  },

  beforeRouteUpdate(to, from, next) {
    this.examineType = to.params.type
    this.selectId = ''
    this.tabsSelectValue = this.examineType == 'my' ? '0' : '1'
    this.$refs.tabsHead.getDefaultSelectValue()

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
        categoryId: this.selectId
      }

      let request = null
      const status = this.tabsSelectValue == 'all' ? '' : this.tabsSelectValue
      if (this.examineType == 'my') {
        params.status = status
        request = oaExamineMyCreateIndexAPI
      } else if (this.examineType == 'wait') {
        params.status = status
        request = examineWaitingQueryOaExamineListAPI
      }

      request(params)
        .then(res => {
          this.loading = false

          const status = this.tabsSelectValue == 'all' ? '' : this.tabsSelectValue
          let pass = false
          if (this.examineType == 'my' && params.status == status) {
            pass = true
          } else if (this.examineType == 'wait' && params.status == status) {
            pass = true
          }

          if (pass) {
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
     * 获取审批类型
     */
    getSelectList() {
      examinesQueryPartListAPI({
        label: 0
      })
        .then(res => {
          const resData = res.data || {}
          const list = resData.list || []
          this.selectList = list.map(item => {
            const iconItem = this.getCategoryIcon(item.examineIcon)
            item.categoryTitle = item.examineName
            iconItem.label = item.examineName
            iconItem.command = item.examineId
            return iconItem
          })
          this.selectList.unshift({
            icon: 'wk wk-approve',
            color: '#9376FF',
            command: '',
            label: '全部审批'
          })
        })
        .catch(() => {
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
     * 单选
     */
    tabsSelect(id) {
      this.selectId = id
      this.refreshList()
    },

    /**
     * cell 操作
     */
    cellHandle(type, data, index) {
      this.detailIndex = index

      if (type == 'detail') {
        this.showRelatedDetail = false
        this.rowID = data.examineId
        this.showDview = true
      } else if (type == 'relate-detail') {
        this.showDview = false
        this.relatedID = data.id
        this.relatedCRMType = data.type
        this.showRelatedDetail = true
      } else if (type == 'edit') {
        data.title = data.categoryName
        this.createInfo = data
        this.createAction = { type: 'update', id: data.examineId, data: data }
        this.isCreate = true
      } else if (type == 'delete') {
        this.$confirm('确定删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            oaExamineDeleteAPI({
              examineId: data.examineId
            }).then(res => {
              this.list.splice(index, 1)
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            })
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      } else if (type == 'reject' || type == 'pass' || type == 'withdraw') {
        // 审核操作 1 审核通过 2 审核拒绝 4 已撤回
        this.rowID = data.examineId
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
     * 新建 审批类型选择
     */
    selcetExamineCategory(item) {
      this.createInfo = item
      this.createAction = { type: 'save' }
      this.isCreate = true
    },

    /**
     * 创建
     */
    createClick() {
      this.showCategorySelect = true
    },

    /**
     * 创建关闭
     */
    createHideView() {
      this.isCreate = false
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
      //   categoryId: this.selectId
      // }

      // if (this.examineType == 'my') {
      //   params.status = this.status
      // } else if (this.examineType == 'wait') {
      //   params.status = this.status
      // }

      // examineWaitingQueryOaExamineListAPI(params)
      // .then(res => {
      //   const examine = this.list[this.detailIndex]
      //   for (let index = 0; index < res.data.list.length; index++) {
      //     const element = res.data.list[index]
      //     if (element.examineId == examine.examineId) {
      //       this.list.splice(this.detailIndex, 1, element)
      //       break
      //     }
      //   }
      // })
      // .catch(() => {})
    },

    detailHandleCallBack(data, index) {
      this.detailIndex = index
      this.refreshDataByHandle()
    },

    /**
     * 审批导出
     */
    exportClick() {
      if (this.selectId === '') {
        this.$message.error('请选择一种审批类型导出')
        return
      }

      this.loading = true
      const params = {
        categoryId: this.selectId
      }

      const status = this.tabsSelectValue == 'all' ? '' : this.tabsSelectValue
      if (this.examineType == 'my') {
        params.status = status
      } else if (this.examineType == 'wait') {
        params.status = status
      }

      params.queryType = this.examineType == 'my' ? 1 : 2 // 1我发出的  2待我审批的
      oaExamineExportAPI(params)
        .then(res => {
          downloadExcelWithResData(res)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
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

.examine-tabs-head {
  margin-bottom: 15px;
}

.cell-section {
  height: calc(100% - 70px);
  overflow: auto;
}
</style>
