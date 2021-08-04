<template>
  <el-dialog
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :title="title"
    width="700px"
    @close="handleCancel">
    <div v-loading="loading" class="field-set-dialog">
      <el-table :data="list" height="50vh" border style="width: 100%">
        <el-table-column label="字段名称" prop="name" width="200"/>
        <el-table-column label="字段权限">
          <template slot-scope="{ row }">
            <el-checkbox
              v-model="row.canCheck"
              :disabled="!getCanOpreateRead(row.operateType)"
              @change="checkCheckboxChange(row)">可以查看</el-checkbox>
            <el-checkbox
              v-model="row.canEdit"
              :disabled="!getCanOpreateEdit(row.operateType)"
              @change="editCheckboxChange(row)">可以修改</el-checkbox>
            <template v-if="getMaskIsShow(row)">
              <el-checkbox
                v-model="row.canMask"
                @change="maskCheckboxChange(row)">掩码显示</el-checkbox>
              <el-button
                :disabled="!row.canMask"
                class="mask-button"
                type="text"
                @click="setMaskClick(row)">设置掩码规则</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button type="text" style="float: left;" @click="getFieldList">重置</el-button>
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">保存</el-button>
    </span>

    <!-- 设置掩码规则 -->
    <el-dialog
      v-if="maskSetVisible"
      :visible="maskSetVisible"
      :append-to-body="true"
      :close-on-click-modal="false"
      title="设置掩码规则"
      width="500px"
      @close="maskSetVisible = false">
      <div class="mask-wrap">
        <div class="mask-wrap__des">
          1、勾选该选项后，该字段的值在页面上将以掩码显示，比如 ：手机188****8888、邮箱wa*****@5kcrm.com、货币全部掩码显示、地址的详细地址全部掩码显示<br>
          2、字段配置掩码后，若用户看到的是掩码显示，那该用户导出的也是掩码显示<br>
          3、编辑页面为非掩码显示
        </div>
        <div class="mask-wrap__body">
          <div>掩码显示的页面</div>
          <div class="handle">
            <el-checkbox
              v-model="maskEditDetail.tableMask"
              disabled>列表页面</el-checkbox>
            <el-checkbox
              v-model="maskEditDetail.viewMask">详情页面</el-checkbox>
          </div>
        </div>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button @click="maskSetVisible = false">取消</el-button>
        <el-button
          v-debounce="handleMaskConfirm"
          type="primary">确定</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
import {
  systemRoleGetFieldAPI,
  systemRoleSetFieldAPI
} from '@/api/admin/role'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import { objDeepCopy } from '@/utils'

export default {
  name: 'FieldSetDialog',
  components: {},
  mixins: [],
  props: {
    label: [String, Number],
    roleId: [String, Number],
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      rowDetail: null, // 用于编辑后修改原值
      maskEditDetail: null, // 用于编辑
      maskSetVisible: false
    }
  },
  computed: {
    title() {
      return `${crmTypeModel.convertTypeToName(this.label)}字段授权`
    }
  },
  watch: {
    visible: {
      handler() {
        if (this.visible) {
          this.getFieldList()
        }
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    getFieldList() {
      this.list = []
      this.loading = true
      systemRoleGetFieldAPI({ label: this.label, roleId: this.roleId }).then(res => {
        this.loading = false
        const list = res.data || []
        // authLevel 1 不能查看不能编辑 2可查看  3 可编辑可查看
        // maskType 掩码类型 0 都不隐藏 1 列表隐藏详情不隐藏 2 都隐藏
        list.forEach(item => {
          item.canCheck = item.authLevel == 2 || item.authLevel == 3
          item.canEdit = item.authLevel == 3
          item.canMask = item.maskType !== 0

          item.tableMask = item.maskType == 1 || item.maskType == 2
          item.viewMask = item.maskType == 2
        })
        this.list = res.data || []
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 取消选择
     */
    handleCancel() {
      // 重置状态
      this.$emit('update:visible', false)
    },

    // 1 都可以 2 能查看 3  能编辑 4  都不能
    getCanOpreateRead(operateType) {
      return operateType == 1 || operateType == 2
    },

    getCanOpreateEdit(operateType) {
      return operateType == 1 || operateType == 3
    },

    getMaskIsShow({ type, fieldName }) {
      if (this.label == crmTypeModel.product && fieldName === 'price') {
        return false
      } else if (this.label == crmTypeModel.business && fieldName === 'money') {
        return false
      } else if (this.label == crmTypeModel.contract && fieldName === 'money') {
        return false
      } else if (this.label == crmTypeModel.receivablesPlan && ['real_received_money', 'unreceived_money'].includes(fieldName)) {
        return true
      }
      // 手机 7、邮箱 14、货币 6、地址 43
      return type == 7 || type == 14 || type == 6 || type == 43
    },

    handleConfirm() {
      this.loading = true
      const listCopy = objDeepCopy(this.list)
      listCopy.forEach(item => {
        let authLevel = 3
        if (item.canCheck && item.canEdit) {
          authLevel = 3
        } else if (item.canCheck) {
          authLevel = 2
        } else {
          authLevel = 1
        }
        item.authLevel = authLevel

        delete item.canCheck
        delete item.canEdit

        // maskType 掩码类型 0 都不隐藏 1 列表隐藏详情不隐藏 2 都隐藏
        let maskType = 0
        if (item.tableMask || item.viewMask) {
          if (item.tableMask && item.viewMask) {
            maskType = 2
          } else {
            maskType = 1
          }
        }
        item.maskType = maskType

        delete item.canMask
        delete item.tableMask
        delete item.viewMask
      })
      systemRoleSetFieldAPI(listCopy).then(res => {
        this.loading = false
        this.$message.success('操作成功')
        this.handleCancel()
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 编辑有效时查看必须有效
     */
    editCheckboxChange(data) {
      if (data.canEdit) {
        this.$set(data, 'canCheck', true)
      }
    },

    checkCheckboxChange(data) {
      if (!data.canCheck && data.canEdit) {
        this.$set(data, 'canEdit', false)
      }
    },

    maskCheckboxChange(data) {
      data.tableMask = data.canMask
      data.viewMask = data.canMask
    },

    /**
     * 掩码设置
     */
    setMaskClick(row) {
      this.rowDetail = row
      this.maskEditDetail = objDeepCopy(row)
      this.maskSetVisible = true
    },

    /**
     * 掩码保存
     */
    handleMaskConfirm() {
      this.rowDetail.tableMask = this.maskEditDetail.tableMask
      this.rowDetail.viewMask = this.maskEditDetail.viewMask
      this.maskSetVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.field-set-dialog {
  color: #333;
  font-size: 12px;
  .mask-button {
    margin-left: 10px;
  }
}

.mask-wrap {
  &__des {
    line-height: 1.5;
    font-size: 13px;
    color: $xr-color-text-secondary;
  }

  &__body {
    color: #333;
    margin-top: 10px;

    .handle {
      margin-top: 10px;
    }
  }
}
</style>
