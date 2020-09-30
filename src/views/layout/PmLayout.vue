<template>
  <el-container>
    <el-header class="nav-container">
      <navbar
        nav-index="/project"
        @nav-items-click="navClick"/>
    </el-header>
    <el-container>
      <sidebar
        :items="projectRouters"
        :create-button-title="permissonProject ? '创建项目' : ''"
        create-button-icon="el-icon-plus"
        @quicklyCreate="quicklyCreate"
        @select="siderbarSelect"/>

      <el-main id="project-container">
        <app-main/>
        <project-board :visible.sync="projectBoardShow" />
        <tag-board :visible.sync="tagBoardShow" />
      </el-main>
    </el-container>
    <add-project
      v-if="isCreate"
      enter-detail
      @close="isCreate = false"/>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { Navbar, Sidebar, AppMain } from './components'
import AddProject from '@/views/pm/components/AddProject'
import ProjectBoard from '@/views/pm/project/ProjectBoard'
import TagBoard from '@/views/pm/tag/TagBoard'

export default {
  name: 'PmLayout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    AddProject,
    ProjectBoard,
    TagBoard
  },
  data() {
    return {
      isCreate: false,
      projectBoardShow: false,
      tagBoardShow: false
    }
  },
  computed: {
    ...mapGetters(['project', 'projectRouters']),
    permissonProject() {
      return (
        this.project &&
        this.project.projectManage &&
        this.project.projectManage.save
      )
    }
  },
  created() {
  },

  beforeDestroy() {
  },
  methods: {
    navClick(index) {},

    siderbarSelect(key, keyPath) {
      if (key == '/project-list/index') {
        this.tagBoardShow = false
        this.projectBoardShow = true
      } else if (key == '/tag-list/index') {
        this.projectBoardShow = false
        this.tagBoardShow = true
      } else {
        this.projectBoardShow = false
        this.tagBoardShow = false
      }
    },

    quicklyCreate() {
      this.projectBoardShow = false
      this.tagBoardShow = false
      this.isCreate = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/common.scss';
.aside-container {
  position: relative;
  background-color: #2d3037;
  box-sizing: border-box;
}

.nav-container {
  padding: 0;
  box-shadow: 0px 1px 2px #dbdbdb;
  z-index: 100;
  min-width: 1200px;
}

#project-container {
  max-height: 100%;
  position: relative;
}

.el-container {
  overflow: hidden;
  height: 100%;;
}
</style>
