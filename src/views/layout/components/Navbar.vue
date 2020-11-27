<template>
  <div class="navbar">
    <img
      v-src="logo"
      :key="logo"
      class="logo"
      @click="enterCustoemBoard" >
    <div class="nav-items-container">
      <el-menu
        :default-active="navActiveIndex"
        mode="horizontal"
        active-text-color="#2362FB"
        @select="navItemsClick">
        <el-menu-item
          v-for="(item, index) in showItems"
          :key="index"
          :index="item.path">
          <i :style="{ fontSize: item.fontSize }" :class="item.icon" />
          <span>{{ item.title }}</span>
        </el-menu-item>
        <el-menu-item
          ref="navManagerMenu"
          index="other">
          <i class="wk wk-grid" />
        </el-menu-item>
      </el-menu>
    </div>

    <el-badge
      :value="unreadNums.announceCount"
      :hidden="!unreadNums.announceCount || unreadNums.announceCount == 0"
      :max="99">
      <i
        class="wk wk-announcement"
        @click="checkMessageDetail(true)"/>
    </el-badge>

    <el-badge
      :value="unreadNums.allCount"
      :hidden="!unreadNums.allCount || unreadNums.allCount == 0"
      :max="99">
      <i
        class="wk wk-bell"
        @click="checkMessageDetail(false)"/>
    </el-badge>

    <system-message
      :visible.sync="sysMessageShow"
      :unread-nums="unreadNums"
      :only-announcement="mesOnlyAnnouncement"
      @update-count="sendSystemUnreadNum"/>

    <el-dropdown
      trigger="click"
      @command="moreMenuClick">
      <div
        class="user-container">
        <template v-if="userInfo && Object.keys(userInfo).length > 0">
          <xr-avatar
            :name="userInfo.realname"
            :size="32"
            :src="userInfo.img"
            class="user-img" />
        </template>
        <i class="el-icon-caret-bottom mark"/>
      </div>
      <el-dropdown-menu
        slot="dropdown"
        class="el-dropdown-unarrow" >
        <el-dropdown-item
          v-for="(item, index) in moreMenu"
          :key="index"
          :command="item.command"
          :divided="item.divided"
          :icon="item.icon"
          :disabled="item.disabled"
        >{{ item.label }}</el-dropdown-item>
        <div v-if="manage && !isNewest" class="wk-update-tips">有新版本<el-badge is-dot><el-button type="primary" round @click="updateClick">更新</el-button></el-badge></div>
        <div
          v-if="manage"
          class="handel-box">
          <el-button
            type="primary"
            class="handel-button"
            @click="enterSystemSet()">企业管理后台</el-button>
        </div>
      </el-dropdown-menu>
    </el-dropdown>

    <nav-manager
      v-if="navManagerShow"
      ref="navManager"
      :collapse="collapse"
      :top-module="items"
      @change="getTopHeaderModule"
      @select="navManagerSelect" />
  </div>
</template>

<script>
import { systemMessageUnreadCountAPI } from '@/api/common'
import { crmCheckVersionAPI } from '@/api/admin/update'

import SystemMessage from './SystemMessage'
import NavManager from './NavManager'

import { mapGetters } from 'vuex'
import { Loading } from 'element-ui'
import { on, off } from '@/utils/dom'

export default {
  components: {
    SystemMessage,
    NavManager
  },
  props: {
    navIndex: {
      type: [Number, String],
      default: 0
      // authRedirect: ''
    }
  },
  data() {
    return {
      unreadNums: {
        allCount: 0,
        announceCount: 0,
        crmCount: 0,
        examineCount: 0,
        eventCount: 0,
        logCount: 0,
        taskCount: 0
      },
      mesOnlyAnnouncement: false,
      sysMessageShow: false,
      intervalId: null,
      type: 0,
      items: [],
      showItems: [],
      hiddenItems: [],
      navManagerShow: false,
      isNewest: false
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'lang',
      'logo',
      'crm',
      'bi',
      'manage',
      'oa',
      'project',
      'navActiveIndex',
      'collapse',
      'headerModule'
    ]),
    moreMenu() {
      return [{
        command: 'baseInfo',
        divided: false,
        label: '基本信息',
        icon: 'wk wk-user'
      }, {
        command: 'help',
        divided: true,
        label: '帮助中心',
        icon: 'wk wk-help'
      }, {
        command: 'logOut',
        divided: false,
        label: '退出登录',
        icon: 'wk wk-logout'
      }, {
        command: 'version',
        divided: false,
        label: `版本 ${WKConfig.version}`,
        icon: 'wk wk-version',
        disabled: true
      }]
    },
    allItemsObj() {
      var tempsItems = {}
      if (this.crm) {
        tempsItems.crm = {
          title: '客户管理',
          type: 1,
          module: 'crm',
          path: '/crm',
          icon: 'wk wk-customer',
          fontSize: '17px'
        }
      }

      if (this.oa && this.oa.taskExamine) {
        tempsItems.taskExamine = {
          title: '任务/审批',
          type: 4,
          module: 'taskExamine',
          path: '/taskExamine',
          icon: 'wk wk-office',
          fontSize: '16px'
        }
      }

      if (this.oa && this.oa.log) {
        tempsItems.log = {
          title: '日志',
          type: 3,
          module: 'log',
          path: '/workLog',
          icon: 'wk wk-log',
          fontSize: '17px'
        }
      }

      if (this.oa && this.oa.book) {
        tempsItems.book = {
          title: '通讯录',
          type: 6,
          module: 'book',
          path: '/addressBook',
          icon: 'wk wk-address-book',
          fontSize: '17px'
        }
      }

      if (this.project) {
        tempsItems.project = {
          title: '项目管理',
          type: 2,
          module: 'project',
          path: '/project',
          icon: 'wk wk-project',
          fontSize: '15px'
        }
      }

      if (this.bi) {
        tempsItems.bi = {
          title: '商业智能',
          type: 5,
          path: '/bi',
          module: 'bi',
          icon: 'wk wk-business-intelligence',
          fontSize: '18px'
        }
      }

      if (this.oa && this.oa.calendar) {
        tempsItems.calendar = {
          title: '日历',
          type: 8,
          module: 'calendar',
          path: '/calendar/index',
          icon: 'wk wk-calendar',
          fontSize: '20px'
        }
      }

      return tempsItems
    }
  },
  watch: {
    navManagerShow(val) {
      if (val == false) {
        this.changeNavIndex()
      }
    }
  },
  created() {
    this.getHeaderModule()
    const _this = this
    async function decorator() {
      var { data } = await crmCheckVersionAPI()
      _this.isNewest = _this.checkIsNewest(data.version, data.serverVersion)
    }
    decorator()
  },

  mounted() {
    on(document, 'click', this.handleDocumentClick)

    window.onresize = () => {
      this.changeMenu(document.documentElement.clientWidth)
    }


    // 消息数
    this.getSystemUnreadNum('visible')

    this.$bus.on('document-visibility', (state) => {
      this.getSystemUnreadNum(state)
    })
  },
  beforeDestroy() {
    this.$bus.off('document-visibility')
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    off(document, 'click', this.handleDocumentClick)
  },
  methods: {
    /**
     * 获取置顶头
     */
    getHeaderModule() {
      if (!this.headerModule) {
        this.$store
          .dispatch('WKHeaderModule')
          .then(res => {
            this.getTopHeaderModule()
          })
          .catch(() => {
          })
      } else {
        this.getTopHeaderModule()
      }
    },

    /**
     * 根据关键词获取菜单数据
     */
    getTopHeaderModule() {
      if (this.headerModule.length) {
        const allList = []
        for (let index = 0; index < this.headerModule.length; index++) {
          const key = this.headerModule[index]
          const menu = this.allItemsObj[key]
          if (menu && allList.length < 8) {
            allList.push(menu)
          }
        }
        this.items = allList
      } else {
        const allList = []
        for (const key in this.allItemsObj) {
          if (allList.length < 8) {
            allList.push(this.allItemsObj[key])
          }
        }
        this.items = allList
      }
      this.changeMenu(document.documentElement.clientWidth)
    },

    changeMenu(clintWidth) {
      const showItems = []
      const hiddenItems = []
      for (let index = 0; index < this.items.length; index++) {
        const element = this.items[index]
        if (clintWidth - 450 - (index + 1) * 130 > 0) {
          showItems.push(element)
        } else {
          hiddenItems.push(element)
        }
      }
      this.showItems = showItems
      this.hiddenItems = hiddenItems

      this.changeNavIndex()
    },

    changeNavIndex() {
      let isHidden = true
      for (let index = 0; index < this.showItems.length; index++) {
        const element = this.showItems[index]
        if (this.navIndex == element.path) {
          isHidden = false
        }
      }

      const navActiveIndex = isHidden ? 'other' : this.navIndex
      if (this.navActiveIndex != navActiveIndex) {
        this.$store.commit('SET_NAVACTIVEINDEX', navActiveIndex)
      }
    },

    navItemsClick(path) {
      if (path != 'other') {
        this.navManagerShow = false
        this.$router.push(path)
      } else {
        this.navManagerShow = !this.navManagerShow
      }
      this.$store.commit('SET_NAVACTIVEINDEX', path)
      this.$emit('nav-items-click', path)
    },
    enterSystemSet() {
      this.$router.push({
        name: 'manage'
      })
    },

    /**
     * 获取系统未读消息数
     */
    getSystemUnreadNum(state) {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
      if (state == 'visible') {
        this.sendSystemUnreadNum()
        this.intervalId = setInterval(() => {
          this.sendSystemUnreadNum()
        }, 600000)
      }
    },

    sendSystemUnreadNum() {
      systemMessageUnreadCountAPI()
        .then(res => {
          this.unreadNums = res.data
        })
        .catch(() => {
          if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
          }
        })
    },

    /**
     * 有客户权限点击logo 进入仪表盘
     */
    enterCustoemBoard() {
      if (this.crm) {
        this.$router.push('/crm/workbench')
      }
    },

    moreMenuClick(command) {
      if (command == 'baseInfo') {
        this.$router.push({
          name: 'person'
        })
      } else if (command == 'help') {
        window.open('https://www.72crm.com/help')
      } else if (command == 'logOut') {
        this.$confirm('退出登录？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            var loading = Loading.service({
              target: document.getElementById('#app')
            })
            this.$store
              .dispatch('LogOut')
              .then(() => {
                location.reload()
                loading.close()
              })
              .catch(() => {
                location.reload()
                loading.close()
              })
          })
          .catch(() => {})
      }
    },

    /**
     * 控制导航管理隐藏
     */
    handleDocumentClick(e) {
      if (!this.$refs.navManagerMenu ||
        !this.$refs.navManager ||
         this.$refs.navManagerMenu.$el.contains(e.target) ||
        this.$refs.navManager.$el.contains(e.target)) return

      this.navManagerShow = false
    },

    navManagerSelect({ path, module }) {
      this.navManagerShow = false
      this.$router.push(path)

      let navActiveIndex = path
      if (!this.headerModule.includes(module)) {
        navActiveIndex = 'other'
      }
      this.$store.commit('SET_NAVACTIVEINDEX', navActiveIndex)
    },

    updateClick() {
      this.$router.push('/manage/update')
    },

    checkIsNewest(a, b) {
      var a = toNum(a)
      var b = toNum(b)

      if (a > b) {
        return false
      } else {
        return true
      }

      function toNum(a) {
        var a = a.toString()
        var c = a.split('.')
        var num_place = ['', '0', '00', '000', '0000']
        var r = num_place.reverse()
        for (var i = 0; i < c.length; i++) {
          var len = c[i].length
          c[i] = r[len] + c[i]
        }
        var res = c.join('')
        return res
      }
    },

    /**
     * 查看消息详情
     */
    checkMessageDetail(onlyAnnouncement) {
      this.mesOnlyAnnouncement = onlyAnnouncement
      this.sysMessageShow = true
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 60px;
  min-height: 60px;
  background-color: white;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 30px;
  .logo {
    width: 150px;
    height: 40px;
    display: block;
    flex-shrink: 0;
    margin-right: 15px;
    background-color: white;
    cursor: pointer;
  }
  .nav-items-container {
    flex: 1;
    display: flex;
    min-width: 500px;
    height: 100%;
    overflow-x: auto;
    line-height: 60px;
    font-size: 15px;
  }

  .user-container {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    cursor: pointer;
    .user-img {
      margin-right: 8px;
    }
    .mark {
      font-size: 15px;
      color: #aaaaaa;
    }
  }

  .user-container:hover {
    .mark {
      color: #2486e4;
    }
  }
}

// 菜单
.el-menu {
  overflow: hidden;

  /deep/ .el-submenu__icon-arrow {
    display: none;
  }

  /deep/ .el-submenu {
    .el-submenu__title {
      i {
        color: #5c6075;
      }
    }
  }

  /deep/ .el-submenu.is-active {
    .el-submenu__title {
      i {
        color: $xr-color-primary;
      }
    }
  }
}

.el-menu.el-menu--horizontal {
  border-bottom: none;
}

.el-menu-item {
  padding: 0;
  margin: 0 20px;
  font-size: 16px;
  font-weight: 500;
  color: #2a304d;
  i {
    color: #5c6075;
  }
}

.el-menu-item:hover {
  i {
    color: $xr-color-primary;
  }
}

.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  color: $xr-color-primary;
}

.el-menu-item.is-active {
  border-width: 3px;
  i {
    color: $xr-color-primary;
  }
}

// 右侧操作
.handel-box {
  padding: 0 15px;
  border-top: 1px solid #EBEEF5;
  padding-top: 10px;
  .handel-button {
    width: 100%;
    border-radius: $xr-border-radius-base;
    border-color: #2362fb;
    background-color: #2362fb;
  }
}

.hr-top {
  margin-top: 8px;
  border-top: 1px solid #f4f4f4;
  padding-top: 3px;
}

.nav-lang {
  cursor: pointer;
  color: #888;
  padding: 20px;
  &:hover {
    color: #2362fb;
  }
  &.active {
    font-weight: bold;
    color: #2362fb;
  }
}

// 系统消息
.wk-announcement,
.wk-bell {
  color: #9DA9C2;
  cursor: pointer;
  font-size: 20px;
}

.el-badge {
  margin-right: 20px;
}

.wk-announcement:hover,
.wk-bell:hover {
  color: $xr-color-primary;
}

.el-dropdown-menu {
  /deep/ .popper__arrow {
    display: none;
  }
}

.top-btn {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: $xr-color-primary;
  .gift {
    color: $xr-color-primary;
    margin-right: 5px;
  }
}

.wk-update-tips {
  font-size: 12px;
  text-align: center;
  color: #bbb;
  margin-bottom: 10px;

  .el-badge {
    margin-left: 5px;
    margin-right: 0;
  }

  .el-button {
    padding: 2px 5px;
    font-size: 12px;
  }
}
</style>

