<template>
  <div
    v-loading="loading"
    v-empty="list"
    xs-empty-icon="none"
    xs-empty-text="暂无记录">
    <flexbox
      class="flow-head">
      <div class="flow-head-name">审批流程</div>
      <i
        class="el-icon-close flow-head-close"
        @click="close" />
    </flexbox>
    <div class="flow-body">
      <flexbox
        v-for="(item, index) in list"
        :key="index"
        class="cf-flow-item"
        align="stretch"
        justify="flex-start">
        <img
          :src="getStatusImageIcon(item.examineStatus)"
          class="cf-flow-item-img" >
        <div>
          <flexbox class="cf-flow-item-head">
            <div class="cf-flow-item-des">{{ item.orderId|stepName }}</div>
            <div>{{ item.examineTime }}</div>
          </flexbox>
          <flexbox class="cf-flow-item-info">
            <div class="cf-flow-item-name">{{ item.realname }}</div>
            <div><span>{{ getStatusName(item.examineStatus) }}</span>了此申请</div>
          </flexbox>
          <div
            v-if="item.remarks"
            class="cf-flow-item-content">{{ item.remarks }}
            <div class="cf-flow-item-content-arrow"/>
          </div>
        </div>
        <div class="cf-flow-item-line"/>
      </flexbox>
    </div>
  </div>
</template>

<script>
import { crmExamineRecordLogListAPI } from '@/api/examine' // 审批记录
import { oaExamineFlowRecordListAPI } from '@/api/oa/examine'
import CheckStatusMixin from '@/mixins/CheckStatusMixin'

import Nzhcn from 'nzh/cn'

export default {
  /** 客户管理 的 合同详情  查看审批流程*/
  name: 'CheckFlow',
  components: {},
  filters: {
    stepName: function(index) {
      return '第' + Nzhcn.encodeS(index) + '级'
    }
  },
  mixins: [CheckStatusMixin],
  props: {
    examineType: {
      type: String,
      default: ''
    },
    // 详情信息id
    id: [String, Number],
    show: Boolean
  },
  data() {
    return {
      loading: false,
      list: []
    }
  },
  computed: {},
  watch: {
    show: function(val) {
      if (val) {
        this.list = []
        this.getDetail()
      }
    }
  },
  mounted() {

  },
  methods: {
    getDetail() {
      if (this.id) {
        this.loading = true
        const request = {
          crm_contract: crmExamineRecordLogListAPI,
          crm_receivables: crmExamineRecordLogListAPI,
          crm_invoice: crmExamineRecordLogListAPI,
          oa_examine: oaExamineFlowRecordListAPI
        }[this.examineType]

        request({
          recordId: this.id
        })
          .then(res => {
            this.loading = false
            this.list = res.data
            // this.$emit('value-change', {
            //   config: res.data.config, // 审批类型
            //   value: [] // 审批信息
            // })
          })
          .catch(() => {
            this.loading = false
          })
      }
    },

    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
/** 头部的css */
.flow-head {
  padding: 8px 0;
  border-bottom: 1px solid #e6e6e6;
  .flow-head-name {
    font-size: 14px;
    color: #333;
    flex: 1;
  }
  .flow-head-close {
    cursor: pointer;
    font-size: 24px;
    color: #909399;
  }

  .flow-head-close:hover {
    color: $xr-color-primary;
  }
}
.flow-body {
  padding: 15px;
  max-height: 300px;
  overflow: auto;
}
/** 每行的css */
.cf-flow-item {
  position: relative;
  padding-bottom: 15px;
  .cf-flow-item-img {
    display: block;
    background-color: white;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    margin-right: 10px;
  }
  .cf-flow-item-head {
    color: #bababa;
    font-size: 12px;
    .cf-flow-item-des {
      margin-right: 10px;
    }
  }
  .cf-flow-item-info {
    margin-top: 8px;
    font-size: 12px;
    color: #979797;
    .cf-flow-item-name {
      color: #333;
      margin-right: 10px;
    }
  }
  .cf-flow-item-line {
    position: absolute;
    z-index: -1;
    width: 1px;
    top: 0px;
    bottom: 0px;
    left: 8px;
    background-color: #e6e6e6;
  }
  .cf-flow-item-content {
    position: relative;
    margin-top: 15px;
    border-radius: $xr-border-radius-base;
    background-color: #f7f8fa;
    font-size: 12px;
    color: #929293;
    padding: 8px;
    line-height: 18px;
    .cf-flow-item-content-arrow {
      width: 8px;
      height: 8px;
      background-color: #f7f8fa;
      transform: rotate(45deg);
      position: absolute;
      top: -4px;
      left: 25px;
    }
  }
}
</style>
