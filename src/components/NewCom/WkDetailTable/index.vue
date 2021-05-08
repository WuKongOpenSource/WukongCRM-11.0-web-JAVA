<template>
  <div class="wk-detail-table">
    <template v-if="showType === 'default'">
      <div
        v-for="(children, index) in fieldList"
        :key="index"
        class="detail-item">
        <flexbox class="detail-item__head">
          <div class="detail-item__head-title">{{ title }}（{{ index+1 }}）</div>
          <el-button
            v-if="fieldList.length > 1"
            icon="wk wk-icon-bin" type="text" @click="deleteClick(index)"/>
        </flexbox>
        <wk-form-items
          :field-from="fieldForm[index]"
          :field-list="children"
          :prop-prefix="`${propPrefix || ''}[${index}].`"
          :disabled="disabled"
          @change="formChange"
        />
        <div class="add-btn">
          <el-button type="text" @click="addClick">
            <i class="wk wk-l-plus" />
            {{ btnName }}
          </el-button>
        </div>
      </div>
    </template>
    <div
      v-else-if="showType === 'table'"
      class="detail-item">
      <wk-table-items
        :field-from="fieldForm"
        :field-list="addFieldList"
        :prop-prefix="propPrefix"
        :disabled="disabled"
        @delete="deleteClick"
        @change="formChange"
      />
      <div class="add-btn">
        <el-button type="text" @click="addClick">
          <i class="wk wk-l-plus" />
          {{ btnName }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import WkTableItems from './WkTableItems'

import { objDeepCopy } from '@/utils'
import Emitter from 'element-ui/lib/mixins/emitter'

export default {
  // 明细表格
  name: 'WkDetailTable',

  components: {
    WkFormItems: () => import('../WkForm/WkFormItems'),
    WkTableItems
  },

  mixins: [Emitter],

  props: {
    title: String,
    showType: {
      type: String,
      default: 'defalut' // defalut table
    },
    propPrefix: String,
    btnName: String,
    addFieldList: Array,
    addFieldForm: Object,
    fieldForm: {
      type: Array,
      default: () => {
        return []
      }
    },
    fieldList: {
      type: Array,
      default: () => {
        return []
      }
    },
    disabled: Boolean
  },

  data() {
    return {
    }
  },

  computed: {},

  watch: {},

  created() {
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    formChange(item, index, value, valueList) {
      this.$emit('change', item, index, value, valueList)
      this.dispatch('ElFormItem', 'el.form.change', this.fieldForm)
    },

    addClick() {
      this.fieldList.push(objDeepCopy(this.addFieldList))
      this.fieldForm.push(objDeepCopy(this.addFieldForm))
    },

    deleteClick(index) {
      this.fieldList.splice(index, 1)
      this.fieldForm.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-detail-table {
  font-size: 14px;
  line-height: inherit;

  .wk-form-items {
    padding: 0;
  }

  .detail-item {
    border-radius: 3px;
    border: 1px solid #e1e1e1;
    background-color: white;
     &__head {
      padding: 10px 20px;
      background-color: #f5f5f5;
      &-title {
        height: auto;
        font-size: 12px;
        color: #333;
        flex: 1;
        line-height: normal;
      }
      .el-button {
        padding: 0;
      }
    }
  }

  .detail-item + .detail-item {
    margin-top: 10px;
  }

  .add-btn {
    text-align: right;
    padding-right: 10px;
    .wk-l-plus {
      font-size: 12px;
    }
  }
}
</style>
