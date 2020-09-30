<template>
  <create-view :body-style="{height: '100%'}">
    <div
      v-loading="newLoading"
      class="new-journal">
      <div
        slot="header"
        class="header">
        <span class="text">{{ dialogTitle }}</span>
        <i
          class="el-icon-close rt"
          @click="close" />
      </div>
      <div class="content">
        <el-tabs
          v-model="activeName"
          @tab-click="tabClick">
          <el-tab-pane
            v-for="(item, index) in tabsData"
            :label="item.label"
            :name="item.key"
            :key="index" />
        </el-tabs>
        <div class="form">
          <div
            v-for="(item, index) in formList"
            :key="index"
            class="row-list">
            <label class="item-label">{{ item.label }}：</label>
            <el-input
              :autosize="{ minRows: 4}"
              :maxlength="1000"
              v-model="formData[item.model]"
              show-word-limit
              type="textarea"
              placeholder="请输入内容"
              resize="none" />
          </div>
          <!-- 图片附件 -->
          <div class="img-accessory">
            <div class="img-box">
              <el-upload
                ref="imageUpload"
                :action="crmFileSaveUrl"
                :headers="httpHeader"
                :data="{type: 'img', batchId: batchId}"
                :on-preview="handleFilePreview"
                :before-remove="beforeRemove"
                :on-success="imgFileUploadSuccess"
                :file-list="imageFileList"
                name="file"
                multiple
                accept="image/*"
                list-type="picture-card">
                <p class="add-img">
                  <span class="el-icon-picture" />
                  <span>添加图片</span>
                </p>
                <i class="el-icon-plus" />
              </el-upload>
            </div>
            <p class="add-accessory">
              <el-upload
                ref="fileUpload"
                :action="crmFileSaveUrl"
                :headers="httpHeader"
                :data="{type: 'file', batchId: batchId}"
                :on-preview="handleFilePreview"
                :before-remove="handleFileRemove"
                :on-success="fileUploadSuccess"
                :file-list="fileList"
                name="file"
                multiple
                accept="*.*">
                <p>
                  <i class="wukong wukong-file" />
                  添加附件
                </p>
              </el-upload>
            </p>
          </div>
          <div class="sent-who">
            <span class="cursor-default">发送给：</span>
            <span
              v-for="(item, index) in showSendUserList"
              :key="index"
              class="send-user">
              <el-tooltip
                placement="bottom"
                effect="light"
                popper-class="tooltip-change-border">
                <div slot="content">
                  <span>{{ item.realname }}</span>
                </div>
                <xr-avatar
                  :name="item.realname"
                  :size="26"
                  :src="item.img"
                  class="item-img" />
              </el-tooltip>
            </span>
            <members-dep
              :close-dep="true"
              :content-block="false"
              :user-checked-data="formData.sendUserList"
              @popoverSubmit="sendUserChange">
              <span slot="membersDep">
                <el-tooltip
                  placement="bottom"
                  effect="light"
                  popper-class="tooltip-change-border">
                  <div slot="content">
                    <span>{{ `等${formData.sendUserList.length}人` }}</span>
                  </div>
                  <i
                    v-show="formData.sendUserList.length > 5"
                    class="el-icon-more more-user-btn" />
                </el-tooltip>

                <i class="el-icon-plus add-user-btn" />
              </span>

            </members-dep>
          </div>
          <related-business
            :margin-left="'0'"
            :all-data="allData"
            @checkInfos="checkInfos" />
        </div>
      </div>
      <div class="btn-group">
        <el-button
          type="primary"
          @click="submitBtn">提交</el-button>
        <el-button @click="close">取消</el-button>
      </div>
    </div>
  </create-view>
</template>

<script>
import axios from 'axios'
import { crmFileDeleteAPI, crmFileSaveUrl } from '@/api/common'
import { guid, getImageData } from '@/utils'
import CreateView from '@/components/CreateView'
// 部门员工优化版
import MembersDep from '@/components/SelectEmployee/MembersDep'
// 相关信息 - 选中列表
import RelatedBusiness from '@/components/RelatedBusiness'

export default {
  components: {
    CreateView,
    MembersDep,
    RelatedBusiness
  },
  props: {
    formData: Object,
    dialogTitle: {
      type: String,
      default: '写日志'
    },
    // 附件
    accessoryFileList: {
      type: Array,
      default: () => {
        return []
      }
    },
    imgFileList: {
      type: Array,
      default: () => {
        return []
      }
    },
    newLoading: Boolean
  },
  data() {
    return {
      activeName: '1',
      tabsData: [
        { label: '日报', key: '1' },
        { label: '周报', key: '2' },
        { label: '月报', key: '3' }
      ],
      // 表格数据
      formList: [],
      dateList: [
        { label: '今日工作内容', model: 'content' },
        { label: '明日工作内容', model: 'tomorrow' },
        { label: '遇到的问题', model: 'question' }
      ],
      weekList: [
        { label: '本周工作内容', model: 'content' },
        { label: '下周工作内容', model: 'tomorrow' },
        { label: '遇到的问题', model: 'question' }
      ],
      monthList: [
        { label: '本月工作内容', model: 'content' },
        { label: '下月工作内容', model: 'tomorrow' },
        { label: '遇到的问题', model: 'question' }
      ],
      batchId: guid(),
      imageFileList: [],
      fileList: [],
      // 发送给谁
      dialogVisible: false,
      // 获取选择的数据id数组
      relevanceAll: {},
      allData: {}
    }
  },
  computed: {
    crmFileSaveUrl() {
      return crmFileSaveUrl
    },
    httpHeader() {
      return {
        'Admin-Token': axios.defaults.headers['Admin-Token']
      }
    },

    showSendUserList() {
      if (this.formData) {
        if (this.formData.sendUserList && this.formData.sendUserList.length > 5) {
          return this.formData.sendUserList.slice(0, 5)
        }
        return this.formData.sendUserList || []
      }
      return []
    }
  },
  mounted() {
    document.body.appendChild(this.$el)
    this.formList = this.dateList

    // 确定显示哪一种日志
    if (this.formData.categoryId) {
      switch (this.formData.categoryId) {
        case 1:
          this.tabsData = [{ label: '日报', key: '1' }]
          this.formList = this.dateList
          this.activeName = '1'
          break
        case 2:
          this.tabsData = [{ label: '周报', key: '2' }]
          this.formList = this.weekList
          this.activeName = '2'
          break
        case 3:
          this.tabsData = [{ label: '月报', key: '3' }]
          this.formList = this.monthList
          this.activeName = '3'
          break
      }
    }

    if (this.dialogTitle != '写日志' && this.formData.batchId) {
      this.batchId = this.formData.batchId
    }

    // 编辑时引用 - 自动勾选
    var allData = {}
    allData.business = (this.formData.businessList || []).map(item => {
      if (item.id) {
        item.businessId = item.id
      }
      return item
    })
    allData.contacts = (this.formData.contactsList || []).map(item => {
      if (item.id) {
        item.contactsId = item.id
      }
      return item
    })
    allData.contract = (this.formData.contractList || []).map(item => {
      if (item.id) {
        item.contractId = item.id
      }
      return item
    })
    allData.customer = (this.formData.customerList || []).map(item => {
      if (item.id) {
        item.customerId = item.id
      }
      return item
    })
    this.allData = allData
    var relevanceAll = {}
    relevanceAll.businessIds = allData.business.map(item => item.businessId)
    relevanceAll.contactsIds = allData.contacts.map(item => item.contactsId)
    relevanceAll.contractIds = allData.contract.map(item => item.contractId)
    relevanceAll.customerIds = allData.customer.map(item => item.customerId)
    this.relevanceAll = relevanceAll

    this.imageFileList = this.imgFileList.map(item => item)

    for (let index = 0; index < this.imageFileList.length; index++) {
      this.setImageList(this.imageFileList[index], index)
    }


    this.fileList = this.accessoryFileList.map(item => item)
  },
  destroyed() {
    // remove DOM node after destroy
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    /**
     * 获取图片内容
     */
    setImageList(item, index) {
      getImageData(item.url).then((data) => {
        item.url = data.src
        this.imageFileList.splice(index, 1, item)
      }).catch(() => {})
    },

    close() {
      if (this.$route.query.routerKey == 1) {
        this.$router.go(-1)
      } else {
        this.$emit('close')
      }
    },
    tabClick() {
      switch (this.activeName) {
        case '1':
          this.formList = this.dateList
          break
        case '2':
          this.formList = this.weekList
          break
        case '3':
          this.formList = this.monthList
          break
      }
    },
    // 提交按钮
    submitBtn() {
      if (
        this.formData.content ||
        this.formData.tomorrow ||
        this.formData.question
      ) {
        this.$emit(
          'submitBtn',
          this.activeName,
          this.batchId,
          this.relevanceAll
        )
      } else {
        this.$message.error('内容至少填写一项')
      }
    },
    // 图片和附件
    // 上传图片
    imgFileUploadSuccess(response, file, fileList) {
      this.imageFileList = fileList
    },
    // 查看图片
    handleFilePreview(file) {
      if (file.response || file.fileId) {
        let perviewFile
        if (file.response) {
          perviewFile = file.response.data
        } else {
          perviewFile = file
        }
        this.$bus.emit('preview-image-bus', {
          index: 0,
          data: [perviewFile]
        })
      }
    },
    beforeRemove(file, fileList) {
      if (file.response || file.fileId) {
        let fileId
        if (file.response) {
          fileId = file.response.data.fileId
        } else {
          fileId = file.fileId
        }
        this.$confirm('您确定要删除该文件吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            crmFileDeleteAPI({
              id: fileId
            })
              .then(res => {
                this.$message.success('操作成功')
                var removeIndex = this.getFileIndex(
                  this.$refs.imageUpload.uploadFiles,
                  fileId
                )
                if (removeIndex != -1) {
                  this.$refs.imageUpload.uploadFiles.splice(removeIndex, 1)
                }
                removeIndex = this.getFileIndex(this.imgFileList, fileId)
                if (removeIndex != -1) {
                  this.imgFileList.splice(removeIndex, 1)
                }
              })
              .catch(() => {})
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消操作'
            })
          })
        return false
      } else {
        return true
      }
    },
    // 附件索引
    getFileIndex(files, fileId) {
      var removeIndex = -1
      for (let index = 0; index < files.length; index++) {
        const item = files[index]
        let itemFileId
        if (item.response) {
          itemFileId = item.response.data.fileId
        } else {
          itemFileId = item.fileId
        }
        if (itemFileId == fileId) {
          removeIndex = index
          break
        }
      }
      return removeIndex
    },
    fileUploadSuccess(response, file, fileList) {
      this.fileList = fileList
    },
    handleFileRemove(file, fileList) {
      if (file.response || file.fileId) {
        let fileId
        if (file.response) {
          fileId = file.response.data.fileId
        } else {
          fileId = file.fileId
        }
        this.$confirm('您确定要删除该文件吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            crmFileDeleteAPI({
              id: fileId
            })
              .then(res => {
                this.$message.success('操作成功')
                var removeIndex = this.getFileIndex(
                  this.$refs.fileUpload.uploadFiles,
                  fileId
                )
                if (removeIndex != -1) {
                  this.$refs.fileUpload.uploadFiles.splice(removeIndex, 1)
                }
                removeIndex = this.getFileIndex(this.fileList, fileId)
                if (removeIndex != -1) {
                  this.fileList.splice(removeIndex, 1)
                }
              })
              .catch(() => {})
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消操作'
            })
          })
        return false
      } else {
        return true
      }
    },
    sendUserChange(members, dep) {
      this.formData.sendUserList = members
      // this.$set(this.formData, 'sendUserList', members)
      // this.$set(this.formData, 'depData', dep)
    },
    // 取消
    handleClose() {
      this.dialogVisible = false
    },
    checkInfos(val) {
      this.relevanceAll = val
    }
  }
}
</script>

<style scoped lang="scss">
.new-journal {
  display: flex;
  flex-direction: column;
  height: 100%;
  .header {
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    .el-icon-close {
      display: block;
      font-size: 24px;
      color: #909399;
      margin-right: -10px;
      padding: 10px;
      cursor: pointer;
    }

    .el-icon-close:hover {
      color: $xr-color-primary;
    }

    .text {
      font-size: 17px;
      font-weight: bold;
    }
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 20px;
  }
  .btn-group {
    text-align: right;
    padding-right: 20px;
  }
  .content /deep/ .el-tabs {
    .el-tabs__header {
      .el-tabs__item {
        height: 50px;
        line-height: 50px;
      }
      .el-tabs__nav {
        margin-left: 20px;
        font-size: 13px;
      }
      .el-tabs__nav-wrap::after {
        height: 1px;
      }
    }
    .el-tabs__content {
      padding: 0 20px;
    }
  }
}

.form {
  flex: 1;
  margin-top: 10px;
  padding: 0 20px;
  overflow-y: scroll;
  .row-list {
    margin-bottom: 20px;
    padding-bottom: 10px;
    .item-label {
      margin-bottom: 9px;
      display: block;
      font-size: 12px;
      // padding-bottom: 10px;
    }
    .el-textarea {
      .el-textarea__inner {
        resize: none;
      }
    }
  }
  .img-accessory {
    font-size: 12px;
    img {
      vertical-align: middle;
    }
    .img-box /deep/ .el-upload {
      width: 80px;
      height: 80px;
      line-height: 90px;
    }
    .img-box /deep/ .el-upload-list {
      .el-upload-list__item {
        width: 80px;
        height: 80px;
      }
    }
    .img-box {
      position: relative;
      margin-top: 40px;
      .add-img {
        position: absolute;
        left: 0;
        top: -30px;
        height: 20px;
        line-height: 20px;
        margin-bottom: 10px;
        color: #2362fb;
      }
    }
    .add-accessory {
      margin-top: 25px;
      margin-bottom: 20px;
      color: #2362fb;

      .wukong-file {
        font-size: 13px;
      }
    }
  }
  .sent-who {
    margin-bottom: 15px;

    .add-user-btn {
      border: 1px dotted #666;
      border-radius: 50%;
      padding: 5px;
      font-size: 12px;
      transform: scale(0.8);
      margin-left: 7px;
    }
    &:hover {
      color: $xr-color-primary;
      .add-user-btn {
        border-color: $xr-color-primary;
      }
    }

    // 参与人
    .send-user {
      position: relative;
      display: inline-block;

      .item-img {
        vertical-align: middle;
      }
    }

    .send-user + .send-user {
      margin-left: 7px;
    }

    .more-user-btn {
      background-color: #f3f7ff;
      border-radius: 50%;
      padding: 5px;
      font-size: 12px;
      color: #666;
      margin-left: 7px;
      &:hover {
        background-color: $xr-color-primary;
        color: white;
      }
    }

    .cursor-default {
      cursor: default;
      color: #666;
    }
  }
}
</style>
