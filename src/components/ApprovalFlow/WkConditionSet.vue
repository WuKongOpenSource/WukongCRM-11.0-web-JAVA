<template>
  <el-drawer
    :visible="visible"
    :with-header="false"
    size="500px"
    title="我是标题"
    append-to-body
    @close="close">
    <flexbox v-if="editNode" class="drawer-header">
      <div class="edit-title">
        <el-input
          v-if="isNameEdit"
          ref="conditionNameInput"
          v-model="editNode.conditionName"
          maxlength="20"
          @blur="nameInputBlur" />
        <template v-else>
          <span class="title" @click="titleEditClick">{{ editNode.conditionName }}</span>
          <i class="wk wk-edit" @click="titleEditClick" />
        </template>
      </div>
      <el-popover
        placement="bottom"
        width="200"
        trigger="click">
        <draggable
          v-model="dragList"
          :options="{ group: 'list',forceFallback:false, fallbackClass:'draggingStyle',filter: 'drag-item__label', preventOnFilter: false }">
          <flexbox
            v-for="(item, index) in dragList"
            :key="index"
            class="drag-item">
            <div class="drag-item__label">{{ item.conditionName }}</div>
            <div class="drag-item__handle">⋮⋮</div>
          </flexbox>
        </draggable>
        <el-button slot="reference" type="text">优先级设置</el-button>
      </el-popover>

      <el-tooltip
        effect="dark"
        placement="bottom">
        <template slot="content">
          首先匹配“优先级高”的条件。<br>如果匹配成功则审批单发送给该条件下的审批人；<br>如果匹配不成功则继续进行匹配下一优先级的条件。
        </template>
        <i class="wk wk-help wk-help-tips"/>
      </el-tooltip>
      <i
        class="el-icon-close "
        @click="close" />
    </flexbox>
    <div v-if="editNode" class="drawer-body">
      <el-row
        v-for="(item, index) in editNode.conditionDataList"
        :key="index"
        :gutter="20" type="flex" align="middle" class="set-row">
        <el-col :span="5" class="set-row__title">{{ item.name }}</el-col>

        <el-col :span="17" class="set-row__center">
          <flexbox
            v-if="item.conditionType === 8">
            <div style="flex: 1;">
              <wk-user-dep-select
                :user-value.sync="item.values.userList"
                :dep-value.sync="item.values.deptList"
                placeholder="请选择员工或部门"
                style="width: 100%;"
                @change="userDepSelectChange(arguments, item)"
              />
              <role-employee-select
                ref="roleSelect"
                v-model="item.values.roleList"
                :props="{
                  onlyShowRole: true
                }"
                multiple
                placeholder="请选择角色"
                collapse-tags
                style="width: 100%;margin-top: 8px;"
                clearable
                @change="roleSelectChange(item)"/>
            </div>
            <div style="flex-shrink: 0;margin-left: 8px;">或</div>
          </flexbox>
          <template
            v-else-if="[9, 3].includes(item.type)">
            <el-select
              v-if="item.type == 3"
              v-model="item.conditionType"
              class="condition-select">
              <el-option
                v-for="option in selectOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"/>
            </el-select>
            <el-select
              v-else-if="item.type == 9"
              v-model="item.conditionType"
              class="condition-select">
              <el-option
                v-for="option in checkboxOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"/>
            </el-select>

            <el-select
              v-model="item.values"
              multiple
              class="condition-value">
              <el-option
                v-for="(option, index) in item.setting"
                :key="index"
                :label="option.value !== undefined ? option.label : option"
                :value="option.value !== undefined ? option.value : option"/>
            </el-select>
          </template>

          <template v-else>
            <el-select
              v-model="item.conditionType"
              :class="['condition-select', {
                'is-block': item.conditionType === 6
            }]">
              <el-option
                v-for="option in numberOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"/>
            </el-select>
            <template v-if="item.conditionType === 6">
              <div style="margin-top: 10px;">
                <el-input-number
                  v-model="item.leftValue"
                  :controls="false"
                  class="small"/>
                <el-select
                  v-model="item.leftCondition"
                  class="small is-condition">
                  <el-option
                    v-for="option in numberValueOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"/>
                </el-select>
                <span class="small-select-label">{{ item.name }}</span>
                <el-select
                  v-model="item.rightCondition"
                  class="small is-condition">
                  <el-option
                    v-for="option in numberValueOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"/>
                </el-select>
                <el-input-number
                  v-model="item.rightValue"
                  :controls="false"
                  class="small"/>
              </div>
            </template>
            <el-input-number
              v-else
              v-model="item.values"
              :controls="false"
              class="condition-value"/>
          </template>

        </el-col>
        <el-col :span="1" class="set-row__footer"><i class="wk wk-delete" @click="deleteItem(index)" /></el-col>
      </el-row>
      <div>
        <el-button type="text" icon="el-icon-plus" @click="conditionSelectClick">添加条件</el-button>

        <el-tooltip
          effect="dark"
          placement="bottom">
          <template slot="content">
            <div style="font-weight: bold">如何添加条件字段？</div>
            <div style="margin-top: 10px;line-height: 15px;">可在编辑表单中添加数字、货币、<br >下拉框或多选字段并设为必填。</div>
          </template>
          <i class="wk wk-help wk-help-tips"/>
        </el-tooltip>
      </div>
    </div>
    <div class="drawer-footer">
      <el-button @click.native="close">取消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">保存</el-button>
    </div>
    <wk-condition-select
      :props="props"
      :checks="editNode ? editNode.conditionDataList : []"
      :visible.sync="conditionSelectVisible"
      @confirm="conditionSelectConfirm"
    />
  </el-drawer>
</template>

<script>
import WkConditionSelect from './WkConditionSelect'
import Draggable from 'vuedraggable'
import WkUserDepSelect from '@/components/NewCom/WkUserDepSelect'
import RoleEmployeeSelect from '@/views/admin/employeeDep/components/RoleEmployeeSelect'


import { objDeepCopy } from '@/utils'
import {
  selectOptions,
  checkboxOptions,
  numberOptions,
  numberValueOptions,
  getSendObj
} from './conditioModel'
import { isEmpty } from '@/utils/types'

export default {
  // 条件配置
  name: 'WkConditionSet',

  components: {
    WkConditionSelect,
    Draggable,
    WkUserDepSelect,
    RoleEmployeeSelect
  },

  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    node: {
      type: Object,
      default() {
        return {}
      }
    },
    conditionParent: Array,
    conditionParentIndex: Number,
    props: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      editNode: null,
      isNameEdit: false,
      // select 3 checkbox 9 number 5 floatnumber 6
      selectOptions: selectOptions,
      checkboxOptions: checkboxOptions,
      numberOptions: numberOptions,
      numberValueOptions: numberValueOptions,
      conditionSelectVisible: false,
      dragList: []
    }
  },

  computed: {},

  watch: {
    visible(val) {
      if (val) {
        const dragList = objDeepCopy(this.conditionParent)
        this.editNode = dragList[this.conditionParentIndex]
        if (this.editNode.conditionDataList.length === 0) {
          this.editNode.conditionDataList.push(getSendObj(true))
        } else {
          this.validateSetting(this.editNode.conditionDataList)
        }
        dragList.forEach((item, index) => {
          item.index = index
        })
        this.dragList = dragList
      } else {
        const dragList = objDeepCopy(this.conditionParent)
        this.conditionParent.splice(0, this.conditionParent.length)
        this.dragList.forEach(item => {
          this.conditionParent.push(dragList[item.index])
        })
        this.editNode = null
      }
    }
  },

  created() {

  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 验证数据
     */
    validateSetting(list) {
      const noSetting = []
      list.forEach(item => {
        if ((item.type === 3 || item.type === 9) && !item.setting) {
          noSetting.push(item)
        }
      })
      if (noSetting && noSetting.length > 0) {
        const { conditionSelectRequest, conditionSelectParams, conditionSelectList } = this.props
        if (conditionSelectList) {
          const list = objDeepCopy(conditionSelectList)
          noSetting.forEach(item => {
            const field = list.find(fieldItem => fieldItem.fieldName === item.fieldName)
            if (field) {
              this.$set(item, 'setting', field.setting)
            }
          })
        } else {
          conditionSelectRequest(conditionSelectParams).then(res => {
            const list = res.data || []
            noSetting.forEach(item => {
              const field = list.find(fieldItem => fieldItem.fieldName === item.fieldName)
              if (field) {
                this.$set(item, 'setting', field.setting)
              }
            })
          }).catch(() => {
          })
        }
      }
    },

    /**
     * 输入失去焦点
     */
    nameInputBlur() {
      this.isNameEdit = false
      if (this.editNode.conditionName === '') {
        this.editNode.conditionName = '条件'
      }
    },

    /**
     * 编辑名称
     */
    titleEditClick() {
      this.isNameEdit = true
      this.$nextTick(() => {
        this.$refs.conditionNameInput.focus()
      })
    },

    /**
     * 关闭
     */
    close() {
      this.$emit('update:visible', false)
    },

    /**
     * 保存
     */
    handleConfirm() {
      // 处理掉不符合的数据
      const conditionDataList = this.editNode.conditionDataList || []
      this.editNode.conditionDataList = conditionDataList.filter(item => {
        if (item.type === 3 || item.type === 9) {
          return item.values && item.values.length > 0
        } else {
          if (item.conditionType === 6) {
            return !isEmpty(item.leftValue) && !isEmpty(item.rightValue) && item.leftValue < item.rightValue
          } else if (item.conditionType === 8) { // 人员部门角色
            return !isEmpty(item.userList) || !isEmpty(item.deptList) || !isEmpty(item.roleList)
          } else {
            return !isEmpty(item.values)
          }
        }
      })

      // 条件为0 报红
      // this.editNode.isError = this.editNode.conditionDataList.length === 0
      this.editNode.isError = false

      for (const key in this.editNode) {
        if (key !== 'examineDataList') {
          this.node[key] = this.editNode[key]
        }
      }

      this.close()
    },

    /**
     * 条件选择
     */
    conditionSelectClick() {
      this.conditionSelectVisible = true
    },

    /**
     * 删除条件
     */
    deleteItem(index) {
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.editNode.conditionDataList.splice(index, 1)
        })
        .catch(() => {})
    },

    /**
     * 条件选择确定
     */
    conditionSelectConfirm(list) {
      list.forEach(item => {
        if (!item.conditionType) {
          // select 3 checkbox 9 number 5 floatnumber 6
          if (item.type === 3 || item.type === 9) {
            item.conditionType = item.type === 3 ? 7 : 11
            item.values = []
          } else if (item.type === 5 || item.type === 6) { // 8 不用校准
            item.conditionType = 3
            item.values = 0
            item.leftValue = 0
            item.leftCondition = 1
            item.rightCondition = 1
            item.rightValue = 0
          }
        }
      })

      this.editNode.conditionDataList = objDeepCopy(list)
    },

    /**
     * 用户部门选择
     */
    userDepSelectChange(list, item) {
      const userList = list[2]
      const deptList = list[3]
      item.userList = userList
      item.deptList = deptList
    },

    /**
     * 角色选择
     */
    roleSelectChange(item) {
      this.$nextTick(() => {
        const selecteds = this.$refs.roleSelect[0].select.selected
        item.roleList = selecteds.map(item => {
          return {
            roleName: item.$props.label
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-header {
  height: 50px;
  padding: 0 15px;
  background: #F7F8FA;
  border-bottom: 1px solid $xr-border-color-base;

  .edit-title {
    width: 360px;
    margin-right: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    .title {
      cursor: pointer;
    }
    .wk-edit {
      cursor: pointer;
    }
  }

  .wk-help-tips {
    margin: 0 5px;
  }

  .el-icon-close {
    font-size: 24px;
    color: #909399;
    cursor: pointer;
  }

  .el-icon-close:hover {
    color: $xr-color-primary;
  }
}

.drag-item {
  padding: 5px 0;
  &__label {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__handle {
    padding: 0 8px;
    flex-shrink: 0;
    color: #333;
    cursor: move;
  }
}

.drawer-body {
  padding: 20px 10px;
  height: calc(100% - 110px);
  overflow-y: auto;
}

.drawer-footer {
  padding: 15px;
  text-align: right;
}

.set-row {
  margin-bottom: 10px;

  &__title {
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__center {
    .condition-select {
      width: 100px;

      &.is-block {
        width: 100%;
      }
    }

    .small {
      width: 20%;
      &.is-condition {
        width: 15%;
      }
      & + & {
        margin-left: 10px;
      }
    }

    .condition-value {
      width: calc(100% - 120px);
      margin-left: 15px;
    }

    .small-select-label {
      width: 20%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  &__footer {
    line-height: 34px;
    .wk-delete {
      cursor: pointer;

      &:hover {
        color: $xr-color-primary;
      }
    }
  }
}
</style>
