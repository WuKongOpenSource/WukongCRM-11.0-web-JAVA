<template>
  <transition name="slide-fade">
    <el-card
      :style="{ 'z-index': zIndex }"
      class="project-screening">
      <p class="header">
        <span class="label">任务筛选</span>
        <el-button
          type="text"
          @click="resetBtn">重置</el-button>
        <span
          class="rt el-icon-close"
          @click="close"/>
      </p>
      <div class="content">
        <el-input v-if="config.searchShow" v-model="search" placeholder="搜索项目内任务" @input="debouncedSeach" />
        <div
          v-for="(item, index) in menuList"
          :key="index"
          class="menu-list">
          <p
            class="item-label"
            @click="rowFun(item)">
            {{ item.label }}
            <span :class="item.expand ? 'el-icon-arrow-right item-expand' : 'el-icon-arrow-down item-expand'"/>
          </p>
          <div
            v-for="(val, i) in item.list"
            v-show="item.expand == false"
            :key="i"
            :class="['item-list', val.checked ? 'item-list-active' : '', {'time-item-list': index == 1} ]"
            @click="rowChecked(val)">
            <xr-avatar
              v-if="val.type == 'user'"
              :name="val.realname"
              :size="24"
              :src="val.img"
              class="user-img" />
            <span
              v-if="val.type == 'tag'"
              :style="{ backgroundColor: val.color }"
              class="tag-icon">
              <i class="wk wk-label" />
            </span>
            <!-- <i
              v-if="val.type == 'tag'"
              :style="{color:val.color}"
              style="margin-right:10px; vertical-align: text-top;"
              class="wukong wukong-tag"/>
            <span>{{ val.name }}</span> -->
            <span :class="{ 'is-tag': val.type == 'tag'}" class="item-list-label">{{ val.name }}</span>
            <span class="el-icon-check rt"/>
          </div>
        </div>
      </div>
    </el-card>
  </transition>
</template>

<script>
import { workWorkOwnerListAPI } from '@/api/pm/project'
import { workTasklableIndexAPI } from '@/api/pm/tag'

import { getMaxIndex } from '@/utils/index'
import { debounce } from 'throttle-debounce'
import merge from '@/utils/merge'

const DefaultProps = {
  searchShow: true, // 是否搜索
  userRequest: null, // 员工列表请求
  userParams: null // 空参数
}

export default {

  props: {
    workId: [Number, String],
    data: Object,
    props: Object
  },
  data() {
    return {
      zIndex: getMaxIndex(),
      search: '',
      menuList: [
        {
          label: '成员',
          id: '1',
          expand: false,
          list: []
        },
        {
          label: '截止时间',
          id: '2',
          expand: false,
          list: [
            {
              id: '1',
              name: '今天',
              type: 'time',
              checked: false
            },
            {
              id: '2',
              name: '明天',
              type: 'time',
              checked: false
            },
            {
              id: '3',
              name: '本周',
              type: 'time',
              checked: false
            },
            {
              id: '4',
              name: '本月',
              type: 'time',
              checked: false
            },
            {
              id: '5',
              name: '未设置截止时间',
              type: 'time',
              checked: false
            },
            {
              id: '6',
              name: '已延期',
              type: 'time',
              checked: false
            },
            {
              id: '7',
              name: '今日更新',
              type: 'time',
              checked: false
            }
          ]
        },
        {
          label: '标签',
          id: '3',
          expand: false,
          list: []
        }
      ]
    }
  },

  computed: {
    config() {
      return merge({ ...DefaultProps }, this.props || {})
    }
  },

  created() {
    this.debouncedSeach = debounce(500, () => {
      this.searchChange()
    })
    this.search = this.data.search
    this.getUserList()
    this.getTagList()
    this.menuList[1].list.forEach(item => {
      item.checked = this.data && this.data.timeId == item.id
    })
  },

  mounted() {
    document
      .getElementById('app')
      .addEventListener('click', this.taskShowHandle, false)
  },
  methods: {
    /**
     * 获取成员
     */
    getUserList() {
      this.menuList[0].list = []
      const request = this.config.userRequest || workWorkOwnerListAPI
      let params = this.config.userParams
      if (params === null) {
        params = {
          workId: this.workId
        }
      }
      request(params).then(res => {
        this.menuList[0].list = res.data.map(item => {
          item.checked = this.data && this.data.userIds && this.data.userIds.includes(item.userId)
          item.name = item.realname
          item.type = 'user'
          return item
        })
      })
    },

    /**
     * 获取标签
     */
    getTagList() {
      this.menuList[2].list = []
      workTasklableIndexAPI()
        .then(res => {
          this.menuList[2].list = res.data.map(item => {
            item.id = item.labelId
            item.checked = this.data && this.data.tagIds && this.data.tagIds.includes(item.labelId)
            item.type = 'tag'
            return item
          })
        })
        .catch(() => {})
    },

    close() {
      this.$emit('close')
    },

    rowChecked(val) {
      if (val.type == 'time') {
        for (const k of this.menuList[1].list) {
          if (val.id == k.id) {
            k.checked = !k.checked
          } else {
            k.checked = false
          }
        }
      } else {
        val.checked = !val.checked
      }
      // 过滤数据 -- 传值
      // 人员
      const userIds = []
      for (const item of this.menuList[0].list) {
        if (item.checked) {
          userIds.push(item.userId)
        }
      }
      // 时间
      let timeId = ''
      for (const item of this.menuList[1].list) {
        if (item.checked) {
          timeId = item.id
          break
        }
      }

      // 标签
      const tagIds = []
      for (const item of this.menuList[2].list) {
        if (item.checked) {
          tagIds.push(item.id)
        }
      }
      this.$emit('change', userIds, timeId, tagIds, this.search)
    },

    searchChange() {
      this.$emit('change', this.data.userIds, this.data.timeId, this.data.tagIds, this.search)
    },

    resetBtn() {
      for (const item of this.menuList) {
        for (const i of item.list) {
          i.checked = false
        }
      }
      this.search = ''
      this.$emit('change', [], '', [], this.search)
    },

    rowFun(val) {
      val.expand ? (val.expand = false) : (val.expand = true)
    },

    /**
     * 点击空白处关闭详情
     */
    taskShowHandle(e) {
      if (!this.$el.contains(e.target)) {
        this.close()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.project-screening /deep/ .el-card__body {
  padding: 0;
}
.project-screening {
  position: fixed;
  top: 60px;
  bottom: 0;
  right: 0;
  width: 300px;
  overflow: auto;
  /deep/ .el-card__body {
    height: 100%;
  }

  .header {
    border-bottom: 1px solid #e6e6e6;
    margin-bottom: 10px;
    padding: 9px 20px;
    .label {
      font-weight: 600;
      font-size: 16px;
      margin-right: 10px;
    }
    .el-icon-close {
      color: #909399;
      font-size: 18px;
      font-weight: 600;
      margin-top: 11px;
      margin-right: 0;
      cursor: pointer;
    }

    .el-icon-close:hover {
      color: $xr-color-primary;
    }
  }
  .content {
    .el-input {
      padding: 10px 15px;
    }
    font-size: 13px;
    height: calc(100% - 60px);
    overflow-y: auto;
    .menu-list {
      margin-bottom: 10px;
      .item-label {
        font-size: 14px;
        font-weight: 600;
        position: relative;
        height: 36px;
        line-height: 36px;
        padding: 0 30px;
        cursor: pointer;
        color: #333;
        .item-expand {
          height: 36px;
          line-height: 36px;
          position: absolute;
          right: 12px;
          top: 0;
        }
      }

      .item-label::before {
        content: '';
        position: absolute;
        top: 10px;
        left: 18px;
        bottom: 10px;
        width: 4px;
        border-radius: 2px;
        background-color: $xr-color-primary;
      }

      .time-item-list {
        padding: 8px 10px 8px 35px !important;
      }
      .item-list {
        padding: 4px 10px 4px 35px;
        margin: 5px 0;
        color: #333;
        .el-icon-check {
          margin-top: 3px;
          opacity: 0;
        }
        .user-img {
          vertical-align: middle;
          margin-right: 5px;
        }
        span {
          vertical-align: middle;
        }
      }

      .tag-icon {
        display: inline-block;
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        text-align: center;
        line-height: 24px;
        border-radius: $xr-border-radius-base;
        margin-right: 10px;

        .wk {
          color: white;
          font-size: 12px;
        }
      }

      .item-list-label {
        font-size: 14px;
        color: #333;
      }

      .item-list-label.is-tag {
        font-size: 12px;
        font-weight: 600;
      }

      .item-list:hover {
        background: #f7f8fa;
        cursor: pointer;
      }
      .item-list-active {
        background: #f7f8fa;
        cursor: pointer;
        .el-icon-check {
          opacity: 1;
        }
      }
    }
  }
}
</style>
