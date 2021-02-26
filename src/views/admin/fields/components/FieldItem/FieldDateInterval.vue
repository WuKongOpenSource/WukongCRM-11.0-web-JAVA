<template>
  <field-wrapper
    :activate="activate"
    :field="field"
    :control-flag="controlFlag"
    class="field-date-interval"
    @click="emitClick"
    @action="handleAction">

    <flexbox class="range-box">
      <i class="el-icon-date icon" />
      <flexbox-item :class="{ placeholder: !Boolean(field.defaultValue) }">
        {{ field.defaultValue[0] || '开始时间' }}
      </flexbox-item>
      <span>至</span>
      <flexbox-item :class="{ placeholder: !Boolean(field.defaultValue) }">
        {{ field.defaultValue[1] || '结束时间' }}
      </flexbox-item>
    </flexbox>

  </field-wrapper>
</template>

<script>
import FieldWrapper from './FieldWrapper'
import mixins from './mixins'

export default {
  name: 'FieldDateInterval',
  components: {
    FieldWrapper
  },
  mixins: [mixins],
  methods: {}
}
</script>

<style scoped lang="scss">
.range-box {
  width: 100%;
  text-align: center;
  font-size: 14px;
  border: 1px solid #e1e1e1;
  border-radius: 3px;
  background: white;
  padding: 10px;

  .icon {
    color: #999;
  }
  .placeholder {
    flex: 1;
    color: #999;
  }
}
</style>
