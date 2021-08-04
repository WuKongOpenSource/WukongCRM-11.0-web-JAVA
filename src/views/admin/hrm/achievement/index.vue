<template>
  <div class="achivement-set">
    <xr-header
      icon-class="wk wk-s-seas"
      icon-color="#487DFF"
      label="考核模板设置" />
    <div class="achivement-content">
      <!-- 客户管理导航 -->
      <div class="system-view-nav">
        <div class="nav-title">模板类型</div>
        <div
          v-for="(item, index) in menuList"
          :key="index"
          :class="{'is-select' : item.tableId == menuIndex}"
          class="menu-item"
          @click="menuSelect(item.tableId)">
          {{ item.tableName }}
        </div>
      </div>
      <keep-alive>
        <achievement-set
          :id="menuIndex"
          class="system-view-content"
          @change="achievementSetChange"/>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import {
  hrmConfigQueryAchievementListAPI
} from '@/api/admin/hrm'

import AchievementSet from './components/AchievementSet' // 考核设置
import XrHeader from '@/components/XrHeader'

export default {
  name: 'AchievementMain',

  components: {
    AchievementSet,
    XrHeader
  },

  data() {
    return {
      menuList: [],
      menuIndex: ''
    }
  },

  computed: { },

  created() {
    this.getList()
  },

  methods: {
    /**
     * 获取详情
     */
    getList() {
      this.loading = true
      hrmConfigQueryAchievementListAPI()
        .then(res => {
          this.loading = false
          this.menuList = res.data || []
          if (this.menuList.length) {
            this.menuIndex = this.menuList[0].tableId
          }
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 菜单选择
     */
    menuSelect(i) {
      this.menuIndex = i
    },

    /**
     * 详情设置
     */
    achievementSetChange(data) {
      let currentIndex = -1
      for (let index = 0; index < this.menuList.length; index++) {
        const element = this.menuList[index]
        if (element.tableId == this.menuIndex) {
          currentIndex = index
          break
        }
      }

      if (currentIndex >= 0) {
        this.menuList.splice(currentIndex, 1, data)
        this.menuIndex = data.tableId
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.achivement-set {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 0 15px;
}
.achivement-content {
  flex: 1;
  position: relative;
  display: flex;
  overflow: hidden;
}
.system-view-nav {
  min-width: 200px;
  background: #fff;
  margin-right: 10px;
  padding-top: 20px;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
  .nav-title {
    margin: 0 15px 8px;
  }
}
.system-view-content {
  flex: 1;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
}

// 菜单
.menu-item {
  color: #333;
  font-size: 13px;
  padding: 0 15px;
  height: 40px;
  line-height: 40px;
  cursor: pointer;
  position: relative;
  .icon-close {
    position: absolute;
    top: 0;
    right: 8px;
    z-index: 1;
    display: none;
  }
}

.menu-item:hover,
.menu-item.is-select {
  background-color: $xr--background-color-base;
}

.menu-item:hover::before,
.menu-item.is-select::before {
  content: ' ';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 2px;
  background-color: #5383ed;
}
</style>
