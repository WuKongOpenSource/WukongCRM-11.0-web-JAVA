<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @Date: 2020-05-27 13:37:31
 * @LastEditTime: 2020-07-17 17:06:36
 * @LastEditors: yang
-->
<template>
  <slide-view
    v-loading="loading"
    :listener-ids="listenerIDs"
    :no-listener-ids="noListenerIDs"
    :no-listener-class="noListenerClass"
    :body-style="{padding: 0, height: '100%', background: 'white'}"
    class="d-view"
    @afterEnter="viewAfterEnter"
    @close="hideView">
    <flexbox
      v-if="detailData"
      direction="column"
      align="stretch"
      style="padding: 0 15px;"
      class="side-detail-main">
      <wk-detail-header
        :show-edit="manageAuth"
        @edit="editClick"
        @command-select="commandSelect"
      >
        <div slot="body" class="employee-header">
          <div class="employee-header__top">
            <span class="name">{{ detailData.candidateName }}</span>
          </div>
          <div class="employee-header__bottom">
            <el-tag
              v-if="detailData.sex === 1 || detailData.sex ===2"
              :class="{
                1: 'is-man',
                2: 'is-woman',
              }[detailData.sex]"
              disable-transitions
              class="xr-sex-tag"
              size="mini">
              <i
                :class="{
                  1: 'wk wk-man',
                  2: 'wk wk-woman',
              }[detailData.sex]" />
            </el-tag>
            <el-tooltip
              :content="`学历：${fieldFormatter(detailData, 'education')|| '--'}`"
              effect="dark"
              placement="top">
              <el-tag
                disable-transitions
                class="xr-tag"
                color="#ECEEF2"
                size="mini">
                <i class="wk wk-icon-cap-outline" />{{ fieldFormatter(detailData, 'education') || '--' }}
              </el-tag>
            </el-tooltip>

            <el-tooltip
              :content="`工作年限：${detailData.workTime|| '--'}`"
              effect="dark"
              placement="top">
              <el-tag
                disable-transitions
                class="xr-tag"
                color="#ECEEF2"
                size="mini">
                <i class="wk wk-icon-tool-cabinet" />{{ detailData.workTime|| '--' }}
              </el-tag>
            </el-tooltip>

            <el-tooltip
              :content="`手机号：${detailData.mobile|| '--'}`"
              effect="dark"
              placement="top">
              <el-tag
                disable-transitions
                class="xr-tag"
                color="#ECEEF2"
                size="mini">
                <i class="wk wk-icon-mobile" />{{ detailData.mobile || '--' }}
              </el-tag>
            </el-tooltip>

            <el-tooltip
              :content="`邮箱：${detailData.email|| '--'}`"
              effect="dark"
              placement="top">
              <el-tag
                disable-transitions
                class="xr-tag"
                color="#ECEEF2"
                size="mini">
                <i
                  style="font-size: 14px;"
                  class="wk wk-icon-email-outline" />{{ detailData.email|| '--' }}
              </el-tag>
            </el-tooltip>
          </div>
        </div>
      </wk-detail-header>
      <el-tabs
        v-model="tabCurrentName"
        style="flex: 1"
        class="side-detail__tabs--default">
        <el-tab-pane
          label="详细资料"
          name="baseInfo"
          lazy>
          <wk-base-detail
            :list="baseList"
          />
        </el-tab-pane>
        <el-tab-pane
          label="材料附件"
          name="file"
          lazy>
          <candidate-file
            :id="id"
            :detail="detailData"
          />
        </el-tab-pane>
        <el-tab-pane
          label="操作记录"
          name="handle"
          lazy>
          <candidate-handle
            :id="id"
          />
        </el-tab-pane>
      </el-tabs>
    </flexbox>

    <candidate-create-view
      v-if="isCreate"
      :detail="detailData"
      @success="getDetial"
      @close="isCreate=false"/>
  </slide-view>
</template>

<script>
import {
  hrmRecruitCandidateQueryByIdAPI
} from '@/api/hrm/recruit/candidate'

import SlideView from '@/components/SlideView'
import WkDetailHeader from '@/components/WkDetailHeader'
import WkBaseDetail from '@/components/WkBaseDetail'
import CandidateHandle from './components/CandidateHandle'
import CandidateFile from './components/CandidateFile'
import CandidateCreateView from './Create'
import candidateModel from '../model/candidate'

import { mapGetters } from 'vuex'

export default {
  // 候选人
  name: 'CandidateDetail',
  components: {
    SlideView,
    WkDetailHeader,
    WkBaseDetail,
    CandidateHandle,
    CandidateFile,
    CandidateCreateView
  },
  props: {
    // 详情信息id
    id: [String, Number],
    // 监听的dom 进行隐藏详情
    listenerIDs: {
      type: Array,
      default: () => {
        return ['crm-main-container']
      }
    },
    // 不监听
    noListenerIDs: {
      type: Array,
      default: () => {
        return []
      }
    },
    noListenerClass: {
      type: Array,
      default: () => {
        return ['el-table__body', 'org-tree-node-label']
      }
    }
  },
  data() {
    return {
      loading: false,
      detailData: null,
      tabCurrentName: 'baseInfo',
      dropdownItems: [{
        icon: 'wk wk-edit',
        label: '编辑',
        command: 'edit'
      }],
      // 编辑操作
      isCreate: false
    }
  },

  computed: {
    ...mapGetters([
      'hrm'
    ]),
    // 维护权限
    manageAuth() {
      return this.hrm.recruit && this.hrm.recruit.manage
    },
    baseList() {
      if (this.detailData) {
        const fieldList = []
        for (let index = 0; index < candidateModel.fields.length; index++) {
          const field = candidateModel.fields[index]
          const temp = {}
          temp.label = field.name
          temp.value = this.fieldFormatter(this.detailData, field.field)
          fieldList.push(temp)
        }
        fieldList.push({
          label: '状态',
          value: this.fieldFormatter(this.detailData, 'status')
        })
        return [
          {
            name: '',
            list: fieldList
          }]
      }
      return []
    }
  },
  watch: {
    id() {
      this.detailData = null
      this.getDetial()
    }
  },
  mounted() {},

  beforeDestroy() {},
  methods: {
    viewAfterEnter() {
      this.getDetial()
    },

    /**
     * 详情
     */
    getDetial() {
      this.loading = true
      hrmRecruitCandidateQueryByIdAPI(this.id)
        .then(res => {
          this.detailData = res.data || {}
          this.loading = false
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },

    /**
     * 格式化字段
     */
    fieldFormatter(row, field) {
      const valueObj = candidateModel[`${field}Value`]
      if (valueObj) {
        return valueObj[row[field]] || '--'
      } else if (field == 'postId') {
        return `${row.postName || ''}${row.postStatus === 0 ? '（已停止招聘）' : ''}` || '--'
      } else if (field == 'channelId') {
        return row.channelName || '--'
      } else {
        return row[field] || '--'
      }
    },

    /**
     * 编辑
     */
    editClick() {
      this.isCreate = true
    },

    editSuccess() {
      this.getDetial()
      this.$emit('edit-success')
    },

    /**
     * 更多操作
     */
    commandSelect(command) {},

    /**
     * 关闭
     */
    hideView() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/side-detail.scss';
.employee-header {
  &__top {
    .name {
      font-weight: bold;
      font-size: 20px;
    }

    .post {
      font-size: 12px;
      font-weight: bold;
      margin-left: 8px;
    }
  }

  &__bottom {
    margin-top: 10px;
    .xr-tag {
      color: #42526E;
      border: none;
      /deep/ i {
        font-size: 12px;
        margin-right: 5px;
      }
    }

    .xr-sex-tag {
      border: none;
      /deep/ i {
        color: white;
        font-size: 12px;
      }

      &.is-man {
        background: #3875FF;
      }
      &.is-woman {
        background: #FF3838;
      }
    }
  }
}
</style>
