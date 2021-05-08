<template>
  <el-dialog
    ref="wkDialog"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :title="title"
    width="700px"
    @close="handleCancel">
    <el-checkbox v-model="allChecked" class="el-bold-checkbox" @change="allChange">全选</el-checkbox>
    <el-checkbox-group v-model="checkList" @change="groupChange">
      <div v-for="(item, index) in treeList" :key="index" class="role-set-section">
        <div class="role-set-section__title">{{ item.name }}</div>
        <div class="role-set-section__list">
          <el-checkbox
            v-for="(subItem, subIndex) in item.list" :key="subIndex"
            :label="subItem.roleId">{{ subItem.roleName }}</el-checkbox>
        </div>
      </div>
    </el-checkbox-group>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  adminRoleGetRoleListAPI,
  adminRoleQueryAuthRoleAPI,
  adminRoleUpdateAuthRoleAPI
} from '@/api/admin/employeeDep'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'
import { objDeepCopy } from '@/utils'

export default {
  name: 'RoleRangeSetDialog',
  components: {},
  mixins: [ElDialogLoadingMixin],
  props: {
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
      allChecked: false,
      treeList: [],
      checkList: [],
      allIds: [],
      defaultProps: {
        children: 'pid',
        label: 'name'
      }
    }
  },
  computed: {
    title() {
      return '配置查看范围'
    }
  },
  mounted() {
    this.getRoleList()
  },
  methods: {
    /**
     * 获取角色设置范围值
     */
    getRoleRangeValue() {
      this.loading = true
      adminRoleQueryAuthRoleAPI(this.roleId).then(res => {
        this.checkList = res.data || []
        this.groupChange()
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 获取角色列表
     */
    getRoleList() {
      this.loading = true
      adminRoleGetRoleListAPI().then(res => {
        this.loading = false
        const treeList = res.data || []
        const allIds = []
        treeList.forEach(item => {
          item.list.forEach(subItem => {
            allIds.push(subItem.roleId)
          })
        })
        this.allIds = allIds
        this.treeList = treeList

        this.getRoleRangeValue()
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

    /**
     * 全部change
     */
    allChange() {
      if (this.allChecked) {
        if (this.checkList.length !== this.allIds.length) {
          this.checkList = objDeepCopy(this.allIds)
        }
      } else {
        if (this.checkList.length === this.allIds.length) {
          this.checkList = []
        }
      }
    },

    /**
     * 组change
     */
    groupChange() {
      console.log(2222)
      if (this.checkList.length === this.allIds.length) {
        if (!this.allChecked) {
          this.allChecked = true
        }
      } else {
        if (this.allChecked) {
          this.allChecked = false
        }
      }
    },

    handleConfirm() {
      this.loading = true
      adminRoleUpdateAuthRoleAPI(this.roleId, this.checkList).then(res => {
        this.loading = false
        this.$message.success('操作成功')
        this.handleCancel()
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.field-set-dialog {
  color: #333;
  font-size: 12px;
  .el-tree {
    max-height: 55vh;
    overflow-y: auto;
  }
}

.el-bold-checkbox {
  /deep/ .el-checkbox__label {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
}

.el-checkbox {
  margin-bottom: 5px;
  /deep/ .el-checkbox__label {
    color: #666 !important;
  }
}

.role-set-section {
  &__title {
    font-size: 14px;
    margin: 10px 0;
    font-weight: bold;
    color: #333;
  }
}
</style>
