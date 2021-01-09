<template>
  <div
    v-loading="loading"
    class="ranking-statistics card">
    <flexbox class="card-title">
      <span class="icon wk wk-clock" />
      <div class="card-title-center text-one-ellipsis">遗忘提醒</div>
    </flexbox>
    <div class="card-desc">
      对一段时间内未联系的客户进行分类汇总
    </div>

    <div class="content">
      <flexbox
        :gutter="0"
        wrap="wrap"
        align="stretch">
        <flexbox-item
          v-for="(item, index) in showData"
          :key="index"
          :span="0.45"
          class="brief"
          @click.native="reportClick(item)">
          <div class="brief-item">
            <div class="title">
              {{ item.label }}
            </div>
            <div class="value">
              {{ item.value }}
              <span class="value-unit">
                个
              </span>
            </div>
          </div>
        </flexbox-item>
      </flexbox>
    </div>

    <!-- 销售简报列表 -->
    <report-list
      :show.sync="reportListShow"
      :title="reportData.title"
      :placeholder="reportData.placeholder"
      :crm-type="reportData.crmType"
      :request="reportData.request"
      :params="reportData.params"
      :paging="reportData.paging"
      :sortable="reportData.sortable"/>
  </div>
</template>

<script>
import { crmIndexForgottenCustomerAPI, crmIndexForgottenCustomerListAPI, crmIndexUnContactCustomerAPI } from '@/api/crm/workbench'

import ReportList from './ReportList'
import ChartMixin from './ChartMixin'

export default {
  name: 'RankingStatistics',
  components: {
    ReportList
  },
  mixins: [ChartMixin],
  data() {
    return {
      data: [
        {
          label: '超过7天未联系的客户',
          value: 0,
          key: 'sevenDays',
          hidden: false
        },
        {
          label: '超过15天未联系的客户',
          value: 0,
          key: 'fifteenDays',
          hidden: false
        },
        {
          label: '超过30天未联系的客户',
          value: 0,
          key: 'oneMonth',
          hidden: false
        },
        {
          label: '超过3个月未联系的客户',
          value: 0,
          key: 'threeMonth',
          hidden: false
        },
        {
          label: '超过6个月未联系的客户',
          value: 0,
          key: 'sixMonth',
          hidden: false
        },
        {
          label: '逾期未联系的客户',
          value: 0,
          key: 'unContactCustomerCount',
          hidden: false
        }
      ],
      loading: false,

      reportListShow: false,
      reportData: {
        title: '',
        placeholder: '',
        crmType: '',
        request: null,
        params: null,
        paging: true,
        sortable: 'custom'
      }
    }
  },
  computed: {
    showData() {
      return this.data.filter(item => {
        return !item.hidden
      })
    }
  },
  methods: {
    getData() {
      this.loading = true
      crmIndexForgottenCustomerAPI(this.getBaseParams())
        .then(res => {
          this.loading = false
          this.data = this.data.map(item => {
            item.hidden = !res.data.hasOwnProperty(item.key)
            item.value = res.data[item.key]
            return item
          })
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 查看
     */
    reportClick(item) {
      this.reportData.title = item.label
      this.reportData.placeholder = '请输入客户名称/手机/电话'
      this.reportData.crmType = 'customer'

      // 逾期未联系的客户
      if (item.key == 'unContactCustomerCount') {
        this.reportData.params = {
          ...this.getBaseParams(),
          isSub: 1
        }
        this.reportData.request = crmIndexUnContactCustomerAPI
      } else {
        const day = {
          sevenDays: 7,
          fifteenDays: 15,
          oneMonth: 30,
          threeMonth: 90,
          sixMonth: 180
        }[item.key]
        this.reportData.params = {
          ...this.getBaseParams(),
          day: day
        }
        this.reportData.request = crmIndexForgottenCustomerListAPI
      }

      this.reportData.paging = true
      this.reportData.sortable = 'custom'
      this.reportListShow = true
    }
  }
}
</script>

<style scoped lang="scss">
@import 'style';
.content {
  height: 300px;
}

.card-title-left .icon {
  color: #ff8400;
}

.brief {
  padding: 8px;
  .brief-item {
    cursor: pointer;
    padding: 15px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.08);
    border-radius: $xr-border-radius-base;
    flex-shrink: 0;
    .title {
      color: #333;
      font-size: 13px;
    }
    .value {
      font-size: 23px;
      font-weight: bold;
      line-height: 1;
      margin-top: 8px;
      color: $xr-color-primary;
      &-unit {
        color: #333;
        font-size: 13px;
      }
    }
    &:hover {
      box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
