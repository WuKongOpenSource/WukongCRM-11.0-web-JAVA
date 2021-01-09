<template>
  <div
    v-loading="loading"
    class="data-statistics card">
    <flexbox class="card-title">
      <span class="icon wk wk-data" />
      <div class="card-title-center text-one-ellipsis">数据汇总</div>
      <!--<div class="card-title-right">
        <span class="box">{{ filterText }}</span>
        <span class="box">{{ timeLine }}</span>
      </div>-->
    </flexbox>
    <div class="card-desc">
      对于数据收集统计的汇总
    </div>
    <div v-if="data" class="content">
      <div class="list-item">
        <div class="title">
          客户汇总
        </div>
        <div class="info">
          新增<span class="bold">{{ data.allCustomer }}</span>个客户，转成交客户<span class="bold">{{ data.dealCustomer }}</span>个
        </div>
      </div>
      <div class="list-item">
        <div class="title">
          跟进汇总
        </div>
        <div class="info">
          跟进客户<span class="bold">{{ data.activityNum }}</span>个，新增客户中未跟进<span class="bold">{{ data.allCustomer - data.activityRealNum }}</span>个
        </div>
      </div>
      <div class="list-item">
        <div class="title">
          商机汇总
        </div>
        <div class="info">
          新增<span class="bold">{{ data.allBusiness }}</span>个商机，商机总金额<span class="bold">{{ data.businessMoney | separator }}</span>元，赢单商机<span class="bold">{{ data.endBusiness }}</span>个
        </div>
      </div>
      <div class="list-item">
        <div class="title">
          合同汇总
        </div>
        <div class="info">
          合同签订<span class="bold">{{ data.allContract }}</span>份，合同金额<span class="bold">{{ data.contractMoney | separator }}</span>元
        </div>
      </div>
      <div class="list-item">
        <div class="title">
          回款金额
        </div>
        <div class="info">
          回款金额<span class="bold">{{ data.receivablesMoney | separator }}</span>元，预计回款金额<span class="bold">{{ data.planMoney | separator }}</span>元
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChartMixin from './ChartMixin'
import { queryDataInfo } from '@/api/crm/workbench'

export default {
  name: 'DataStatistics',
  filters: {},
  mixins: [ChartMixin],
  data() {
    return {
      data: null,
      loading: false
    }
  },
  methods: {
    getData() {
      this.loading = true
      queryDataInfo(this.getBaseParams()).then(res => {
        this.loading = false
        this.data = res.data || {}
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
  @import "style";
  .content {
    width: 100%;
    height: 300px;
    .list-item {
      border-bottom: 1px dashed #EFEFEF;
      padding: 10px 20px;
      &:last-child {
        border-bottom: 0 none;
        padding-bottom: 0;
      }
      .title {}
      .info {
        margin-top: 5px;
        .bold {
          font-size: 18px;
          font-weight: bold;
          margin: 0 3px;
        }
      }
    }
  }

  .card-title-left .icon {
    color: #BF80FF;
  }
</style>
