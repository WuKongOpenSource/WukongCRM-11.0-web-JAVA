<template>
  <el-container>
    <el-header class="nav-container">
      <navbar
        nav-index="/taskExamine"
        @nav-items-click="navClick"/>
    </el-header>
    <el-container>
      <sidebar
        :items="taskExamineRouters"
        class="sidebar-container" />

      <el-main
        id="workLog-main-container"
        style="padding:15px;">
        <app-main/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import { mapGetters } from 'vuex'

export default {
  name: 'TaskExamineLayout',

  components: {
    Navbar,
    Sidebar,
    AppMain
  },

  data() {
    return {}
  },

  computed: {
    ...mapGetters(['taskExamineRouters'])
  },

  created() {
  },

  methods: {
    navClick(index) {}
  }
}
</script>

<style lang="scss" scoped>
  @import './styles/common.scss';
  .el-container {
    min-height: 0;
    height: 100%;
  }
  .aside-container {
    position: relative;
    background-color: #2d3037;
    box-sizing: border-box;
    overflow: visible;
  }

  .nav-container {
    padding: 0;
    box-shadow: 0px 1px 2px #dbdbdb;
    z-index: 100;
    min-width: 1200px;
  }
  .quick-add {
    height: 178px;
  }
</style>
