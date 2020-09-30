<template>
  <div class="project-settings">
    <el-popover
      v-model="projectSetShow"
      placement="bottom-start"
      width="400"
      popper-class="no-padding-popover"
      trigger="click">
      <div
        v-loading="loading"
        class="project-settings-box">
        <p class="project-settings-title-top">
          <span>项目设置</span>
          <span
            class="el-icon-close rt"
            @click="close"/>
        </p>
        <div class="content">
          <p class="title-checked">
            <span
              :class="{'is-select ': tabType == 'base'}"
              class="span-item"
              @click="tabType = 'base'">基础设置</span>
            <span
              v-if="isOpen == 0"
              :class="{'is-select ': tabType == 'member'}"
              class="span-item"
              @click="tabType = 'member'">成员管理</span>
          </p>
          <!-- 基础设置 -->
          <div
            v-show="tabType == 'base'"
            class="infrastructure">
            <div class="row">
              <span class="label name">项目名称</span>
              <div class="color-dynamic">
                <el-input
                  v-model="setTitle"
                  :maxlength="50"
                  size="mini"/>
                <span
                  :style="{background: setColor}"
                  class="dynamic-span"/>
              </div>
            </div>
            <div class="row">
              <span class="label">图标颜色</span>
              <div class="color-box">
                <span
                  v-for="(item, index) in colorList"
                  :key="index"
                  :style="{background: item}"
                  @click="setColor = item"/>
              </div>
            </div>
            <div class="row">
              <span class="label name">可见范围</span>
              <div class="color-dynamic">
                <el-select
                  v-model="setIsOpen">
                  <el-option
                    v-for="item in openOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"/>
                </el-select>
              </div>
            </div>
            <div v-if="setIsOpen == 1" class="row">
              <span class="label name">成员权限</span>
              <div class="color-dynamic">
                <el-select
                  v-model="ownerRole">
                  <el-option
                    v-for="item in projectRoleList"
                    :key="item.roleId"
                    :label="`${item.roleName}：${item.remark}`"
                    :value="item.roleId"/>
                </el-select>
              </div>
            </div>
          </div>
          <div
            v-show="tabType == 'member'"
            class="add-members">
            <members-dep
              v-if="permission.setTaskOwnerUser && projectSetShow"
              :close-dep="true"
              :content-block="false"
              :user-checked-data="membersList"
              @popoverSubmit="userSelectChange">
              <div
                slot="membersDep"
                class="img-span">
                <el-button
                  type="text"
                  class="add-btn"
                  icon="wk wk-add">添加成员</el-button>
              </div>
            </members-dep>

            <div class="member-section">
              <div
                v-for="(item, index) in membersList"
                :key="index"
                class="member-row">
                <xr-avatar
                  :name="item.realname"
                  :size="24"
                  :src="item.img"
                  class="user-img" />
                <span class="member-row-name">{{ item.realname }}</span>
                <div class="rt">
                  <el-select
                    v-model="item.roleId"

                    size="mini">
                    <el-option
                      v-for="val in optionList"
                      :key="val.roleId"
                      :label="val.roleName"
                      :value="val.roleId"/>
                  </el-select>
                  <span
                    v-if="permission.setTaskOwnerUser"
                    class="el-icon-close"
                    @click="deleteMember(item, index)"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <el-button
            type="primary"
            @click="submite">确定</el-button>
          <el-button @click="close">取消</el-button>
        </div>
      </div>
      <p
        slot="reference"
        class="title"
        @click="projectSetting">项目设置</p>
    </el-popover>
  </div>
</template>

<script>
import {
  workWorkUpdateAPI,
  workWorkOwnerDelAPI,
  workWorkAddUserGroupAPI,
  workWorkGroupListAPI
} from '@/api/pm/project'
import {
  systemRoleQueryProjectRoleListAPI
} from '@/api/admin/project'

import MembersDep from '@/components/SelectEmployee/MembersDep'

import { objDeepCopy } from '@/utils'

export default {
  components: {
    MembersDep
  },

  props: {
    workId: [Number, String],
    title: String,
    color: String,
    isOpen: [Number, String],
    // 人员数据
    addMembersData: Array,
    name: {
      type: Array,
      default: () => {
        return []
      }
    },
    permission: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      loading: false,
      // 是否显示弹出框
      projectSetShow: false,
      colorList: [
        '#53D397',
        '#20C1BD',
        '#58DADA',
        '#0FC9E7',
        '#3498DB',
        '#4586FF',
        '#8983F3',
        '#AEA1EA',
        '#FF6699',
        '#F24D70',
        '#FF6F6F'
      ],
      tabType: 'base', // base 基础设置 member 成员设置
      // 动态背景
      setColor: '',
      setTitle: '',
      setIsOpen: 0,
      openOptions: [
        {
          value: 0,
          label: '私有：只有加入的成员才能看见此项目'
        },
        {
          value: 1,
          label: '公开：企业所有成员都可以看见此项目'
        }
      ],
      membersList: [],
      // 角色权限
      optionList: [],
      // 成员权限
      ownerRole: '',
      projectRoleList: []
    }
  },

  watch: {
    addMembersData() {
      this.membersList = objDeepCopy(this.addMembersData || [])
    },

    projectSetShow(val) {
      if (val) {
        this.membersList = objDeepCopy(this.addMembersData || [])
      }
    },

    tabType(val) {
      if (val == 'member' && this.optionList.length == 0) {
        this.getGroupList()
      }
    }
  },

  created() {
    this.membersList = objDeepCopy(this.addMembersData || [])
    this.getProjectRoleList()
  },

  beforeDestroy() {},

  methods: {
    /**
     * 获取项目角色列表
     */
    getGroupList() {
      workWorkGroupListAPI()
        .then(res => {
          this.optionList = res.data || []
        })
        .catch(() => {})
    },

    /**
     * 点击项目设置
     */
    projectSetting() {
      this.setColor = this.color
      this.setTitle = this.title
      this.setIsOpen = this.isOpen
      this.tabType = 'base'
      this.$emit('click')
    },

    /**
     * 设置提交 base 基础设置
     */
    submite() {
      if (this.tabType == 'base') {
        this.loading = true
        const params = {
          name: this.setTitle,
          color: this.setColor,
          isOpen: this.setIsOpen,
          workId: this.workId
        }
        if (this.setIsOpen == 1) {
          params.ownerRole = this.ownerRole
        }
        workWorkUpdateAPI(params)
          .then(res => {
            this.loading = false
            this.$message.success('操作成功')
            this.$emit('submite', this.setTitle, this.setColor, this.setIsOpen)
            this.close()
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        for (let index = 0; index < this.membersList.length; index++) {
          const element = this.membersList[index]
          if (!element.roleId) {
            return
          }
        }
        this.loading = true
        workWorkAddUserGroupAPI({
          list: this.membersList,
          workId: this.workId
        })
          .then(res => {
            this.loading = false
            this.$message.success('操作成功')
            this.$emit('handle', 'member')
            this.close()
          })
          .catch(() => {
            this.loading = false
          })
      }
    },

    /**
     * 关闭弹窗
     */
    close() {
      this.projectSetShow = false
      this.$emit('close')
    },

    /**
     * 编辑成员
     */
    userSelectChange(members, dep) {
      const selectIds = this.membersList.map(item => item.userId)

      const roleItem = this.optionList.length > 0 ? this.optionList[0] : null
      const membersList = []

      members.forEach(item => {
        const memder = this.getSelectMemberRole(selectIds, item)
        if (memder) {
          item.roleId = memder.roleId
          item.roleName = memder.roleName
        } else {
          item.roleId = roleItem ? roleItem.roleId : ''
          item.roleName = roleItem ? roleItem.roleName : ''
        }
        membersList.push(item)
      })

      this.membersList = membersList
    },

    /**
     * 获取之前已经选择的人的角色填充
     */
    getSelectMemberRole(selectIds, member) {
      if (selectIds.includes(member.userId)) {
        return this.membersList.find(item => item.userId)
      }

      return null
    },

    /**
     * 删除一个成员
     */
    deleteMember(data, index) {
      workWorkOwnerDelAPI({
        workId: this.workId,
        ownerUserId: data.userId
      }).then(res => {
        this.membersList.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {})
    },

    /**
     * 获取列表数据
     */
    getProjectRoleList() {
      this.loading = true
      systemRoleQueryProjectRoleListAPI()
        .then(res => {
          this.projectRoleList = res.data || []
          if (this.projectRoleList.length) {
            this.ownerRole = this.projectRoleList[0].roleId
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
.project-settings {
  .title {
    height: 34px;
    line-height: 34px;
    cursor: pointer;
    padding-left: 32px;
  }
  .title:hover {
    background: #f7f8fa;
    color: #2362FB;
  }
}
.project-settings-box {
  .project-settings-title-top {
    padding: 20px;
    padding-bottom: 10px;
    line-height: 24px;
    font-size: 16px;
    color: #333;
    font-weight: 600;

    .el-icon-close {
      color: #909399;
      cursor: pointer;
      font-weight: 600;
      font-size: 18px;
      margin-right: 0;
    }

    .el-icon-close:hover {
      color: $xr-color-primary;
    }
  }
  .content {
    padding: 30px 20px;
    padding-top: 0;
    .title-checked {
      text-align: center;
      margin: 5px 0;
      .span-item {
        font-size: 14px;
        display: inline-block;
        padding-bottom: 3px;
        color: #333;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      .span-item + .span-item {
        margin-left: 15px;
      }

      .span-item.is-select {
        color: $xr-color-primary;
        border-bottom-color: $xr-color-primary;
      }
    }
    .infrastructure {
      .row {
        display: flex;
        flex-direction: row;
        margin-top: 10px;
        .el-textarea {
          flex: 1;
        }
        .label {
          margin-right: 10px;
          font-size: 13px;
        }
        .color-box {
          span {
            display: inline-block;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            margin-right: 7px;
            cursor: pointer;
          }
        }
        .name {
          line-height: 28px;
        }
        .color-dynamic {
          flex: 1;
          position: relative;
          .dynamic-span {
            position: absolute;
            left: 10px;
            top: 6px;
            display: inline-block;
            width: 15px;
            height: 15px;
            border-radius: 50%;
          }
          .el-input /deep/ .el-input__inner {
            padding-left: 30px;
          }

          .el-select {
            width: 100%;
          }
        }
      }
    }
    .add-members {
      .rt {
        margin-right: 0;
        .el-icon-close {
          margin-left: 10px;
          color: #cccccc;
          font-size: 16px;
        }
      }
      .img-span {
        margin-bottom: 15px;
        margin-left: 10px;
        .add-btn {
          vertical-align: middle;
          /deep/ i {
            margin-right: 5px;
          }
        }
      }

      .member-section {
        max-height: 300px;
        overflow-y: auto;
        .member-row {
          position: relative;
          margin-bottom: 10px;
          padding: 0 10px;
          .member-row-name {
            display: inline-block;
            width: 70px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            vertical-align: middle;
          }
          .user-img {
            vertical-align: middle;
            margin-right: 5px;
          }
          .el-icon-close {
            cursor: pointer;
          }

          .el-icon-close:hover {
            color: $xr-color-primary;
          }
        }
      }
    }
  }
  .footer {
    padding: 10px;
    background-color: #F7F8FA;
    border-top: 1px solid #e6e6e6;
    text-align: right;
  }
}
</style>

