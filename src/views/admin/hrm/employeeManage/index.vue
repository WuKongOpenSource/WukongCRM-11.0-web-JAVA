<template>
  <div class="system-customer">
    <xr-header
      icon-class="wk wk-double-gear"
      icon-color="#1CBAF5"
      label="员工管理设置" />
    <div class="customer-content">
      <!-- 导航 -->
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
import EmployeeArchives from './components/EmployeeArchives' // 员工档案设置
import EmployeeFields from './components/EmployeeFields' // 员工档案设置
import XrHeader from '@/components/XrHeader'

export default {
  name: 'EmployeeManage',

  components: {
    EmployeeArchives,
    EmployeeFields,
    XrHeader
  },

  data() {
    return {
      menuList: [
        { label: '新建员工字段设置', key: 'EmployeeFields' },
        { label: '员工档案设置', key: 'EmployeeArchives' }
      ],
      menuIndex: 'EmployeeFields'
    }
  },

  computed: { },

  created() {
    const { menuIndex } = this.$route.query
    if (menuIndex) {
      this.menuIndex = menuIndex
    }
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
