<template>
  <field-wrapper
    :activate="activate"
    :field="field"
    :control-flag="controlFlag"
    class="field-checkbox"
    @click="emitClick"
    @action="handleAction">

    <el-checkbox-group
      v-model="field.defaultValue"
      :disabled="disabled">
      <el-checkbox
        v-for="(item, index) in field.setting"
        :key="index"
        :label="item"
        class="checkbox" />
    </el-checkbox-group>

  </field-wrapper>
</template>

<script>
import FieldWrapper from './FieldWrapper'
import mixins from './mixins'

export default {
  name: 'FieldCheckbox',
  components: {
    FieldWrapper
  },
  mixins: [mixins],
  methods: {}
}
</script>

<style scoped lang="scss">
.select-box {
  width: 100%;
  color: #333;
  border: 1px solid #dcdfe6;
  border-radius: $xr-border-radius-base;
  padding: 10px;
  div {
    flex: 1;
  }
  .placeholder {
    color: #999;
  }
}
</style>
