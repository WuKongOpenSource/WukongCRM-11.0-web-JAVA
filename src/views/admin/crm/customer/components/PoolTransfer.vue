<template>
  <el-dialog
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

import { Loading } from 'element-ui'

export default {
  /**
   * 公海转移
   */
  name: 'PoolTransfer',
  components: {
  },
  mixins: [],
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
      const loading = Loading.service({
        target: document.querySelector(`.el-dialog[aria-label="转移"]`)
      })
      crmCustomerPoolSetNameListAPI()
        .then(res => {
          this.allList = res.data || []
          loading && loading.close()
        })
        .catch(() => {
          loading && loading.close()
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
        const loading = Loading.service({
          target: document.querySelector(`.el-dialog[aria-label="转移"]`)
        })
        crmCustomerPoolSetTransferAPI({
          prePoolId: this.id,
          postPoolId: this.selectId
        })
          .then(res => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            loading.close()
            this.$emit('transfer')
            this.handleCancel()
          })
          .catch(() => {
            loading.close()
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
