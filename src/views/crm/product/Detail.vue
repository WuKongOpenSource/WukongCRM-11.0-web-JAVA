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
              <c-r-m-edit-base-info
                v-if="item.name === 'CRMEditBaseInfo'"
                :is="item.name"
                :detail="detailData"
                :id="id"
                :crm-type="crmType">
                <sections
                  class="b-cells"
                  title="图片信息"
                  content-height="auto">
                  <div class="image">
                    <div v-if="mainFileList.length > 0" class="image-info">
                      <div class="image-info__label">产品图片</div>
                      <div class="image-info__list">
                        <img
                          v-src="item.url"
                          v-for="(item, index) in mainFileList"
                          :key="index"
                          class="main-img"
                          @click="previewImage(mainFileList, index)">
                      </div>
                    </div>
                    <div v-if="detailFileList.length > 0" class="image-info">
                      <div class="image-info__label">产品详情图片</div>
                      <div class="image-info__list">
                        <img
                          v-src="item.url"
                          v-for="(item, index) in detailFileList"
                          :key="index"
                          class="detial-img"
                          @click="previewImage(detailFileList, index)">
                      </div>
                    </div>
                    <div v-if="detailFileList.length == 0 && mainFileList.length == 0" class="no-img">暂无图片</div>
                  </div>
                </sections>
              </c-r-m-edit-base-info>
              <component
                v-else
                :is="item.name"
                :detail="detailData"
                :id="id"
                :crm-type="crmType" />
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
import { crmProductReadAPI } from '@/api/crm/product'

import SlideView from '@/components/SlideView'
import CRMDetailHead from '../components/CRMDetailHead'
import CRMEditBaseInfo from '../components/CRMEditBaseInfo' // 产品基本信息
import RelativeFiles from '../components/RelativeFiles' // 相关附件
import RelativeHandle from '../components/RelativeHandle' // 相关操作

import CRMAllCreate from '../components/CRMAllCreate' // 新建页面
import DetailImg from './components/DetailImg'
import Sections from '../components/Sections'

import DetailMixin from '../mixins/Detail'
import { separator } from '@/filters/vueNumeralFilter/filters'

export default {
  // 客户管理 的 产品详情
  name: 'ProductDetail',
  components: {
    SlideView,
    CRMDetailHead,
    DetailImg,
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
      crmType: 'product',
      headDetails: [
        { title: '产品类别', value: '' },
        { title: '产品单位', value: '' },
        { title: '产品价格', value: '' },
        { title: '产品编码', value: '' }
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
    },
    mainFileList() {
      if (this.detailData && this.detailData.mainFileList) {
        return this.detailData.mainFileList
      }

      return []
    },

    detailFileList() {
      if (this.detailData && this.detailData.detailFileList) {
        return this.detailData.detailFileList
      }

      return []
    }
  },
  mounted() {},
  methods: {
    /**
     * 详情
     */
    getDetial() {
      this.loading = true
      crmProductReadAPI({
        productId: this.id
      })
        .then(res => {
          this.loading = false
          this.detailData = res.data

          this.headDetails[0].value = res.data.categoryName
          this.headDetails[1].value = res.data.unit
          this.headDetails[2].value = separator(res.data.price || 0)
          this.headDetails[3].value = res.data.num
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
    },

    // /**
    //  * 编辑成功
    //  */
    // editSaveSuccess() {
    //   this.$emit('handle', { type: 'save-success' })
    //   this.getDetial()
    // },

    /**
     * 预览图片
     */
    previewImage(list, index) {
      this.$bus.emit('preview-image-bus', {
        index: index,
        data: list
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.image {
  color: #333;
  &-info {
    margin: 10px 25px 0;

    &__label {
      font-size: 13px;
    }

    &__list {
      overflow-x: auto;
      white-space: nowrap;

      img {
        margin-top: 15px;
        border-radius: $xr-border-radius-base;
        cursor: pointer;
      }

      img + img {
        margin-left: 20px;
      }

      .main-img {
        width: 100px;
        height: 76px;
      }

      .detial-img {
        width: 100px;
        height: 80px;
      }
    }
  }

  .no-img {
    color: #666;
    margin: 50px 0;
    text-align: center;
  }
}
@import '../styles/crmdetail.scss';
</style>
