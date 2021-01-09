<template>
  <el-dialog
    :visible.sync="visible"
    :show-close="false"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    class="approval-flow-update-dialog"
    title="提示"
    width="700px"
    destroy-on-close>
    <template slot="title"><i class="el-icon-warning" />审批流程变更说明！</template>
    <div class="content">由于审批流程全面升级，审批流程变更如下：<br>
      <span>① 审核状态为“待审核、审核中”的数据，自动处理为“已拒绝”，需要发起人重新编辑提交。</span><br>
      ② 若审批用的是固定审批流，则根据新审批流自动适配，审批流程不受影响。<br>
      ③ 若原审批流程为“授权审批人”则自动变为新审批流中的“发起人自选”，审批流程与原审批流不同。</div>
    <div class="content">如对审批流有异议，请立即联系系统管理员重新配置此审批流！给您带来的不便，敬请谅解。</div>
    <div class="des">备注：发起人自选是指由发起人创建表单时自由选择每个节点的审批人，无需审批人选择，当前配置默认可以选择多个审批人，并且根据审批人顺序依次审批。</div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="sureClick">我已知晓</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Lockr from 'lockr'

export default {
  // 审批流升级说明弹窗
  name: 'ApprovalFlowUpdateDialog',

  components: {},

  props: {
  },

  data() {
    return {
      visible: false
    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {
    const visible = Lockr.get('WkApprovalFlowUpdateDialog')
    if (!visible) {
      setTimeout(() => {
        this.visible = true
      }, 1000)
    }
  },

  beforeDestroy() {},

  methods: {
    sureClick() {
      Lockr.set('WkApprovalFlowUpdateDialog', true)
      this.visible = false
    }
  }
}
</script>

<style lang="scss">
.approval-flow-update-dialog {
  .el-dialog__header {
    font-size: 15px;
    font-weight: bold;
    .el-icon-warning {
      color: #F9A74E;
      margin-right: 5px;
    }
  }

  .el-dialog__body {
    padding-top: 10px;
    padding-left: 35px;
    padding-right: 35px;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    .content {
      span {
        color: red;
      }
    }

    .content + .content {
      margin-top: 30px;
    }

    .des {
      margin-top: 30px;
      color: #999;
      font-size: 13px;
    }
  }
}
</style>
