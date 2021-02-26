<template>
  <field-wrapper
    :activate="activate"
    :field="field"
    :control-flag="controlFlag"
    class="field-file"
    @click="emitClick"
    @action="handleAction">

    <div class="box">
      请选择文件
    </div>

  </field-wrapper>
</template>

<script>
import FieldWrapper from './FieldWrapper'
import mixins from './mixins'

export default {
  name: 'FieldFile',
  components: {
    FieldWrapper
  },
  mixins: [mixins],
  methods: {}
}
</script>

<style scoped lang="scss">
.box {
  width: 100px;
  text-align: center;
  font-size: 14px;
  border: 1px solid #e1e1e1;
  border-radius: 3px;
  background: white;
  padding: 10px 0;
}
</style>
