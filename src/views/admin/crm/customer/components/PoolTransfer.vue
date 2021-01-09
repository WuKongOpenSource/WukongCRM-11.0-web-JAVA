<template>
  <el-dialog
    ref="wkDialog"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="转移"
    width="450px"
    @close="handleCancel">
    <div class="handle-box">
      <flexbox class="handle-item">
        <div class="handle-item-name">转移到：</div>
        <el-select v-model="selectId" >
          <el-option
            v-for="item in list"
            :key="item.poolId"
            :label="item.poolName"
            :value="item.poolId"/>
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
import {
  crmCustomerPoolSetTransferAPI,
  crmCustomerPoolSetNameListAPI
} from '@/api/crm/customer'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'

export default {
  /**
   * 公海转移
   */
  name: 'PoolTransfer',
  components: {
  },
  mixins: [ElDialogLoadingMixin],
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    id: [String, Number]
  },
  data() {
    return {
      loading: false,
      selectId: '',
      allList: []
    }
  },
  computed: {
    list() {
      return this.allList.filter(item => {
        return item.poolId != this.id
      })
    }
  },
  watch: {
    list: {
      handler() {
        this.selectId = this.list && this.list.length > 0 ? this.list[0].poolId : ''
      },
      immediate: true
    },
    visible(val) {
      if (val && this.list.length === 0) {
        this.getList()
      }
    }
  },
  mounted() {
  },
  methods: {
    /**
     * 获取数据源
     */
    getList() {
      this.loading = true
      crmCustomerPoolSetNameListAPI()
        .then(res => {
          this.allList = res.data || []
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 取消选择
     */
    handleCancel() {
      this.$emit('update:visible', false)
    },

    /**
     * 确定
     */
    handleConfirm() {
      if (this.selectId) {
        this.loading = true
        crmCustomerPoolSetTransferAPI({
          prePoolId: this.id,
          postPoolId: this.selectId
        })
          .then(res => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.loading = false
            this.$emit('transfer')
            this.handleCancel()
          })
          .catch(() => {
            this.loading = false
          })
      }
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
    width: 60px;
  }
  .el-select {
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
