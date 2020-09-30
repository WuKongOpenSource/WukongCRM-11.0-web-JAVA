<template>
  <el-input
    v-model="dataValue"
    :autosize="{ minRows: 3}"
    :maxlength="800"
    :disabled="disabled"
    type="textarea"
    resize="none"
    show-word-limit
    @input="valueChange"/>
</template>
<script type="text/javascript">
import stringMixin from './stringMixin'

export default {
  name: 'XhTextarea', // 新建 textarea
  components: {},
  mixins: [stringMixin],
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
/** 调整textarea输入 */
.el-textarea /deep/ .el-textarea__inner {
  border: none;
  color: #333333;
}
.el-textarea /deep/ .el-textarea__inner:focus {
  outline: 0;
  border-color: #ddd;
}

.el-textarea /deep/ .el-input__count {
  bottom: 0;
  line-height: initial;
}

.el-textarea {
  border-radius: 3px;
  border: 1px solid #ddd;
  padding-bottom: 10px;
  &.is-disabled {
    background-color: #F5F7FA;
  }
}
</style>
