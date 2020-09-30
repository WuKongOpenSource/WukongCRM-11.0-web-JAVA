<template>
  <el-container>
    <el-header class="nav-container">
      <navbar
        nav-index="/calendar/index"
        @nav-items-click="navClick"/>
    </el-header>
    <el-container>
      <sidebar
        :items="calendarRouters"
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
// import { mapGetters } from 'vuex'
import calendarRouter from '@/router/modules/calendar'

export default {
  name: 'CalendarLayout',

  components: {
    Navbar,
    Sidebar,
    AppMain
  },

  data() {
    return {
      calendarRouters: calendarRouter
    }
  },

  computed: {},

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

  .nav-container {
    padding: 0;
    box-shadow: 0px 1px 2px #dbdbdb;
    z-index: 100;
    min-width: 1200px;
  }
</style>
