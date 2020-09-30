<template>
  <div class="system-customer">
    <xr-header
      icon-class="wk wk-manage"
      icon-color="#2EC2F9"
      label="其他设置" />
    <div class="customer-content">
      <!-- 客户管理导航 -->
      <div class="system-view-nav">
        <div
          v-for="(item, index) in menuList"
          :key="index"
          :class="{'is-select' : item.key == menuIndex}"
          class="menu-item"
          @click="menuSelect(item.key)">
          {{ item.label }}
        </div>
      </div>
      <keep-alive>
        <component
          :is="menuIndex"
          class="system-view-content"/>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import LogWelcome from './components/LogWelcome'
import XrHeader from '@/components/XrHeader'
import CalendarType from './components/CalendarType'
import LogRuleSet from './components/LogRuleSet'

export default {
  name: 'OtherSystem',

  components: {
    LogWelcome,
    CalendarType,
    XrHeader,
    LogRuleSet
  },

  data() {
    return {
      menuList: [
        { label: '日志欢迎语', key: 'LogWelcome' },
        { label: '日志规则设置', key: 'LogRuleSet' },
        { label: '日程类型设置', key: 'CalendarType' }
      ],
      menuIndex: 'LogWelcome',
      types: '' // 区分拥有客户 和 锁定客户
    }
  },

  computed: {
  },

  methods: {
    /**
     * 菜单选择
     */
    menuSelect(i) {
      this.menuIndex = i
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.system-customer {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 0 15px;
}
.customer-content {
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
