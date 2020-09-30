<template>
  <el-dialog
    v-loading="loading"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="编辑跟进记录"
    width="700px"
    custom-class="no-padding-dialog"
    @close="handleCancel">
    <div class="mix-content">
      <div class="mix-content__body">
        <div
          class="mix-content-select">
          <el-select
            v-if="showContacts"
            v-model="selectContactsId"
            clearable
            placeholder="选择联系人">
            <el-option
              v-for="item in contacts"
              :key="item.contactsId"
              :label="item.name"
              :value="item.contactsId" />
          </el-select>
          <el-select
            v-model="followType"
            clearable
            placeholder="选择跟进方式">
            <el-option
              v-for="item in followTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </el-select>
          <el-date-picker
            v-model="nextTime"
            :editable="false"
            type="datetime"
            placeholder="选择下次联系时间"
            value-format="yyyy-MM-dd HH:mm:ss" />
          <common-words @select="commonWordsSelect" />
        </div>
        <div class="i-cont">
          <el-input
            ref="textarea"
            v-model="content"
            :autosize="autosize"
            :maxlength="800"
            type="textarea"
            clearable
            resize="none"
            placeholder="请输入内容"
            @focus="inputFocus" />
        </div>
        <add-image-list
          v-if="imgFiles.length > 0"
          :data="imgFiles"
          @delete="deleteImage"
          @delete-all="deleteAllFile(2)"
          @upload="uploadFile" />
        <add-file-list
          v-if="files.length > 0"
          :data="files"
          @delete="deleteFile"
          @delete-all="deleteAllFile(1)" />
        <add-relate-list
          v-if="business.length > 0"
          :data="business"
          type="business"
          @delete="deleteRelate" />
      </div>

      <div
        class="bar-cont">
        <el-button
          type="text"
          class="handle-button"
          icon="wk wk-picture"
          @click="barClick('img')">图片</el-button>
        <el-button
          type="text"
          class="handle-button"
          icon="wk wk-file"
          @click="barClick('file')">附件</el-button>
        <el-popover
          v-if="showBusiness"
          v-model="showBusinessPopover"
          placement="bottom"
          width="700"
          popper-class="no-padding-popover"
          trigger="click">
          <crm-relative
            ref="crmrelative"
            :show="showBusinessPopover"
            :radio="false"
            :action="businessAction"
            :selected-data="{ 'business': business }"
            crm-type="business"
            @close="showBusinessPopover=false"
            @changeCheckout="checkRelativeInfos" />
          <el-button
            slot="reference"
            type="text"
            icon="wk wk-associate"
            class="handle-button"
            style="margin-left: 10px;"
            @click="barClick('business')">关联商机</el-button>
        </el-popover>
      </div>

      <!-- 附件 -->
      <input
        ref="fileInput"
        accept="*.*"
        type="file"
        class="file-input"
        multiple
        @change="uploadFile">
      <input
        ref="imgInput"
        accept="image/*"
        type="file"
        class="file-input"
        multiple
        @change="uploadFile">
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="handleCancel">取消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { crmFileDeleteAPI, crmFileRemoveByBatchIdAPI } from '@/api/common'
import { crmSettingRecordListAPI } from '@/api/admin/crm'
import { crmActivityUpdateAPI } from '@/api/crm/common'
import { crmCustomerQueryContactsAPI } from '@/api/crm/customer'
import { objDeepCopy } from '@/utils'


import CrmRelative from '@/components/CreateCom/CrmRelative'
import AddImageList from '@/components/QuickAdd/AddImageList'
import AddFileList from '@/components/QuickAdd/AddFileList'
import AddRelateList from '@/components/QuickAdd/AddRelateList'
import CommonWords from '@/components/CommonWords'

import { fileSize, getFileTypeIcon, getFileIconWithSuffix } from '@/utils/index'
import crmTypeModel from '@/views/crm/model/crmTypeModel'

export default {
  /** 跟进记录 下的 添加 有添加框的都需要*/
  name: 'LogEditDialog',
  components: {
    CrmRelative,
    AddImageList,
    AddFileList,
    AddRelateList,
    CommonWords
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    data: Object
  },
  data() {
    return {
      loading: false,
      crmType: '',
      /** 输入法 */
      content: '',
      /** 图片信息 */
      imgFiles: [],
      businessAction: {}, // 关联商机注入的客户信息
      /** 图片信息 */
      files: [],
      /** 关联商机信息 */
      showBusinessPopover: false,
      business: [],
      /** 关联联系人信息 */
      contacts: [],
      selectContactsId: '',
      followTypes: [],
      followType: '',
      // 下次联系时间
      nextTime: '',
      /** 展示关联弹窗 */
      showRelativeType: '',
      batchId: '' // 批次ID
    }
  },
  computed: {
    autosize() {
      return { minRows: 4, maxRows: 8 }
    },

    id() {
      return this.data ? this.data.activityTypeId : ''
    },

    showBusiness() {
      return this.crmType == 'customer'
    },

    showContacts() {
      return this.showBusiness
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          const newCrmType = crmTypeModel.convertTypeToKey(this.data.activityType)
          if (this.crmType != newCrmType) {
            this.crmType = newCrmType
          }
          this.handleDetailInfo(objDeepCopy(this.data))
        }
      },
      immediate: true,
      deep: true
    },

    id: {
      handler() {
        this.businessAction = { type: 'condition', data: { moduleType: this.crmType, customerId: this.id }}
      },
      immediate: true
    }
  },
  created() {
  },

  beforeDestroy() {},
  methods: {
    /**
     * 操作详情数据
     */
    handleDetailInfo(data) {
      if (this.showContacts) {
        this.getContactsList()
      }

      if (this.followTypes.length == 0) {
        this.getLogTypeList()
      }
      this.content = data.content
      this.imgFiles = data.img || []
      const files = data.file || []
      this.files = files.map(item => {
        item.icon = this.getFileTypeIcon(item.name)
        return item
      })


      const businessList = data.businessList || []
      this.business = businessList.map(item => {
        return {
          businessName: item.name,
          businessId: item.id
        }
      })
      this.selectContactsId = data.contactsList && data.contactsList.length ? data.contactsList[0].id : ''
      this.followType = data.category
      this.nextTime = data.nextTime
      this.batchId = data.batchId
    },

    /**
     * 获取图标
     */
    getFileTypeIcon(url) {
      if (!url) return ''
      const temps = url ? url.split('.') : []
      let ext = ''
      if (temps.length > 0) {
        ext = temps[temps.length - 1]
      } else {
        ext = ''
      }

      return getFileIconWithSuffix(ext)
    },

    /**
     * 获取跟进类型详情
     */
    getLogTypeList() {
      crmSettingRecordListAPI()
        .then(res => {
          this.followTypes = res.data.map(item => {
            return {
              value: item,
              label: item
            }
          })
        })
        .catch(() => {})
    },

    /**
     * 获取联系人
     */
    getContactsList() {
      crmCustomerQueryContactsAPI({
        customerId: this.id
      })
        .then(res => {
          this.contacts = res.data.list
        })
        .catch(() => {})
    },

    /**
     * 跟进类型初始值
     */
    getDefalutFollowType() {
      if (this.followTypes && this.followTypes.length > 0) {
        this.followType = this.followTypes[0].value
      } else {
        this.followType = ''
      }
    },

    /**
     * 重置数据
     */
    resetInfo() {
      this.nextTime = ''
      // 输入法
      this.content = ''
      // 图片信息
      this.imgFiles = []
      // 图片信息
      this.files = []
      // 关联商机信息
      this.business = []
      // 关联联系人信息
      this.selectContactsId = this.contactsId || ''
      // 展示关联弹窗
      this.showRelativeType = ''
      this.batchId = ''
      this.getDefalutFollowType()
    },

    /**
     * 常用语选择
     */
    commonWordsSelect(data) {
      if (this.content) {
        this.$confirm('您选中的常用语将覆盖当前填写内容?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'is-particulars'
        })
          .then(() => {
            this.content = data
          })
          .catch(() => {})
      } else {
        this.content = data
      }
    },

    /**
     * 快捷添加按钮
     */
    checkRelativeInfos(data) {
      if (this.showRelativeType == 'business') {
        this.business = data.data
      }
    },
    barClick(type) {
      this.showRelativeType = type
      if (type == 'business') {
        this.showBusinessPopover = true
      } else if (type == 'file') {
        this.$refs.fileInput.click()
      } else if (type == 'img') {
        this.$refs.imgInput.click()
      }
    },

    /**
     * 图片选择出发
     */
    uploadFile(event) {
      var files = event.target.files
      if (files.length) {
        for (let index = 0; index < files.length; index++) {
          const file = files[index]
          if (
            file.type.indexOf('image') == -1 &&
            this.showRelativeType == 'img'
          ) {
            this.$message.error('请上传正确的文件类型')
            return
          }
        }

        var type = event.target.accept == 'image/*' ? 'img' : 'file'
        for (let index = 0; index < files.length; index++) {
          const file = files[index]
          this.uploadFileRequest(file, type)
        }
        event.target.value = ''
      }
    },

    /**
     * 文件上传
     */
    uploadFileRequest(file, type, result) {
      this.$wkUploadFile.upload({
        file: file,
        params: {
          type: type,
          batchId: this.batchId
        }
      }).then(({ res }) => {
        const data = res.data || {}
        data.size = fileSize(file.size)
        if (type == 'img') {
          this.imgFiles.push(data)
        } else {
          data['icon'] = getFileTypeIcon(file)
          this.files.push(data)
        }
        if (result) {
          result()
        }
      }).catch(() => {})
    },

    /**
     * 图片附件删除
     */
    deleteImage(item, index) {
      this.deleteImgOrFile('image', item, index)
    },

    deleteFile(item, index) {
      this.deleteImgOrFile('file', item, index)
    },

    deleteImgOrFile(type, item, index) {
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          crmFileDeleteAPI({
            id: item.fileId
          })
            .then(res => {
              if (type == 'image') {
                this.imgFiles.splice(index, 1)
              } else {
                this.files.splice(index, 1)
              }
              this.$message.success('操作成功')
            })
            .catch(() => {})
        })
        .catch(() => {})
    },

    /**
     * 删除全部 type 1 是附件 2 是图片
     */
    deleteAllFile(type) {
      if (this.batchId) {
        this.$confirm('确定删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            crmFileRemoveByBatchIdAPI({
              batchId: this.batchId,
              type
            })
              .then(res => {
                if (type == 2) {
                  this.imgFiles = []
                } else {
                  this.files = []
                }
                this.$message.success('操作成功')
              })
              .catch(() => {})
          })
          .catch(() => {})
      }
    },

    /**
     * 删除相关
     */
    deleteRelate(data, index) {
      this.business.splice(index, 1)
    },

    inputFocus() {
      this.$nextTick(() => {
        this.$refs.textarea.focus()
        this.$emit('focus')
      })
    },

    /**
     * 发布
     */
    handleConfirm() {
      if (!this.content) {
        this.$message.error('请输入跟进内容')
        return
      }

      const params = {}
      params.activityId = this.data.activityId
      params.activityType = this.data.activityType
      params.activityTypeId = this.id
      params.content = this.content
      params.category = this.followType
      const businessIds = this.business.map(element => {
        return element.businessId || element.id
      })

      params.batchId = this.batchId
      params.businessIds = businessIds.join(',')
      params.contactsIds = this.contactsId

      params.nextTime = this.nextTime || ''
      params.isEvent = 0
      this.loading = true
      crmActivityUpdateAPI(params)
        .then(res => {
          this.loading = false
          this.$message.success('编辑成功')
          this.$emit('save', res.data)
          this.handleCancel()
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 取消选择
     */
    handleCancel() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.mix-content {
  position: relative;
  border: 1px solid $xr-border-line-color;
  border-radius: 3px;
  background-color: white;
  padding: 8px 8px 0;
  margin: 10px 15px 20px;
  &__body {
    height: 40vh;
    overflow-y: auto;
  }
  &-select {
    .el-select {
      width: 110px;
      margin-right: 8px;
    }

    .el-date-editor {
      width: 200px;
      margin-right: 8px;
    }
  }

  .i-cont {
    padding: 8px 0px;
    .wk-write {
      color: $xr-border-line-color;
      font-size: 15px;
    }
  }
}


.i-cont /deep/ .el-textarea__inner {
  border: none;
  padding: 0;
}

/** 底部bar  */
.bar-cont {
  .handle-button {
    color: #666;
    font-size: 12px;

    /deep/ i {
      font-size: 12px;
      margin-right: 5px;
    }
  }

  .handle-button:hover {
    color: $xr-color-primary;
  }
}

.file-input {
  display: none;
}

.send-btn {
  float: right;
  font-size: 12px;
  padding: 5px 9px;
  margin-top: -5px;
}
</style>
