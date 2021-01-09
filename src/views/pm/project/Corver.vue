<template>
  <div class="corver">
    <xr-header
      icon-class="wk wk-project"
      icon-color="#4AB8B8"
      placeholder="请输入项目/任务/描述"
      label="项目"
      show-search
      ft-top="0"
      @search="searchClick">
      <div slot="ft">
        <el-button
          type="primary"
          icon="el-icon-plus"
          class="xr-btn--orange"
          @click="createProjectClick">
          创建项目
        </el-button>
      </div>
    </xr-header>
    <div v-loading="loading" class="content">
      <span class="dropdown-handle">
        <el-dropdown trigger="click" @command="showTypeChange">
          <div class="el-dropdown-link" >
            {{ tabShowType | showTypeName }}<i class="el-icon-arrow-down el-icon--right"/>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="board">卡片视图</el-dropdown-item>
            <el-dropdown-item command="list">列表视图</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          trigger="click"
          @command="filterClick">
          <div class="el-dropdown-link el-dropdown-filter">
            {{ filterObj[filterValue] }}<i class="el-icon-arrow-down el-icon--right"/>
          </div>
          <el-dropdown-menu slot="dropdown">
            <div class="el-dropdown-title">排序</div>
            <el-dropdown-item
              v-for="(item, index) in filterList"
              :key="index"
              :command="item.value">{{ item.label }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </span>
      <el-tabs v-model="tabName">
        <el-tab-pane
          v-for="(item, index) in tabList"
          :key="index"
          :label="item.label"
          :name="item.name">
          <draggable
            v-model="item.list"
            :options="{ forceFallback: false, disabled: tabName == 'star' }"
            class="cover-content"
            @end="moveItem">
            <template v-if="tabShowType == 'board'">
              <div
                v-for="(childItem, childIndex) in item.list"
                :key="childIndex"
                class="cover-content-item"
                @click="enterDetail(childItem)">

                <div v-src:background-image="childItem.coverUrl || defaultCorverUrl" class="cover-content-item__content">
                  <div class="handle-bar">
                    <div :title="childItem.name" class="title text-one-line">{{ childItem.name }}</div>
                    <i
                      v-if="childItem.authList && childItem.authList.project && childItem.authList.project.setWork"
                      class="wk wk-circle-edit"
                      @click.stop="editProjectClick(childItem)"/>
                    <i
                      :class="{ 'is-collect': childItem.collect == 1 }"
                      class="wk wk-focus-on"
                      @click.stop="collectClick(childItem)" />
                  </div>
                  <div class="cover-content-item__content-shadow"/>
                </div>
              </div>
              <div
                v-if="permissonProject"
                class="cover-content-item content-cross"
                @click="createProjectClick">
                <div class="content-cross__content">
                  <flexbox justify="center" align="center" orient="vertical">
                    <i class="wk wk-l-plus" />
                    <div>创建项目</div>
                  </flexbox>
                </div>
              </div>
            </template>
            <template v-else>
              <project-cell
                v-for="(childItem, childIndex) in item.list"
                :key="childIndex"
                :data="childItem"
                :edit-show="childItem.authList && childItem.authList.project && childItem.authList.project.setWork"
                :delete-show="childItem.authList && childItem.authList.project && childItem.authList.project.setWork"
                @click.native="enterDetail(childItem)"
                @handle="cellHandle($event, childItem)"
              />
              <project-cell
                v-if="permissonProject"
                :edit-show="false"
                :delete-show="false"
                :collect-show="false"
                @click.native="createProjectClick">
                <div slot="header" class="project-cell__add">
                  <i class="wk wk-l-plus" />
                </div>
                <span slot="body" class="project-cell__add--title">创建新项目</span>
              </project-cell>
            </template>
          </draggable>
        </el-tab-pane>
      </el-tabs>
    </div>
    <add-project
      v-if="isCreate"
      :id="editId"
      @save-success="createSuccess"
      @close="isCreate = false"/>
  </div>
</template>

<script>
import { workIndexWorkListAPI } from '@/api/pm/task'
import {
  workWorkCollectAPI,
  workUpdateWorkOrderAPI,
  workWorkDeleteAPI
} from '@/api/pm/project'

import XrHeader from '@/components/XrHeader'
import AddProject from '../components/AddProject'
import ProjectCell from './components/ProjectCell'

import Draggable from 'vuedraggable'
import { mapGetters } from 'vuex'

export default {
  // 项目封面展示
  name: 'Corver',
  components: {
    XrHeader,
    AddProject,
    Draggable,
    ProjectCell
  },
  filters: {
    showTypeName(value) {
      return {
        board: '卡片视图',
        list: '列表视图'
      }[value]
    }
  },
  props: {},
  data() {
    return {
      loading: true,
      tabShowType: 'board',
      search: '',
      filterObj: {},
      filterValue: 1,
      filterList: [{
        label: '按最早创建',
        value: 1
      }, {
        label: '按最近创建',
        value: 2
      }, {
        label: '按最近更新',
        value: 3
      }],
      isCreate: false,
      list: [],
      defaultCorverUrl: 'https://file.72crm.com/static/pc/images/pm/project-cover-1.jpg',
      tabName: 'all',
      tabList: [
        {
          label: '全部项目',
          name: 'all',
          list: []
        },
        {
          label: '我关注的',
          name: 'star',
          list: []
        }
      ],
      editId: null
    }
  },
  computed: {
    ...mapGetters(['project']),
    permissonProject() {
      return (
        this.project &&
        this.project.projectManage &&
        this.project.projectManage.save
      )
    }
  },
  watch: {},
  created() {
    this.filterList.forEach(item => {
      this.filterObj[item.value] = item.label
    })

    if (this.$route.query.type) {
      this.tabShowType = this.$route.query.type != 'board' ? 'list' : 'board'
    }
    this.getList()
    this.$bus.on('add-project', () => {
      this.getList()
    })
  },
  beforeRouteUpdate(to, from, next) {
    if (to.query.type) {
      this.tabShowType = to.query.type != 'board' ? 'list' : 'board'
    }
    next()
  },
  beforeDestroy() {
    this.$bus.off('add-project')
  },
  methods: {
    /**
     * 搜索操作
     */
    searchClick(search) {
      this.search = search
      this.getList()
      this.$router.push(`/project/search?search=${search || ''}&sort=${this.filterValue}`)
    },

    /**
     * 筛选操作
     */
    filterClick(command) {
      this.filterValue = command
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      this.loading = true
      workIndexWorkListAPI({
        workSort: this.filterValue,
        name: this.search
      })
        .then(res => {
          this.loading = false
          this.list = res.data || []
          const allItem = this.tabList[0]
          allItem.list = res.data || []
          allItem.label = `全部项目（${allItem.list.length}）`

          const starItem = this.tabList[1]
          starItem.list = this.list.filter(item => {
            return item.collect == 1
          })
          starItem.label = `我关注的（${starItem.list.length}）`
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 收藏
     */
    collectClick(item) {
      workWorkCollectAPI(item.workId)
        .then(res => {
          // item.collect = item.collect == 0 ? 1 : 0
          this.getList()
        })
        .catch(() => {})
    },


    /**
     * 拖拽
     */
    moveItem(evt) {
      if (evt) {
        // 如果没有进行移动 不做处理
        if (evt.oldIndex == evt.newIndex) {
          return
        }

        workUpdateWorkOrderAPI(this.tabList[0].list.map(item => item.workId))
          .then(res => {})
          .catch(() => {})
      }
    },

    /**
     * 进入详情
     */
    enterDetail(item) {
      this.$router.push({
        name: 'project-list',
        params: {
          id: item.workId
        }
      })
    },

    /**
     * 创建项目
     */
    createProjectClick() {
      this.editId = null
      this.isCreate = true
    },

    /**
     * 编辑项目
     */
    editProjectClick(item) {
      this.editId = item.workId
      this.isCreate = true
    },

    /**
     * 创建成功
     */
    createSuccess() {
      this.getList()
    },

    /**
     * 展示类型修改
     */
    showTypeChange(type) {
      this.$router.push(`/project/list?type=${type}`)
    },

    /**
     * 行操作
     */
    cellHandle(type, data) {
      if (type === 'edit') {
        this.editProjectClick(data)
      } else if (type === 'delete') {
        this.deleteProject(data)
      } else {
        this.collectClick(data)
      }
    },

    /**
     * 删除项目
     */
    deleteProject(data) {
      this.$confirm(
        '确定要删除项目吗？删除后此项目中的所有任务将一并彻底删除，无法恢复',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          workWorkDeleteAPI(data.workId)
            .then(res => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.corver {
  height: 100%;
  overflow: hidden;
  position: relative;
  .content {
    background-color: white;
    position: absolute;
    top: 45px;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 3px;
    overflow-y: auto;
    border: 1px solid #e6e6e6;
    padding: 10px 12px 15px;

    .dropdown-handle {
      cursor: pointer;
      position: absolute;
      right: 30px;
      top: 20px;
      z-index: 2;
    }

    .el-dropdown-filter {
      cursor: pointer;
      border-radius: 4px;
      padding: 8px 10px;
      background-color: white;
      margin-left: 15px;
    }
  }
}

.el-dropdown-menu {
  .el-dropdown-title {
    padding: 0px 20px 10px;
    color: #999;
    border-bottom: 1px solid $xr-border-color-base;
  }
  .el-dropdown-menu__item {
    color: #333;
  }
}

.xr-header {
  padding-top: 0 !important;
}

/deep/ .el-tabs {
  height: 100%;

  .el-tabs__header {
    margin: 0 8px 15px;
  }

  .el-tabs__nav-wrap::after {
    display: none;
  }

  .el-tabs__content {
    height: calc(100% - 45px);
    overflow-x: hidden;
    overflow-y: auto;
  }
}

.cover-content {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  flex-direction: row;
  padding-top: 8px;

  &-item {
    position: relative;
    flex: none;
    width: 235px;
    height: 0;
    padding: 8px;
    transform: translateY(0);
    margin-bottom: 20px;


    &__content {
      position: absolute;
      top: 0;
      left: 8px;
      right: 8px;
      bottom: 0;
      box-shadow: 0 0 0 rgba(0,0,0,0.15);
      transition: box-shadow 0.218s ease;
      cursor: pointer;
      border-radius: $xr-border-radius-base;

      background-position: 50%;
      background-repeat: no-repeat;
      background-size: cover;

      .handle-bar {
        text-align: right;
        margin: 10px;
        z-index: 1222222222;
        position: relative;

        .title {
          text-align: left;
          color: white;
          width: calc(100% - 45px);
          display: inline-block;
          font-weight: bold;
        }

        i {
          color: white;
          cursor: pointer;

          &:hover {
            color: $xr-color-primary;
          }
        }

        .wk-focus-on.is-collect {
          color: #F7AD3D;
        }

        .wk-circle-edit {
          visibility: hidden;
        }
      }

      &-shadow {
        background-image: linear-gradient(180deg,rgba(0,0,0,0.5) 0%,transparent);
        background-repeat: repeat-x;
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#59000000",endColorstr="#00000000",GradientType=0);
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        border-radius: 4px 4px 0 0;
        z-index: 0;
      }


      &:hover {
        .wk-circle-edit {
          visibility: visible;
        }
      }
    }

    &:hover {
      transform: translateY(-4px);
      .cover-content-item__content {
        box-shadow: 0 6px 12px rgba(38,38,38,0.1);
      }
    }
  }


  @media screen and (max-width: 900px) {
    .cover-content-item {
      width: 33.3%;
      padding-bottom: calc(16.65% - 16px);
    }
  }

    @media screen and (min-width: 900px)  and (max-width: 1280px) {
      .cover-content-item {
        width: 25%;
        padding-bottom: calc(12.5% - 16px);
      }
    }


  @media screen and (min-width: 1280px)  and (max-width: 1680px) {
    .cover-content-item {
      width: 20%;
      padding-bottom: calc(10% - 16px);
    }
  }


  @media screen and (min-width: 1680px)  and (max-width: 1920px) {
    .cover-content-item {
      width: 16.6%;
      padding-bottom: calc(8.3% - 16px);
    }
  }

  @media screen and (min-width: 1921px) {
    .cover-content-item {
      width: 16.6%;
      padding-bottom: calc(8.3% - 16px);
    }
  }


  .content-cross {
    &__content {
      position: absolute;
      top: 0;
      left: 8px;
      right: 8px;
      bottom: 0;
      border: 1px #e6e6e6 solid;
      border-radius: $xr-border-radius-base;
      background: #f7f7f7;
      text-align: center;
      cursor: pointer;

      .vux-flexbox {
        height: 100%;
        .wk-l-plus {
          display: inline-block;
          font-size: 16px;
        }

        div {
          margin-top: 10px;
        }
      }


      &:hover {
        background: rgba($color: $xr-color-primary, $alpha: 0.1);
        color: $xr-color-primary;
      }
    }

    &:hover {
      transform: translateY(0);
    }
  }

  .project-cell__add {
    border: 1px #e6e6e6 solid;
    border-radius: $xr-border-radius-base;
    background: #f7f7f7;
    line-height: 75px;
    text-align: center;
    &:hover {
      background: rgba($color: $xr-color-primary, $alpha: 0.1);
      color: $xr-color-primary;
    }
  }

  .project-cell__add--title {
    color: #999;
  }
}
</style>
