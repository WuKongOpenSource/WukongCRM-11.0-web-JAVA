<template>
  <div class="detail-recycle-rule">
    <div>{{ typeName }}</div>
    <div
      class="detail-recycle-rule__content">
      <div class="range-rule">
        <span>选择不进入公海客户</span>
        <span v-if="dealHandleShow && data.dealHandle === 0">已成交客户</span>
        <span v-if="businessHandleShow && data.businessHandle === 0">有商机客户</span>
      </div>
      <div>
        <div v-if="data.customerLevelSetting === 1" class="type-rule">所有客户统一设置</div>
        <div v-else-if="data.customerLevelSetting === 2" class="type-rule">根据客户级别分别设置</div>
        <el-table
          :data="data.levelSetting"
          border
          style="width: 100%">
          <el-table-column
            prop="level"
            label="客户"
            width="180"/>
          <el-table-column
            :label="limitDayName"
            prop="limitDay">
            <template slot-scope="scope">
              <span>{{ `超过${scope.row.limitDay}天${getLimitDayUnit(data.type)}，进入公海` }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  // 详情回收规则
  name: 'DetailRecycleRule',
  components: {},
  props: {
    data: null
  },
  data() {
    return {}
  },
  computed: {
    typeName() {
      return {
        1: '超过N天“无新建跟进（跟进记录）”的客户，由系统定时退回公海客户池',
        2: '超过N天“无新建商机”的客户，由系统定时退回公海客户池',
        3: '超过N天“未成交”的客户，由系统定时退回公海客户池'
      }[parseInt(this.data.type)]
    },

    limitDayName() {
      return {
        1: '未跟进天数',
        2: '未新建天数',
        3: '未成交天数'
      }[parseInt(this.data.type)]
    },

    dealHandleShow() {
      return this.data.type == 1 || this.data.type == 2
    },
    businessHandleShow() {
      return this.data.type == 1 || this.data.type == 3
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    getLimitDayUnit(type) {
      return {
        1: '未跟进',
        2: '未新建商机',
        3: '未成交'
      }[type]
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-recycle-rule {
  font-size: 13px;

  &__content {
    padding: 15px;
    border: 1px solid $xr-border-color-base;
    border-radius: $xr-border-radius-base;
  }
}

.range-rule {
  span:first-child {
    color: #999;
  }

  span {
    display: inline-block;
  }

  span + span {
    margin-left: 20px;
  }
}

.type-rule {
  color: #999;
  margin-top: 10px;
}
</style>
