<template>
  <transition
    name="el-drawer-fade">
    <div
      v-loading="loading"
      :style="{ 'z-index': zIndex, 'left': containerLeft }"
      class="nav-manager">

      <div class="nav-manager__content">

        <div class="nav-section">
          <div class="nav-section__title" title="123123">全部应用</div>
          <flexbox
            class="nav-section__content"
            wrap="wrap">
            <div
              v-for="(item, index) in allList"
              :key="index"
              :class="{'is-future': item.future}"
              class="nav-section-item"
              @click="selectClick(item)">
              <div class="nav-section-item__icon">
                <i :class="item.icon" />
              </div>
              <div class="nav-section-item__label">{{ item.title }}</div>
              <i v-if="isEdit && topList.length < 8 && !item.future && !isHasSelect(item.module)" class="el-icon-circle-plus is-handle" @click.stop="moduleTopClick(item, index)" />
              <span v-if="item.future" class="span-future">{{ item.futureLabel }}</span>
            </div>
          </flexbox>
        </div>

        <div class="nav-section">
          <div class="nav-section__title">置顶应用<span class="nav-section__tips">（最多可设置8个置顶应用，可通过拖拽进行排列）</span>
            <el-button v-if="isEdit" type="primary" @click="saveClick">保存</el-button>
            <el-button v-else @click="isEdit = !isEdit">编辑</el-button>
          </div>
          <draggable
            v-model="topList"
            :options="{ dragClass: 'sortable-drag', forceFallback: false, disabled:!isEdit }"
            style="flex-wrap: wrap;"
            class="vux-flexbox nav-section__content">
            <div
              v-for="(item, index) in topList"
              :key="index"
              class="nav-section-item"
              @click="selectClick(item)">
              <div class="nav-section-item__icon">
                <i :class="item.icon" />
              </div>
              <div class="nav-section-item__label">{{ item.title }}</div>
              <i v-if="isEdit" class="el-icon-remove is-handle" @click.stop="topModuleDelete(item, index)" />
            </div>
          </draggable>

        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import { configSetHeaderModelSortAPI } from '@/api/config'

import { mapGetters, mapState } from 'vuex'
import { getMaxIndex } from '@/utils/index'
import Draggable from 'vuedraggable'

export default {
  // 模块管理
  name: 'NavManager',
  components: {
    Draggable
  },
  props: {
    collapse: Boolean,
    topModule: Array
  },
  data() {
    return {
      zIndex: getMaxIndex(),
      loading: false,
      isEdit: false,
      topList: [],
      allList: []
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'bi',
      'crm',
      'manage',
      'oa',
      'project',
      'hrm',
      'headerModule'
    ]),
    ...mapState({
      moduleAuth: state => state.app.moduleAuth
    }),
    containerLeft() {
      if (this.collapse) {
        return '79px'
      }

      return '215px'
    },

    topModules() {
      return this.topList.map(item => item.module)
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

      if (this.moduleAuth && this.moduleAuth.hrm) {
        tempsItems.hrm = {
          title: '人力资源',
          type: 11,
          module: 'hrm',
          path: '/hrm',
          icon: 'wk wk-employees',
          fontSize: '18px'
        }
      }

      return tempsItems
    }
  },
  watch: {},
  created() {
    const allList = []
    for (const key in this.allItemsObj) {
      allList.push(this.allItemsObj[key])
    }
    this.allList = allList

    this.getHeaderModelSortList()
  },
  mounted() {
    // document.body.appendChild(this.$el)
  },

  beforeDestroy() {
    // if (this.appendToBody && this.$el && this.$el.parentNode) {
    //   this.$el.parentNode.removeChild(this.$el)
    // }
  },
  methods: {
    /**
     * 获取置顶应用
     */
    getHeaderModelSortList() {
      if (this.headerModule.length) {
        const allList = []
        for (let index = 0; index < this.headerModule.length; index++) {
          const key = this.headerModule[index]
          const menu = this.allItemsObj[key]
          if (menu && allList.length < 8) {
            allList.push(menu)
          }
        }
        this.topList = allList
      } else {
        const allList = []
        for (const key in this.allItemsObj) {
          if (allList.length < 8) {
            allList.push(this.allItemsObj[key])
          }
        }
        this.topList = allList
      }
    },

    /**
     * 保存
     */
    saveClick() {
      const keys = this.topList.map(item => item.module)
      this.loading = true
      configSetHeaderModelSortAPI(keys).then(res => {
        this.isEdit = false
        this.$store
          .dispatch('WKHeaderModule')
          .then(res => {
            this.$message.success('操作成功')
            this.loading = false
            this.$emit('change')
          })
          .catch(() => {
            this.loading = false
          })
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 判断是否有选择
     */
    isHasSelect(module) {
      return this.topModules.includes(module)
    },

    /**
     * 删除
     */
    topModuleDelete(item, index) {
      if (this.topList.length > 1) {
        this.topList.splice(index, 1)
      }
    },

    /**
     * 模块添加
     */
    moduleTopClick(item, index) {
      if (this.topList.length < 8) {
        this.topList.push(item)
      }
    },

    /**
     * 选择模块
     */
    selectClick(item) {
      if (!item.future && !this.isEdit) {
        this.$emit('select', item)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.nav-manager {
  position: absolute;
  top: 61px;
  right: 15px;
  background-color: white;
  box-shadow: 0px 8px 11px 1px rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;

  padding: 20px 15px 40px;

  &__content {
    position: relative;
  }

  &__handle {
    position: absolute;
    right: 20px;
    top: -5px;
  }

  .nav-section {
    &__title {
      font-weight: bold;
    }

    &__tips {
      color: #ccc;
      font-weight: normal;
    }

    &__content {
      margin-top: 20px;
    }
  }

  .nav-section + .nav-section {
    margin-top: 20px;
    border-top: 1px solid $xr-border-line-color;
    .nav-section__title {
      margin-top: 20px;
    }
  }

  .nav-section-item {
    text-align: center;
    width: 70px;
    height: 70px;
    margin: 10px;
    cursor: pointer;
    position: relative;

    &__icon {
      width: 40px;
      height: 40px;
      display: inline-block;
      line-height: 40px;
      border-radius: 4px;
      background-color: #F0F0F0;
      border-radius: 4px;

      i {
        font-size: 18px;
        color: $xr-color-primary;
      }
    }

    &__label {
      font-size: 13px;
      margin-top: 10px;
    }

    .el-icon-circle-plus,
    .el-icon-remove {
      color: #F94E4E;
      cursor: pointer;
    }
    .is-handle {
      position: absolute;
      right: 10px;
      top: -6px;
    }

    .span-future {
      position: absolute;
      top: -6px;
      left: 35px;
      font-size: 12px;
      background: #D9D9D9;
      display: inline-block;
      color: white;
      padding: 2px 3px;
      border-radius: 2px;
      white-space: nowrap;
      transform: scale(0.9);
    }

    &.is-future {
      cursor: initial;

      .nav-section-item__icon {
        i {
          color: #999;
        }
      }

      .nav-section-item__label {
        color: #666;
      }
    }

  }
}


</style>
