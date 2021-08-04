<template>
  <div class="my-archives">
    <xr-header
      style="padding: 0px 15px 15px 0;"
      ft-top="0"
      icon-class="wk wk-archive"
      icon-color="#2362FB"
      label="我的档案" />
    <el-tabs
      v-model="tabCurrentName"
      class="side-detail__tabs--default">
      <el-tab-pane
        v-for="(item, index) in tabNames"
        :key="index"
        :label="item.label"
        :name="item.name"
        lazy>
        <component
          :is="item.name"
          class="side-detail-tabs-content"
          style="padding: 15px 10px;margin-left: -20px;"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import XrHeader from '@/components/XrHeader'
import EmployeePostInfo from './components/EmployeePostInfo'
import EmployeeBaseInfo from './components/EmployeeBaseInfo'

export default {
  // 我的档案
  name: 'MyArchives',

  components: {
    XrHeader,
    EmployeePostInfo,
    EmployeeBaseInfo
  },

  props: {},

  data() {
    return {
      loading: false, // 展示加载loading
      detailData: null,
      tabNames: [
        { label: '基本信息', name: 'EmployeeBaseInfo' },
        { label: '岗位信息', name: 'EmployeePostInfo' }
      ],
      tabCurrentName: 'EmployeeBaseInfo'
    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {}
}
</script>

<style lang="scss" scoped>
@import '@/styles/side-detail.scss';

.my-archives {
  height: 100%;

  .side-detail__tabs--default {
    height: calc(100% - 45px);
    /deep/.el-tabs__header {
      padding: 0;
    }
  }
}
</style>
