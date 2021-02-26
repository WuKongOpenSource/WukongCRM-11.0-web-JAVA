<template>
  <field-wrapper
    :activate="activate"
    :field="field"
    :control-flag="controlFlag"
    class="field-detail-table"
    @click="emitClick"
    @action="handleAction">

    <div class="box">
      明细表格
    </div>

  </field-wrapper>
</template>

<script>
import FieldWrapper from './FieldWrapper'
import mixins from './mixins'

export default {
  name: 'FieldDetailTable',
  components: {
    FieldWrapper
  },
  mixins: [mixins],
  methods: {}
}
</script>

<style scoped lang="scss">
.box {
  width: 100%;
  text-align: center;
  font-size: 14px;
  border: 1px solid #e1e1e1;
  border-radius: 3px;
  background: white;
  padding: 10px 0;
}
</style>
