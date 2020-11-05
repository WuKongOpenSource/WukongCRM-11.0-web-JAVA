<template>
  <div v-loading="loading" class="b-cont">
    <div>
      <sections
        v-for="(mainItem, mainIndex) in list"
        :key="mainIndex"
        :title="mainItem.name"
        class="b-cells"
        content-height="auto">
        <flexbox
          :gutter="0"
          align="stretch"
          wrap="wrap"
          style="padding: 10px 8px 0;">
          <flexbox-item
            v-for="(item, index) in mainItem.list"
            :span="getShowBlock(item.formType) ? 12 : 0.5"
            :key="index"
            :class="{'b-cell': item.formType !== 'map_address'}">
            <flexbox
              v-if="item.formType === 'map_address'"
              :gutter="0"
              wrap="wrap">
              <flexbox-item
                :span="0.5"
                class="b-cell"
                @click.native="checkMapView(item)">
                <flexbox
                  class="b-cell-b"
                  align="stretch">
                  <div class="b-cell-name">定位</div>
                  <div
                    class="b-cell-value"
                    style="color: #3E84E9;cursor: pointer;">{{ item.value.location }}</div>
                </flexbox>
              </flexbox-item>
              <flexbox-item
                :span="0.5"
                class="b-cell">
                <flexbox
                  class="b-cell-b"
                  align="stretch">
                  <div class="b-cell-name">区域</div>
                  <div class="b-cell-value">{{ item.value.address }}</div>
                </flexbox>
              </flexbox-item>
              <flexbox-item
                :span="0.5"
                class="b-cell">
                <flexbox
                  class="b-cell-b"
                  align="stretch">
                  <div class="b-cell-name">详细地址</div>
                  <div class="b-cell-value">{{ item.value.detailAddress }}</div>
                </flexbox>
              </flexbox-item>
            </flexbox>

            <flexbox
              v-else-if="item.formType === 'single_user'"
              align="stretch"
              class="b-cell-b">
              <div class="b-cell-name">{{ item.name }}</div>
              <div class="b-cell-value">{{ item.value ? item.value.realname : '' }}</div>
            </flexbox>

            <flexbox
              v-else-if="isModule(item)"
              align="stretch"
              class="b-cell-b">
              <div class="b-cell-name">{{ item.name }}</div>
              <div class="b-cell-value can-check" @click="checkModuleDetail(item)">{{ getModuleName(item) }}</div>
            </flexbox>

            <flexbox
              v-else-if="item.formType === 'checkbox' || item.formType === 'structure' || item.formType === 'user'"
              align="stretch"
              class="b-cell-b">
              <div class="b-cell-name">{{ item.name }}</div>
              <div class="b-cell-value">{{ item.value | arrayValue(getArrayKey(item.formType)) }}</div>
            </flexbox>

            <flexbox
              v-else-if="item.formType === 'file'"
              align="stretch"
              class="b-cell-b">
              <div class="b-cell-name">{{ item.name }}</div>
              <div class="b-cell-value">
                <file-list-view :list="item.value || []" />
              </div>
            </flexbox>

            <flexbox
              v-else-if="item.formType === 'check_status'"
              align="stretch"
              class="b-cell-b">
              <div class="b-cell-name">{{ item.name }}</div>
              <div class="b-cell-value">{{ getStatusName(item.value) }}</div>
            </flexbox>

            <flexbox
              v-else
              align="stretch"
              class="b-cell-b">
              <div class="b-cell-name">{{ item.name }}</div>
              <div class="b-cell-value">{{ item.value }}</div>
            </flexbox>
          </flexbox-item>
        </flexbox>
      </sections>
      <slot />
    </div>
    <map-view
      v-if="showMapView"
      :title="mapViewInfo.title"
      :lat="mapViewInfo.lat"
      :lng="mapViewInfo.lng"
      @hidden="showMapView=false" />

    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :id="fullDetailId"
      :crm-type="fullDetailType"/>
  </div>
</template>

<script>
import crmTypeModel from '@/views/crm/model/crmTypeModel'
import Sections from '../components/Sections'
import { filedGetInformationAPI } from '@/api/crm/common'
import MapView from '@/components/MapView' // 地图详情
import FileListView from '@/components/FileListView'
import CheckStatusMixin from '@/mixins/CheckStatusMixin'

import { separator } from '@/filters/vueNumeralFilter/filters'
import { isObject } from '@/utils/types'

export default {
  // 客户管理 的 基本信息
  name: 'CRMBaseInfo',
  components: {
    Sections,
    MapView,
    FileListView,
    CRMFullScreenDetail: () => import('@/components/CRMFullScreenDetail')
  },
  filters: {
    arrayValue(array, field) {
      if (
        !array ||
        Object.prototype.toString.call(array) !== '[object Array]'
      ) {
        return ''
      }

      return array
        .map(item => {
          return field ? item[field] : item
        })
        .join('，')
    }
  },
  mixins: [CheckStatusMixin],
  props: {
    // 模块ID
    id: [String, Number],
    poolId: [String, Number],
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 没有值就是全部类型 有值就是当个类型
    crmType: {
      type: String,
      default: ''
    },
    // 固定字段的数据
    filedList: Array
  },
  data() {
    return {
      loading: false,
      list: [],
      // 控制展示地图详情
      showMapView: false,
      // 地图详情信息
      mapViewInfo: {},
      showFullDetail: false,
      fullDetailId: '',
      fullDetailType: ''
    }
  },
  inject: ['rootTabs'],
  computed: {},
  watch: {
    id(val) {
      if (!this.filedList) {
        this.getBaseInfo(true)
      }
    },

    filedList() {
      this.list = this.filedList
    },

    'rootTabs.currentName'(val) {
      if (val === 'CRMBaseInfo') {
        if (!this.filedList) {
          this.getBaseInfo(false)
        }
      }
    }
  },
  created() {
    this.$bus.on('crm-detail-update', (data) => {
      if (!this.filedList) {
        this.getBaseInfo(false)
      }
    })
  },
  beforeDestroy() {
    this.$bus.off('crm-detail-update')
  },
  mounted() {
    if (this.filedList) {
      this.list = this.filedList
    } else {
      this.getBaseInfo(true)
    }
  },
  methods: {
    /**
     * 获取基础信息
     */
    getBaseInfo(loading) {
      this.loading = !!loading
      const params = {
        types: crmTypeModel[this.crmType],
        id: this.id
      }

      // 如果有公海id 需上传确定展示字段
      if (this.poolId) {
        params.poolId = this.poolId
      }

      filedGetInformationAPI(params)
        .then(res => {
          const baseList = []
          const systemList = []
          res.data.forEach(item => {
            if (item.formType === 'floatnumber') {
              item.value = separator(item.value)
            }
            if (item.sysInformation == 1) {
              systemList.push(item)
            } else {
              baseList.push(item)
            }
          })

          this.list = [
            {
              name: '基本信息',
              list: baseList
            },
            {
              name: '系统信息',
              list: systemList
            }
          ]
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 查看地图详情
     */
    checkMapView(item) {
      if (item.value && item.value !== '') {
        this.mapViewInfo = {
          title: item.value.location,
          lat: item.value.lat,
          lng: item.value.lng
        }
        this.showMapView = true
      }
    },

    getArrayKey(type) {
      if (type === 'structure') {
        return 'name'
      } else if (type === 'user') {
        return 'realname'
      }

      return ''
    },

    isModule(item) {
      return [
        'customer',
        'business',
        'contract',
        'contacts',
        'category',
        'statusName',
        'typeName'].includes(item.formType)
    },

    getShowBlock(type) {
      return ['map_address', 'file'].includes(type)
    },

    getModuleName(item) {
      const field = {
        customer: 'customerName',
        business: 'businessName',
        contract: 'contractNum',
        contacts: 'contactsName',
        category: 'categoryName',
        statusName: 'statusName',
        typeName: 'typeName'
      }[item.formType]
      return item.value ? item.value[field] : ''
    },

    /**
     * 查看详情
     */
    checkModuleDetail(data) {
      if (isObject(data.value)) {
        this.fullDetailType = data.formType
        this.fullDetailId = data.value[`${data.formType}Id`]
        this.showFullDetail = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.b-cont {
  position: relative;
  padding: 15px;
  height: 100%;
  overflow-y: auto;
  overflow-y: overlay;
}

.b-cells {
  margin-top: 25px;
}

.b-cell {
  padding: 0 10px;
}

.b-cell-b {
  width: auto;
  padding: 8px;
  .b-cell-name {
    width: 100px;
    margin-right: 10px;
    font-size: 13px;
    flex-shrink: 0;
    color: #777;
    line-height: 40px;
  }
  .b-cell-value {
    font-size: 13px;
    color: #333;
    line-height: 40px;
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
  }
  .b-cell-foot {
    flex-shrink: 0;
    display: block;
    width: 15px;
    height: 15px;
    margin-left: 8px;
  }
}

.f-item {
  padding: 3px 0;
  height: 25px;
  .f-img {
    position: block;
    width: 15px;
    height: 15px;
    padding: 0 1px;
    margin-right: 8px;
  }
  .f-name {
    color: #666;
    font-size: 12px;
    margin-right: 10px;
  }
}

.can-check {
  color: $xr-color-primary !important;
  cursor: pointer;
}

</style>
