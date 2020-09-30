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
          @handle="detailHeadHandle"
          @close="hideView" />
        <examine-info
          v-if="detailData.examineRecordId"
          :id="id"
          :record-id="detailData.examineRecordId"
          :owner-user-id="detailData.ownerUserId"
          class="examine-info"
          examine-type="crm_invoice"
          @on-handle="examineHandle" />
        <div class="d-container-bd">
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
                :filed-list="baseDetailList" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </flexbox>
    </div>

    <!-- <c-r-m-create-view
      v-if="isCreate"
      :action="{type: 'update', id: id, batchId: detailData.batchId}"
      :crm-type="crmType"
      @save-success="editSaveSuccess"
      @hiden-view="isCreate=false" /> -->

    <create
      v-if="isCreate"
      :detail="detailData"
      @save-success="editSaveSuccess"
      @close="isCreate = false"/>
  </slide-view>
</template>

<script>
import { crmInvoiceReadAPI } from '@/api/crm/invoice'

import SlideView from '@/components/SlideView'
import CRMDetailHead from '../components/CRMDetailHead'
import CRMBaseInfo from '../components/CRMBaseInfo' // 基本信息
import RelativeFiles from '../components/RelativeFiles' // 相关附件
import RelativeHandle from '../components/RelativeHandle' // 相关操作
import ExamineInfo from '@/components/Examine/ExamineInfo'
import Create from './Create'

import DetailMixin from '../mixins/Detail'
import { separator } from '@/filters/vueNumeralFilter/filters'

export default {
  // 学员管理 的 发票详情
  name: 'InvoiceDetail',
  components: {
    SlideView,
    CRMDetailHead,
    CRMBaseInfo,
    RelativeFiles,
    RelativeHandle,
    ExamineInfo,
    Create
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
      crmType: 'invoice',
      // 名称
      name: '',
      headDetails: [
        { title: '客户名称', value: '' },
        { title: '开票金额', value: '' },
        { title: '发票号码', value: '' },
        { title: '实际开票日期', value: '' }
      ],
      tabCurrentName: 'CRMBaseInfo',
      baseDetailList: [], // 基本详情list
      // 编辑操作
      isCreate: false
    }
  },
  computed: {
    tabNames() {
      return [
        { label: '详细资料', name: 'CRMBaseInfo' },
        {
          label: this.getTabName('附件', this.tabsNumber.fileCount),
          name: 'RelativeFiles'
        },
        { label: '操作记录', name: 'RelativeHandle' }
      ]
    }
  },
  mounted() {},
  methods: {
    viewAfterEnter() {
      this.getDetial()
    },

    /**
     * 详情
     */
    getDetial() {
      this.loading = true
      crmInvoiceReadAPI(this.id)
        .then(res => {
          this.loading = false
          this.name = res.data.invoiceNumber
          this.detailData = res.data
          this.getBaseList(res.data)

          //   // 负责人
          this.headDetails[0].value = res.data.customerName
          this.headDetails[1].value = separator(res.data.invoiceMoney || 0)
          this.headDetails[2].value = res.data.invoiceNumber
          this.headDetails[3].value = res.data.realInvoiceDate
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },

    /**
     * 获取基本信息数据
     */
    getBaseList(data) {
      this.baseDetailList = [
        {
          name: '基本信息',
          list: [
            {
              name: '发票申请编号',
              formType: 'text',
              value: data.invoiceApplyNumber
            },
            {
              name: '客户名称',
              formType: 'customer',
              value: data
            },
            {
              name: '合同编号',
              formType: 'contract',
              value: data
            },
            {
              name: '合同金额',
              formType: 'text',
              value: data.contractMoney
            },
            {
              name: '开票金额（元）',
              formType: 'text',
              value: data.invoiceMoney
            },
            {
              name: '开票日期',
              formType: 'text',
              value: data.invoiceDate
            },
            {
              name: '开票类型',
              formType: 'text',
              value: {
                1: '增值税专用发票',
                2: '增值税普通发票',
                3: '国税通用机打发票',
                4: '地税通用机打发票',
                5: '收据'
              }[data.invoiceType]
            },
            {
              name: '备注',
              formType: 'text',
              value: data.remark
            },
            {
              name: '创建人',
              formType: 'text',
              value: data.createUserName
            },
            {
              name: '负责人',
              formType: 'text',
              value: data.ownerUserName
            },
            {
              name: '创建时间',
              formType: 'text',
              value: data.createTime
            },
            {
              name: '更新时间',
              formType: 'text',
              value: data.updateTime
            }
          ]
        },
        {
          name: '发票信息',
          list: [
            {
              name: '抬头类型',
              formType: 'text',
              value: {
                1: '单位',
                2: '个人'
              }[data.titleType]
            },
            {
              name: '开票抬头',
              formType: 'text',
              value: data.invoiceTitle
            },
            {
              name: '纳税人识别号',
              formType: 'text',
              value: data.taxNumber
            },
            {
              name: '开户行',
              formType: 'text',
              value: data.depositBank
            },
            {
              name: '开户账号',
              formType: 'text',
              value: data.depositAccount
            },
            {
              name: '开票地址',
              formType: 'text',
              value: data.depositAddress
            },
            {
              name: '电话',
              formType: 'text',
              value: data.telephone
            }
          ]
        },
        {
          name: '邮寄信息',
          list: [
            {
              name: '联系人',
              formType: 'text',
              value: data.contactsName
            },
            {
              name: '联系方式',
              formType: 'text',
              value: data.contactsMobile
            },
            {
              name: '邮寄地址',
              formType: 'text',
              value: data.contactsAddress
            }
          ]
        }
      ]
    },

    /**
     * 关闭
     */
    hideView() {
      this.$emit('hide-view')
    },

    /**
     * 编辑成功
     */
    editSaveSuccess() {
      this.$emit('handle', { type: 'save-success' })
      this.getDetial()
    },

    /**
     * 审核操作
     */
    examineHandle() {
      this.$emit('handle', { type: 'examine' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/crmdetail.scss';
</style>
