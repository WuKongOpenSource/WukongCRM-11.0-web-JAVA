<template>
  <slide-view
    v-loading="loading"
    :no-listener-class="noListenerClass"
    :body-style="{padding: 0, height: '100%'}"
    class="d-view"
    xs-empty-icon="nopermission"
    xs-empty-text="暂无权限"
    @afterEnter="viewAfterEnter"
    @close="hideView">
    <div
      v-if="detail"
      direction="column"
      align="stretch"
      class="main">
      <flexbox class="detail-header">
        <div class="header-icon">
          <i class="wk wk-log" />
        </div>
        <div class="header-name">日志</div>
      </flexbox>
      <div class="main__bd">
        <!-- 基本信息 -->
        <div class="main__bd--info">
          <div class="content">
            <div
              v-if="detail.content"
              class="content-box">
              <div class="content-title">
                今日工作内容：
              </div>
              <div class="content-text">{{ detail.content }}</div>
            </div>
            <div
              v-if="detail.tomorrow"
              class="content-box">
              <div class="content-title">
                明日工作的内容：
              </div>
              <div class="content-text">{{ detail.tomorrow }}</div>
            </div>
            <div
              v-if="detail.question"
              class="content-box">
              <div class="content-title">
                遇到的问题：
              </div>
              <div class="content-text">{{ detail.question }}</div>
            </div>
          </div>

          <picture-list-view
            v-if="detail.img.length !== 0"
            :list="detail.img" />

          <flexbox v-if="detail.sendUserList && detail.sendUserList.length" class="send-list">
            <span class="send-list__label">发送给：</span>
            <span
              v-for="(item, index) in detail.sendUserList"
              :key="index"
              class="send-list__user">
              <xr-avatar
                :name="item.realname"
                :size="32"
                :src="item.img"
                :id="item.userId"
                :disabled="false"
                trigger="hover" />
            </span>
          </flexbox>

          <!-- 附件 -->
          <div v-if="detail.file.length" class="section">
            <div class="section__hd">
              <i class="wukong wukong-file" />
              <span>附件</span>
              <span>({{ detail.file.length }})</span>
            </div>
            <div class="section__bd">
              <file-cell
                v-for="(file, fileIndex) in detail.file"
                :key="fileIndex"
                :data="file"
                :list="detail.file"
                :cell-index="fileIndex" />
            </div>
          </div>

          <!-- 相关信息 -->
          <div
            v-if="Object.keys(relatedListData).length > 0"
            class="section">
            <div class="section__hd">
              <i class="wukong wukong-relevance" />
              <span>相关信息</span>
            </div>
            <div class="section__bd">
              <div
                v-for="(items, key) in relatedListData"
                :key="key">
                <related-business-cell
                  v-for="(item, itemIndex) in items"
                  :data="item"
                  :cell-index="itemIndex"
                  :type="key"
                  :key="itemIndex"
                  :show-foot="false"
                  @click.native="checkRelatedDetail(key, item)" />
              </div>
            </div>
          </div>

          <div v-if="detail.getBulletin" class="section">
            <div class="section__hd">
              <i class="wk wk-briefing" />
              <span>销售简报</span>
            </div>
            <div class="section__bd">
              <report-menu
                :list="reportList"
                @select="reportSelect" />
            </div>
          </div>
        </div>

        <!-- 回复 -->
        <el-tabs
          value="commont"
          type="border-card"
          class="commont">
          <el-tab-pane
            label="回复"
            name="commont">
            <reply-comment
              v-loading="commentLoading"
              ref="f_reply"
              @toggle="closeOtherReply"
              @reply="handleReply" />
            <comment-list
              v-if="replyList.length > 0"
              ref="comment_list"
              :id="id"
              :list="replyList"
              type="2"
              @delete="deleteComment"
              @close-other-reply="$refs.f_reply.toggleFocus(true)" />
          </el-tab-pane>
        </el-tabs>

      </div>
    </div>
    <c-r-m-full-screen-detail
      :visible.sync="showRelatedDetail"
      :crm-type="relatedCRMType"
      :id="relatedID" />

    <!-- 销售简报列表 -->
    <report-list
      :show.sync="reportListShow"
      :title="reportData.title"
      :placeholder="reportData.placeholder"
      :crm-type="reportData.crmType"
      :request="reportData.request"
      :params="reportData.params"
      :record-request="reportData.recordRequest"
      :field-list="fieldReportList"
      :paging="reportData.paging"
      :sortable="reportData.sortable"/>

  </slide-view>
</template>

<script>
import {
  journalQueryByIdAPI,
  journalQueryRecordCountAPI,
  journalQueryBulletinByTypeAPI } from '@/api/oa/journal'
import {
  setCommentAPI,
  queryCommentListAPI
} from '@/api/oa/common'

import SlideView from '@/components/SlideView'
import PictureListView from '@/components/PictureListView'
import FileCell from '@/views/oa/components/FileCell'
import RelatedBusinessCell from '@/views/oa/components/RelatedBusinessCell'
import ReportMenu from './ReportMenu'
import ReportList from '@/views/crm/workbench/components/ReportList'
import ReplyComment from '@/components/ReplyComment'
import CommentList from '@/components/CommentList'

import { mapGetters } from 'vuex'
import { separator } from '@/filters/vueNumeralFilter/filters'

export default {
  // 日志详情
  name: 'LogDetail',
  components: {
    SlideView,
    PictureListView,
    FileCell,
    RelatedBusinessCell,
    ReportMenu,
    ReportList,
    ReplyComment,
    CommentList,
    CRMFullScreenDetail: () =>
      import('@/components/CRMFullScreenDetail')
  },
  props: {
    id: [String, Number],
    noListenerClass: {
      type: Array,
      default: () => {
        return ['el-table__body']
      }
    }
  },
  data() {
    return {
      loading: false,
      detail: null,

      // 相关详情的查看
      relatedID: '',
      relatedCRMType: '',
      showRelatedDetail: false,

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
      ],

      // 简报预览
      reportListShow: false,
      fieldReportList: null,
      reportData: {
        title: '',
        placeholder: '',
        crmType: '',
        request: null,
        recordRequest: journalQueryBulletinByTypeAPI,
        params: null,
        paging: true,
        sortable: false
      },

      // 回复
      commentLoading: false,
      replyList: []
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ]),
    /**
     * 相关信息
     */
    relatedListData() {
      const tempsData = {}
      const keys = ['contacts', 'customer', 'business', 'contract']
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        const list = this.detail[`${key}List`] || []
        if (list.length > 0) {
          tempsData[key] = list
        }
      }
      return tempsData
    }
  },
  watch: {
    id() {
      this.viewAfterEnter()
    }
  },
  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 页面展示发请求
     */
    viewAfterEnter() {
      this.detail = null
      this.getDetail()
      this.getCommentList()
    },

    /**
     * 详情
     */
    getDetail() {
      this.loading = true
      journalQueryByIdAPI({ logId: this.id })
        .then(res => {
          this.detail = res.data
          if (this.detail.getBulletin) {
            const data = this.detail.bulletin || {}
            this.reportList = this.reportList.map(item => {
              if (item.key == 'receivablesMoney') {
                data.receivablesMoney = separator(Math.floor(data.receivablesMoney || 0))
              }
              item.name = `${item.info} ${data[item.key]}`
              return item
            })
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },

    /**
     * 查看相关信息详情
     */
    checkRelatedDetail(crmType, item) {
      this.relatedID = item[crmType + 'Id']
      this.relatedCRMType = crmType
      this.showRelatedDetail = true
    },

    /**
     * 关闭页面
     */
    hideView() {
      this.$emit('close')
      this.$emit('hide-view')
    },

    /**
     * 简报预览
     */
    reportSelect(item, data) {
      data = this.detail

      if (item.type) {
        this.reportData.title = `销售简报-${item.info}`
        this.reportData.placeholder = {
          customer: '请输入客户名称',
          business: '请输入商机名称',
          contract: '请输入合同名称',
          receivables: '请输入回款编号',
          record: ''
        }[item.type]


        this.reportData.crmType = item.type
        // data 存在 是已添加日志预览  不存在为页面顶部 销售简报预览
        this.reportData.params = data ? { logId: data.logId } : { today: 1 }

        // type   1 客户 2 商机 3 合同 4 回款 5 跟进记录
        this.reportData.params.type = {
          customer: 1,
          business: 2,
          contract: 3,
          receivables: 4,
          record: 5
        }[item.type]

        if (item.type == 'record') {
          this.fieldReportList = [
            {
              label: '模块',
              prop: 'crmType',
              width: 300
            },
            {
              label: '新增跟进记录数',
              prop: 'count'
            }
          ]
          this.reportData.request = journalQueryRecordCountAPI
          this.reportData.paging = false
          this.reportData.sortable = false
        } else {
          this.fieldReportList = this.getReportFieldList(item.type)
          this.reportData.request = journalQueryBulletinByTypeAPI
          this.reportData.paging = true
          this.reportData.sortable = 'custom'
        }

        this.reportListShow = true
      }
    },

    /**
     * type   1 客户 2 商机 3 合同 4 回款 5 跟进记录
     *
     * 表头数据
     * 客户：客户名称、成交状态、最后跟进时间、创建时间、负责人
     * 商机：商机名称、商机阶段、最后跟进时间、创建时间、负责人
     * 合同：合同名称、合同状态、创建时间、公司签约人
     * 回款：回款编号、回款时间、负责人
     */
    getReportFieldList(type) {
      return {
        customer: [
          {
            label: '客户名称',
            prop: 'customerName'
          },
          {
            label: '成交状态',
            prop: 'dealStatus'
          },
          {
            label: '最后跟进时间',
            prop: 'lastTime'
          },
          {
            label: '创建时间',
            prop: 'createTime'
          },
          {
            label: '负责人',
            prop: 'ownerUserName'
          }
        ],
        business: [
          {
            label: '商机名称',
            prop: 'businessName'
          },
          {
            label: '商机阶段',
            prop: 'statusName'
          },
          {
            label: '最后跟进时间',
            prop: 'lastTime'
          },
          {
            label: '创建时间',
            prop: 'createTime'
          },
          {
            label: '负责人',
            prop: 'ownerUserName'
          }
        ],
        contract: [
          {
            label: '合同名称',
            prop: 'contractName'
          },
          {
            label: '合同状态',
            prop: 'checkStatus'
          },
          {
            label: '创建时间',
            prop: 'createTime'
          },
          {
            label: '公司签约人',
            prop: 'companyUserName'
          }
        ],
        receivables: [
          {
            label: '回款编号',
            prop: 'number'
          },
          {
            label: '回款时间',
            prop: 'returnTime'
          },
          {
            label: '负责人',
            prop: 'ownerUserName'
          }
        ]
      }[type]
    },

    /**
     * 评论逻辑
     */
    getCommentList() {
      queryCommentListAPI({
        typeId: this.id,
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

    closeOtherReply(flag) {
      if (!flag && this.$refs.comment_list) {
        this.$refs.comment_list.closeReply()
      }
    },

    deleteComment(index) {
      this.replyList.splice(index, 1)
    },

    /**
     * 日志评论
     */
    handleReply(data) {
      this.commentLoading = true
      setCommentAPI({
        type: 2,
        content: data,
        typeId: this.id
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
        this.$refs.f_reply.commentsTextarea = ''
        this.replyList.push(res.data)
        this.commentLoading = false
      }).catch(() => {
        this.commentLoading = false
      })
    }

  }
}
</script>

<style lang="scss" scoped>
.main {
  position: relative;
  height: 100%;
  background: #f5f6f9;

  &__bd {
    height: calc(100% - 40px);
    overflow: auto;

    &--info {
      padding: 0 20px 10px;
      background: white;
    }
  }
}

.d-view {
  padding: 0 !important;
}

// 日志内容

.content {
  padding-top: 30px;
  .content-box {
    font-size: 14px;
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 15px;
    }
    .content-title {
      font-size: 13px;
      color: #666;
      margin-bottom: 10px;
    }
    .content-text {
      color: #333;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}

.detail-header {
  padding: 30px 20px 0;
  background: white;

  .header-icon {
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    border-radius: $xr-border-radius-base;
    margin-right: 20px;
    background-color: #5864ff;
    .wk {
      color: white;
      font-size: 26px;
    }
  }
  .header-name {
    font-size: 16px;
    color: #333333;
    flex: 1;
    font-weight: 600;
  }
}

.send-list {
  padding: 8px 0  ;
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

.d-view {
  position: fixed;
  min-width: 926px;
  width: 75%;
  top: 60px;
  bottom: 0px;
  right: 0px;
  padding: 15px;
  background-color: white;
}

// 详情其他模块
.section {
  padding: 10px 0;

  &__hd {
    span {
      font-size: 16px;
      color: #333;
      font-weight: 600;
    }
    .wk {
      color: #363636;
      font-size: 15px;
      margin-right: 5px;
    }
  }

  &__bd {
    margin-top: 15px;
    padding-left: 25px;
  }
}

// 详情
.commont {
  box-shadow: none;
  margin-bottom: 50px;

  /deep/ .el-tabs__item {
    color: #333;
    font-size: 12px;
    top: 2px;
    margin-top: -2px;
  }

  /deep/ .el-tabs__nav-scroll {
    min-height: 39px;
  }

  /deep/ .el-tabs__item.is-active {
    border-top: 2px solid $xr-color-primary;
    color: #333;
  }

  /deep/ .el-tabs {
    height: calc(100% - 15px) !important;
  }

  // /deep/ .el-tabs__content {
  //   height: calc(100% - 40px) !important;
  //   padding: 0;
  //   overflow: hidden;
  //   position: relative;

  //   .el-tab-pane {
  //     height: 100%;
  //     overflow: hidden;
  //   }
  // }
}

</style>
