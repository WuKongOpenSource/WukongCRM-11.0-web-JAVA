<template>
  <div
    v-loading="loading"
    class="chiefly-contacts">
    <flexbox
      v-if="contactsDetail && canShowContacts"
      class="cell"
      align="stretch">
      <xr-avatar
        :name="contactsDetail.name"
        :size="40"
        class="cell-hd" />
      <div class="cell-bd">
        <p class="cell-bd__name">
          <span>{{ contactsDetail.name }}</span>
          <span
            v-if="contactsDetail.post"
            class="cell-bd__name--des">{{ contactsDetail.post }}</span>
        </p>
        <p class="cell-bd__detail">
          <i class="wk wk-circle-iphone" />
          <span v-if="contactsDetail.mobile">{{ contactsDetail.mobile }}</span>
          <span
            v-else
            class="no-data">暂无电话</span>
        </p>
        <p class="cell-bd__detail">
          <i class="wk wk-circle-email" />
          <span v-if="contactsDetail.email">{{ contactsDetail.email }}</span>
          <span
            v-else
            class="no-data">暂无邮箱</span>
        </p>
      </div>
      <span class="mark"><i class="wk wk-s-contacts" />首要联系人</span>
    </flexbox>

    <import-info-empty
      v-else-if="!contactsId && canShowContacts"
      :title="emptyName"
      :btn-name="emptyBtnName"
      class="empty-info"
      v-on="$listeners" />

    <import-info
      v-if="list.length"
      :list="list"
      :detail="detail" />
    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :id="contactsId"
      :model-data="{
        model: 'contacts',
        modelId: contactsId
      }"
      crm-type="contacts"/>
  </div>
</template>

<script>
import { crmContactsReadAPI } from '@/api/crm/contacts'
import { filedGetInformationAPI } from '@/api/crm/common'
import ImportInfo from './ImportInfo'
import ImportInfoEmpty from './ImportInfoEmpty'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import { mapGetters } from 'vuex'

export default {
  // 首要联系人
  name: 'ChieflyContacts',
  components: {
    ImportInfo,
    ImportInfoEmpty,
    CRMFullScreenDetail: () => import('@/components/CRMFullScreenDetail')
  },
  props: {
    id: [Number, String],
    poolId: [Number, String],
    contactsId: [Number, String],
    crmType: {
      required: true,
      type: String,
      default: ''
    },
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 是公海 默认是客户
    isSeas: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      contactsDetail: null,
      list: [],
      showFullDetail: false
    }
  },
  computed: {
    ...mapGetters(['crm']),

    // 联系人权限
    canShowContacts() {
      return this.crm && this.crm.contacts && this.crm.contacts.read
    },

    // 有首要联系人
    hasInfo() {
      return this.contactsId
    },

    // 空数据按钮文字 为空不展示
    emptyBtnName() {
      return this.$listeners.add && !this.isSeas ? '新建联系人' : ''
    },

    emptyName() {
      return (
        {
          customer: '暂无客户首要联系人',
          business: '暂无商机首要联系人'
        }[this.crmType] || '暂无数据'
      )
    }
  },
  watch: {
    contactsId() {
      this.contactsDetail = null
      this.getDetial()
    },

    id() {
      this.list = []
      this.contactsDetail = null
      this.getBaseInfo()
      this.getDetial()
    }
  },
  created() {
    if (this.canShowContacts) {
      this.getDetial()
    }
    this.getBaseInfo()
    this.$bus.on('crm-detail-update', (data) => {
      this.getBaseInfo()
    })
  },

  beforeDestroy() {
    this.$bus.off('crm-detail-update')
  },
  methods: {
    /**
     * 获取联系人详情
     */
    getDetial() {
      if (this.hasInfo) {
        this.loading = true
        crmContactsReadAPI({
          contactsId: this.contactsId
        })
          .then(res => {
            this.loading = false
            this.contactsDetail = res.data
          })
          .catch(() => {
            this.loading = false
          })
      }
    },

    /**
     * 获取基础信息
     */
    getBaseInfo() {
      this.loading = true
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
          const list = res.data || []
          this.list = list.filter(item => {
            return item.formType !== 'file' &&
        item.formType !== 'detail_table' &&
        item.formType !== 'product'
          })
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
.chiefly-contacts {
  overflow: auto;
  height: 100%;
  padding: 15px;
  overflow-y: overlay;
}

.cell {
  padding: 12px;
  border-radius: $xr-border-radius-base;
  position: relative;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);

  &-hd {
    position: relative;
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    margin-right: 10px;
  }

  &-bd {
    flex: 1;
    &__name {
      font-size: 14px;
      font-weight: 600;
      color: #333333;
      margin-top: 10px;
      margin-bottom: 2px;
      &--des {
        margin-left: 5px;
        padding-left: 5px;
        color: #666666;
        font-size: 12px;
        position: relative;
        font-weight: 500;
      }

      &--des::before {
        content: '';
        position: absolute;
        top: 3px;
        left: 0;
        bottom: 1px;
        width: 1px;
        background-color: #666;
      }
    }

    &__detail {
      font-size: 12px;
      color: #333333;
      margin-top: 8px;
      i {
        color: $xr-color-primary;
        font-size: 13px;
      }

      .no-data {
        color: #999;
      }
    }
  }

  .mark {
    position: absolute;
    top: 4px;
    right: -2px;
    z-index: 1;
  }

  .wk-phone {
    position: absolute;
    top: 30px;
    right: 5px;
    z-index: 1;
  }
}

.mark {
  display: inline-block;
  color: #fb2337;
  background-color: #fff4f4;
  font-size: 12px;
  padding: 5px;
  border-radius: $xr-border-radius-base;
  transform: scale(0.8);
  i {
    font-size: 12px;
    margin-right: 5px;
  }
}

.wk-phone {
  cursor: pointer;
  background-color: #fb9323;
  color: white;
  border-radius: $xr-border-radius-base;
  display: inline-block;
  padding: 4px 5px;
  font-size: 14px;
}

// 无数据
.empty-info {
  border-radius: $xr-border-radius-base;
  position: relative;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
  height: 96px;
}
</style>
