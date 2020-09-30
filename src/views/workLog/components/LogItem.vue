<template>
  <div class="log-item">
    <div class="main">
      <div class="user">
        <xr-avatar
          v-if="data.createUser"
          :name="data.createUser.realname"
          :id="data.createUser.userId"
          :size="38"
          :src="data.createUser.img"
          :disabled="false"
          class="user-img" />
        <div class="box">
          <div class="username">
            {{ data.realname }}
          </div>
          <div class="time">
            创建日志于 {{ data.createTime }} <!--{{ data.isRead === 1 ? '已读' : '未读' }}-->
          </div>
          <div
            class="handle">
            <el-button
              v-if="showHistoryBtn"
              type="text"
              @click="checkHistoryClick">查看以往日志</el-button>
          </div>
          <div class="comment-status">
            <span class="icon wk wk-task" />
            <span>{{ getCategory(data.categoryId) }}-{{ data.replyNum === 0 ? '未点评' : '已点评' }}</span>
            <span :class="{active: data.replyNum !== 0}" class="dot" />
          </div>
        </div>
      </div>
      <div class="content">
        <div v-if="data.content" class="content-box">
          <div class="content-title">
            {{ logTitleName }}：
          </div>
          <div class="content-text">{{ data.content }}</div>
        </div>
        <div v-if="data.tomorrow" class="content-box">
          <div class="content-title">
            {{ logNextTitleName }}：
          </div>
          <div class="content-text">{{ data.tomorrow }}</div>
        </div>
        <div v-if="data.question" class="content-box">
          <div class="content-title">
            遇到的问题：
          </div>
          <div class="content-text">{{ data.question }}</div>
        </div>
      </div>

      <picture-list-view
        v-if="data.img && data.img.length !== 0"
        :list="data.img" />

      <file-list-view
        v-if="data.file && data.file.length !== 0"
        :list="data.file" />

      <related-business-list
        v-if="allDataLen > 0"
        :data="allData"
        @select="relatedClick" />

      <div v-if="data.getBulletin" class="content">
        <div class="content-box">
          <div class="content-title">
            销售简报
          </div>
          <div class="content-text">
            <report-menu
              :list="reportList"
              @select="reportSelect" />
          </div>
        </div>
      </div>

      <flexbox v-if="data.sendUserList && data.sendUserList.length" class="send-list">
        <span class="send-list__label">发送给：</span>
        <span
          v-for="(item, index) in data.sendUserList"
          :key="index"
          class="send-list__user">
          <xr-avatar
            :name="item.realname"
            :id="item.userId"
            :size="32"
            :src="item.img"
            :disabled="false" />
        </span>
      </flexbox>
    </div>

    <div class="footer">
      <el-dropdown
        v-if="data.permission && (data.permission.isUpdate || data.permission.isDelete)"
        trigger="click"
        @command="handleCommand">
        <el-button
          icon="el-icon-more"
          class="more" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-if="data.permission.isUpdate"
            command="edit">编辑</el-dropdown-item>
          <el-dropdown-item
            v-if="data.permission.isDelete"
            command="delete">删除</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button
        type="primary"
        icon="wk wk-message"
        class="replay-btn"
        @click="replayClick">{{ '回复' + (replyTotal > 0 ? `(${replyTotal})` : '') }}</el-button>
    </div>
    <div
      v-if="showReply"
      class="reply-wrapper">
      <reply-comment
        v-loading="commentLoading"
        ref="f_reply"
        @toggle="closeOtherReply"
        @reply="handleReply" />
      <comment-list
        v-if="replyList.length > 0"
        ref="comment_list"
        :id="data.logId"
        :list="replyList"
        type="2"
        @delete="deleteComment"
        @close-other-reply="$refs.f_reply.toggleFocus(true)" />
    </div>
  </div>
</template>

<script>
// API
import {
  journalDeleteAPI,
  journalSetReadAPI
} from '@/api/oa/journal'
import {
  setCommentAPI,
  queryCommentListAPI
} from '@/api/oa/common'

import PictureListView from '@/components/PictureListView'
import FileListView from '@/components/FileListView'
// import RelatedBusiness from '@/components/RelatedBusiness'
import ReplyComment from '@/components/ReplyComment'
import RelatedBusinessList from '@/components/RelatedBusinessList'
import CommentList from '@/components/CommentList'
import ReportMenu from './ReportMenu'

import { mapGetters } from 'vuex'
import { separator } from '@/filters/vueNumeralFilter/filters'

export default {
  name: 'LogItem',
  components: {
    PictureListView,
    FileListView,
    RelatedBusinessList,
    CommentList,
    ReplyComment,
    ReportMenu
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      default: 0
    },
    showHistoryBtn: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isWaiting: false,
      showReply: false,
      commentLoading: false,
      replyList: [],

      // 简报信息
      reportList: [
        {
          type: 'customer',
          key: 'customerCount',
          info: '今日新增客户',
          name: '今日新增客户 0'
        },
        {
          type: 'business',
          key: 'businessCount',
          info: '今日新增商机',
          name: '今日新增商机 0'
        },
        {
          type: 'contract',
          key: 'contractCount',
          info: '今日新增合同',
          name: '今日新增合同 0'
        },
        {
          type: 'receivables',
          key: 'receivablesMoney',
          info: '今日新增回款',
          name: '今日新增回款 0'
        },
        {
          type: 'record',
          key: 'recordCount',
          info: '今日新增跟进记录',
          name: '今日新增跟进记录 0'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ]),
    allData() {
      return {
        business: this.data ? this.data.businessList : [],
        contacts: this.data ? this.data.contactsList : [],
        contract: this.data ? this.data.contractList : [],
        customer: this.data ? this.data.customerList : []
      }
    },
    allDataLen() {
      let res = 0
      if (!this.data) return res
      const keys = ['businessList', 'contactsList', 'contractList', 'customerList']
      keys.forEach(key => {
        res += this.data[key].length || 0
      })
      return res
    },
    replyTotal() {
      let num = 0
      this.replyList.forEach(item => {
        num++
        num += item.childCommentList.length || 0
      })
      return num || this.data.replyNum
    },
    // 日志标题
    logTitleName() {
      return {
        1: '今日',
        2: '本周',
        3: '本月'
      }[this.data.categoryId] + '工作内容'
    },
    logNextTitleName() {
      return {
        1: '明日',
        2: '下周',
        3: '下月'
      }[this.data.categoryId] + '工作内容'
    }

  },
  created() {
    // this.$nextTick(() => {
    //   if (this.data.isRead === 1) return
    //   this.$bus.on('load-more-work-log', clientHeight => {
    //     if (this.isWaiting) return
    //     if (this.calcVisible(clientHeight)) {
    //       this.isWaiting = true
    //       setTimeout(() => {
    //         this.isWaiting = false
    //         if (this.calcVisible(clientHeight)) {
    //           this.readLog()
    //         }
    //       }, 3000)
    //     }
    //   })
    // })

    if (this.data.getBulletin) {
      const data = this.data.bulletin || {}
      this.reportList = this.reportList.map(item => {
        if (item.key == 'receivablesMoney') {
          data.receivablesMoney = separator(Math.floor(data.receivablesMoney || 0))
        }
        item.name = `${item.info} ${data[item.key]}`
        return item
      })
    }
  },
  beforeDestroy() {
    // this.$bus.off('load-more-work-log')
  },
  methods: {
    getCategory(categoryId) {
      const map = {
        1: '日报',
        2: '周报',
        3: '月报'
      }
      return map[categoryId]
    },
    /**
     * 编辑/删除
     * @param action
     * @param index
     */
    handleCommand(action, index) {
      if (action === 'delete') {
        this.$confirm('确定删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          journalDeleteAPI({ logId: this.data.logId }).then(() => {
            this.$message.success('删除成功!')
            this.$emit('delete', index)
          })
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      } else {
        this.$emit('edit', this.index, this.data)
      }
    },

    /**
     * 判断当前组件是否完全可见
     */
    calcVisible(boxHeight) {
      if (this.data.isRead === 1) return false
      const domRect = this.$el.getBoundingClientRect()
      return boxHeight > (domRect.top + domRect.height)
    },

    /**
     * 日志标记为已读
     */
    readLog() {
      if (this.data.isRead === 1) return
      this.$emit('read')
      journalSetReadAPI({
        logId: this.data.logId
      }).then(() => {
        this.$bus.off('load-more-work-log')
      }).catch()
    },

    /**
     * 日志评论
     */
    handleReply(data) {
      this.commentLoading = true
      setCommentAPI({
        type: 2,
        content: data,
        typeId: this.data.logId
      }).then(res => {
        res.data.user = {
          userId: this.userInfo.userId,
          realname: this.userInfo.realname,
          img: this.userInfo.img
        }
        res.data.childCommentList = []
        // this.$emit('add-comment', {
        //   data: res.data,
        //   index: this.index
        // })
        this.replyList.push(res.data)
        this.commentLoading = false
        this.showReply = false
        this.$nextTick(() => {
          this.showReply = true
        })
      }).catch(() => {
        this.commentLoading = false
      })
    },

    deleteComment(index) {
      this.replyList.splice(index, 1)
    },

    closeOtherReply(flag) {
      if (!flag && this.$refs.comment_list) {
        this.$refs.comment_list.closeReply()
      }
    },

    /**
     * 相关信息点击
     */
    relatedClick(type, data) {
      this.$emit('relate-detail', type, data)
    },

    /**
     * 回复点击
     */
    replayClick() {
      this.showReply = !this.showReply
      if (this.replyList.length == 0) {
        this.getCommentList()
      }
    },

    /**
     * 获取回复列表
     */
    getCommentList() {
      queryCommentListAPI({
        typeId: this.data.logId,
        type: 2 // 任务1 日志2
      })
        .then(res => {
          const list = res.data || []
          this.replyList = list
          // this.replyList = list.sort((a, b) => {
          //   return new Date(b.createTime) - new Date(a.createTime)
          // }) || []
        })
        .catch(() => {})
    },

    /**
     * 简报详情
     */
    reportSelect(item) {
      this.$emit('report-detail', item, this.data)
    },

    /**
     * 查看历史
     */
    checkHistoryClick() {
      this.$emit('check-history', this.data.createUser)
    }
  }
}
</script>

<style scoped lang="scss">
.log-item {
  .main {
    .user {
      color: #333;
      font-size: 14px;
      padding: 10px 15px 5px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .user-img {
        margin-right: 12px;
      }
      .box {
        flex: 1;
        margin-top: -10px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        .username {
          margin-right: 15px;
        }
        .time {
          font-size: 12px;
          color: #999;
        }
        .handle {
          flex: 1;
          margin-left: 30px;

          .el-button {
            font-size: 12px;
          }
        }
        .comment-status {
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          .icon {
            font-size: 14px;
            color: #2772FF;
            margin-right: 5px;
          }
          .dot {
            width: 7px;
            height: 7px;
            background-color: #F95A5A;
            border-radius: 50%;
            margin-left: 5px;
            display: inline-block;
            &.active {
              background-color: #4ca824;
            }
          }
        }
      }
    }

    .content {
      margin: 0 15px 0 68px;
      .content-box {
        font-size: 13px;
        margin-bottom: 20px;
        &:last-child {
          margin-bottom: 15px;
        }
        .content-title {
          /*color: #999;*/
          color: #333;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .content-text {
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      }
    }

    .picture-list-view {
      margin: 0 15px 10px 68px;
    }
    .file-list-view {
      width: 800px;
      margin: 0 15px 10px 68px;
    }
    .related-business-list {
      width: 800px;
      margin: 0 15px 10px 68px;
    }
    .comment-list {
      padding: 10px 30px 10px 60px;
      border-top: 1px solid #e6e6e6;
    }
  }

  .footer {
    width: 100%;
    height: 38px;
    background-color: #F4F7FF;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .replay-btn {
      margin-left: 10px;
      /deep/ i {
        margin-right: 5px;
        font-size: 14px;
      }
    }

    .el-button {
      padding: 6px 10px;
    }
  }

  .reply-wrapper {
    border-top: 1px solid #e6e6e6;
    padding: 20px 20px 10px;
    background-color: #f9f9f9;
  }
}

.send-list {
  padding: 8px 15px 8px 68px;
  &__label {
    color: #333;
    font-size: 12px;
  }

  &__user {
    position: relative;
    display: inline-block;
  }

  &__user + &__user {
    margin-left: 7px;
  }
}
</style>
