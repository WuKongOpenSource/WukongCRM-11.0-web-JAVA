<template>
  <div v-loading="loading" class="contacts-import">
    <flexbox
      v-if="detail"
      class="cell"
      align="stretch">
      <img src="@/assets/img/crm/customer.png" class="cell-hd" >
      <div class="cell-bd">
        <p class="cell-bd__name">
          <span>{{ detail.customerName }}</span>
        </p>
        <div class="cell-bd__detail">
          <i class="wk wk-circle-iphone" />
          <span v-if="detail.mobile">{{ detail.mobile }}</span>
          <span v-else class="no-data">暂无电话</span>
          <div class="deal-info">
            <span :class="[ 'mark', isDeal ? 'mark-suc' : 'mark-un' ]"><i
              :class="dealIcon" />{{ dealName }}</span>
          </div>
        </div>
      </div>
    </flexbox>

    <import-info v-if="list.length" :list="list" />

  </div>
</template>

<script>
import { crmCustomerReadAPI } from '@/api/crm/customer'
import crmTypeModel from '@/views/crm/model/crmTypeModel'
import { filedGetInformationAPI } from '@/api/crm/common'
import ImportInfo from '../../components/ImportInfo'

export default {
  // 联系人的重要信息
  name: 'ContactsImport',
  components: {
    ImportInfo
  },
  props: {
    id: [Number, String],
    customerId: [Number, String]
  },
  data() {
    return {
      loading: false,
      // 客户详情
      detail: null,
      // 联系人基本信息
      list: []
    }
  },
  computed: {
    // 有首要联系人
    hasInfo() {
      return this.id && this.customerId
    },

    // 是成交
    isDeal() {
      return this.detail.dealStatus == 1
    },

    dealIcon() {
      return this.isDeal ? 'wk wk-success' : 'wk wk-close'
    },

    dealName() {
      return this.isDeal ? '已成交' : '未成交'
    }
  },
  watch: {
    customerId() {
      this.detail = null
      this.list = []
      this.getDetial()
    },

    id() {
      this.detail = null
      this.list = []
      this.getDetial()
    }
  },
  created() {
    this.$bus.on('crm-detail-update', (data) => {
      this.getBaseInfo()
    })
  },
  mounted() {
    this.getDetial()
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
        crmCustomerReadAPI({
          customerId: this.customerId
        })
          .then(res => {
            this.loading = false
            this.detail = res.data
          })
          .catch(() => {
            this.loading = false
          })
        this.getBaseInfo()
      }
    },

    /**
     * 获取基础信息
     */
    getBaseInfo() {
      this.loading = true
      filedGetInformationAPI({
        types: crmTypeModel['contacts'],
        id: this.id
      })
        .then(res => {
          this.list = res.data
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
.contacts-import {
  overflow: auto;
  height: 100%;
  padding: 15px;
  overflow-y: overlay;
}

.cell {
  padding: 12px;
  border-radius: $xr-border-radius-base;
  position: relative;
  border: 1px solid #EBEEF5;
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
}

.deal-info {
  margin-top: 6px;
  font-size: 12px;
}

.mark {
  display: inline-block;
  border-radius: $xr-border-radius-base;
  padding: 4px 8px;

  &-suc {
    background-color: #F4FFF4;
  }

  &-un {
    background-color: #FFF4F4;
  }

  .wk {
    font-size: 12px;
    margin-right: 3px;
  }

  .wk-success {
    color: #20b559;
  }

  .wk-close {
    color: #f95a5a;
  }
}


</style>
