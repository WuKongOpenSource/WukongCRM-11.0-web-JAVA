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
    width="500px"
    @close="handleCancel">
    <div class="template-dialog-body">
      <template v-if="isNew">
        <el-form
          ref="ruleForm"
          :model="ruleForm"
          :rules="rules"
          label-width="100px"
          label-position="top">
          <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="ruleForm.templateName" :maxlength="20"/>
          </el-form-item>
          <el-form-item label="调薪项" prop="value">
            <span
              v-for="(item, index) in templateOption"
              :key="`span${index}`"
              :class="{ 'is-select': item.isSelect }"
              class="span-label is-big"
              @click="spanSelectClick(item)"
            >{{ item.name }}</span>
          </el-form-item>
        </el-form>
      </template>
      <template v-else>
        <div class="template__header">
          <el-button
            type="primary"
            icon="el-icon-plus"
            style="margin-right: 20px;"
            @click="createClick(null)">新建模板</el-button>
        </div>
        <div class="template__body">
          <el-card
            v-for="(item, index) in list"
            :key="`card${index}`"
            class="template-item">
            <div class="template-item__header">{{ item.templateName }}<span
              class="item-handle">
              <el-button type="text" @click="itemHandleClick('edit', item)">编辑</el-button>
              <el-button v-if="item.isDefault !== 1" type="text" class="is-delete" @click="itemHandleClick('delete', item)">删除</el-button>
            </span>
            </div>
            <div class="template-item__body">
              <span
                v-for="(subItem, subIndex) in item.value"
                :key="`span${subIndex}`"
                class="span-label"
              >{{ subItem.name }}</span>
            </div>
          </el-card>
        </div>
      </template>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <template v-if="isNew">
        <el-button type="primary" @click="newHandleClick('save')">保存</el-button>
        <el-button @click="newHandleClick('cancel')">取消</el-button>
      </template>
      <template v-else>
        <el-button @click="handleCancel">关闭</el-button>
      </template>
    </span>
  </el-dialog>
</template>

<script>
import {
  hrmSalaryChangeTemplateQueryListAPI,
  hrmSalaryChangeTemplateDeleteAPI,
  hrmSalaryChangeTemplateQueryOptionAPI,
  hrmSalaryArchivesSetAPI
} from '@/api/hrm/salary'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'

export default {
  // 管理定薪模板
  name: 'TemplateManageDialog',
  components: {
  },
  mixins: [ElDialogLoadingMixin],
  props: {
    id: [String, Number],
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    var validateValue = (rule, value, callback) => {
      const selectValue = value.filter(item => item.isSelect)
      if (selectValue.length === 0) {
        callback(new Error('调薪项不能为空'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      list: [],
      isNew: false, // 区分列表和新建
      ruleForm: {
        templateName: '',
        value: []
      },
      rules: {
        templateName: [
          { required: true, message: '模板名称不能为空', trigger: 'blur' }
        ],
        value: [
          { validator: validateValue }
        ]
      },
      editData: null,
      templateOption: []
    }
  },
  computed: {
    title() {
      if (this.isNew) {
        return this.editData ? '编辑模板' : '新建模板'
      }

      return '管理定薪模板'
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.isNew = false
          this.getList()
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

    getList() {
      this.loading = true
      hrmSalaryChangeTemplateQueryListAPI()
        .then(res => {
          this.list = res.data || []
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 操作
     */
    itemHandleClick(type, item) {
      if (type === 'edit') {
        this.createClick(item)
      } else {
        this.$confirm('确定删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            hrmSalaryChangeTemplateDeleteAPI(item.id).then(res => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getList()
            })
          })
          .catch(() => {})
      }
    },

    /**
     * 新建
     */
    createClick(editData = null) {
      this.editData = editData
      this.ruleForm = {
        templateName: editData ? editData.templateName : '',
        value: []
      }
      this.templateOption = []
      this.getTemplateOption()
      this.isNew = true
    },

    /**
     * 获取模板项
     */
    getTemplateOption() {
      this.loading = true

      hrmSalaryChangeTemplateQueryOptionAPI()
        .then(res => {
          const templateOption = res.data || []
          let codeList = []
          if (this.editData) {
            codeList = this.editData.value.map(item => item.code)
          }
          templateOption.forEach(item => {
            if (codeList.length > 0) {
              item.isSelect = codeList.includes(item.code)
            } else {
              // 新建 小于20000的默认选中
              item.isSelect = item.code < 20000
            }
          })
          this.templateOption = templateOption
          this.ruleForm = {
            templateName: this.editData ? this.editData.templateName : '',
            value: templateOption
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 新建操作
     */
    newHandleClick(type) {
      if (type === 'cancel') {
        this.isNew = false
      } else if (type === 'save') {
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            const value = []
            for (let index = 0; index < this.ruleForm.value.length; index++) {
              const item = this.ruleForm.value[index]
              if (item.isSelect) {
                value.push({
                  name: item.name,
                  code: item.code
                })
              }
            }
            this.loading = true
            const params = {
              templateName: this.ruleForm.templateName,
              value
            }
            if (this.editData) {
              params.id = this.editData.id
            }
            hrmSalaryArchivesSetAPI(params)
              .then(res => {
                this.$message.success(this.editData ? '编辑成功' : '新建成功')
                this.isNew = false
                this.getList()
                this.loading = false
              })
              .catch(() => {
                this.loading = false
              })
          } else {
            return false
          }
        })
      }
    },

    /**
     * 选择
     */
    spanSelectClick(item) {
      item.isSelect = !item.isSelect
    }
  }
}
</script>
<style lang="scss" scoped>
.template-dialog-body {
  overflow-y: auto;
  overflow-x: hidden;
  height: 55vh;

  .template {
    &__header {
      text-align: right;
    }

    &__body {
      padding: 15px 10px 0;
      height: calc(100% - 31px);
      overflow-y: auto;
    }

    &-item {
      &__header {
        font-weight: bold;
        line-height: 31px;
        .item-handle {
          float: right;
        }

        .el-button.is-delete {
          color: #fa6060;
        }
      }

      &__body {
        line-height: 30px;
        margin-top: 5px;
      }
    }
  }

  .template-item + .template-item {
    margin-top: 10px;
  }
}

.span-label {
  word-break: keep-all;
  padding: 2px 10px;
  border: 1px solid $xr-border-color-base;
  border-radius: $xr-border-radius-base;
  font-size: 12px;
  white-space: nowrap;
  color: $xr-color-text-regular;
  margin-right: 15px;
  &.is-select {
    border-color: $xr-color-primary;
    color: $xr-color-primary;
  }

  &.is-big {
    cursor: pointer;
    padding: 8px 10px;
  }
}

.el-dialog__wrapper {
  /deep/.el-dialog__body {
    padding-top: 5px;
  }
}

.el-form {
  /deep/ .el-form-item__label {
    line-height: 30px;
    padding-bottom: 0;
  }
}
</style>
