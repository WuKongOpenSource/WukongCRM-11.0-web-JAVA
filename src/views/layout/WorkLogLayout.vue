<template>
  <el-container>
    <el-header class="nav-container">
      <navbar
        nav-index="/workLog"
        @nav-items-click="navClick"/>
    </el-header>
    <el-container>
      <sidebar
        :items="workLogRouters"
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
  name: 'WorkLogLayout',

  components: {
    Navbar,
    Sidebar,
    AppMain
  },

  data() {
    return {}
  },

  computed: {
    ...mapGetters(['workLogRouters'])
  },

  created() {
  },

  methods: {
    navClick(index) {}
  }
}
</script>

<style lang="scss" scoped>
  .el-container {
    min-height: 0;
    height: 100%;
  }

  .nav-container {
    padding: 0;
    box-shadow: 0px 1px 2px #dbdbdb;
    z-index: 100;
    min-width: 1200px;
  }
</style>
