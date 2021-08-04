<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <el-dialog
    ref="wkDialog"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :title="title"
    :show-close="false"
    width="700px">
    <div class="form-add-dialog-body">
      <wk-dep-user-view
        v-if="step == 0"
        :props="{
          value: 'employeeId',
          label: 'employeeName',
          depValue: 'deptId',
          isHrm: true
        }"
        @change="selectChange"
      />
      <template v-else>
        <el-form
          ref="hrmAddForm"
          :model="form"
          :validate-on-rule-change="false"
          :rules="rules"
          class="wk-form is-two-columns">
          <el-form-item
            v-for="(item, index) in fieldList"
            :label="item.value"
            :prop="item.field"
            :key="index">
            <span slot="label">{{ item.value }}</span>
            <el-tooltip
              v-if="item.tips"
              slot="label"
              :content="item.tips"
              effect="dark"
              placement="top">
              <i class="wukong wukong-help_tips" />
            </el-tooltip>
            <template v-if="item.type == 'select'">
              <el-select
                v-model="form[item.field]"
                filterable
                style="width: 100%;">
                <el-option
                  v-for="optionItem in optionsList[item.field]"
                  :key="optionItem.id"
                  :label="optionItem.name"
                  :value="optionItem.id" />
              </el-select>
            </template>
            <template v-else-if="item.type == 'user'">
              <wk-user-select
                v-model="form[item.field]"
                radio
              />
            </template>
            <template v-else-if="item.type == 'structure'">
              <wk-dep-select
                v-model="form[item.field]"
                radio
                @change="depChange"
              />
            </template>
            <template v-else-if="item.type == 'selectCheckout'">
              <el-select
                v-model="form[item.field]"
                :popper-append-to-body="false"
                collapse-tags
                popper-class="select-popper-class"
                filterable
                multiple
                style="width: 100%;">
                <el-option-group
                  v-for="group in groupsList"
                  :key="group.pid"
                  :label="group.name">
                  <el-option
                    v-for="item in group.list"
                    :key="item.roleId"
                    :label="item.roleName"
                    :value="item.roleId" />
                </el-option-group>
              </el-select>
            </template>
            <el-input
              v-else
              v-model="form[item.field]"
              :maxlength="100" />
          </el-form-item>
        </el-form>
        <div class="data-info">
          <div class="data-info__header">已选择员工：{{ countName }}</div>
          <el-table
            :data="tableList"
            height="300"
            stripe
            border
            highlight-current-row>
            <el-table-column
              v-for="(item, index) in tableFieldList"
              :key="index"
              :prop="item.field"
              :label="item.name"
              show-overflow-tooltip/>
            <el-table-column
              fixed="right"
              label="操作"
              width="80">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  @click="deleteClick(scope)">删 除</el-button></template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="close">取消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">{{ sureTitle }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { hrmAddUserAPI } from '@/api/admin/user'
import {
  hrmEmployeeQueryByUserDeptAPI
} from '@/api/hrm/employee'

import WkDepUserView from '@/components/NewCom/WkUserSelect/Dep'
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import WkDepSelect from '@/components/NewCom/WkDepSelect'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'
import { objDeepCopy } from '@/utils'

export default {
  // 人资添加
  name: 'HrmEmployeeAddDialog',
  components: {
    WkDepUserView,
    WkUserSelect,
    WkDepSelect
  },
  mixins: [ElDialogLoadingMixin],
  props: {
    rules: Object,
    // 领取数据源
    optionsList: Object,
    groupsList: Array,
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      title: '添加员工',
      step: 0, // 0 和 1
      users: [],
      deps: [],
      fieldList: [
        { field: 'password', value: '登录密码' },
        { field: 'deptId', value: '部门', type: 'structure' },
        { field: 'parentId', value: '直属上级', type: 'user' },
        { field: 'roleId', value: '角色', type: 'selectCheckout' }
      ],
      tableList: [],
      tableFieldList: [
        { field: 'employeeName', name: '姓名' },
        { field: 'mobile', name: '手机号' },
        { field: 'email', name: '邮箱' },
        { field: 'sex', name: '性别' },
        { field: 'post', name: '岗位' }
      ],
      form: {}
    }
  },
  computed: {
    sureTitle() {
      return this.step == 0 ? '下一步' : '保存'
    },
    countName() {
      if (this.tableList && this.tableList.length > 0) {
        const nameList = this.tableList.length >= 2 ? this.tableList.slice(0, 2) : this.tableList
        const names = nameList.map(item => item.employeeName).join('、')
        return this.tableList.length > 2 ? `${names}等${this.tableList.length}人` : names
      }
      return '0人'
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.step = 0
          this.form = {}
        }
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    close() {
      this.$emit('update:visible', false)
    },

    /**
     * 第一步
     */
    selectChange(users, deps) {
      this.users = users || []
      this.deps = deps || []
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      if (this.step == 0) {
        this.firstConfirmClick()
      } else {
        this.secondConfirmClick()
      }
    },

    /**
     * 第一步保存点击
     */
    firstConfirmClick() {
      if (this.users.length > 0 || this.deps.length > 0) {
        this.loading = true
        hrmEmployeeQueryByUserDeptAPI({
          deptIdList: this.deps.map(item => item.deptId),
          employeeIdList: this.users.map(item => item.employeeId)
        }).then(res => {
          const tableList = res.data || []
          tableList.forEach(item => {
            item.sex = {
              1: '男',
              2: '女'
            }[item.sex]
          })
          this.tableList = tableList
          this.step = 1
          this.$nextTick(() => {
            if (this.$refs.hrmAddForm) {
              this.$refs.hrmAddForm.clearValidate()
            }
          })
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      } else {
        this.$message.error('请选择')
      }
    },

    /**
     * 删除
     */
    deleteClick(scope) {
      this.tableList.splice(scope.$index, 1)
    },

    /**
     * 第二步保存点击
     */
    secondConfirmClick() {
      this.$refs.hrmAddForm.validate(valid => {
        if (valid) {
          if (this.tableList.length > 0) {
            this.loading = true
            const params = {
              // deptIds: this.deps.map(item => item.deptId),
              employeeIds: this.tableList.map(item => item.employeeId)
            }
            const form = objDeepCopy(this.form)
            form.roleId = this.form.roleId.join(',')
            hrmAddUserAPI({
              ...params,
              ...form
            }).then(res => {
              this.$message.success('添加成功')
              this.$emit('change')
              this.close()
              this.loading = false
            }).catch(() => {
              this.loading = false
            })
          } else {
            this.$message.error('请选择员工')
          }
        }
      })
    },

    /**
     * 编辑员工单选change
     */
    depChange(_, data) {
      const obj = data && data.length > 0 ? data[0] : null
      this.$set(this.form, 'parentId', obj ? obj.ownerUserId : '')
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/wk-form.scss';
.form-add-dialog-body {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 55vh;

  .data-info {
    padding: 8px 13px;
    &__header {
      margin-bottom: 8px;
    }
  }

  .wk-dep-select,
  .wk-user-select {
    width: 100%;
    display: inline-block;
  }
}
</style>
