<template>
  <slide-view
    :listener-ids="listenerIDs"
    :no-listener-ids="noListenerIDs"
    :no-listener-class="noListenerClass"
    :body-style="{padding: 0, height: '100%'}"
    class="d-view"
    @close="hideView">
    <flexbox class="t-section">
      <img
        :src="crmIcon"
        class="t-img" >
      <div class="t-name">跟进记录</div>
    </flexbox>
    <div class="t-content">
      <div
        v-infinite-scroll="getList"
        :key="scrollKey"
        infinite-scroll-disabled="scrollDisabled"
        infinite-scroll-distance="100">
        <log-cell
          v-for="(item, index) in list"
          :item="item"
          :index="index"
          :key="index"
          :can-delete="false"
          @crm-detail="checkRelationDetail">
          <div
            class="relate-cell"
            @click="checkRelationDetail(item.activityType, item.activityTypeId, true)">
            <i
              :class="item.activityType | crmIconClass"
              class="relate-cell-icon"/>
            <span
              class="relate-cell-type">{{ item.activityType | crmName }}-</span>
            <span
              class="relate-cell-name">{{ item.crmTypeName }}</span>
          </div>
        </log-cell>
      </div>
      <p
        v-if="loading"
        class="scroll-bottom-tips">加载中...</p>
      <p
        v-if="noMore"
        class="scroll-bottom-tips">没有更多了</p>
    </div>


    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :crm-type="relationCrmType"
      :id="relationID"/>

  </slide-view>
</template>

<script>
import LogCell from '@/views/crm/components/Activity/LogCell'
import SlideView from '@/components/SlideView'

import crmTypeModel from '@/views/crm/model/crmTypeModel'

export default {
  /** 跟进记录列表 */
  name: 'RecordList',

  components: {
    LogCell,
    SlideView,
    CRMFullScreenDetail: () =>
      import('@/components/CRMFullScreenDetail')
  },

  filters: {
    crmIconClass(type) {
      return `wk wk-${crmTypeModel.convertTypeToKey(type)}`
    },

    crmName(type) {
      return crmTypeModel.convertTypeToName(type)
    }
  },

  props: {
    crmType: String,
    request: Function,
    params: Object,
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
      loading: false,

      // 判断是否发请求
      page: 1,
      noMore: false,
      list: [],
      scrollKey: Date.now(),

      showFullDetail: false, // 查看相关客户管理详情
      relationID: '', // 相关ID参数
      relationCrmType: '' // 相关类型
    }
  },

  computed: {
    crmIcon() {
      const crmType = this.crmType.replace('crm_', '')
      return require(`@/assets/img/crm/${crmType}.png`)
    },

    scrollDisabled() {
      return this.loading || this.noMore
    }
  },

  watch: {
    params() {
      this.refreshList()
    }
  },

  mounted() {
  },

  methods: {
    refreshList() {
      this.page = 1
      this.list = []
      this.noMore = false
      this.scrollKey = Date.now()
    },

    /**
     * 获取列表
     */
    getList() {
      this.loading = true
      this.request({ page: this.page, limit: 15, ...this.params })
        .then(res => {
          this.page++
          this.list = this.list.concat(res.data.list)
          this.noMore = res.data.lastPage
          this.loading = false
        })
        .catch(() => {
          this.noMore = true
          this.loading = false
        })
    },

    /**
     * 查看相关客户管理详情
     */
    checkRelationDetail(type, id, convert = false) {
      this.relationID = id
      this.relationCrmType = convert ? crmTypeModel.convertTypeToKey(type) : type
      this.showFullDetail = true
    },

    /**
     * 点击关闭按钮隐藏视图
     */
    hideView() {
      this.$emit('hide')
    }
  }
}
</script>

<style lang="scss" scoped>
.t-section {
  position: relative;
  padding: 10px 17px;
  min-height: 60px;
  line-height: 40px;
  .t-img {
    display: block;
    width: 35px;
    height: 35px;
    margin-right: 10px;
  }
  .t-name {
    font-size: 14px;
    color: #333333;
    flex: 1;
  }

  .t-close {
    display: block;
    float: right;
    width: 40px;
    height: 40px;
    margin-left: 20px;
    padding: 10px;
    cursor: pointer;
  }
}


.d-view {
  position: fixed;
  width: 950px;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: white;
}

.t-content {
  margin: 0 30px;
  height: calc(100% - 80px);
  overflow: auto;
  position: relative;
}

.relate-cell {
  padding: 8px;
  margin-left: 40px;
  background-color: #f5f7fa;
  border-radius: 4px;
  position: relative;
  width: auto;
  display: inline-block;
  margin-top: 10px;
  font-size: 12px;
  color: #333;

  &-icon {
    display: inline-block;
    font-size: 14px;
    color: #666;
    margin-right: 5px;
  }

  &-name {
    cursor: pointer;
    color: $xr-color-primary;
  }

  &-name:hover {
    text-decoration: underline;
  }
}

</style>
