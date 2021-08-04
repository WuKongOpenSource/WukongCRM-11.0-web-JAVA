<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <flexbox
    class="workbench"
    align="stretch">
    <div class="workbench__left">
      <wb-personnel />
      <wb-survey />
    </div>

    <div class="workbench__right">
      <wb-calendar />
    </div>
  </flexbox>
</template>

<script>
import WbPersonnel from './components/WbPersonnel'
import WbSurvey from './components/WbSurvey'

import WbCalendar from '../components/WbCalendar'

export default {
  // 工作台
  name: 'TeamWorkbench',
  components: {
    WbPersonnel,
    WbSurvey,

    WbCalendar
  },
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.workbench {
  padding-bottom: 40px;
  &__left {
    min-width: 700px;
    flex: 1;
    flex-shrink: 0;
  }

  &__right {
    width: 450px;
    margin-left: 15px;
    flex-shrink: 0;
  }

  .el-card + .el-card {
    margin-top: 15px;
  }
}
</style>
