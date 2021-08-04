<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @Date: 2020-05-14 13:58:54
 * @LastEditTime: 2020-07-03 15:37:00
 * @LastEditors: yang
-->
<template>
  <el-container>
    <el-header class="nav-container">
      <navbar
        nav-index="/hrm"
        @nav-items-click="navClick"/>
    </el-header>
    <el-container>
      <sidebar
        v-if="hrm"
        :items="menuRouters"
        :create-button-title="createName"
        create-button-icon="el-icon-plus"
        @quicklyCreate="quicklyCreate">
        <el-popover
          slot="sidebar-bottom"
          :key="collapse ? 'right-start' : 'top'"
          v-model="sidebarPopoverVisible"
          :visible-arrow="false"
          :disabled="!tabShow"
          :placement="collapse ? 'right-start' : 'top'"
          popper-class="el-popove--sidebar"
          width="190"
          trigger="hover">
          <template>
            <div v-if="tabType !== 1" class="el-menu-item el-menu-item--bottom" @click="typeChange(1)">
              <item
                :collapse="false"
                icon="s-seas"
                title="管理端" />
            </div>
            <div v-if="tabType !== 2" class="el-menu-item el-menu-item--bottom" @click="typeChange(2)">
              <item
                :collapse="false"
                icon="user"
                title="员工端" />
            </div>
          </template>
          <div slot="reference" class="el-menu-item el-menu-item--bottom">
            <item
              :icon="tabObj.icon"
              :title="tabObj.title"
              :collapse="collapse" />
          </div>
        </el-popover>
      </sidebar>
      <el-main>
        <app-main ref="hrmAppMain"/>
      </el-main>
    </el-container>
    <employee-create-view
      v-if="isCreate"
      @success="createSaveSuccess"
      @close="isCreate=false"/>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'

import { Navbar, Sidebar, AppMain } from './components'
import Item from './components/Sidebar/Item'
import EmployeeCreateView from '@/views/hrm/employee/components/EmployeeCreateView'

export default {
  name: 'HrmLayout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    EmployeeCreateView,
    Item
  },
  data() {
    return {
      isCreate: false,
      sidebarPopoverVisible: false,
      tabType: 1 // manage 1 employee 2
    }
  },
  computed: {
    ...mapGetters(['hrm', 'hrmRouters', 'collapse', 'hrmUserInfo', 'hrmShowType']),

    // 新建权限
    createName() {
      const permission = this.hrm.employee && this.hrm.employee.save
      return permission && this.tabType === 1 ? '快速创建' : ''
    },

    menuRouters() {
      if (!this.hrmUserInfo) {
        return []
      }
      return this.hrmRouters.filter(item => {
        if (item.isAll) {
          return true
        }
        return this.tabType === 1 ? !item.isEmployee : item.isEmployee
      })
    },

    tabObj() {
      return this.tabType === 1 ? {
        icon: 's-seas',
        title: '管理端'
      } : {
        icon: 'user',
        title: '员工端'
      }
    },

    // 有管理或者上级角色
    tabShow() {
      return this.hrmUserInfo && this.hrmUserInfo.role !== null
    },

    // 当前人在人力资源内
    hasAddHrm() {
      return this.hrmUserInfo && !!this.hrmUserInfo.employeeId
    }
  },
  watch: {
    collapse() {
      this.sidebarPopoverVisible = false
    },

    tabType() {
      this.$store.commit('SET_HRMSHOWTYPE', this.tabType)
    },

    hrmUserInfo: {
      handler() {
        this.setShowType()
      },
      deep: true
    },

    $route(to, from) {
      if (to.fullPath && !to.fullPath.includes('/workbench')) {
        if (to.fullPath.includes('self-server') && this.tabType !== 2) {
          this.tabType = 2
        } else if (!to.fullPath.includes('self-server') && this.tabType !== 1) {
          this.tabType = 1
        }
      }
    }
  },
  created() {
    if (this.hrm) {
      if (!this.hrmUserInfo) {
        this.$store.dispatch('GetHrmUserInfo').then(() => {
          this.setShowType()
        }).catch(() => {
        })
      } else {
        this.setShowType()
      }
    }
  },
  methods: {
    /**
     * 设置展示类型
     */
    setShowType() {
      if (this.tabShow) {
        this.tabType = this.hrmShowType
      } else {
        this.tabType = this.tabShow ? 1 : 2
      }

      // 如果在员工下刷新 默认展示员工
      if (this.$route.fullPath.includes('self-server')) {
        this.tabType = 2
      }

      // 如果没有加入人资员工管理，当前需展示员工端，有管理权限跳转2，没管理权限跳首页
      if (!this.hasAddHrm && this.tabType === 2) {
        if (this.tabShow) {
          this.tabType = 1
        } else {
          this.$router.push('/')
        }
      }
    },

    navClick(index) {
    },

    /**
     * 快捷添加
     */
    quicklyCreate() {
      this.isCreate = true
    },

    /**
     * 创建成功刷新
     */
    createSaveSuccess() {
      const hrmAppMain = this.$refs.hrmAppMain
      if (hrmAppMain && hrmAppMain.$children && hrmAppMain.$children.length) {
        const appSubMain = hrmAppMain.$children[0]
        if (appSubMain.$options.name == 'EmployeeIndex') {
          appSubMain.createSaveSuccess()
        }
      }
    },

    /**
     * 类型切换
     */
    typeChange(type) {
      // 没有员工端权限，进行提示
      if (type == 2 && !this.hrmUserInfo.employeeId) {
        if (this.hrm && this.hrm.employee && this.hrm.employee.save) {
          this.$alert(`您尚未开通员工端，请先将您本人添加至<strong>人力资源-员工管理</strong>`, '提示', {
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            confirmButtonText: '添加员工',
            callback: action => {
              if (action === 'confirm') {
                this.$router.push({
                  name: 'hrmEmployee',
                  query: {
                    depAddEmplogyShow: true,
                    time: Date.now()
                  }
                })
              }
            }
          })
        } else {
          this.$alert(`您尚未开通员工端，请联系公司管理员将您添加至<strong>人力资源-员工管理</strong>。<br>
  （管理员可在员工管理点击“从组织架构中选择”添加员工）。`, '提示', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定'
          })
        }
      } else {
        this.sidebarPopoverVisible = false
        this.tabType = type
        const item = this.menuRouters[0]
        // 员工端跳转 携带query type self-server
        let firstPath = item.children[0].path
        if (type === 2 && firstPath.includes('workbench')) {
          firstPath = `${firstPath}?type=self-server`
        }
        this.$router.push(item.path + '/' + firstPath)
      }
    }
  }
}
</script>

<style lang="scss">
@import './components/Sidebar/variables.scss';

.el-menu-item--bottom {
  height: auto;
  line-height: normal;
  padding: 0 14px;
  .menu-item-content {
    text-overflow: unset;
    background-color: rgba($color: #fff, $alpha: 0.1) !important;
    i {
      color: white;
    }

    &:hover {
      background-color: $xr-color-primary !important;
    }
  }
  color: white;

  background-color: transparent !important;
}

.el-popove--sidebar {
  background-color: $menuBg;
  border-color: #6c7277;
}
</style>
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
}

.nav-container {
  padding: 0;
  box-shadow: 0px 1px 2px #dbdbdb;
  z-index: 100;
  min-width: 1200px;
}

.el-main {
  background: white;
}
</style>
