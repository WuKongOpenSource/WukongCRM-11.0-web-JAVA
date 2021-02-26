<template>
  <el-dialog
    ref="wkDialog"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="重置部门"
    width="500px"
    @close="handleCancel">
    <div >
      <el-form
        ref="form"
        :model="fieldFrom"
        :rules="rules"
        label-position="top">
        <el-form-item
          label="部门"
          prop="deptId">
          <wk-dep-select
            v-model="fieldFrom.deptId"
            radio
            style="width: 100%;"
          />
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
import {
  adminUserSetUserDeptPI
} from '@/api/admin/employeeDep'

import WkDepSelect from '@/components/NewCom/WkDepSelect'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'

export default {
  // 重置部门
  name: 'EditDepDialog',

  components: {
    WkDepSelect
  },

  mixins: [ElDialogLoadingMixin],

  props: {
    selectionList: Array, // 员工信息
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  data() {
    return {
      fieldFrom: {
        deptId: ''
      },
      rules: {
        deptId: { required: true, message: '请选择', trigger: 'change' }
      }
    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 取消选择
     */
    handleCancel() {
      this.$emit('update:visible', false)
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const userIdList = this.selectionList.map(item => item.userId)
          this.loading = true
          adminUserSetUserDeptPI({
            ...this.fieldFrom,
            userIdList
          }).then(res => {
            this.loading = false
            this.$message.success('操作成功')
            this.$emit('change')
            this.handleCancel()
          }).catch(() => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  margin-top: 10px;
  /deep/ .el-form-item__label {
    line-height: 30px;
    padding-bottom: 0;
  }
}
</style>
