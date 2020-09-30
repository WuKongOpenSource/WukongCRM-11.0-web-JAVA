<template>
  <el-dialog
    v-loading="loading"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :title="title"
    width="400px"
    @close="handleCancel">
    <div class="handle-box">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="发票号码">
          <el-input v-model="form.invoiceNumber"/>
        </el-form-item>
        <el-form-item label="实际开票日期">
          <el-date-picker
            v-model="form.realInvoiceDate"
            style="width: 100%;"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期"/>
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="form.logisticsNumber"/>
        </el-form-item>

      </el-form>
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
import { crmInvoiceStatusResetAPI, crmInvoiceStatusUpdateAPI } from '@/api/crm/invoice'


export default {
  name: 'MarkInvoice', // 标记为开票
  components: {
  },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    detail: Object,
    reset: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: true,
      form: {
        invoiceNumber: '',
        logisticsNumber: '',
        realInvoiceDate: ''
      }
    }
  },
  computed: {
    title() {
      return this.reset ? '重置开票信息' : '标记为已开票'
    }
  },
  watch: {
    visible() {
      if (this.reset) {
        this.form = {
          invoiceNumber: this.detail.invoiceNumber,
          logisticsNumber: this.detail.logisticsNumber,
          realInvoiceDate: this.detail.realInvoiceDate
        }
      }
    }
  },
  mounted() {},
  methods: {
    /**
     * 取消选择
     */
    handleCancel() {
      // 重置状态
      this.form = {
        invoiceNumber: '',
        logisticsNumber: '',
        realInvoiceDate: ''
      }
      this.$emit('update:visible', false)
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      if (this.invoiceNumber <= 0) {
        return
      }
      var params = {
        ...this.form
      }
      params.invoiceId = this.detail.invoiceId
      this.loading = true
      const request = this.reset ? crmInvoiceStatusResetAPI : crmInvoiceStatusUpdateAPI
      request(params)
        .then(res => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.loading = false
          this.detail.invoiceStatus = 1
          this.handleCancel()
          this.$emit('change')
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
    width: 110px;
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
