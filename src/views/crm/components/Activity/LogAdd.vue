<template>
  <div :class="['mix-content', { 'unfold': !isUnfold }]">
    <i
      v-if="isUnfold"
      class="wk wk-close"
      @click="close" />
    <div
      v-if="isUnfold"
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
    <div :class="['i-cont', { 'unfold': !isUnfold }]">
      <i
        v-if="!isUnfold"
        class="wk wk-write" />
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
      v-if="imgFiles.length > 0 && isUnfold"
      :data="imgFiles"
      @delete="deleteImage"
      @delete-all="deleteAllFile(2)"
      @upload="uploadFile" />
    <add-file-list
      v-if="files.length > 0 && isUnfold"
      :data="files"
      @delete="deleteFile"
      @delete-all="deleteAllFile(1)" />
    <add-relate-list
      v-if="business.length > 0 && isUnfold"
      :data="business"
      type="business"
      @delete="deleteRelate" />

    <div
      v-if="isUnfold"
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
      <crm-relative
        v-if="showBusiness"
        :visible.sync="showBusinessPopover"
        :radio="false"
        :action="businessAction"
        :selected-data="{ 'business': business }"
        crm-type="business"
        @close="showBusinessPopover=false"
        @changeCheckout="checkRelativeInfos" />
      <el-button
        type="text"
        icon="wk wk-associate"
        class="handle-button"
        style="margin-left: 10px;"
        @click="barClick('business')">关联商机</el-button>
      <el-button
        v-debounce="sendClick"
        type="primary"
        class="send-btn">发布</el-button>
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
</template>

<script>
import { crmFileDeleteAPI, crmFileRemoveByBatchIdAPI } from '@/api/common'

import AddImageList from '@/components/QuickAdd/AddImageList'
import AddFileList from '@/components/QuickAdd/AddFileList'
import AddRelateList from '@/components/QuickAdd/AddRelateList'
import CommonWords from '@/components/CommonWords'

import { fileSize, getFileTypeIcon, guid } from '@/utils/index'
import EmitterMixin from '@/mixins/Emitter'

export default {
  /** 跟进记录 下的 添加 有添加框的都需要*/
  name: 'LogAdd',
  components: {
    CrmRelative: () => import('@/components/CreateCom/CrmRelative'),
    AddImageList,
    AddFileList,
    AddRelateList,
    CommonWords
  },
  mixins: [EmitterMixin],
  props: {
    // 展示相关商机关联
    showBusiness: {
      type: Boolean,
      default: false
    },
    // 展示相关商机关联
    showContacts: {
      type: Boolean,
      default: false
    },
    contacts: Array,
    // 首要联系人ID
    contactsId: [String, Number],
    // 跟进类型
    followTypes: Array,
    // 模块ID
    id: [String, Number],
    // 没有值就是全部类型 有值就是当个类型
    crmType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isUnfold: false, // 默认闭合
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
      selectContactsId: '',
      followType: '',
      // 下次联系时间
      nextTime: '',
      /** 展示关联弹窗 */
      showRelativeType: '',
      batchId: guid() // 批次ID
    }
  },
  computed: {
    autosize() {
      if (this.isUnfold) {
        return { minRows: 3, maxRows: 6 }
      }
      return { minRows: 1, maxRows: 1 }
    }
  },
  watch: {
    followTypes() {
      this.getDefalutFollowType()
    },

    content(val) {
      const value = !!(val && val.length > 0)
      this.dispatch('SlideView', 'setEditClose', [value])
    },

    contactsId() {
      this.selectContactsId = this.contactsId || ''
    },

    id: {
      handler() {
        this.businessAction = { type: 'condition', data: { moduleType: this.crmType, customerId: this.id }}
      },
      immediate: true
    }
  },
  created() {
    this.selectContactsId = this.contactsId || ''
    this.getDefalutFollowType()
  },

  beforeDestroy() {},
  methods: {
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
      this.isUnfold = false
      // 输入法
      this.content = ''
      this.dispatch('SlideView', 'setEditClose', [false])
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
      this.batchId = guid()
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
      this.isUnfold = true
      this.$nextTick(() => {
        this.$refs.textarea.focus()
        this.$emit('focus')
      })
    },

    /**
     * 发布
     */
    sendClick() {
      this.$emit('send', {
        id: this.id,
        content: this.content,
        files: this.files,
        images: this.imgFiles,
        business: this.business,
        contactsId: this.selectContactsId,
        batchId: this.batchId,
        followType: this.followType,
        nextTime: this.nextTime
      })
    },

    /**
     * 关闭
     */
    close() {
      this.isUnfold = false
      this.$emit('close')
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

.mix-content.unfold {
  padding: 0;
  .i-cont {
    padding: 8px 10px;
  }
}

.mix-content.unfold:hover {
  cursor: pointer;
  border-color: #c0c4cc;
  .i-cont {
    cursor: pointer;
    .wk-write {
      color: $xr-color-primary;
    }

    /deep/ .el-textarea__inner {
      cursor: pointer;
    }
  }
}

.wk-close {
  border: 0;
  color: #d9d9d9;
  font-size: 22px;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  padding: 4px;
  transform: scale(0.8);
}

.wk-close:hover {
  color: #2362fb;
}

.i-cont /deep/ .el-textarea__inner {
  border: none;
  padding: 0;
}

.i-cont.unfold {
  /deep/ .el-textarea {
    width: calc(100% - 50px);
  }
  /deep/ .el-textarea__inner {
    overflow: hidden;
  }
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
