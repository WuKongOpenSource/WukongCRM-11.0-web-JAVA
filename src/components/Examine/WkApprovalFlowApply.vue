<template>
  <div v-if="data && data.length === 0" style="color: #666;">审核人为空，审核将自动通过。</div>
  <el-timeline v-else>
    <el-timeline-item
      v-for="(flow, index) in data"
      :key="index"
      class="wk-approval-item">
      <div class="wk-approval-item__header">{{ flow.name }}<span>{{ getExamineTypeName(flow.examineType) }}</span></div>
      <div class="wk-approval-item__body">
        <template v-if="flow.examineType === 4">
          <flexbox
            class="user-wrap"
            wrap="wrap">
            <div
              v-for="(item, index) in flow.values"
              :key="index"
              class="user">
              <xr-avatar
                :name="item.realname"
                :size="40"
                :src="item.img"
              />
              <div class="user__name">{{ item.realname }}</div>
              <div class="user__step">{{ (index+1)|step }}</div>
              <i class="user__delete el-icon-close" @click="deleteUserClick(index, flow.values)" />
            </div>
            <div
              v-if="(flow.chooseType === 1 && flow.values.length === 0) ||
              (flow.chooseType === 2 && flow.values.length < 20)"
              class="user">
              <el-button
                class="user__img" icon="el-icon-plus" style="margin-bottom: 2px;" circle
                @click="selectUserClick(flow)"/>
              <div class="user__name">{{ getSelfSelectName(flow) }}</div>
              <div class="user__step">{{ (flow.values.length + 1)|step }}</div>
            </div>
          </flexbox>
        </template>
        <template v-else-if="flow.examineType === 1 || flow.examineType === 3">
          <flexbox
            v-if="flow.userList.length === 1"
            class="user-wrap"
            wrap="wrap">
            <div
              v-for="(item, index) in flow.userList"
              :key="index"
              class="user">
              <xr-avatar
                :name="item.realname"
                :size="40"
                :src="item.img"
              />
              <div class="user__name">{{ item.realname }}</div>
              <div class="user__step">{{ (index+1)|step }}</div>
            </div>
          </flexbox>
          <flexbox
            v-else
            class="user-wrap"
            wrap="wrap">
            <el-popover
              :disabled="flow.userList.length==0"
              :content="flow.userList|contentFilters"
              placement="bottom"
              trigger="hover">
              <div
                slot="reference"
                class="user">
                <img class="user__img" src="@/assets/img/examine_head.png" >
                <div class="user__name">{{ flow.userList.length }}人{{ getWayTypeName(flow.type) }}</div>
                <div class="user__step">第一级</div>
              </div>
            </el-popover>
          </flexbox>
        </template>
        <template v-else-if="flow.examineType === 2 || flow.examineType === 5">
          <flexbox
            v-if="flow.userList.length > 0"
            class="user-wrap"
            wrap="wrap">
            <div
              v-for="(item, index) in flow.userList"
              :key="index"
              class="user">
              <xr-avatar
                :name="item.realname"
                :size="40"
                :src="item.img"
              />
              <div class="user__name">{{ item.realname }}</div>
              <div class="user__step">{{ (index+1)|step }}</div>
            </div>
          </flexbox>
          <flexbox
            v-else
            class="user-wrap"
            wrap="wrap">
            <div
              class="user">
              <img class="user__img" src="@/assets/img/examine_head.png" >
              <div class="user__name">XX</div>
              <div class="user__step">第一级</div>
            </div>
          </flexbox>
        </template>
      </div>
    </el-timeline-item>

    <wk-dep-user-view-dialog
      v-if="depUserViewDialogShow"
      :props="{
        canSelectDep: false,
        userOptions: userOptions,
        searchParams: {status: 1},
        request: userRequest,
        radio: true
      }"
      :user-value="userList"
      :visible.sync="depUserViewDialogShow"
      @change="selectUserChange"
    />
  </el-timeline>
</template>

<script>
import {
  adminUserQueryDeptUserByExamineAPI
} from '@/api/admin/user'

import WkUserSelect from '@/components/NewCom/WkUserSelect'
import WkDepUserViewDialog from '@/components/NewCom/WkUserSelect/DepDialog'

import { examineTypeObj, wayTypeObj } from '@/components/ApprovalFlow/nodeModel'
import Nzhcn from 'nzh/cn'

export default {
  // 审批流的应用参数
  name: 'WkApprovalFlowApply',

  components: {
    WkUserSelect,
    WkDepUserViewDialog
  },

  filters: {
    step: function(index) {
      return '第' + Nzhcn.encodeS(index) + '级'
    },

    contentFilters: function(array) {
      return array
        .map(item => item.realname)
        .join('、')
    }
  },

  props: {
    data: Array
  },

  data() {
    return {
      userList: [],
      userOptions: [],
      editItem: null,
      depUserViewDialogShow: false
    }
  },

  computed: {
    userRequest() {
      return adminUserQueryDeptUserByExamineAPI
    }
  },

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 获取审批类型名称
     */
    getExamineTypeName(examineType) {
      return examineTypeObj[examineType]
    },

    /**
     * 获取或并方式
     */
    getWayTypeName(type) {
      return wayTypeObj[type]
    },

    /**
     * 选择员工
     */
    selectUserClick(item) {
      this.userOptions = item.rangeType === 1 ? null : item.userList
      this.editItem = item
      this.depUserViewDialogShow = true
    },

    /**
     * 选择员工change
     */
    selectUserChange(users) {
      if (users.length) {
        const userIds = this.editItem.values.map(item => item.userId)
        if (!userIds.includes(users[0].userId)) {
          this.editItem.values.push(users[0])
        }
      }
    },

    /**
     * 获取自选名称
     */
    getSelfSelectName(data) {
      if (data.chooseType === 1) {
        return '选择员工'
      } else if (data.chooseType === 2) {
        return {
          2: '多人会签',
          3: '多人或签'
        }[data.type] || '选择员工'
      }
    },

    /**
     * 删除user
     */
    deleteUserClick(index, list) {
      list.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-approval-item{
  &__header {
    span {
      font-size: 12px;
      background: #fd715a;
      color: white;
      line-height: 18px;
      padding: 0 8px;
      border-radius: 9px;
      transform: scale(0.8, 0.8);
      display: inline-block;
    }
  }

  &__body {
    margin-top: 5px;

    .user-wrap {
      padding: 0px 10px;
      text-align: center;
      .user {
        padding: 10px 20px 10px 0;
        position: relative;
        .user__img {
          width: 40px;
          height: 40px;
          border-radius: 20px;
        }
        .user__name {
          color: #777777;
          font-size: 12px;
          padding: 2px 0;
          transform: scale(0.8, 0.8);
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .user__step {
          color: #333333;
          font-size: 12px;
        }

        &__delete {
          position: absolute;
          background-color: #b2b2b2;
          color: white;
          font-size: 12px;
          border-radius: 6px;
          cursor: pointer;
          top: 12px;
          right: 25px;
          visibility: hidden;
          &:hover {
            background-color: $xr-color-primary;
          }
        }

        &:hover {
          .user__delete {
            visibility: visible;
          }
        }
      }
    }
  }
}
</style>
