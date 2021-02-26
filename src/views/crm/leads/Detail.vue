<template>
  <slide-view
    v-empty="!canShowDetail"
    :listener-ids="listenerIDs"
    :no-listener-ids="noListenerIDs"
    :no-listener-class="noListenerClass"
    :body-style="{padding: 0, height: '100%'}"
    xs-empty-icon="nopermission"
    xs-empty-text="暂无权限"
    @afterEnter="viewAfterEnter"
    @close="hideView">
    <div
      v-loading="loading"
      ref="crmDetailMain"
      class="detail-main">
      <flexbox
        v-if="canShowDetail && detailData"
        direction="column"
        align="stretch"
        class="d-container">
        <c-r-m-detail-head
          :detail="detailData"
          :head-details="headDetails"
          :id="id"
          :crm-type="crmType"
          :page-list="pageList"
          @pageChange="pageChange"
          @handle="detailHeadHandle"
          @close="hideView">
          <template slot="name">
            <el-tooltip :content="detailData.star == 0 ? '添加关注' : '取消关注'" effect="dark" placement="top">
              <i
                :class="{active: detailData.star != 0}"
                class="wk wk-focus-on focus-icon"
                @click="toggleStar()" />
            </el-tooltip>
          </template>
        </c-r-m-detail-head>
        <flexbox class="d-container-bd" align="stretch">
          <el-tabs
            v-model="tabCurrentName"
            type="border-card"
            class="d-container-bd--left">
            <el-tab-pane
              v-for="(item, index) in tabNames"
              :key="index"
              :label="item.label"
              :name="item.name"
              lazy>
              <component
                :is="item.name"
                :detail="detailData"
                :id="id"
                :handle="activityHandle"
                :crm-type="crmType" />
            </el-tab-pane>
          </el-tabs>
          <transition name="slide-fade">
            <el-tabs
              v-show="showImportInfo"
              value="chiefly-contacts"
              type="border-card"
              class="d-container-bd--right">
              <el-tab-pane
                label="重要信息"
                name="chiefly-contacts"
                lazy>
                <import-info :list="importList" class="import-info" />
              </el-tab-pane>
            </el-tabs>
          </transition>
        </flexbox>
      </flexbox>
    </div>
    <el-button
      class="firse-button"
      @click="showImportInfo= !showImportInfo">重<br>要<br>信<br>息<br><i :class="{ 'is-reverse': !showImportInfo }" class="el-icon-arrow-right el-icon--right" /></el-button>
    <c-r-m-all-create
      v-if="isCreate"
      :action="{type: 'update', id: id, batchId: detailData.batchId}"
      :crm-type="crmType"
      @save-success="editSaveSuccess"
      @close="isCreate=false"/>
  </slide-view>
</template>

<script>
import { crmLeadsReadAPI } from '@/api/crm/leads'
import { filedGetInformationAPI } from '@/api/crm/common'
import crmTypeModel from '@/views/crm/model/crmTypeModel'

import SlideView from '@/components/SlideView'
import CRMDetailHead from '../components/CRMDetailHead'
import Activity from '../components/Activity'
import ImportInfo from '../components/ImportInfo' // 重要信息
import CRMEditBaseInfo from '../components/CRMEditBaseInfo' // 线索基本信息
import RelativeFiles from '../components/RelativeFiles' // 相关附件
import RelativeHandle from '../components/RelativeHandle' // 相关操作

import CRMAllCreate from '../components/CRMAllCreate' // 新建页面
import DetailMixin from '../mixins/Detail'

export default {
  // 线索管理 的 线索详情
  name: 'LeadsDetail',
  components: {
    SlideView,
    CRMDetailHead,
    Activity,
    CRMEditBaseInfo,
    RelativeFiles,
    RelativeHandle,
    ImportInfo,
    CRMAllCreate
  },
  mixins: [DetailMixin],
  props: {
    // 详情信息id
    id: [String, Number],
    // 监听的dom 进行隐藏详情
    listenerIDs: {
      type: Array,
      default: () => {
        return ['crm-main-container']
      }
    },
    // 不监听
    noListenerIDs: {
      type: Array,
      default: () => {
        return []
      }
    },
    noListenerClass: {
      type: Array,
      default: () => {
        return ['el-table__body']
      }
    }
  },
  data() {
    return {
      // 展示加载loading
      loading: false,
      crmType: 'leads',
      headDetails: [
        { title: '姓名', value: '' },
        { title: '线索来源', value: '' },
        { title: '手机', value: '' },
        { title: '负责人', value: '' },
        { title: '创建时间', value: '' }
      ],
      tabCurrentName: 'Activity',
      // 编辑操作
      isCreate: false,
      // 展示重要信息
      showImportInfo: true,
      importList: []
    }
  },
  computed: {
    /**
     * 活动操作
     */
    activityHandle() {
      let temps = []

      if (this.canCreateFollowRecord) {
        temps = [{
          type: 'log',
          label: '写跟进'
        }]
      }

      return temps
    },

    /**
     * tabs
     */
    tabNames() {
      return [
        { label: '活动', name: 'Activity' },
        { label: '详细资料', name: 'CRMEditBaseInfo' },
        { label: this.getTabName('附件', this.tabsNumber.fileCount), name: 'RelativeFiles' },
        { label: '操作记录', name: 'RelativeHandle' }
      ]
    }
  },
  mounted() {},
  methods: {
    /**
     * 详情
     */
    getDetial() {
      this.loading = true
      crmLeadsReadAPI(this.id)
        .then(res => {
          this.detailData = res.data

          this.headDetails[0].value = res.data.name
          this.headDetails[1].value = res.data.source
          this.headDetails[2].value = res.data.mobile
          // 负责人
          this.headDetails[3].value = res.data.ownerUserName
          this.headDetails[4].value = res.data.createTime
          this.loading = false
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
      this.getBaseInfo()
    },

    /**
     * 获取基础信息
     */
    getBaseInfo() {
      this.loading = true
      filedGetInformationAPI({
        types: crmTypeModel[this.crmType],
        id: this.id
      })
        .then(res => {
          this.importList = res.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 关闭
     */
    hideView() {
      this.$emit('hide-view')
    }

    // /**
    //  * 编辑成功
    //  */
    // editSaveSuccess() {
    //   this.$emit('handle', { type: 'save-success' })
    //   this.getDetial()
    // }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/crmdetail.scss';

.import-info {
  overflow: auto;
  height: 100%;
}
</style>
