<template>
  <el-container>
    <el-header class="nav-container">
      <navbar
        nav-index="/addressBook"
        @nav-items-click="navClick"/>
    </el-header>
    <el-container>
      <sidebar
        :items="addressBookRouters"
        class="sidebar-container" />

      <el-main
        id="addressBook-main-container"
        style="padding: 0;">
        <app-main/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { Navbar, AppMain, Sidebar } from './components'
import { mapGetters } from 'vuex'

export default {
  name: 'AddressBookLayout',

  components: {
    Navbar,
    Sidebar,
    AppMain
  },

  data() {
    return {}
  },

  computed: {
    ...mapGetters(['addressBookRouters'])
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
