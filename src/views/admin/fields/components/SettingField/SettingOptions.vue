<template>
  <div class="setting-options">
    <draggable
      :list="optionsList"
      :options="dragConfig"
      @sort="handleChange">
      <div
        v-for="(item, index) in optionsList"
        :key="index"
        class="option-item">
        <el-input
          :disabled="!optionsEditAuth"
          v-model="item.value"
          @change="handleChange">
          <flexbox v-if="optionsEditAuth" slot="suffix">
            <div class="el-input__icon drag-hook wk wk-grid" />
            <el-button
              type="text"
              class="el-input__icon wk wk-icon-bin"
              @click="handleDelete(index)" />
          </flexbox>
        </el-input>
      </div>
    </draggable>

    <el-button
      v-if="optionsEditAuth"
      class="add-btn"
      @click="handleAdd">
      <i class="el-icon-plus" /> 添加新选项
    </el-button>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { isEmpty, isArray } from '@/utils/types'
import { getFieldAuth } from '../utils'

export default {
  name: 'SettingOptions',
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
      optionsList: []
    }
  },
  computed: {
    optionsEditAuth() {
      return getFieldAuth(this.field.operating).optionsEdit
    },

    dragConfig() {
      return {
        group: 'list',
        forceFallback: false,
        disabled: !this.optionsEditAuth,
        fallbackClass: 'draggingStyle',
        handle: '.drag-hook',
        filter: '.el-input__inner',
        preventOnFilter: false
      }
    }
  },
  watch: {
    field: {
      handler(newVal, oldVal) {
        if (isEmpty(this.field.options)) {
          this.$set(this.field, 'options', '选1,选2,选3')
        }
        if (!oldVal || newVal.options !== oldVal.options) {
          this.optionsList = this.field.options.split(',').map(o => {
            return { value: o }
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /**
     * 修改、排序
     */
    handleChange() {
      // 选项不允许重复或有空
      let arr = this.optionsList
        .map(o => o.value)
        .filter(o => !isEmpty(o))
      arr = Array.from(new Set(arr))
      if (arr.length !== this.optionsList.length) {
        this.optionsList = arr.map(o => {
          return { value: o }
        })
      }
      this.field.setting = arr
      this.field.options = arr.join(',')
      this.$set(this.field, 'setting', this.field.setting)
      this.$set(this.field, 'options', this.field.options)
      this.$nextTick(() => {
        this.checkDefaultValue()
      })
    },
    /**
     * 删除
     * @param index
     */
    handleDelete(index) {
      this.optionsList.splice(index, 1)
      this.field.setting.splice(index, 1)
      this.$set(this.field, 'setting', this.field.setting)
      this.$set(this.field, 'options', this.field.setting.join(','))
      this.checkDefaultValue()
    },
    /**
     * 添加
     */
    handleAdd() {
      const val = this.getAddValue(this.optionsList.length + 1)
      this.optionsList.push({
        value: val
      })
      this.handleChange()
    },

    getAddValue(index) {
      const findRes = this.optionsList.find(o => o.value === `选${index}`)
      if (findRes) {
        return this.getAddValue(index + 1)
      }
      return `选${index}`
    },

    checkDefaultValue() {
      if (!isEmpty(this.field.defaultValue)) {
        if (isArray(this.field.defaultValue)) {
          const arr = []
          this.field.defaultValue.forEach(o => {
            const findRes = this.optionsList.find(item => item.value === o)
            if (findRes) arr.push(o)
          })
          this.$set(this.field, 'defaultValue', [...arr])
        } else {
          const findRes = this.optionsList.find(item => item.value === this.field.defaultValue)
          if (!findRes) {
            this.$set(this.field, 'defaultValue', null)
          }
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.option-item {
  margin: 5px 0;
  .el-input__icon {
    font-size: 14px;
    color: #999999;
  }
  .drag-hook {
    cursor: move;
  }
}

.add-btn {
  width: 100%;
  height: 34px;
  font-size: 14px;
  color: #666666;
  border: 1px dashed $xr-border-color-base;
  border-radius: $xr-border-radius-base;
  background-color: #f8f8f8;
  cursor: pointer;
}
</style>
