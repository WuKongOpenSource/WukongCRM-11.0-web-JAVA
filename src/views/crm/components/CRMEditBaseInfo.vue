<template>
  <div v-loading="loading" class="b-cont">
    <div v-if="showSaveButton" class="b-cont__handle">
      <el-button @click.native="editCancel">取消</el-button>
      <el-button
        v-debounce="editConfirm"
        type="primary">保存</el-button>
    </div>
    <sections
      v-for="(mainItem, mainIndex) in list"
      :key="mainIndex"
      :title="mainItem.name"
      class="b-cells"
      content-height="auto">
      <el-form
        :model="editForm"
        :rules="currentEditRules"
        :ref="`editForm${mainIndex}`"
        :validate-on-rule-change="false"
        class="el-form--flex"
        label-position="left"
        label-width="100px">
        <el-form-item
          v-for="(item, index) in mainItem.list"
          :key="index"
          :prop="item.fieldName"
          :class="{'is-block': isBlockShowField(item)}">
          <span slot="label">
            {{ item.name }}
          </span>
          <template v-if="item.isEdit">
            <el-input
              v-if="item.formType === 'text' ||
                item.formType == 'mobile' ||
                item.formType == 'email' ||
                item.formType == 'textarea' ||
              item.formType == 'website'"
              v-model="editForm[item.fieldName]"/>
            <el-input-number
              v-else-if="item.formType == 'number' ||
                item.formType == 'floatnumber' ||
              item.formType == 'percent'"
              v-model="editForm[item.fieldName]"
              :controls="false" />
            <el-select
              v-else-if="item.formType === 'select' || item.formType === 'business_status'"
              v-model="editForm[item.fieldName]"
              style="width: 100%;"
              clearable>
              <el-option
                v-for="(item, index) in getFieldOption(item)"
                :key="index"
                :label="item.name"
                :value="item.value"/>
            </el-select>
            <el-select
              v-else-if="item.formType === 'checkbox'"
              v-model="editForm[item.fieldName]"
              multiple
              style="width: 100%;"
              clearable>
              <el-option
                v-for="(item, index) in getFieldOption(item)"
                :key="index"
                :label="item.name"
                :value="item.value"/>
            </el-select>
            <el-date-picker
              v-else-if="item.formType === 'date'"
              v-model="editForm[item.fieldName]"
              type="date"
              clearable
              style="width: 100%;"
              value-format="yyyy-MM-dd"
            />
            <el-date-picker
              v-else-if="item.formType === 'datetime'"
              v-model="editForm[item.fieldName]"
              clearable
              style="width: 100%;"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
            <xh-user-cell
              v-else-if="item.formType === 'user' || item.formType === 'single_user'"
              :value="editForm[item.fieldName]"
              :radio="item.formType === 'single_user'"
              @value-change="arrayValueChange($event, item)"
            />
            <xh-structure-cell
              v-else-if="item.formType === 'structure'"
              :value="editForm[item.fieldName]"
              :radio="false"
              @value-change="arrayValueChange($event, item)"
            />
            <crm-relative-cell
              v-else-if="item.formType === 'contacts' ||
                item.formType === 'customer' ||
                item.formType === 'contract' ||
              item.formType === 'business'"
              :relative-type="item.formType"
              :value="editForm[item.fieldName]"
              @value-change="arrayValueChange($event, item)"
            />
            <xh-files
              v-else-if="item.formType === 'file'"
              :value="editForm[item.fieldName]"
              @value-change="arrayValueChange($event, item)"
            />
            <xh-prouct-cate
              v-else-if="item.formType === 'category'"
              :value="editForm[item.fieldName]"
              @value-change="arrayValueChange($event, item)"
            />
            <el-switch
              v-else-if="item.formType == 'boolean_value'"
              v-model="editForm[item.fieldName]"
              active-value="1"
              inactive-value="0"/>
            <wk-position
              v-else-if="item.formType == 'position'"
              :hide-area="item.hideArea"
              :only-province="item.onlyProvince"
              :show-detail="item.showDetail"
              v-model="editForm[item.fieldName]"/>
            <wk-location
              v-else-if="item.formType == 'location'"
              v-model="editForm[item.fieldName]"/>
            <wk-signature-pad
              v-else-if="item.formType == 'handwriting_sign'"
              v-model="editForm[item.fieldName]"/>
            <el-date-picker
              v-else-if="item.formType === 'date_interval'"
              v-model="editForm[item.fieldName]"
              :type="item.dateType || 'daterange'"
              :value-format="item.valueFormat || 'yyyy-MM-dd'"
              start-placeholder="开始日期"
              end-placeholder="结束日期" />
            <wk-percent-input
              v-else-if="item.formType == 'percent'"
              v-model="editForm[item.fieldName]"
              :controls="false" />
          </template>
          <template v-else>
            <flexbox v-if="item.formType === 'file'" style="min-height: 40px;">
              <file-list-view :list="item.value || []" />
              <i v-if="getEditAuth(item)" class="wk wk-edit form-item__edit" @click="editClick(item)" />
            </flexbox>
            <div
              v-else-if="item.formType === 'map_address'"
              :gutter="0"
              wrap="wrap">
              <div
                :span="0.5"
                class="b-cell">
                <flexbox
                  class="b-cell-b">
                  <div class="b-cell-name">定位</div>
                  <div
                    class="b-cell-value"
                    style="color: #3E84E9;cursor: pointer;"
                    @click="checkMapView(item)">{{ item.value.location }}</div>
                </flexbox>
              </div>
              <div
                :span="0.5"
                class="b-cell">
                <flexbox
                  class="b-cell-b">
                  <div class="b-cell-name">区域</div>
                  <div class="b-cell-value">{{ item.value.address }}</div>
                </flexbox>
              </div>
              <div
                :span="0.5"
                class="b-cell">
                <flexbox
                  class="b-cell-b">
                  <div class="b-cell-name">详细地址</div>
                  <div class="b-cell-value">{{ item.value.detailAddress }}</div>
                </flexbox>
              </div>
            </div>
            <wk-desc-text
              v-else-if="item.formType == 'desc_text'"
              :value="item.value"/>
            <flexbox
              v-else
              :class="{'can-check':isModule(item)}"
              align="stretch"
              class="form-item__value">
              <wk-field-view
                v-if="item.formType == 'boolean_value' || item.formType == 'handwriting_sign' || item.formType == 'website'"
                :form-type="item.formType"
                :value="item.value"
              />
              <span v-else @click="checkModuleDetail(item)">{{ getCommonShowValue(item) }}</span>
            <i v-if="getEditAuth(item)" class="wk wk-edit form-item__edit" @click.stop="editClick(item)" /></flexbox>
          </template>
        </el-form-item>
      </el-form>
    </sections>
    <slot />
    <map-view
      v-if="showMapView"
      :title="mapViewInfo.title"
      :lat="mapViewInfo.lat"
      :lng="mapViewInfo.lng"
      @hidden="showMapView=false" />

    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :id="fullDetailId"
      :crm-type="fullDetailType"/>
  </div>
</template>

<script>
import { filedGetInformationAPI, filedUpdateTableFieldAPI, filedGetFieldAPI } from '@/api/crm/common'

import {
  XhUserCell,
  XhStructureCell,
  XhFiles,
  CrmRelativeCell,
  XhProuctCate,
  XhBusinessStatus,
  XhReceivablesPlan
} from '@/components/CreateCom'
import WkPosition from '@/components/NewCom/WkPosition'
import WkLocation from '@/components/NewCom/WkLocation'
import WkSignaturePad from '@/components/NewCom/WkSignaturePad'
import WkFieldView from '@/components/NewCom/WkForm/WkFieldView'
import WkDescText from '@/components/NewCom/WkDescText'
import WkPercentInput from '@/components/NewCom/WkPercentInput'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import Sections from '../components/Sections'
import MapView from '@/components/MapView' // 地图详情
import FileListView from '@/components/FileListView'
import { separator } from '@/filters/vueNumeralFilter/filters'
import { objDeepCopy } from '@/utils'
import { isArray, isObject, isEmpty } from '@/utils/types'
import { mapGetters } from 'vuex'
import { getWkDateTime } from '@/utils'
import { getFormFieldShowName } from '@/components/NewCom/WkForm/utils'
import CustomFieldsMixin from '@/mixins/CustomFields'

export default {
  // 客户管理 的 基本信息
  name: 'CRMEditBaseInfo',
  components: {
    Sections,
    MapView,
    FileListView,
    XhUserCell,
    XhStructureCell,
    XhFiles,
    CrmRelativeCell,
    XhProuctCate,
    XhBusinessStatus,
    XhReceivablesPlan,
    WkPosition,
    WkLocation,
    WkSignaturePad,
    WkFieldView,
    WkDescText,
    WkPercentInput,
    CRMFullScreenDetail: () => import('@/components/CRMFullScreenDetail')
  },
  filters: {
  },
  mixins: [CustomFieldsMixin],
  props: {
    // 模块ID
    id: [String, Number],
    poolId: [String, Number],
    isSeas: {
      type: Boolean,
      default: false
    },
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 没有值就是全部类型 有值就是当个类型
    crmType: {
      type: String,
      default: ''
    },
    // 固定字段的数据
    filedList: Array
  },
  data() {
    return {
      loading: false,
      list: [],
      // 控制展示地图详情
      showMapView: false,
      // 地图详情信息
      mapViewInfo: {},
      showFullDetail: false,
      fullDetailId: '',
      fullDetailType: '',
      // 编辑
      showSaveButton: false,
      editRules: {},
      currentEditRules: {},
      editForm: {},
      editOptions: {},
      editFieldData: []
    }
  },
  inject: ['rootTabs'],
  computed: {
    ...mapGetters(['crm'])
  },
  watch: {
    id(val) {
      if (!this.filedList) {
        this.refreshData(true)
      }
    },

    filedList() {
      this.list = this.filedList
    },

    'rootTabs.currentName'(val) {
      if (val === 'CRMEditBaseInfo') {
        this.refreshData(false)
      }
    }

  },
  created() {
    this.$bus.on('crm-detail-update', (data) => {
      this.getBaseInfo(false)
      if (!this.isSeas) {
        this.refreshData(true)
      }
    })
  },
  beforeDestroy() {
    this.$bus.off('crm-detail-update')
  },
  mounted() {
    if (this.filedList) {
      this.list = this.filedList
    } else {
      this.refreshData(true)
    }
  },
  methods: {
    /**
     * 刷新页面数据
     */
    refreshData(loading = false) {
      this.getBaseInfo(loading)
      if (!this.isSeas) {
        this.getEditFieldData()
      }
    },

    /**
     * 获取基础信息
     */
    getBaseInfo(loading) {
      this.loading = !!loading

      const params = {
        types: crmTypeModel[this.crmType],
        id: this.id
      }

      // 如果有公海id 需上传确定展示字段
      if (this.poolId) {
        params.poolId = this.poolId
      }

      filedGetInformationAPI(params)
        .then(res => {
          const baseList = []
          const systemList = []
          res.data.forEach(item => {
            if (item.formType === 'floatnumber') {
              item.value = separator(item.value)
            } else if (item.formType === 'date') {
              item.value = getWkDateTime(item.value)
            }
            if (item.sysInformation == 1) {
              systemList.push(item)
            } else {
              baseList.push(item)
            }
          })

          this.list = [
            {
              name: '基本信息',
              list: baseList
            },
            {
              name: '系统信息',
              list: systemList
            }
          ]
          this.editCancel()
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 查看地图详情
     */
    checkMapView(item) {
      if (isObject(item.value) && !isEmpty(item.value.location)) {
        this.mapViewInfo = {
          title: item.value.location,
          lat: item.value.lat,
          lng: item.value.lng
        }
        this.showMapView = true
      }
    },

    /**
     * 客户等模块类型
     */
    isModule(item) {
      return [
        'customer',
        'business',
        'contract',
        'contacts',
        'location'].includes(item.formType)
    },

    /**
     * 特殊字段
     */
    isSpecialField(item) {
      return [
        'category',
        'statusName',
        'typeName'].includes(item.formType)
    },

    /**
     * 是整行展示字段
     */
    isBlockShowField(item) {
      return [
        'map_address',
        'file'].includes(item.formType)
    },

    getShowBlock(type) {
      return ['map_address', 'file'].includes(type)
    },

    getModuleName(item) {
      const field = {
        customer: 'customerName',
        business: 'businessName',
        contract: 'contractNum',
        contacts: 'contactsName',
        category: 'categoryName',
        statusName: 'statusName',
        typeName: 'typeName',
        location: 'address'
      }[item.formType]
      return item.value ? item.value[field] : ''
    },

    getFieldOption(item) {
      const editData = this.editOptions[item.fieldName]
      let setting = []
      if (editData) {
        if (item.formType === 'select' || item.formType === 'checkbox') {
          if (editData.setting.length > 0 && typeof editData.setting[0] == 'string') {
            setting = editData.setting.map(element => {
              return { name: element, value: element }
            })
          } else {
            setting = editData.setting
          }
        } else if (item.formType === 'business_status') {
          setting = editData.setting.map(element => {
            element.value = element.statusId
            return element
          })
        }
      }

      return setting
    },

    /**
     * 获取非附件类型的展示值
     */
    getCommonShowValue(item) {
      if (this.isModule(item) || this.isSpecialField(item)) {
        return this.getModuleName(item)
      } else {
        return getFormFieldShowName(item.formType, item.value, '')
      }
    },

    /**
     * 查看详情
     */
    checkModuleDetail(data) {
      const dataValue = data.value
      if (this.isModule(data) && isObject(dataValue)) {
        if (data.formType === 'location') {
          if (!isEmpty(dataValue.address)) {
            this.mapViewInfo = {
              title: dataValue.address,
              lat: dataValue.lat,
              lng: dataValue.lng
            }
          }
          this.showMapView = true
        } else {
          this.fullDetailType = data.formType
          this.fullDetailId = dataValue[`${data.formType}Id`]
          this.showFullDetail = true
        }
      }
    },

    /**
     * 编辑逻辑
     */
    getEditAuth(item) {
      if (this.isSeas) {
        return false
      }
      if (this.crmType == 'business' && ['statusName', 'typeName'].includes(item.formType)) {
        return false
      } else if (this.crmType == 'contract' && ['business', 'contacts', 'customer'].includes(item.formType)) {
        return false
      } else if (this.crmType == 'receivables' && ['contract', 'customer'].includes(item.formType)) {
        return false
      } else if (this.crmType == 'visit' && ['business', 'contacts', 'customer'].includes(item.formType)) {
        return false
      } else if (item.formType === 'desc_text' || item.formType === 'handwriting_sign') {
        // 描述文字签名不允许编辑
        return false
      }
      // authLevel 1 不能查看不能编辑 2可查看  3 可编辑可查看
      return item.authLevel === 3 && this.crm && this.crm[this.crmType] && this.crm[this.crmType].update // 不能编辑 disabled true
    },

    /**
     * 点击编辑按钮
     */
    editClick(item) {
      const editData = this.editFieldData.find(field => {
        return field.fieldName == item.fieldName
      })

      if (editData) {
        let value = isArray(editData.value) || isObject(editData.value) ? objDeepCopy(editData.value) : editData.value
        if (item.formType === 'contacts' ||
          item.formType === 'customer' ||
          item.formType === 'contract' ||
          item.formType === 'business') {
          value = value && value[`${item.formType}Id`] ? [value] : []
        } else if (item.formType === 'category') {
          value = value && value.categoryId ? value.categoryId : []
        } else if (item.formType === 'single_user') {
          value = value && value.userId ? [value] : []
        } else if (item.formType === 'structure' || item.formType === 'file' || item.formType === 'user') {
          value = value || []
        } else if (item.formType === 'number' || item.formType === 'floatnumber' || item.formType === 'percent') {
          value = isEmpty(value) ? undefined : value
        }

        this.$set(this.editForm, item.fieldName, value)
        this.$set(editData, 'isEdit', true)
        this.$set(this.editOptions, item.fieldName, editData)
        this.$set(this.currentEditRules, item.fieldName, this.editRules[item.fieldName])
      }
      this.showSaveButton = true
      this.$set(item, 'isEdit', true)
    },

    editCancel() {
      if (this.$refs.editForm0[0].clearValidate) {
        this.$refs.editForm0[0].clearValidate()
      }

      this.$nextTick(() => {
        this.list.forEach(bItem => {
          bItem.list.forEach(item => {
            item.isEdit = false
          })
        })
        this.editFieldData.forEach(item => {
          item.isEdit = false
        })

        this.currentEditRules = {}
        this.editForm = {}
        this.editOptions = {}
        this.showSaveButton = false
      })
    },

    editConfirm() {
      // customerId    fieldId   fieldType  fieldName  formType  value
      // this.editCancel()
      this.$refs.editForm0[0].validate(valid => {
        if (valid) {
          this.submiteInfo()
        }
      })
    },

    /**
     * 发请求提交数据
     */
    submiteInfo() {
      // 仅第一块可编辑 ，直接取第一块的数据
      this.loading = true
      const fields = this.list[0].list || []
      const list = []
      for (let index = 0; index < fields.length; index++) {
        const field = fields[index]
        if (field.isEdit) {
          const fieldData = this.editOptions[field.fieldName]
          if (fieldData) {
            list.push({
              fieldName: fieldData.fieldName,
              fieldType: fieldData.fieldType,
              name: fieldData.name,
              type: fieldData.type,
              fieldId: fieldData.fieldId,
              value: this.getRealValue(fieldData, this.editForm[fieldData.fieldName])
            })
          }
        }
      }

      filedUpdateTableFieldAPI({
        id: this.id,
        batchId: this.detail.batchId,
        label: crmTypeModel[this.crmType],
        list: list
      }).then(res => {
        this.loading = false
        this.editCancel()

        this.refreshData(true)
      }).catch(() => {
        this.loading = false
      })
    },

    getRealValue(element, value) {
      if (
        element.formType == 'customer' ||
        element.formType == 'contacts' ||
        element.formType == 'business' ||
        element.formType == 'leads' ||
        element.formType == 'contract'
      ) {
        if (value && value.length) {
          return value[0][`${element.formType}Id`]
        } else {
          return ''
        }
      } else if (
        element.formType == 'user' ||
        element.formType == 'single_user' ||
        element.formType == 'structure'
      ) {
        return value
          .map(item => {
            return (element.formType == 'user' || element.formType == 'single_user') ? item.userId : item.id
          })
          .join(',')
      } else if (element.formType == 'file') {
        if (value && value.length > 0) {
          return value[0].batchId
        }
        return ''
      } else if (element.formType == 'category') {
        if (value && value.length > 0) {
          return value[value.length - 1]
        }
        return ''
      } else if (element.formType == 'checkbox') {
        if (value && value.length > 0) {
          return value.join(',')
        }
        return ''
      }

      return value
    },

    /**
     * 员工编辑
     * 关联模块编辑
     * 附件选择
     * 产品类别
     */
    arrayValueChange(data, item) {
      this.editForm[item.fieldName] = data.value || []
    },

    // 获取自定义字段
    getEditFieldData() {
      // 获取自定义字段的更新时间
      var params = {
        label: crmTypeModel[this.crmType],
        id: this.id,
        type: 1 // 一维数组
      }

      filedGetFieldAPI(params)
        .then(res => {
          const editFieldData = res.data || []
          const editRules = {}
          editFieldData.forEach(item => {
            item.isEdit = false
            let authList = []
            if (item.autoGeneNumber == 1) {
              const copyItem = objDeepCopy(item)
              copyItem.isNull = 0
              authList = this.getRules(copyItem)
            } else {
              authList = this.getRules(item)
            }
            if (authList && authList.length) {
              editRules[item.fieldName] = authList
            }
          })

          this.editFieldData = editFieldData
          this.editRules = editRules
        })
        .catch(() => {
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.b-cont {
  position: relative;
  padding: 15px;
  height: 100%;
  overflow-y: auto;
  overflow-y: overlay;

  &__handle {
    position: absolute;
    text-align: right;
    right: 20px;
    width: 100%;
    z-index: 3;
  }
}

.section {
  margin-top: 0;
  /deep/ .content {
    overflow: hidden;
  }
}

.el-input-number {
  width: 100%;
  /deep/ .el-input__inner {
    text-align: left;
    padding: 0 8px;
  }
}

.b-cells + .b-cells {
  margin-top: 25px;
}

.b-cell {
  padding: 0 10px;
}

.el-form--flex {
  margin: 20px 10px 0;
  /deep/ .el-form-item {
    padding: 0 40px 0 15px;
    margin-bottom: 10px;
    max-width: 100%;
    .el-form-item__content {
      position: relative;
      min-height: 40px;
      line-height: 1.5;
    }

    .el-form-item__label {
      color: #777;
      font-size: 13px;
      line-height: 1.5;
    }

    &:hover {
      .form-item__edit{
        display: inline;
      }
    }
  }
}

.form-item__value {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  min-height: 22px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}

.form-item__edit {
  margin-left: 5px;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  display: none;
  flex-shrink: 0;

  &:hover {
    color: $xr-color-primary;
  }
}

.can-check {
  color: $xr-color-primary !important;
  cursor: pointer;
}

.is-block {
  flex-basis: 100% !important;
}

.b-cell-b {
  width: auto;
  .b-cell-name {
    width: 100px;
    margin-right: 10px;
    font-size: 13px;
    flex-shrink: 0;
    color: #777;
  }
  .b-cell-value {
    font-size: 13px;
    color: #333;
    line-height: 30px;
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
  }
}
</style>
