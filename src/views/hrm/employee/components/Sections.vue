<template>
  <div class="section">
    <div
      v-if="title && title.length > 0"
      class="section-header">
      <div
        :style="{ 'border-left-color': mColor }"
        class="section-mark"/>
      <div class="section-title">{{ title }}</div>
      <el-dropdown
        v-if="showHandle"
        @command="handleTypeDrop">
        <span
          v-if="showHandle"
          class="handle-button">
          操作<i class="el-icon-arrow-down el-icon--right"/>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="edit">编辑</el-dropdown-item>
          <el-dropdown-item command="delete">删除</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div
      v-if="titles.length > 0"
      class="section-header">
      <div
        :style="{ 'border-left-color': mColor }"
        class="section-mark"/>
      <el-breadcrumb
        style="padding: 5px 0;margin-left: 8px;"
        separator-class="el-icon-arrow-right">
        <el-breadcrumb-item
          v-for="(item, index) in titles"
          :key="index">
          <span
            class="section-titles-name"
            @click="titlesClick(item, index)">{{ item }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div
      :style="{ 'height': contentHeight }"
      class="content">
      <div
        v-if="showNoData"
        class="no-data-container">
        <img
          class="no-data"
          src="@/assets/img/no_data.png" >
        <div class="no-data-name">暂无数据</div>
      </div>
      <slot/>
    </div>
  </div>
</template>
<script type="text/javascript">
export default {
  name: 'Sections',
  components: {},
  props: {
    title: {
      type: String,
      default: ''
    },
    /** 附件标签效果 */
    titles: {
      type: Array,
      default: () => {
        return []
      }
    },
    mColor: {
      type: String,
      default: '#2362FB'
    },
    /** 内容区域固定高度 */
    contentHeight: {
      type: String,
      default: '327px'
    },
    /** 展示无数据 */
    showNoData: {
      type: Boolean,
      default: false
    },
    /** 展示操作 */
    showHandle: {
      type: Boolean,
      default: false
    },
    /** 循环时候的行 */
    index: Number
  },
  data() {
    return {
    }
  },
  computed: {},
  mounted() {
  },
  methods: {
    /** 编辑删除操作 */
    handleTypeDrop(command) {
      this.$emit('on-handle', { type: command, index: this.index })
    },
    titlesClick(item, index) {
      this.$emit('on-titles-click', { item: item, itemIndex: index, index: this.index })
    }
  }
}
</script>
<style lang="scss" scoped>
.section {
  position: relative;
  background-color: white;
  margin-top: 8px;
}
.section:first-child {
  margin-top: 0;
}
/* .section:before {
  content: " ";
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 1px;
  border-top: 1px solid #e5e5e5;
  color: #e5e5e5;
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  z-index: 2;
}
.section:after {
  content: " ";
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 1px;
  border-bottom: 1px solid #e5e5e5;
  color: #e5e5e5;
  -webkit-transform-origin: 0 100%;
  transform-origin: 0 100%;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  z-index: 2;
} */
.section-mark {
  border-left-width: 4px;
  border-left-style: solid;
  border-radius: 2px;
  height: 14px;
}

.section-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 5px 15px;
}
.section-title {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-left: 8px;
  flex-shrink: 0;
  flex: 1;
}

.section-titles-name {
  font-size: 13px;
  color: #333;
  flex-shrink: 0;
  font-weight: 600;
  cursor: pointer;
}

.content {
  overflow: auto;
  .no-data-container {
    text-align: center;
    .no-data {
      margin-top: 30px;
    }
    .no-data-name {
      font-size: 12px;
      margin-top: 8px;
      color: #666;
    }
  }
}

.handle-button {
  margin-right: 20px;
  color: $xr-color-primary;
  cursor: pointer;
}
</style>
