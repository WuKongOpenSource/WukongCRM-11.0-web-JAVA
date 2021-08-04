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
          @close="hideView"/>
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
                :crm-type="crmType"
                @handle="detailHeadHandle" />
            </el-tab-pane>
          </el-tabs>
        </flexbox>
      </flexbox>
    </div>

    <c-r-m-all-create
      v-if="isCreate"
      :action="{type: 'update', id: id, batchId: detailData.batchId, editDetail: detailData}"
      :crm-type="crmType"
      @save-success="editSaveSuccess"
      @close="isCreate=false"/>
  </slide-view>
</template>

<script>
import { crmReceivablesPlanReadAPI } from '@/api/crm/receivablesPlan'

import SlideView from '@/components/SlideView'
import CRMDetailHead from '../components/CRMDetailHead'
import CRMEditBaseInfo from '../components/CRMEditBaseInfo' // 产品基本信息
import RelativeFiles from '../components/RelativeFiles' // 相关附件
import RelativeHandle from '../components/RelativeHandle' // 相关操作

import CRMAllCreate from '../components/CRMAllCreate' // 新建页面
import Sections from '../components/Sections'

import DetailMixin from '../mixins/Detail'
import { separator } from '@/filters/vueNumeralFilter/filters'

export default {
  // 回款计划详情
  name: 'ReceivablesPlanDetail',
  components: {
    SlideView,
    CRMDetailHead,
    CRMEditBaseInfo,
    RelativeFiles,
    RelativeHandle,
    CRMAllCreate,
    Sections
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
      crmType: 'receivablesPlan',
      headDetails: [
        { title: '客户名称', value: '', field: 'customerName' },
        { title: '合同编号', value: '', field: 'contractNum' },
        { title: '计划回款金额', value: '', field: 'money', isMoney: true },
        { title: '计划回款日期', value: '', field: 'returnDate' },
        { title: '实际回款金额', value: '', field: 'realReceivedMoney', isMoney: true }
      ],
      tabCurrentName: 'CRMEditBaseInfo',
      // 编辑操作
      isCreate: false
    }
  },
  computed: {
    tabNames() {
      return [
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
      crmReceivablesPlanReadAPI(this.id)
        .then(res => {
          this.loading = false
          this.detailData = res.data || {}

          this.headDetails.forEach(item => {
            const itemValue = this.detailData[item.field]
            if (item.isMoney) {
              item.value = separator(itemValue || 0)
            } else {
              item.value = itemValue
            }
          })
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },

    /**
     * 关闭
     */
    hideView() {
      this.$emit('hide-view')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/crmdetail.scss';
</style>
