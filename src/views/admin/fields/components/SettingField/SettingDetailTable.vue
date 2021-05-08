<template>
  <div class="setting-detail-table">
    <div class="item-section">
      <div class="name">表格字段</div>
      <draggable
        :list="field.fieldExtendList"
        :options="dragConfig"
        @sort="handleChange">
        <flexbox
          v-for="(item, index) in field.fieldExtendList"
          :key="index"
          align="center"
          justify="flex-start"
          class="option-item">
          <i
            :class="typeObj(item.formType).icon"
            class="type-icon" />
          <div class="option-item__name">{{ item.name }}</div>
          <el-button
            type="text"
            class="option-item__icon wk wk-write"
            @click="handleEdit(index)" />
          <el-button
            type="text"
            class="option-item__icon wk wk-icon-bin"
            @click="handleDelete(index)" />
          <div class="option-item__icon drag-hook wk wk-grid" />
        </flexbox>
      </draggable>
    </div>

    <div class="item-section">
      <div class="name">动作名</div>
      <div>
        <el-input v-model="field.remark" :maxlength="10" />
      </div>
    </div>

    <div class="item-section">
      <div class="name">
        填写方式
        <el-tooltip
          content="选择明细的填写方式"
          effect="dark"
          popper-class="setting-number-tooltip"
          placement="top">
          <i class="wk wk-help wk-help-tips" />
        </el-tooltip>
      </div>
      <el-radio-group v-model="field.precisions">
        <el-radio :label="1">列表</el-radio>
        <el-radio :label="2">表格</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { guid } from '@/utils'
import FieldTypeLib from '../../fieldTypeLib'

export default {
  name: 'SettingDetailTable',
  components: {
    draggable
  },
  props: {
    field: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dragConfig: {
        group: guid(),
        forceFallback: false,
        fallbackClass: 'draggingStyle',
        handle: '.drag-hook',
        filter: '.el-input__inner',
        preventOnFilter: false
      }
    }
  },
  watch: {
    field: {
      handler() {
        if (!this.field.precisions) {
          this.$set(this.field, 'precisions', 1)
        }
        this.$set(this.field, 'precisions', this.field.precisions)
        this.$set(this.field, 'remark', this.field.remark)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    typeObj(formType) {
      return FieldTypeLib.find(o => o.formType === formType)
    },

    handleChange() {
      this.$set(this.field, 'fieldExtendList', this.field.fieldExtendList)
    },

    handleEdit(index) {
      this.$emit('child-edit', this.field.fieldExtendList[index])
    },

    handleDelete(index) {
      this.field.fieldExtendList.splice(index, 1)
      this.$set(this.field, 'fieldExtendList', this.field.fieldExtendList)
    }
  }
}
</script>

<style scoped lang="scss">
.setting-detail-table {
  .item-section {
    padding: 10px 0;
    border-bottom: 1px solid #e6e6e6;
    .name {
      font-size: 13px;
      font-weight: 500;
      color: #333;
      margin: 10px 0;
    }
  }

  .option-item {
    width: 100%;
    height: 34px;
    border: 1px solid #e6e6e6;
    border-radius: 3px;
    padding: 0 8px;
    margin: 5px 0;

    .drag-hook {
      cursor: move;
    }

    .type-icon {
      font-size: 14px;
      color: #777777;
      margin-right: 5px;
    }

    .option-item__name {
      width: 174px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .option-item__icon {
      font-size: 14px;
      color: #999999;
      margin: 0 2px;
    }
  }
}
</style>
