<template>
  <field-wrapper
    :activate="activate"
    :field="field"
    :control-flag="controlFlag"
    class="field-select"
    @click="emitClick"
    @action="handleAction">

    <flexbox class="select-box">
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
