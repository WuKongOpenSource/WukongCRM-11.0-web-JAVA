<template>
  <div
    v-loading="loading"
    v-if="examineFlowList && examineFlowList.length > 0"
    class="approval-flow">
    <flexbox
      class="approval-flow__hd"
      justify="space-between">

      <div class="approval-flow__hd--left">
        <span
          class="flow-title">
          <i class="wk wk-approve" />审批流信息
        </span>

        <el-popover
          v-model="showFlowPopover"
          width="300"
          trigger="click">
          <check-flow
            ref="checkFlow"
            :show="showFlowPopover"
            :id="recordId"
            :examine-type="examineType"
            @close="showFlowPopover=false"/>
          <el-button
            slot="reference"
            type="text">查看历史审批流程</el-button>
        </el-popover>
      </div>


      <div class="approval-flow__hd--right">
        <el-button
          v-if="examineInfo.isCheck == 1"
          class="xr-btn--green"
          icon="wk wk-success"
          @click="examineHandle(1)">通过</el-button>
        <el-button
          v-if="examineInfo.isCheck == 1"
          class="xr-btn--red"
          icon="wk wk-close"
          @click="examineHandle(2)">拒绝</el-button>
        <el-button
          v-if="examineInfo.isRecheck == 1"
          class="xr-btn--primary"
          icon="wk wk-reset"
          @click="examineHandle(4)">撤回</el-button>
      </div>
    </flexbox>

    <!-- 固定 -->
    <flexbox
      class="check-items"
      wrap="wrap">
      <el-popover
        v-for="(item, index) in examineFlowList"
        :key="index"
        :disabled="!item.userList || item.userList.length==0"
        placement="bottom"
        trigger="hover">
        <div class="popover-detail">
          <flexbox
            v-for="(subItem, subIndex) in item.userList"
            :key="subIndex"
            align="stretch"
            class="popover-detail-item">
            <img
              :src="getStatusImageIcon(subItem.examineStatus)"
              class="popover-detail-item-img">
            <div>
              <div class="popover-detail-item-time">{{ subItem.examineTime }}</div>
              <flexbox class="popover-detail-item-examine">
                <div class="examine-name">{{ subItem.realname }}</div>
                <div class="examine-info">{{ getStatusName(subItem.examineStatus) }}此申请</div>
              </flexbox>
            </div>
          </flexbox>
        </div>
        <flexbox
          slot="reference"
          class="check-item">
          <img
            :src="getStatusImageIcon(item.examineStatus)"
            class="check-item-img">
          <div class="check-item-name">{{ getDetailName(item) }}</div>
          <div class="check-item-status">{{ getStatusName(item.examineStatus) }}</div>
          <i
            v-if="examineFlowList.length -1 != index"
            class="el-icon-arrow-right check-item-arrow"/>
        </flexbox>
      </el-popover>
    </flexbox>

    <examine-handle
      :show="showExamineHandle"
      :id="id"
      :record-id="recordId"
      :examine-type="examineType"
      :detail="examineInfo"
      :status="examineHandleInfo.status"
      @close="showExamineHandle = false"
      @save="examineHandleClick"/>
  </div>
</template>
<script type="text/javascript">
import { examineRecordQueryListAPI } from '@/api/examine' // 审批步骤

import Nzhcn from 'nzh/cn'
import ExamineHandle from './ExamineHandle' // 审批操作理由
import CheckFlow from './CheckFlow' // 审批流程
import CheckStatusMixin from '@/mixins/CheckStatusMixin'
import { wayTypeObj } from '@/components/ApprovalFlow/nodeModel'

// 审核信息 config 1 固定 0 自选
export default {
  name: 'ExamineInfo', // 合同审核操作
  components: {
    ExamineHandle,
    CheckFlow
  },
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
    id: [String, Number],
    // 审批流id
    recordId: [String, Number],
    ownerUserId: [String, Number]
  },
  data() {
    return {
      loading: false,
      examineInfo: {}, // 审核信息
      showFlowPopover: false,
      examineHandleInfo: { status: 1 }, // 1 审核通过 2 审核拒绝 4 已撤回
      showExamineHandle: false // 审核操作
    }
  },
  computed: {
    examineFlowList() {
      return this.examineInfo.examineFlowList ? this.examineInfo.examineFlowList : []
    }
  },
  watch: {
    recordId: {
      handler(val) {
        if (val) {
          this.examineInfo = {}
          this.getFlowStepList()
          if (this.$refs.checkFlow) {
            this.$refs.checkFlow.getDetail()
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {},
  methods: {
    /**
     * 详情
     */
    getFlowStepList() {
      if (!this.recordId) {
        return
      }
      this.loading = true
      examineRecordQueryListAPI({
        recordId: this.recordId,
        ownerUserId: this.ownerUserId
      })
        .then(res => {
          this.loading = false
          const resData = res.data || {}
          this.examineInfo = resData
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 撤回审核 通过 拒绝
     */
    examineHandle(status) {
      this.examineHandleInfo.status = status
      this.showExamineHandle = true
    },

    /**
     * 审批操作点击
     */
    examineHandleClick(data) {
      this.getFlowStepList()
      if (this.$refs.checkFlow) {
        this.$refs.checkFlow.getDetail()
      }
      this.$emit('on-handle', data)
    },

    /**
     * 获取名称
     */
    getDetailName(data) {
      if (!data.userList || data.userList.length === 0) {
        return 'XX'
      } else if (data.userList.length === 1) {
        return data.userList[0].realname
      } else if (data.examineType === 5) {
        return `${data.userList.length}人${wayTypeObj[1]}`
      } else {
        return `${data.userList.length}人${wayTypeObj[data.type]}`
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.approval-flow{
  position: relative;
  background-color: white;
  padding: 15px;

  &__hd {
    position:relative;

    &--right {

      .xr-btn--green,
      .xr-btn--red {
        color: white;
      }
    }
  }
}

// 头部标示
.flow-title {
  font-weight: 600;
  color: #333333;
  margin-right: 20px;
  i {
    color: white;
    margin-right: 5px;
    padding: 3px;
    font-size: 12px;
    border-radius: $xr-border-radius-base;
    background-color: #1CBAF5;
  }
}

/** 审核流程 */
.check-items {
  overflow-x: auto;
  padding: 10px 0;
  margin-top: 10px;
}

.check-item {
  width: auto;
  flex-shrink: 0;
  .check-item-img {
    display: block;
    width: 18px;
    height: 18px;
    border-radius: 9px;
    margin-right: 8px;
  }
  .check-item-name {
    color: #333;
    font-size: 14px;
    margin-right: 8px;
  }
  .check-item-status {
    color: #666;
    font-size: 12px;
  }

  .check-item-arrow {
    color: #666;
    margin: 0 15px;
    font-size: 13px;
  }
}

// 固定审批流详情
.popover-detail {
  padding: 0 5px;
}
.popover-detail-item {
  padding: 5px 0;
  &-img {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    margin-right: 10px;
  }
  &-time {
    color: #bababa;
    font-size: 12px;
  }
  &-examine {
    .examine-name {
      color: #333;
      margin-right: 10px;
    }
    .examine-info {
      color: #666;
    }
  }
}
</style>
