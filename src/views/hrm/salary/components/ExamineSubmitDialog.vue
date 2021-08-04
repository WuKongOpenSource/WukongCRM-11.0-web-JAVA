<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <el-dialog
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :title="title"
    :show-close="false"
    width="500px">
    <div class="form-add-dialog-body">
      <wk-approval-flow-apply
        v-if="list"
        :data="list"
        style="padding-left: 5px;padding-top: 2px;"
      />
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
import WkApprovalFlowApply from '@/components/Examine/WkApprovalFlowApply'


export default {
  // 发起审批
  name: 'ExamineSubmitDialog',
  components: {
    WkApprovalFlowApply
  },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    data: Object
  },
  data() {
    return {
      list: null,
      title: '提交审核'
    }
  },
  computed: {
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.list = this.data ? this.data.examineFlowList : null
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
      this.close()
    },

    close() {
      this.$emit('update:visible', false)
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      this.$emit('save', this.list)
    }
  }
}
</script>
<style lang="scss" scoped>
.form-add-dialog-body {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 55vh;
  min-height: 20px;
}
</style>
