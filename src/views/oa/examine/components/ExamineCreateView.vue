<template>
  <xr-create
    :loading="loading"
    :title="title"
    @close="hidenView"
    @save="saveClick">
    <!-- 基本信息 -->
    <create-sections title="基本信息">
      <el-form
        ref="crmForm"
        :model="fieldForm"
        :rules="fieldRules"
        class="wk-form"
        label-position="top">
        <wk-form-items
          v-for="(children, index) in fieldList"
          :key="index"
          :field-from="fieldForm"
          :field-list="children"
          @change="formChange"
        >
          <template slot-scope="{ data }">
            <xh-expenses
              v-if="data && data.formType == 'examine_cause'"
              :value="fieldForm[data.field]"
              @value-change="otherChange($event, data)"
            />
            <xh-leaves
              v-if="data && data.formType == 'business_cause'"
              :value="fieldForm[data.field]"
              @value-change="otherChange($event, data)"
            />
          </template>
        </wk-form-items>
      </el-form>
    </create-sections>

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
          :file-list="imgFileList"
          name="file"
          multiple
          accept="image/*"
          list-type="picture-card">
          <p class="add-img">
            <span class="el-icon-picture"/>
            <span>添加图片</span>
          </p>
          <i class="el-icon-plus"/>
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
    <!-- 相关信息 -->
    <related-business
      :selected-infos="relatedBusinessInfo"
      class="related-business"
      @value-change="relativeValueChange"/>
    <!-- 审核信息 -->
    <create-sections
      v-if="wkFlowList"
      title="审核信息">
      <template slot="header">
        <el-tooltip
          v-if="flowRemarks"
          :content="flowRemarks"
          effect="dark"
          placement="top">
          <i class="wk wk-help wk-help-tips" style="margin-left: 8px;"/>
        </el-tooltip>
      </template>
      <wk-approval-flow-apply
        :data="wkFlowList"
        style="padding: 15px;"
      />
    </create-sections>
  </xr-create>
</template>
<script type="text/javascript">
import { filedGetFieldAPI } from '@/api/crm/common'
import { oaExamineGetFieldAPI } from '@/api/oa/examine'
import { crmFileDeleteAPI, crmFileSaveUrl } from '@/api/common'
import { oaExamineSaveAndUpdateAPI } from '@/api/oa/examine'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import XhExpenses from './XhExpenses' // 报销事项
import XhLeaves from './XhLeaves' // 出差事项
import RelatedBusiness from './RelatedBusiness'
import WkApprovalFlowApply from '@/components/Examine/WkApprovalFlowApply'
import WkApprovalFlowApplyMixin from '@/components/Examine/mixins/WkApprovalFlowApply'
import WkFormItems from '@/components/NewCom/WkForm/WkFormItems'

import { isEmpty } from '@/utils/types'
import CustomFieldsMixin from '@/mixins/CustomFields'
import axios from 'axios'

import {
  guid,
  objDeepCopy,
  getImageData
} from '@/utils'

export default {
  name: 'ExamineCreateView', // 所有新建效果的view
  components: {
    XrCreate,
    CreateSections,
    XhExpenses,
    XhLeaves,
    RelatedBusiness,
    WkApprovalFlowApply,
    WkFormItems
  },
  filters: {},
  mixins: [CustomFieldsMixin, WkApprovalFlowApplyMixin],
  props: {
    // 类型ID
    categoryId: {
      type: [String, Number],
      default: ''
    },
    type: [String, Number],
    // 类型名称
    categoryTitle: {
      type: String,
      default: ''
    },
    /**
     * save:添加、update:编辑(action_id)、read:详情、index:列表
     * relative: 相关 添加
     */
    action: {
      type: Object,
      default: () => {
        return {
          type: 'save',
          id: ''
        }
      }
    }
  },
  data() {
    return {
      // 标题展示名称
      title: '',
      loading: false,
      // 自定义字段验证规则
      baseFields: [],
      fieldList: [],
      fieldForm: {},
      fieldRules: {},
      batchId: guid(),
      // 图片附件
      imgFileList: [],
      fileList: [],
      // 审批信息
      flowRemarks: '',
      wkFlowList: null, // 有值有审批流
      relatedBusinessInfo: {} // 相关信息信息
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
    }
  },
  watch: {},
  mounted() {
    // 获取title展示名称
    document.body.appendChild(this.$el)
    this.title = this.getTitle()
    this.getField()

    if (this.action.type == 'update') {
      this.batchId = this.action.data.batchId
    }
  },
  destroyed() {
    // remove DOM node after destroy
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    /**
     * 相关信息的值更新
     */
    relativeValueChange(data) {
      this.relatedBusinessInfo = data.value
    },

    /**
     * change
     */
    formChange(field, index, value, valueList) {
      // 审批流逻辑
      this.debouncedGetWkFlowList(field.field, this.fieldForm)
    },

    /**
     * change
     */
    otherChange(data, field) {
      // 出差事项
      if (data.value.update) {
        if (field.formType == 'business_cause') {
          this.$set(this.fieldForm, 'duration', data.value.duration)
        } else if (field.formType == 'examine_cause') {
          this.$set(this.fieldForm, 'money', data.value.money)
        }
      }
      this.$set(this.fieldForm, field.field, data.value)
    },

    /**
     * 获取自定义字段
     */
    getField() {
      this.loading = true
      // 获取自定义字段的更新时间
      var params = {}
      params.label = 10
      params.id = this.categoryId

      // 进行编辑操作
      if (this.action.type == 'update') {
        params.examineId = this.action.id
        params.isDetail = 2 // 1详情 2 编辑
      }

      const request = {
        update: oaExamineGetFieldAPI,
        save: filedGetFieldAPI
      }[this.action.type]
      request(params)
        .then(res => {
          this.getcrmRulesAndModel(res.data)
          if (this.action.type == 'update') {
            this.getUpdateOtherInfo()
          }

          // 审核信息
          this.initWkFlowData({
            params: { label: 0, examineId: this.categoryId },
            fieldForm: this.fieldForm // 该对象没有需要适配
          }, res => {
            this.wkFlowList = res.list
            this.flowRemarks = res.resData ? res.resData.remarks : ''
          })
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 更新图片附件相关信息信息
     */
    getUpdateOtherInfo() {
      this.imgFileList = objDeepCopy(this.action.data.img || [])

      for (let index = 0; index < this.imgFileList.length; index++) {
        this.setImageList(this.imgFileList[index], index)
      }

      this.fileList = objDeepCopy(this.action.data.file || [])

      this.relatedBusinessInfo = {
        contacts: (this.action.data.contactsList || []).map(item => {
          if (item.id) {
            item.contactsId = item.id
          }
          return item
        }),
        customer: (this.action.data.customerList || []).map(item => {
          if (item.id) {
            item.customerId = item.id
          }
          return item
        }),
        business: (this.action.data.businessList || []).map(item => {
          if (item.id) {
            item.businessId = item.id
          }
          return item
        }),
        contract: (this.action.data.contractList || []).map(item => {
          if (item.id) {
            item.contractId = item.id
          }
          return item
        })
      } // 相关信息信息
    },

    /**
     * 获取图片内容
     */
    setImageList(item, index) {
      getImageData(item.url).then((data) => {
        item.url = data.src
        this.imgFileList.splice(index, 1, item)
      }).catch(() => {})
    },

    /**
     * 根据自定义字段获取自定义字段规则
     */
    getcrmRulesAndModel(list) {
      const baseFields = []
      const fieldList = []
      const fieldRules = {}
      const fieldForm = {}
      list.forEach(children => {
        const fields = []
        children.forEach(item => {
          const temp = this.getFormItemDefaultProperty(item)

          fieldRules[temp.field] = this.getRules(item)

          // 特殊字段验证规则
          if (item.isNull == 1) {
            if (item.formType == 'business_cause') {
              var validateFunction = (rule, value, callback) => {
                if (!value.list) {
                  callback(new Error('请完善明细'))
                } else {
                  var hasError = false
                  for (let index = 0; index < value.list.length; index++) {
                    const item = value.list[index]
                    const keys = [
                      'startAddress',
                      'endAddress',
                      'startTime',
                      'endTime',
                      'duration'
                    ]
                    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
                      const key = keys[keyIndex]
                      if (key == 'duration') {
                        if (item.duration <= 0) {
                          hasError = true
                          callback(new Error(`行程明细（${index + 1}）时长应大于0`))
                          break
                        }
                      } else if (isEmpty(item[key])) {
                        hasError = true
                        callback(new Error('请完善明细'))
                        break
                      }
                    }
                  }
                  if (!hasError) {
                    callback()
                  }
                }
              }
              fieldRules[temp.field] = [{
                validator: validateFunction,
                trigger: []
              }]
            } else if (item.formType == 'examine_cause') {
              var validateFunction = (rule, value, callback) => {
                if (!value.list) {
                  callback(new Error('请完善明细'))
                } else {
                  var hasError = false
                  for (let index = 0; index < value.list.length; index++) {
                    const item = value.list[index]
                    const keys = [
                      'startAddress',
                      'endAddress',
                      'startTime',
                      'endTime',
                      'traffic',
                      'stay',
                      'diet',
                      'other'
                    ]
                    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
                      const key = keys[keyIndex]
                      if (isEmpty(item[key])) {
                        hasError = true
                        callback(new Error('请完善明细'))
                        break
                      }
                    }

                    if (item.money <= 0) {
                      hasError = true
                      callback(new Error(`费用明细（${index + 1}）合计应大于0`))
                      break
                    }
                  }
                  if (!hasError) {
                    callback()
                  }
                }
              }
              fieldRules[temp.field] = [{
                validator: validateFunction,
                trigger: []
              }]
            } else if ((item.fieldName == 'duration' && this.type == 3) ||
          (item.fieldName == 'money' && this.type == 5)) {
              fieldRules[temp.field] = [{
                required: true,
                message: '请完善明细',
                trigger: ['blur', 'change']
              }]
            }
          }

          // disabled
          if (
          // 出差审批 差旅报销
            (item.fieldName == 'duration' && this.type == 3) ||
          (item.fieldName == 'money' && this.type == 5)
          ) {
            temp.disabled = true
          }

          // 特殊字段允许多选
          this.getItemRadio(item, temp)

          // 获取默认值
          if (item.formType == 'examine_cause' ||
          item.formType == 'business_cause') {
            if (this.action.type == 'update') {
              const list = item.value.map(element => {
                if (element.img) {
                  element.imgList = objDeepCopy(element.img || [])
                } else {
                  element.imgList = []
                }
                return element
              })
              fieldForm[temp.field] = { list: list } // 编辑的值 在value字段
            } else {
              fieldForm[temp.field] = {} // 加入默认值 可能编辑的时候需要调整
            }
          } else {
            fieldForm[temp.field] = this.getItemValue(item, this.action.data, this.action.type)
          }
          fields.push(temp)
          baseFields.push(item)
        })
        fieldList.push(fields)
      })
      this.baseFields = baseFields
      this.fieldList = fieldList
      this.fieldForm = fieldForm
      this.fieldRules = fieldRules
    },

    /**
     * 保存数据
     */
    saveClick() {
      this.loading = true
      const crmForm = this.$refs.crmForm
      crmForm.validate(valid => {
        if (valid) {
          const wkFlowResult = this.validateWkFlowData(this.wkFlowList)
          if (wkFlowResult.pass) {
            const params = {
              oaExamine: { categoryId: this.categoryId },
              oaExamineRelation: {},
              field: [],
              oaExamineTravelList: []
            }
            this.getSubmiteParams(this.baseFields, params)
            if (wkFlowResult.data) {
              params.examineFlowData = wkFlowResult.data
            }
            this.submiteParams(params)
          } else {
            this.loading = false
            this.$message.error('请完善审批信息')
          }
        } else {
          this.loading = false
          // 提示第一个error
          this.getFormErrorMessage(crmForm)
          return false
        }
      })
    },

    /**
     * 上传
     */
    submiteParams(params) {
      for (const key in this.relatedBusinessInfo) {
        const list = this.relatedBusinessInfo[key]
        params.oaExamineRelation[key + 'Ids'] = list
          .map(function(item, index, array) {
            return item[key + 'Id']
          })
          .join(',')
      }

      params.oaExamine['batchId'] = this.batchId

      if (this.action.type == 'update') {
        params.oaExamine.examineId = this.action.id
      }
      oaExamineSaveAndUpdateAPI(params)
        .then(res => {
          this.loading = false
          this.hidenView()
          this.$message.success('操作成功')
          // 回到保存成功
          this.$emit('save-success')
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 拼接上传传输
     */
    getSubmiteParams(array, params) {
      for (let index = 0; index < array.length; index++) {
        const element = array[index]
        const dataValue = this.fieldForm[element.fieldName]
        if (element.fieldName == 'cause') {
          if (element.formType == 'business_cause') {
            params.oaExamineTravelList = dataValue.list
          } else if (element.formType == 'examine_cause') {
            for (let index = 0; index < dataValue.list.length; index++) {
              const cause = dataValue.list[index]
              var causeCopy = Object.assign({}, cause)
              delete causeCopy['imgList']
              params.oaExamineTravelList.push(causeCopy)
            }
          }
        } else {
          if (element.fieldType == 1) {
            params.oaExamine[element.fieldName] = this.getRealParams(element, dataValue)
          } else if (element.formType !== 'desc_text') { //  描述文字忽略
            params.field.push({
              fieldName: element.fieldName,
              fieldType: element.fieldType,
              name: element.name,
              type: element.type,
              fieldId: element.fieldId,
              value: this.getRealParams(element, dataValue)
            })
          }
        }
      }
      return params
    },

    /** 图片和附件 */

    /**
     * 上传图片
     */
    imgFileUploadSuccess(response, file, fileList) {
      this.imgFileList = fileList
    },

    /**
     * 查看图片
     */
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

    /**
     * 附件索引
     */
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

    /**
     * 关闭
     */
    hidenView() {
      this.$emit('hiden-view')
    },

    /**
     * 根据类型获取标题展示名称
     */
    getTitle() {
      return this.action.type == 'update'
        ? '编辑' + this.categoryTitle
        : '新建' + this.categoryTitle
    }
  }
}
</script>
<style lang="scss" scoped>
.crm-create-container {
  position: relative;
  height: 100%;
}

.crm-create-header {
  height: 40px;
  margin-bottom: 20px;
  padding: 0 10px;
  flex-shrink: 0;
  .close {
    display: block;
    font-size: 24px;
    color: #909399;
    margin-right: -10px;
    padding: 10px;
    cursor: pointer;
  }
  .close:hover {
    color: $xr-color-primary;
  }
}

.crm-create-body {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}

/** 将其改变为flex布局 */
.crm-create-box {
  display: flex;
  flex-wrap: wrap;
  padding: 0 10px 15px;
}

.crm-create-item {
  flex: 0 0 50%;
  flex-shrink: 0;
  // overflow: hidden;
  padding-bottom: 10px;
}

// 图片 附件
.img-accessory {
  padding: 0 20px;
  font-size: 12px;
  img {
    width: 16px;
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
      color: #2362FB;
    }
  }
  .add-accessory {
    margin-top: 25px;
    margin-bottom: 20px;
    color: #2362FB;

    .wukong-file {
      font-size: 13px;
    }
  }
}

.related-business {
  padding: 0 20px;
}

.wk-form {
  /deep/ .el-form-item {
    &.is-business_cause,
    &.is-examine_cause {
      flex: 0 0 100%;
      width: 0;
    }
  }
}
</style>
