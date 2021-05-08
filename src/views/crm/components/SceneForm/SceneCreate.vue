<template>
  <el-dialog
    :title="edit_id ? '编辑场景' : '新建场景'"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :append-to-body="true"
    width="800px"
    @close="handleCancel">
    <div class="scene-name-container">
      <div class="scene-name">场景名称</div>
      <el-input
        v-model.trim="saveName"
        :maxlength="10"
        class="scene-input"
        placeholder="请输入场景名称，最多10个字符"/>
    </div>
    <div class="scene-name">筛选条件</div>
    <el-form
      id="scene-filter-container"
      class="filter-container">
      <el-form-item>
        <template v-for="(formItem, index) in form">
          <el-row :key="index">
            <el-col :span="8">
              <el-select
                v-model="formItem.fieldName"
                placeholder="请选择要筛选的字段名"
                @change="fieldChange(formItem)"
                @focus="fieldFocus">
                <el-option
                  v-for="item in fieldList"
                  :key="item.fieldName"
                  :label="item.name"
                  :value="item.fieldName"/>
              </el-select>
            </el-col>

            <template v-if="showCalCondition(formItem.formType, formItem.fieldName)">
              <el-col
                :span="1">&nbsp;</el-col>
              <el-col
                :span="4">
                <el-select
                  v-model="formItem.condition"
                  placeholder="请选择范围"
                  @change="selectChange($event,formItem)">
                  <el-option
                    v-for="item in getAdvancedFilterOptions(formItem.formType, formItem.fieldName)"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"/>
                </el-select>
              </el-col>
            </template>

            <!-- 商机组 -->
            <el-col
              v-if="formItem.formType == 'business_type'"
              :span="1">&nbsp;</el-col>
            <el-col
              v-if="formItem.formType == 'business_type'"
              :span="4">
              <el-select
                v-model="formItem.typeId"
                @change="typeOptionsChange(formItem)">
                <el-option
                  v-for="item in formItem.typeOption"
                  :key="item.typeId"
                  :label="item.name"
                  :value="item.typeId"/>
              </el-select>
            </el-col>

            <el-col :span="1">&nbsp;</el-col>
            <el-col :span="getValueSpan(formItem.formType, formItem.fieldName) ? 8 : 13" style="position: relative;">
              <template
                v-if="formItem.condition === 'isNull' ||
                formItem.condition === 'isNotNull'">
                &nbsp;
              </template>
              <template v-else>
                <el-select
                  v-if="formItem.formType === 'checkStatus'
                    || formItem.formType === 'dealStatus'
                    || formItem.fieldName === 'invoiceStatus'
                  || (formItem.formType === 'select' && getSettingValueType(formItem.setting) != 'string')"
                  v-model="formItem.value"
                  placeholder="请选择筛选条件">
                  <el-option
                    v-for="item in formItem.setting"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"/>
                </el-select>
                <el-select
                  v-else-if="formItem.formType === 'select' || formItem.formType === 'checkbox'"
                  v-model="formItem.value"
                  multiple
                  placeholder="请选择筛选条件">
                  <el-option
                    v-for="item in formItem.setting"
                    :key="item"
                    :label="item"
                    :value="item"/>
                </el-select>
                <template
                  v-else-if="formItem.formType == 'number' ||
                    formItem.formType == 'floatnumber' ||
                  formItem.formType == 'percent'">
                  <div v-if="formItem.type === 14">
                    <el-input-number
                      v-model="formItem.min"
                      :controls="false"
                      style="width: 100px;"
                      class="small"/>
                    <span>-</span>
                    <el-input-number
                      v-model="formItem.max"
                      :controls="false"
                      style="width: 100px;"
                      class="small"/>
                  </div>
                  <el-input-number
                    v-else
                    v-model="formItem.value"
                    :controls="false"
                    style="width: 100%;"
                    class="small"/>
                </template>
                <template v-else-if="formItem.formType === 'date' || formItem.formType === 'datetime'">
                  <el-date-picker
                    v-show="formItem.type === 14"
                    :ref="`wkDatePicker${index}`"
                    v-model="formItem.range"
                    :picker-options="getPickerOptions(formItem, index)"
                    :type="formItem.formType === 'date' ? 'daterange' : 'datetimerange'"
                    :value-format="formItem.formType === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss'"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right"
                    @change="datePickerChange(formItem)"/>
                  <div
                    v-if="formItem.timeType"
                    class="date-range-content"
                    @click="dateRangeSelect(formItem, index)">{{ formItem.timeTypeName }}</div>
                  <el-date-picker
                    v-show="formItem.type !== 14"
                    v-model="formItem.value"
                    :value-format="formItem.formType === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss'"
                    :type="formItem.formType"
                    placeholder="选择日期"/>
                </template>
                <el-select
                  v-else-if="formItem.formType === 'business_type'"
                  v-model="formItem.statusId">
                  <el-option
                    v-for="item in formItem.statusOption"
                    :key="item.statusId"
                    :label="item.name"
                    :value="item.statusId"/>
                </el-select>
                <wk-user-select
                  v-else-if="formItem.formType === 'user' || formItem.formType === 'single_user'"
                  :radio="false"
                  v-model="formItem.value"
                  @change="userDepChange(formItem, arguments[0], arguments[1])"/>
                <wk-dep-select
                  v-else-if="formItem.formType === 'structure'"
                  :radio="false"
                  v-model="formItem.value"
                  @change="userDepChange(formItem, arguments[0], arguments[1])"/>
                <el-switch
                  v-else-if="formItem.formType == 'boolean_value'"
                  v-model="formItem.value"
                  active-value="1"
                  inactive-value="0"/>
                <xh-prouct-cate
                  v-else-if="formItem.formType === 'category'"
                  :item="formItem"
                  :value="formItem.value"
                  @value-change="arrayValueChange"/>
                <v-distpicker
                  v-else-if="formItem.formType === 'map_address'"
                  :province="formItem.address.state"
                  :city="formItem.address.city"
                  :area="formItem.address.area"
                  @province="selectProvince($event,formItem)"
                  @city="selectCity($event,formItem)"
                  @area="selectArea($event,formItem)"/>
                <wk-position
                  v-else-if="formItem.formType == 'position'"
                  :show-detail="false"
                  :props="{ checkStrictly: true }"
                  v-model="formItem.value"/>
                <el-input
                  v-else
                  v-model="formItem.value"
                  placeholder="多个条件请用；隔开"/>
              </template>
            </el-col>
            <el-col
              :span="1"
              class="delete">
              <i
                class="el-icon-error delete-btn"
                @click="handleDelete(index)"/>
            </el-col>
          </el-row>
        </template>
      </el-form-item>
    </el-form>
    <p
      v-show="showErrors"
      class="el-icon-warning warning-info">
      <span class="desc">筛选条件中有重复项！</span>
    </p>
    <el-button
      type="text"
      @click="handleAdd">+ 添加筛选条件</el-button>
    <div class="save">
      <div class="save-setting">
        <el-checkbox v-model="saveDefault">设置为默认</el-checkbox>
      </div>
    </div>
    <div
      slot="footer"
      class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { crmSceneSaveAPI, crmSceneUpdateAPI } from '@/api/crm/common'
import { productCategoryIndexAPI } from '@/api/admin/crm'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import { XhProuctCate } from '@/components/CreateCom'
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import WkDepSelect from '@/components/NewCom/WkDepSelect'
import VDistpicker from '@/components/VDistpicker'
import WkPosition from '@/components/NewCom/WkPosition'

import { objDeepCopy } from '@/utils'
import AdvancedFilterMixin from '@/mixins/AdvancedFilter'
import { isArray, isEmpty } from '@/utils/types'

/**
 * fieldList: 高级筛选的字段
 *     type:  date || datetime || select || 其他 input
 */
export default {
  name: 'SceneCreate', // 新建场景
  components: {
    WkUserSelect,
    XhProuctCate,
    VDistpicker,
    WkDepSelect,
    WkPosition
  },
  mixins: [AdvancedFilterMixin],
  props: {
    dialogVisible: {
      type: Boolean,
      required: true,
      default: false
    },
    fieldList: {
      type: Array,
      required: true,
      default: () => {
        return []
      }
    },
    obj: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    },
    /** 没有值就是全部类型 有值就是当个类型 */
    crmType: {
      type: String,
      default: ''
    },
    /** 名字和 默认 id 编辑的时候需要 */
    name: {
      type: String,
      default: ''
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    edit_id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: [],
      visible: false, // 控制展示
      showErrors: false,
      saveDefault: false, // 设置为默认场景
      saveName: null, // 场景名称
      timeTypes: [
        { text: '本年度', value: 'year' },
        { text: '上一年度', value: 'lastYear' },
        { text: '下一年度', value: 'nextYear' },
        { text: '上半年', value: 'firstHalfYear' },
        { text: '下半年', value: 'nextHalfYear' },
        { text: '本季度', value: 'quarter' },
        { text: '上一季度', value: 'lastQuarter' },
        { text: '下一季度', value: 'nextQuarter' },
        { text: '本月', value: 'month' },
        { text: '上月', value: 'lastMonth' },
        { text: '下月', value: 'nextMonth' },
        { text: '本周', value: 'week' },
        { text: '上周', value: 'lastWeek' },
        { text: '下周', value: 'nextWeek' },
        { text: '今天', value: 'today' },
        { text: '昨天', value: 'yesterday' },
        { text: '明天', value: 'tomorrow' },
        { text: '过去7天', value: 'previous7day' },
        { text: '过去30天', value: 'previous30day' },
        { text: '未来7天', value: 'future7day' },
        { text: '未来30天', value: 'future30day' }
      ]
    }
  },
  computed: {},
  watch: {
    dialogVisible: {
      handler(val) {
        if (val) {
          // 处理编辑数据
          let form = []
          if (this.edit_id) {
            for (const field in this.obj.obj) {
              const element = this.obj.obj[field]
              const item = this.getItem()
              item.fieldName = element.name
              item.formType = element.formType
              item.type = element.type
              this.getAdvancedFilterOptions(element.formType, element.fieldName).forEach(child => {
                if (element.type === child.type) {
                  item.condition = child.value
                }
              })

              // 校准setting
              if (item.formType === 'checkbox' || item.formType === 'select' || item.formType === 'dealStatus' || item.formType === 'checkStatus') {
                item.setting = this.getEditSetting(item.formType, item.fieldName)
              }

              if (element.formType == 'date' || element.formType == 'datetime') {
                item.value = '' // 时间点
                this.$set(item, 'timeType', '')
                this.$set(item, 'timeTypeName', '')
                this.$set(item, 'range', [])

                if (item.type === 14) {
                  if (isArray(element.values) && element.values.length > 0) {
                    if (element.values.length === 1) {
                      item.timeType = element.values[0]
                      const timeObj = this.timeTypes.find(tItem => tItem.value === item.timeType)
                      if (timeObj) {
                        item.timeTypeName = timeObj.text
                      }
                    } else {
                      this.$set(item, 'range', element.values.slice(0, 2))
                    }
                  } else {
                    item.value = ''
                  }
                } else {
                  item.value = element.values[0]
                }
              } else if (
                element.formType == 'number' ||
                element.formType == 'floatnumber' ||
                element.formType == 'percent'
              ) {
                item.min = ''
                item.max = ''
                item.value = ''
                if (item.type === 14) {
                  item.min = isArray(element.values) && !isEmpty(element.values[0]) ? element.values[0] : ''
                  item.max = isArray(element.values) && !isEmpty(element.values[1]) ? element.values[1] : ''
                } else {
                  item.value = element.values[0]
                }
              } else if (element.formType == 'business_type') {
                item.typeId = element.values[0]
                item.statusId = element.values.length > 1 ? element.values[1] : null
                item.typeOption = this.getEditSetting(item.formType, item.fieldName)
                if (element.typeId) {
                  const obj = item.typeOption.find(typeItem => {
                    return typeItem.typeId === element.typeId
                  })
                  if (obj) {
                    item.statusOption = obj.statusList
                  } else {
                    item.statusOption = []
                  }
                }
              } else if (element.formType == 'user' ||
               element.formType == 'single_user' ||
               element.formType == 'structure' ||
               element.formType == 'checkbox' ||
               element.formType == 'position') {
                item.value = element.values
              } else if (element.formType == 'select') {
                if (this.getSettingValueType(item.setting) != 'string') {
                  item.value = element.values[0]
                } else {
                  item.value = element.values
                }
              } else if (element.formType == 'category') {
                item.value = []
                this.getProductCategoryValue(item, element.values[0])
              } else if (element.formType == 'map_address') {
                const addressArr = element.values[0].split(',')
                item.address = {
                  state: addressArr.length > 0 ? addressArr[0] : '',
                  city: addressArr.length > 1 ? addressArr[1] : '',
                  area: addressArr.length > 2 ? addressArr[2] : ''
                }
              } else {
                item.setting = element.setting
                item.value = element.values.join(';')
              }

              form.push(item)
            }
          } else {
            form = objDeepCopy(this.obj.form)
            if (form.length == 0) {
              form.push(this.getItem())
            }
          }

          this.form = form
          /** 只有编辑会牵扯到这两个字段赋值 */
          if (this.name) {
            this.saveName = this.name
          } else {
            this.saveName = ''
          }
          if (this.isDefault) {
            this.saveDefault = this.isDefault
          } else {
            this.saveDefault = false
          }
        }
        this.visible = this.dialogVisible
      },
      deep: true,
      immediate: true
    },

    form() {
      this.$nextTick(() => {
        var container = document.getElementById('scene-filter-container')
        container.scrollTop = container.scrollHeight
      })
    }
  },
  methods: {
    /**
     * 获取编辑setting
     */
    getEditSetting(formType, fieldName) {
      const obj = this.fieldList.find(item => {
        return item.formType == formType && item.fieldName == fieldName
      })

      if (obj) {
        return obj.setting
      }

      return []
    },

    /**
     * 获取产品类别的值
     */
    getProductCategoryValue(item, categoryId) {
      productCategoryIndexAPI()
        .then(res => {
          const categoryList = res.data || []
          const categoryIds = []
          this.filterProductTree(categoryList, categoryId, categoryIds)
          item.value = categoryIds.reverse()
        })
        .catch(() => {})
    },

    filterProductTree(tree, categoryId, categoryIds) {
      for (let index = 0; index < tree.length; index++) {
        const element = tree[index]
        if (element.categoryId == categoryId) {
          categoryIds.push(categoryId)
          this.filterProductTree(tree, element.pid, categoryIds)
          break
        }
      }
    },

    /**
     * 位置更改
     */
    selectProvince(data, formItem) {
      formItem.address.state = data.value
    },
    selectCity(data, formItem) {
      formItem.address.city = data.value
    },
    selectArea(data, formItem) {
      formItem.address.area = data.value
    },

    getItem() {
      return {
        fieldName: '',
        name: '',
        type: 3,
        formType: '',
        condition: 'contains',
        value: '',
        setting: [],
        typeOption: [],
        statusOption: [],
        typeId: '',
        statusId: ''
      }
    },
    /**
     * 商机组状态
     */
    typeOptionsChange(formItem) {
      if (formItem.typeId) {
        const obj = formItem.typeOption.find(item => {
          return item.typeId === formItem.typeId
        })
        formItem.statusOption = obj.statusList || []
      } else {
        formItem.statusOption = []
      }
      formItem.statusId = ''
    },
    /**
     * 用户创建人
     * 产品类别
     */
    arrayValueChange(data) {
      if (data.value.length > 0) {
        data.item.value = data.value
        data.item.valueContent = data.valueContent
      } else {
        data.item.value = []
      }
    },
    /**
     * 用户部门change
     */
    userDepChange(formItem, dataIds, data) {
      // 用于部门员工的展示
      formItem.valueContent = data
    },
    /**
     * 连接条件的变更
     */
    selectChange(event, formItem) {
      this.getAdvancedFilterOptions(formItem.formType, formItem.fieldName).forEach(item => {
        if (item.value === event) {
          formItem.type = item.type
        }
      })
    },
    /**
     * 是否展示条件
     */
    showCalCondition(formType, fieldName) {
      return this.getAdvancedFilterOptions(formType, fieldName).length > 0
    },

    /**
     * 值span
     */
    getValueSpan(formType, fieldName) {
      if (formType == 'business_type') {
        return 8
      }
      return this.showCalCondition(formType, fieldName) ? 8 : 13
    },

    /**
     * 聚焦
     */
    fieldFocus() {
      this.$el.click()
    },

    /**
     * 当前选择的字段名改变，判断是否有重复
     * @param formItem
     */
    fieldChange(formItem) {
      const obj = this.fieldList.find(item => {
        return item.fieldName === formItem.fieldName
      })
      if (obj) {
        formItem.formType = obj.formType
        formItem.name = obj.name
        if (formItem.formType == 'business_type') {
          formItem.typeOption = obj.setting
          formItem.statusOption = []
          formItem.typeId = ''
          formItem.statusId = ''
          formItem.value = ''
        } else if (
          formItem.formType == 'checkStatus' ||
          formItem.formType == 'dealStatus'
        ) {
          formItem.setting = obj.setting || []
          formItem.value = ''
        } else if (formItem.formType == 'map_address') {
          formItem.address = {
            state: '',
            city: '',
            area: ''
          }
        } else if (
          formItem.formType === 'user' ||
          formItem.formType === 'single_user' ||
          formItem.formType === 'structure' ||
          formItem.formType === 'category' ||
          formItem.formType === 'position'
        ) {
          formItem.value = []
        } else if (
          formItem.formType === 'date' ||
          formItem.formType === 'datetime'
        ) {
          formItem.value = '' // 时间点
          this.$set(formItem, 'timeType', '')
          this.$set(formItem, 'timeTypeName', '')
          this.$set(formItem, 'range', [])
        } else if (
          formItem.formType == 'select' ||
          formItem.formType === 'checkbox'
        ) {
          formItem.setting = obj.setting || []
          formItem.value = []
        } else if (
          formItem.formType == 'number' ||
          formItem.formType == 'floatnumber' ||
          formItem.formType == 'percent'
        ) {
          formItem.min = ''
          formItem.max = ''
          formItem.value = ''
        } else {
          formItem.value = ''
        }

        const conditions = this.getAdvancedFilterOptions(formItem.formType)
        if (conditions.length > 0) {
          const conditionObj = conditions[0]
          formItem.condition = conditionObj.value
          formItem.type = conditionObj.type
        } else {
          formItem.condition = 'is'
          formItem.type = 1
        }
      }

      this.getError()
    },
    /**
     * 取消选择
     */
    handleCancel() {
      this.visible = false
      this.$emit('update:dialogVisible', false)
    },

    /**
     *获取错误
     */
    getError() {
      this.showErrors = false
      const fieldNames = []
      for (let index = 0; index < this.form.length; index++) {
        const item = this.form[index]
        if (fieldNames.includes(item.fieldName)) {
          this.showErrors = true
          break
        } else {
          fieldNames.push(item.fieldName)
        }
      }
    },

    /**
     * 确定选择
     */
    handleConfirm() {
      if (this.showErrors) {
        this.$message.error('筛选条件中有重复项！')
        return
      }
      if (!this.saveName || this.saveName === '') {
        this.$message.error('场景名称不能为空！')
        return
      }
      for (let i = 0; i < this.form.length; i++) {
        const o = this.form[i]
        if (!o.fieldName || o.fieldName === '') {
          this.$message.error('筛选的字段名称不能为空！')
          return
        }
        if (o.formType == 'business_type') {
          if (!o.typeId && !o.statusId) {
            this.$message.error('筛选内容不能为空！')
            return
          }
        } else if (o.formType == 'map_address') {
          if (!o.address.state && !o.address.city && !o.address.area) {
            this.$message.error('筛选内容不能为空！')
            return
          }
        } else if (
          o.formType == 'date' ||
          o.formType == 'datetime'
        ) {
          if (o.condition != 'isNull' && o.condition != 'isNotNull') {
            if (o.type === 14) {
              if (isEmpty(o.timeType) && isEmpty(o.range)) {
                this.$message.error('筛选内容不能为空！')
                return
              }
            } else {
              if (isEmpty(o.value)) {
                this.$message.error('筛选内容不能为空！')
                return
              }
            }
          }
        } else if (
          o.formType == 'number' ||
          o.formType == 'floatnumber' ||
          o.formType == 'percent'
        ) {
          if (o.condition != 'isNull' && o.condition != 'isNotNull') {
            if (o.type === 14) {
              if (isEmpty(o.min) || isEmpty(o.max)) {
                this.$message.error('筛选内容不能为空！')
                return
              }
            } else {
              if (isEmpty(o.value)) {
                this.$message.error('筛选内容不能为空！')
                return
              }
            }
          }
        } else if (
          o.formType == 'user' ||
          o.formType == 'single_user' ||
          o.formType == 'structure' ||
          o.formType == 'category' ||
          o.formType == 'checkbox' ||
          o.formType == 'position'
        ) {
          if (!o.value || o.value.length === 0) {
            if (o.condition != 'isNull' && o.condition != 'isNotNull') {
              this.$message.error('筛选内容不能为空！')
              return
            }
          }
        } else if (isEmpty(o.value)) {
          if (o.condition != 'isNull' && o.condition != 'isNotNull') {
            this.$message.error('筛选内容不能为空！')
            return
          }
        }
      }
      const obj = []
      this.form.forEach(o => {
        if (o.formType == 'datetime' || o.formType == 'date') {
          let dataValues = []
          if (o.type === 14) {
            if (!isEmpty(o.timeType)) {
              dataValues = [o.timeType]
            } else {
              dataValues = o.range
            }
          } else {
            dataValues = [o.value]
          }
          obj.push({
            formType: o.formType,
            name: o.fieldName,
            type: o.type,
            values: dataValues
          })
        } else if (
          o.formType == 'number' ||
          o.formType == 'floatnumber' ||
          o.formType == 'percent'
        ) {
          let dataValues = []
          if (o.type === 14) {
            dataValues = [isEmpty(o.min) ? '' : o.min, isEmpty(o.max) ? '' : o.max]
          } else {
            dataValues = [o.value]
          }
          obj.push({
            formType: o.formType,
            name: o.fieldName,
            type: o.type,
            values: dataValues
          })
        } else if (o.formType == 'business_type') {
          obj.push({
            formType: o.formType,
            name: o.statusId ? 'statusId' : 'typeId',
            type: 1,
            values: o.statusId ? [o.typeId, o.statusId] : [o.typeId]
          })
        } else if (o.formType == 'user' || o.formType == 'single_user') {
          obj.push({
            type: o.type,
            values: o.value,
            formType: o.formType,
            name: o.fieldName
          })
        } else if (o.formType == 'position') {
          obj.push({
            type: o.type,
            values: o.value.filter(item => !isEmpty(item.name)).map(item => JSON.stringify(item)),
            formType: o.formType,
            name: o.fieldName
          })
        } else if (o.formType == 'structure') {
          obj.push({
            type: o.type,
            values: o.value,
            formType: o.formType,
            name: o.fieldName
          })
        } else if (o.formType == 'checkbox') {
          obj.push({
            type: o.type,
            values: o.value,
            formType: o.formType,
            name: o.fieldName
          })
        } else if (o.formType == 'category') {
          obj.push({
            type: 1,
            values: [o.value[o.value.length - 1]],
            formType: o.formType,
            name: o.fieldName
          })
        } else if (o.formType == 'select') {
          let values = o.value
          if (this.getSettingValueType(o.setting) != 'string') {
            values = [o.value]
          }
          obj.push({
            type: o.type,
            values: values,
            formType: o.formType,
            name: o.fieldName
          })
        } else if (o.formType == 'map_address') {
          const value = []
          for (const key in o.address) {
            const addValue = o.address[key]
            if (addValue) {
              value.push(addValue)
            }
          }
          obj.push({
            values: [value.join(',')],
            type: 1,
            formType: o.formType,
            name: o.fieldName
          })
        } else {
          let values = []
          if (typeof o.value === 'string') {
            const temp = o.value.replace(/；/g, ';')
            values = temp.split(';').filter(item => item !== '' && item !== null)
          } else {
            values = [o.value]
          }

          obj.push({
            type: o.type,
            values: values,
            formType: o.formType,
            name: o.fieldName
          })
        }
      })
      const data = {
        obj: obj,
        form: this.form,
        saveDefault: this.saveDefault,
        saveName: this.saveName
      }
      this.requestCreateScene(data)
    },
    // 创建场景
    requestCreateScene(data) {
      /** 编辑操作 */
      if (this.edit_id) {
        crmSceneUpdateAPI({
          isDefault: data.saveDefault ? 1 : 0,
          name: data.saveName,
          sceneId: this.edit_id,
          type: crmTypeModel[this.crmType],
          data: JSON.stringify(data.obj)
        })
          .then(res => {
            this.$message({
              type: 'success',
              message: '编辑成功'
            })
            // 新建成功
            this.$emit('save-success')
            this.handleCancel()
          })
          .catch(() => {})
      } else {
        crmSceneSaveAPI({
          type: crmTypeModel[this.crmType],
          isDefault: data.saveDefault ? 1 : 0,
          name: data.saveName,
          data: JSON.stringify(data.obj)
        })
          .then(res => {
            // 新建成功
            this.$emit('save-success')
            this.$message({
              type: 'success',
              message: '创建成功'
            })
            this.handleCancel()
          })
          .catch(() => {})
      }
    },
    /**
     * 添加筛选条件
     */
    handleAdd() {
      this.form.push(this.getItem())
    },
    /**
     * 删除筛选条件
     * @param index
     */
    handleDelete(index) {
      this.$confirm('您确定要删除这一条数据吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.form.splice(index, 1)
          this.getError()
        })
        .catch(() => {})
    },

    /**
     * 获取setting数据类型
     */
    getSettingValueType(setting) {
      if (setting && setting.length > 0) {
        const value = setting[0]
        return typeof value
      }
      return []
    },

    /**
     * 聚焦datepicker
     */
    dateRangeSelect(formItem, index) {
      const datePicker = this.$refs[`wkDatePicker${index}`][0]
      this.$nextTick(() => {
        datePicker.focus()
        datePicker.pickerVisible = true
      })
    },

    /**
     * datepicker change
     */
    datePickerChange(formItem) {
      formItem.timeTypeName = ''
      formItem.timeType = ''
    },

    /**
     * 时间筛选配置
     */
    getPickerOptions(item, itemIndex) {
      const shortcuts = []
      for (let index = 0; index < this.timeTypes.length; index++) {
        const element = this.timeTypes[index]
        shortcuts.push({
          text: element.text,
          onClick: (picker) => {
            picker.$emit('pick', [], false)
            this.$nextTick(() => {
              item.timeTypeName = element.text
              item.timeType = element.value
            })
          }
        })
      }

      return {
        shortcuts: shortcuts
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__body {
  padding: 10px 20px;
}

/deep/ .el-form-item__label {
  width: 100%;
  text-align: left;
}
.filter-container {
  max-height: 200px;
  overflow-y: auto;
}

.save {
  margin-top: 10px;
  .name {
    width: 300px;
    margin-left: 10px;
    /deep/ .el-input__inner {
      height: 32px;
    }
  }
  .save-setting {
    margin-top: 20px;
  }
}

.el-form-item {
  margin-bottom: 0;
}

.el-row {
  margin-bottom: 20px;
  .delete-btn {
    margin-left: 15px;
    color: #bbb;
    cursor: pointer;
  }
  .el-select,
  .el-date-editor {
    width: 100%;
    /deep/ .el-range__icon {
      line-height: 26px;
    }
  }

  .el-input-number {
    /deep/ input {
      text-align: left;
      padding: 0 8px;
    }
  }

  .date-range-content {
    position: absolute;
    left: 30px;
    right: 30px;
    top: 4px;
    height: 30px;
    line-height: 30px;
    background: white;
    font-size: 13px;
    cursor: pointer;
  }
}

.warning-info {
  width: 100%;
  font-size: 14px;
  color: #f56c6c;
  margin-top: 10px;
  .desc {
    padding-left: 8px;
  }
}

.scene-name-container {
  padding-bottom: 15px;
  .scene-input {
    width: 300px;
  }
}
.scene-name {
  margin-bottom: 10px;
}
</style>
