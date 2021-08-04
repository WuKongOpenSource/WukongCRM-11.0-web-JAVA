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
    width="700px">
    <div class="form-add-dialog-body">
      <examine-info
        ref="examineInfo"
        :id="id"
        :record-id="recordId"
        :owner-user-id="createUserId"
        examine-type="hrm_salary"
        class="examine-info"
        @info="handleExamineInfo"
        @on-handle="handleBack" />
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="handleCancel">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import ExamineInfo from '@/components/Examine/ExamineInfo'

export default {
  // 审批进度详情
  name: 'ExamineProgressDialog',
  components: {
    ExamineInfo
  },
  mixins: [],
  props: {
    detail: Object,
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      title: '详情'
    }
  },
  computed: {
    id() {
      return this.detail ? this.detail.srecordId : ''
    },

    recordId() {
      return this.detail ? this.detail.examineRecordId : ''
    },

    createUserId() {
      return this.detail ? this.detail.createUserId : ''
    }
  },
  watch: {
    visible: {
      handler(val) {
        // 触发内部更新
        if (val) {
          if (this.recordId) {
            if (this.$refs.examineInfo) {
              this.$refs.examineInfo.refreshData()
            }
          }
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

    handleExamineInfo(data) {
    },

    handleBack(data) {
      this.close()
      this.$emit('change')
    }
  }
}
</script>
<style lang="scss" scoped>
.form-add-dialog-body {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 55vh;
  .approval-flow {
    padding-top: 0;
  }
}
</style>
