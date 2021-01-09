<template>
  <el-date-picker
    v-model="dataValue"
    :disabled="disabled"
    clearable
    style="width: 100%;"
    type="date"
    value-format="yyyy-MM-dd"
    placeholder="选择日期"
    @change="valueChange"/>
</template>
<script type="text/javascript">
import StringMixin from './StringMixin'

export default {
  name: 'XhInput', // 新建 date
  components: {},
  mixins: [StringMixin],
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {}
}
</script>
<style lang="scss" scoped>
</style>
