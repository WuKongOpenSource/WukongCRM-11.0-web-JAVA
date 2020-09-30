<template>
  <slide-view
    v-loading="loading"
    :no-listener-class="noListenerClass"
    class="d-view"
    @close="hideView">
    <flexbox
      v-if="detail"
      orient="vertical"
      align="stretch"
      class="detail-main">
      <flexbox class="detail-header">
        <div
          style="backgroundColor: #19B5F6"
          class="header-icon">
          <i class="wk wk-s-seas" />
        </div>
        <div>
          <div class="header-title">公海名称</div>
          <div class="header-name">{{ detail.poolName }}</div>
        </div>

        <span class="customer-num">
          客户数量：<span class="customer-num__value">{{ detail.customerNum || 0 }}个</span>
        </span>
      </flexbox>
      <flexbox
        align="stretch"
        class="member">
        <flexbox-item class="member-item">
          <div class="label">公海管理员</div>
          <div class="value">
            <xr-avatar
              v-for="(item, index) in detail.adminUser"
              :key="`admin${index}`"
              :name="item.realname"
              :size="32"
              :src="item.img" />
          </div>
        </flexbox-item>
        <flexbox-item class="member-item">
          <div class="label">公海成员</div>
          <div class="value">
            <xr-avatar
              v-for="(item, index) in detail.memberUser"
              :key="`member${index}`"
              :name="item.realname"
              :size="32"
              :src="item.img" />
            <xr-avatar
              v-for="(item, index) in detail.memberDept"
              :title="`dept${index}`"
              :key="`dept${index}`"
              :name="item.name"
              :size="32"
              background="#FB6523" />
          </div>
        </flexbox-item>
      </flexbox>
      <create-sections title="规则设置">
        <div class="rule">
          <flexbox
            align="stretch"
            class="rule-item">
            <div class="label">前负责人领取规则</div>
            <div class="value">{{ detail.preOwnerSetting == 1 ? `前负责人${detail.preOwnerSettingDay}天内不允许领取该客户` : '不限制' }}</div>
          </flexbox>
          <flexbox
            align="stretch"
            class="rule-item">
            <div class="label">领取频率规则</div>
            <div class="value">{{ detail.receiveSetting == 1 ? `每天最多领取${detail.receiveNum}个公海客户` : '不限制' }}</div>
          </flexbox>
          <flexbox
            align="stretch"
            class="rule-item">
            <div class="label">提醒规则</div>
            <div class="value">{{ detail.remindSetting == 1 ? `提前${detail.remindDay}天提醒负责人` : '不提醒' }}</div>
          </flexbox>
          <flexbox
            align="stretch"
            class="rule-item">
            <div class="label">收回规则</div>
            <div v-if="detail.putInRule == 0" class="value">不自动回收</div>
            <div v-else class="value rule-value">
              <detail-recycle-rule
                v-for="(item, index) in detail.rule"
                :key="index"
                :data="item"/>
            </div>
          </flexbox>
          <flexbox
            align="stretch"
            class="rule-item">
            <div class="label">公海字段</div>
            <div class="value field-value">{{ detail.field | fieldNameFilter }}</div>
          </flexbox>
        </div>
      </create-sections>
    </flexbox>
  </slide-view>
</template>

<script>
import {
  crmCustomerPoolSetDetailAPI
} from '@/api/crm/customer'

import SlideView from '@/components/SlideView'
import CreateSections from '@/components/CreateSections'
import DetailRecycleRule from './DetailRecycleRule'

export default {
  /** 公海设置详情 */
  name: 'PoolDetail',
  components: {
    SlideView,
    CreateSections,
    DetailRecycleRule
  },
  filters: {
    fieldNameFilter(list) {
      return list.filter(item => {
        return item.isHidden === 0
      }).map(item => {
        return item.name
      }).join('，')
    }
  },
  mixins: [],
  props: {
    // 详情信息id
    id: [String, Number],
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
      detail: null
    }
  },
  computed: {},
  watch: {
    id: function(val) {
      this.detail = null
      this.getDetail()
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {
    getDetail() {
      this.loading = true
      crmCustomerPoolSetDetailAPI({
        poolId: this.id
      }).then(res => {
        this.detail = res.data
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
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
.detail-main {
  height: 100%;
  overflow-y: auto;
  overflow-y: overlay;
  padding: 30px 20px 20px;
}

.detail-header {
  position: relative;
  flex-shrink: 0;

  .header-icon {
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    border-radius: $xr-border-radius-base;
    margin-right: 20px;
    .wk {
      color: white;
      font-size: 26px;
    }
  }
  .header-title {
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
  }

  .header-name {
    font-size: 16px;
    color: #333333;
    font-weight: 600;
  }

  .customer-num {
    position: absolute;
    top: 5px;
    right: 5px;
    color: #999;
    font-size: 14px;
    &__value {
      color: #333;
    }
  }
}
// 人员
.member {
  padding: 20px 20px 0;
  flex-shrink: 0;

  &-item {
    .label {
      font-size: 12px;
      color: #999;
    }

    .value {
      margin-top: 8px;
    }
  }

  &-item + &-item {
    margin-left: 60px;
  }
}

// 规则
.rule {
  padding: 15px 20px;
  font-size: 14px;
  color: #333;

  &-item {
    margin-bottom: 20px;
    .label {
      flex-shrink: 0;
      width: 120px;
      color: #666;
    }

    .value {
      margin-left: 30px;
      flex: 1;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
    }

    .field-value {
      line-height: 1.5;
    }
  }
}

.detail-recycle-rule + .detail-recycle-rule {
  margin-top: 20px;
}

// 头像样式
.el-avatar {
  margin-right: 8px;
  margin-bottom: 5px;
}

.el-avatar[title=dept0] {
  margin-left: -4px;
}

.d-view {
  position: fixed;
  width: 926px;
  top: 60px;
  bottom: 0px;
  right: 0px;
  /deep/ .el-card__body {
    height: 100%;
    background-color: white;
  }
}
</style>

