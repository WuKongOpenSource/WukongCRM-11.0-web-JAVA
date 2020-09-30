<template>
  <el-dialog
    v-loading="loading"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="客户成交状态"
    width="400px"
    @close="handleCancel">
    <div class="handle-box">
      <flexbox
        class="handle-item"
        align="stretch">
        <div
          class="handle-item-name"
          style="margin-top: 8px;">成交状态：</div>
        <el-select
          v-model="status"
          class="handle-item-content">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </flexbox>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="handleCancel">取消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { crmCustomerDealStatusAPI } from '@/api/crm/customer'

export default {
  /** 客户管理  成交状态 操作*/
  name: 'DealStatusHandle',
  components: {},
  mixins: [],
  props: {
    value: Number,
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    crmType: {
      type: String,
      default: ''
    },
    // 勾选数据
    selectionList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      loading: true,
      status: 1,
      options: [
        {
          label: '已成交',
          value: 1
        },
        {
          label: '未成交',
          value: 0
        }
      ]
    }
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        if (typeof val != 'undefined') {
          this.status = val == 0 ? 1 : 0
        }
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    /**
     * 取消选择
     */
    handleCancel() {
      // 重置状态
      this.status = 1
      this.$emit('update:visible', false)
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      const actionIds = this.selectionList.map(item => item[this.crmType + 'Id']).join(',')
      const params = {
        dealStatus: this.status
      }
      params.ids = actionIds
      this.loading = true
      crmCustomerDealStatusAPI(params)
        .then(res => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.loading = false
          this.$emit('handle', {
            type: 'deal_status'
          })
          this.handleCancel()
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.handle-box {
  color: #333;
  font-size: 12px;
}
.handle-item {
  padding-bottom: 15px;
  .handle-item-name {
    flex-shrink: 0;
    width: 90px;
  }
  .handle-item-content {
    flex: 1;
  }
}
.handle-bar {
  position: relative;
  margin-top: 10px;
  height: 30px;
  button {
    float: right;
    margin-right: 10px;
  }
}
</style>
