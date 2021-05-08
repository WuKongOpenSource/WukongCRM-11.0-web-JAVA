<template>
  <field-wrapper
    :activate="activate"
    :field="field"
    :control-flag="controlFlag"
    class="field-select"
    @click="emitClick"
    @action="handleAction">

    <el-radio-group
      v-if="field.precisions === 1"
      v-model="field.defaultValue">
      <el-radio
        v-for="(item, index) in field.setting"
        :key="index"
        :label="item">
        {{ item }}
      </el-radio>
    </el-radio-group>

    <flexbox
      v-else
      class="select-box">
      <div :class="{placeholder: !Boolean(field.defaultValue)}">
        {{ field.defaultValue ? field.defaultValue :'请选择' }}
      </div>
      <i class="el-icon-arrow-down el-icon--right"/>
    </flexbox>

  </field-wrapper>
</template>

<script>
import FieldWrapper from './FieldWrapper'
import mixins from './mixins'

export default {
  name: 'FieldSelect',
  components: {
    FieldWrapper
  },
  mixins: [mixins],
  watch: {
    field: {
      handler() {
        // 兼容老字段，确保状态不变
        if (!this.field.precisions) {
          this.$set(this.field, 'precisions', 2)
        }
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<style scoped lang="scss">
.select-box {
  width: 100%;
  color: #333;
  border: 1px solid #dcdfe6;
  border-radius: $xr-border-radius-base;
  padding: 8px 10px;
  div {
    flex: 1;
  }
  .placeholder {
    color: #999;
  }
}

.el-radio-group {
  width: 100%;
  .el-radio {
    margin: 5px 30px 5px 0;
  }
}
</style>
