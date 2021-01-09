<template>
  <flexbox
    class="main"
    direction="column"
    align="stretch">
    <xr-header
      icon-class="wk wk-workbench"
      icon-color="#5864FF"
      label="办公审批流" />
    <div class="main__bd">
      <component :is="leftType"/>
    </div>
  </flexbox>
</template>

<script>
import ExamineManager from './components/ExamineManager'
import XrHeader from '@/components/XrHeader'

export default {
  components: {
    ExamineManager,
    XrHeader
  },
  data() {
    return {
      leftType: 'ExamineManager',
      leftSides: [
        {
          name: '审批类型管理',
          type: 'ExamineManager'
        }
      ]
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.main {
  height:100%;

  /deep/ .xr-header {
    padding: 15px 30px;
  }

  &__bd {
    border-top: 1px solid $xr-border-line-color;
    border-bottom: 1px solid $xr-border-line-color;
  }
}


</style>

