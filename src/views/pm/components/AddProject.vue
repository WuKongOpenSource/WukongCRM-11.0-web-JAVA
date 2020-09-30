<template>
  <create-view
    v-loading="loading"
    :body-style="{height: '100%'}">
    <flexbox
      direction="column"
      align="stretch"
      class="add-project">
      <div
        class="header">
        <span class="text">{{ title }}</span>
        <span
          class="el-icon-close"
          @click="close"/>
      </div>
      <div class="content">
        <div class="project-name">
          <div class="label color-label">项目名称</div>
          <el-input
            v-model="name"
            :maxlength="50"
            placeholder="请输入内容">
            <i
              slot="prefix"
              class="el-input__icon">
              <span
                :style="{'background': typeColor}"
                class="bg-color"/>
            </i>
          </el-input>
          <div class="color-box">
            <span
              v-for="(item, index) in typeColorList"
              :key="index"
              :style="{'background': item}"
              @click="typeColor = item"/>
          </div>
        </div>

        <div class="cover">
          <div class="label">项目封面</div>
          <flexbox
            :gutter="0"
            align="stretch"
            wrap="wrap"
            class="cover-content">
            <flexbox-item
              v-for="(item, index) in coverImgList"
              :key="index"
              :span="0.25"
              :class="{'select': coverImg.url == item.url}"
              class="cover-content-item"
              @click.native="corverSelect(item)">
              <img v-src="item.url" class="cover-img">
              <i class="wk wk-success cover-select" />
              <i v-if="item.custom && !coverImg.custom" class="wk wk-close cover-delete" @click.stop="corverDelete" />
            </flexbox-item>
            <flexbox-item
              v-loading="imgLoading"
              v-if="coverImgList.length <= 8"
              :span="0.25"
              class="content-cross"
              @click.native="upLoadCustomImg">
              <input
                ref="imageInput"
                accept="image/*"
                type="file"
                class="file-input"
                @change="customImgChange">
              <el-button
                type="text"
                icon="el-icon-plus"
                class="cross"/>
            </flexbox-item>
          </flexbox>
        </div>

        <div class="describe">
          <div class="label">项目描述</div>
          <el-input
            :rows="4"
            v-model="description"
            :maxlength="300"
            show-word-limit
            type="textarea"
            placeholder="请输入内容"/>
        </div>
        <div class="range">
          <div class="label">可见范围</div>
          <el-select
            v-model="openType">
            <el-option
              v-for="item in openOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </div>
        <div v-if="openType == 1" class="describe">
          <div class="label">成员权限</div>
          <el-select
            v-model="ownerRole">
            <el-option
              v-for="item in projectRoleList"
              :key="item.roleId"
              :label="`${item.roleName}：${item.remark}`"
              :value="item.roleId"/>
          </el-select>
        </div>
        <div
          v-if="openType == 0"
          class="member">
          <div class="label">项目成员</div>
          <flexbox>
            <xr-avatar
              v-for="(user, userIndex) in selectUserList"
              :key="userIndex"
              :name="user.realname"
              :size="25"
              :src="user.img"
              class="user-img" />
            <members-dep
              :user-checked-data="selectUserList"
              :content-block="false"
              :close-dep="true"
              @popoverSubmit="userSelectChange">
              <i
                slot="membersDep"
                class="el-icon-plus add-user-btn" />
            </members-dep>
          </flexbox>
        </div>
      </div>
      <div class="footer">
        <el-button
          type="primary"
          @click="submitBtn">确定</el-button>
        <el-button @click="close">取消</el-button>
      </div>
    </flexbox>
  </create-view>
</template>
<script>
import { crmFileSaveByBatchIdAPI } from '@/api/common'
import {
  workWorkSaveAPI,
  workWorkUpdateAPI,
  workWorkReadAPI
} from '@/api/pm/project'
import {
  systemRoleQueryProjectRoleListAPI
} from '@/api/admin/project'

import MembersDep from '@/components/SelectEmployee/MembersDep'
import CreateView from '@/components/CreateView'

import { mapGetters } from 'vuex'
import { guid } from '@/utils'

export default {
  components: {
    CreateView,
    MembersDep
  },

  props: {
    enterDetail: Boolean, // 是否跳转详情
    id: [Number, String] // 编辑用
  },

  data() {
    return {
      loading: false,
      name: '',
      batchId: guid(),
      description: '',
      typeColor: '#53D397',
      projectRoleList: [],
      typeColorList: [
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
      imgLoading: false,
      coverImg: null,
      coverImgList: [
        {
          url: 'https://www.72crm.com/api/uploads/project-cover-1.jpg'
        },
        {
          url: 'https://www.72crm.com/api/uploads/project-cover-2.jpg'
        },
        {
          url: 'https://www.72crm.com/api/uploads/project-cover-3.jpg'
        },
        {
          url: 'https://www.72crm.com/api/uploads/project-cover-4.jpg'
        },
        {
          url: 'https://www.72crm.com/api/uploads/project-cover-5.jpg'
        },
        {
          url: 'https://www.72crm.com/api/uploads/project-cover-6.jpg'
        },
        {
          url: 'https://www.72crm.com/api/uploads/project-cover-7.jpg'
        },
        {
          url: 'https://www.72crm.com/api/uploads/project-cover-8.jpg'
        }
      ],
      openType: 0,
      ownerRole: '',
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

      selectUserList: []
    }
  },

  computed: {
    ...mapGetters(['userInfo']),
    title() {
      return this.id ? '编辑项目' : '创建项目'
    }
  },

  created() {
    this.selectUserList.push(this.userInfo)
    this.coverImg = this.coverImgList[0]

    // 是编辑
    if (this.id) {
      this.getDetail()
    }

    this.getProjectRoleList()
  },

  mounted() {
    document.body.appendChild(this.$el)
  },

  destroyed() {
    // if appendToBody is true, remove DOM node after destroy
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },

  methods: {
    /**
     * 获取项目详情
     */
    getDetail() {
      this.loading = true
      workWorkReadAPI({
        workId: this.id
      })
        .then(res => {
          const data = res.data || {}
          this.name = data.name
          this.description = data.description
          this.typeColor = data.color
          this.openType = data.isOpen
          this.ownerRole = data.ownerRole
          if (this.openType == 0) {
            this.selectUserList = data.ownerUser || []
          }

          this.batchId = data.batchId || guid()
          if (data.coverUrl) {
            this.coverImg = {
              custom: data.isSystemCover != 1,
              url: data.coverUrl
            }
            if (data.isSystemCover != 1) {
              this.coverImgList.push({
                custom: true,
                fileId: data.fileId,
                url: data.coverUrl
              })
            }
          } else {
            this.coverImg = this.coverImgList[0]
          }

          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 保存
     */
    submitBtn() {
      if (!this.name) {
        this.$message.error('请输入项目名称')
        return
      }
      this.loading = true
      const params = {
        name: this.name,
        description: this.description,
        color: this.typeColor,
        isOpen: this.openType
      }

      if (this.coverImg.custom) {
        params.isSystemCover = 0
        params.batchId = this.batchId
      } else {
        params.isSystemCover = 1
        params.coverUrl = this.coverImg.url
      }

      if (this.openType == 0) {
        params.ownerUserId = this.selectUserList
          .map(item => {
            return item.userId
          })
          .join(',')
      } else {
        params.ownerRole = this.ownerRole
      }

      if (this.id) {
        params.workId = this.id
      }

      const request = this.id ? workWorkUpdateAPI : workWorkSaveAPI
      request(params)
        .then(res => {
          this.loading = false
          this.$message.success('新建成功')
          this.$emit('save-success')
          const workId = res.data ? res.data.workId : ''
          if (this.enterDetail && workId) {
            this.$bus.emit('add-project', this.name, workId)
            this.close()
            this.$router.push({
              name: 'project-list',
              params: {
                id: workId
              }
            })
          }
          this.close()
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 关闭窗口
     */
    close() {
      this.$emit('close')
    },

    /**
     * 项目成员
     */
    userSelectChange(members, dep) {
      this.selectUserList = members
    },

    /**
     * 封面选择
     */
    corverSelect(item) {
      this.coverImg = item
    },

    /**
     * 上传自定义图片
     */
    upLoadCustomImg() {
      this.$refs.imageInput.click()
    },

    customImgChange() {
      var files = event.target.files
      this.imgLoading = true
      crmFileSaveByBatchIdAPI({
        file: files[0],
        batchId: this.batchId
      }).then(res => {
        this.imgLoading = false
        const data = res.data || {}
        data.custom = true
        this.coverImg = data
        this.coverImgList.push(data)
      }).catch(() => {
        this.imgLoading = false
      })
    },

    corverDelete() {
      this.$confirm('您确定要删除该封面吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.coverImgList.pop()
          this.$message.success('操作成功')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
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
@mixin rt {
  float: right;
  color: #ccc;
  font-size: 26px;
}
$color3: #333;
.add-project {
  position: relative;
  height: 100%;
}
.header {
  overflow: hidden;
  margin-bottom: 15px;
  flex-shrink: 0;
  .text {
    color: $color3;
    font-size: 17px;
    height: 40px;
    line-height: 40px;
    color:#333;
    font-weight: bold;
  }
  .el-icon-close {
    @include rt;
    font-size: 24px;
    color: #909399;
    padding: 10px;
    cursor: pointer;
    &:hover {
      color: $xr-color-primary;
    }
  }
}
.content {
  padding: 0 10px;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  .project-name {
    .color-box {
      margin: 10px 0;
      span {
        display: inline-block;
        width: 15px;
        height: 15px;
        margin-right: 10px;
        border-radius: 50%;
        cursor: pointer;
      }
      span:last-child {
        margin: 0;
      }
    }
    .color-label {
      padding-left: 10px;
      border-left: 2px solid #f56c6c;
    }
    .el-input {
      width: 40%;
    }
    .bg-color {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      display: inline-block;
      vertical-align: middle;
    }
  }
  .label {
    margin-bottom: 12px;
    color: $color3;
    font-size: 13px;
  }
  .range {
    margin: 15px 0;
    .el-select {
      width: 40%;
    }
  }

  .describe {
    margin-top: 12px;

    .el-select {
      width: 40%;
    }
  }

  .cover {
    &-content {
      &-item {
        position: relative;
        .cover-img {
          width: 200px;
          height: 100px;
        }

        .cover-delete,
        .cover-select {
          position: absolute;
          top: 10px;
          right: 15px;
          z-index: 1;
          color: white;
          cursor: pointer;
          visibility: hidden;
        }

        .cover-delete:hover {
          color: $xr-color-primary;
        }

        &.select {
          .cover-select {
            visibility: visible;
          }
        }

        &:hover {
          .cover-delete {
            visibility: visible;
          }
        }
      }
    }

    .content-cross {
      flex-shrink: 0;
      width: 195px;
      height: 100px;
      display: flex;
      cursor: pointer;
      border-radius: $xr-border-radius-base;
      position: relative;
      text-align: center;
      border: 1px #c0ccda dashed;
      margin-bottom: 5px;
      .file-input {
        display: none;
      }
      .cross {
        color: #606266;
        font-size: 20px;
        margin-left: calc(50% - 10px);
      }
    }
  }

  .member {
    img {
      width: 25px;
      cursor: pointer;
    }
    .item-name {
      margin-right: 7px;
    }
    .user-img {
      margin-right: 7px;
    }
    .add-user-btn {
      cursor: pointer;
      border: 1px dotted #666;
      border-radius: 50%;
      padding: 6px 5.5px 5px;
      font-size: 12px;
      transform: scale(0.8);
    }
    .add-user-btn:hover {
      border-color: $xr-color-primary;
    }
  }
}

.footer {
  padding: 5px 20px 0;
  flex-shrink: 0;
  text-align: right;
}
</style>
