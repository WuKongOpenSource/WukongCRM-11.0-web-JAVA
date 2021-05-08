<template>
  <field-wrapper
    :activate="activate"
    :field="field"
    :control-flag="controlFlag"
    class="field-detail-table"
    @click="emitClick"
    @action="handleAction">

    <div
      :class="{'is-empty': isEmpty}"
      class="box">
      <draggable
        :list="list"
        :options="dragListConfig"
        :class="{'is-table': field.precisions === 2}"
        class="field-list"
        @end="dragListEnd"
        @add="dragAdded">
        <div v-if="isEmpty" class="empty-box">
          <div class="empty-box-title">可拖拽添加多个字段</div>
          <div class="empty-box-desc">（不支持明细中添加明细字段）</div>
        </div>

        <template v-if="!isEmpty && field.precisions === 1">
          <component
            v-for="(field, index) in list"
            :key="index"
            :is="field | typeToComponentName"
            :field="field"
            :point="[index, 0]"
            :active-point="[null, null]"
            class="draggable-hook"
            @click="emitClick" />
        </template>
        <template v-if="!isEmpty && field.precisions === 2">
          <el-table
            :data="tableData"
            border
            style="width: 100%">
            <el-table-column
              v-for="(field, index) in list"
              :key="index"
              :prop="field.fieldName"
              :label="field.name">
              <template slot-scope="scope">
                <div class="input-box" />
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right">
              <template slot-scope="scope">
                <el-button>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </draggable>

      <div v-if="!isEmpty" class="add-btn">
        <el-button type="text">
          <i class="wk wk-l-plus" />
          {{ field.remark || '' }}
        </el-button>
      </div>
    </div>

  </field-wrapper>
</template>

<script>
import FieldWrapper from './FieldWrapper'
import draggable from 'vuedraggable'

import mixins from './mixins'
import { isEmpty } from '@/utils/types'
import { typeToComponent } from '../../utils'

export default {
  name: 'FieldDetailTable',
  components: {
    draggable,
    FieldWrapper,

    'FieldInput': () => import('./FieldInput'),
    'FieldTextarea': () => import('./FieldTextarea'),
    'FieldSelect': () => import('./FieldSelect'),
    'FieldCheckbox': () => import('./FieldCheckbox'),
    'FieldFile': () => import('./FieldFile'),
    'FieldBoolean': () => import('./FieldBoolean'),
    'FieldPercent': () => import('./FieldPercent'),
    'FieldPosition': () => import('./FieldPosition'),
    'FieldLocation': () => import('./FieldLocation'),
    'FieldWritingSign': () => import('./FieldWritingSign'),
    'FieldDateInterval': () => import('./FieldDateInterval'),
    'FieldDescText': () => import('./FieldDescText')
  },
  filters: {
    /** 根据type 找到组件 */
    typeToComponentName(item) {
      return typeToComponent(item)
    }
  },
  mixins: [mixins],
  data() {
    return {
      dragListConfig: {
        delay: 50,
        group: {
          name: 'childList',
          put: ['libList'],
          pull: false
        },
        sort: false,
        forceFallback: true,
        fallbackClass: 'draggingStyle',
        filter: '.empty-box'
      },
      selectedPoint: [null, null],

      tableData: [{}]
    }
  },
  computed: {
    isEmpty() {
      return isEmpty(this.field.fieldExtendList)
    },
    isList() {
      return true
    },
    list() {
      return this.isEmpty ? [] : this.field.fieldExtendList
    }
  },
  methods: {
    dragListEnd(evt) {
      // console.log('table drag list end', evt)
    },
    /**
     * 拖拽派发新增事件
     * @param evt
     */
    dragAdded(evt) {
      this.$emit('child-drag-add', this.point, evt)
      this.$nextTick(() => {
        this.selectedPoint = [evt.newIndex, 0]
      })
    }
  }
}
</script>

<style scoped lang="scss">
.box {
  width: 100%;
  font-size: 14px;
  border-radius: 3px;
  border: 1px solid #e1e1e1;
  background-color: white;
  padding: 5px;

  &.is-empty {
    border: unset;
    background-color: #f7f8fa;
  }

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
    .wk-l-plus {
      font-size: 12px;
    }
  }

  .empty-box {
    width: 100%;
    text-align: center;
    background-color: #f7f8fa;
    padding: 25px 0;
    .empty-box-title {
      color: $xr-color-text-primary;
    }
    .empty-box-desc {
      color: $xr-color-text-placeholder;
      font-size: 12px;
      margin-top: 5px;
    }
  }

  .field-list {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;

    &.is-table {
      flex-wrap: nowrap;
      overflow-x: auto;
    }
  }

  .input-box {
    width: 100%;
    height: 30px;
    border: 1px solid #dcdfe6;
    padding: 3px 0;
  }

  .table-field {
    width: 200px;
    /deep/ .field-item {
      padding-bottom: 0;
      .field-item_title {
        border: 1px solid #dcdfe6;
        padding-left: 10px;
      }
      .field-item_body {
        padding: 10px 5px;
      }
    }
  }
}
</style>
