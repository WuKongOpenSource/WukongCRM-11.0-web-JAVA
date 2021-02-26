import { filedValidatesAPI } from '@/api/crm/common'

import { isArray, isEmpty, isObject } from '@/utils/types'
import { objDeepCopy } from '@/utils'
import GenerateRulesMixin from '@/components/NewCom/WkForm/GenerateRules'

export default {
  mixins: [GenerateRulesMixin],

  props: {},

  methods: {
    /**
     * 获取初始value值
     * detail 主要用于关联模块
     * type update 读取 value 判断 save 读取 defaultValue 判断
     */
    getItemValue(item, detail, type) {
      detail = detail || {}
      if (item.formType == 'contacts' ||
          item.formType == 'customer' ||
          item.formType == 'contract' ||
          item.formType == 'business'
      ) {
        // crm相关信息特殊处理
        if (type === 'update') {
          return item.value ? objDeepCopy(item.value) : []
        } else {
          const relativeData = detail[item.formType]
          return relativeData ? [relativeData] : []
        }
      } else if (item.formType == 'category') {
        // 产品类别
        return item.value ? item.value.map(item => parseInt(item)) : []
      } else if (item.formType == 'product') {
        // 关联产品
        return item.value
      } else if (item.formType == 'map_address') {
        if (type == 'update') {
          if (item.value.address) {
            item.value.address = item.value.address.split(',')
          }
          return item.value
        } else {
          return {}
        }
      } else if (item.formType == 'single_user') {
        if (type === 'update') {
          return isObject(item.value) && item.value.userId
            ? item.value.userId
            : ''
        } else {
          return isArray(item.defaultValue) && item.defaultValue.length > 0
            ? objDeepCopy(item.defaultValue[0]).userId
            : ''
        }
      } else if (item.formType == 'user' ||
            item.formType == 'structure' ||
            item.formType == 'file') {
        if (type === 'update') {
          return item.value ? objDeepCopy(item.value) : []
        } else {
          return item.defaultValue
            ? objDeepCopy(item.defaultValue)
            : []
        }
      } else {
        if (item.formType == 'number' ||
        item.formType == 'floatnumber' ||
        item.formType == 'percent') {
          if (type == 'update') {
            return isEmpty(item.value) ? undefined : item.value
          } else {
            return isEmpty(item.defaultValue) ? undefined : item.defaultValue
          }
        } else {
          if (type == 'update') {
            return item.value || ''
          } else {
            return item.defaultValue || ''
          }
        }
      }
    },

    /**
     * 验证唯一
     */
    getUniquePromise(field, value, detail) {
      return new Promise((resolve, reject) => {
        var validatesParams = {}
        validatesParams.fieldId = field.fieldId
        if (isArray(value)) {
          let postValue = ''
          if (value.length > 0) {
            if (
              field.formType == 'user' ||
                  field.formType == 'structure'
            ) {
              postValue = value
                .map(valueItem => {
                  return field.formType == 'user'
                    ? valueItem.userId
                    : valueItem.id
                })
                .join(',')
            } else if (field.fieldName == 'categoryId') {
              if (value && value.length) {
                postValue = value[value.length - 1]
              } else {
                postValue = ''
              }
            } else if (field.formType == 'checkbox') {
              postValue = value.join(',')
            }
          }
          validatesParams.value = postValue
        } else {
          validatesParams.value = value
        }
        if (detail.type == 'update') {
          validatesParams.batchId = detail.batchId
        }

        filedValidatesAPI(validatesParams).then(res => {
          // status 1 通过 0
          const resData = res.data || {}
          if (resData.status === 1) {
            resolve()
          } else {
            if (resData.ownerUserName) {
              reject(`${field.name}已存在，负责人为“${resData.ownerUserName}”`)
            } else if (resData.poolNames && resData.poolNames.length > 0) {
              reject(`${field.name}已存在，当前位于公海“${resData.poolNames.join('，')}”`)
            } else {
              reject(`${field.name}已存在`)
            }
          }
        }).catch(() => {
          reject()
        })
      })
    },

    /**
     * 获取字段默认内容
     */
    getFormItemDefaultProperty(item) {
      const temp = {}
      temp.field = item.fieldName
      temp.formType = item.formType
      temp.fieldId = item.fieldId
      temp.inputTips = item.inputTips
      temp.name = item.name
      temp.setting = item.setting
      temp.stylePercent = item.stylePercent
      temp.precisions = item.precisions
      // 细化 precisions
      if (item.formType === 'date_interval') {
        // 1 日期  2 时间日期
        if (item.precisions === 2) {
          temp.dateType = 'datetimerange'
          temp.dateValueFormat = 'yyyy-MM-dd HH:mm:ss'
        } else {
          temp.dateType = 'daterange'
          temp.dateValueFormat = 'yyyy-MM-dd'
        }
      } else if (item.formType === 'position') {
        // 1 省/地区、市、区/县、详细地址 2 省/地区、市、区/县
        // 3 省/地区、市 4 省/地区
        temp.showDetail = item.precisions === 1
        temp.hideArea = item.precisions === 3 || item.precisions === 4
        temp.onlyProvince = item.precisions === 4
      }
      return temp
    },

    /**
     * 获取二维数组字段
     * @param {*} array
     * @param {*} formType
     */
    getItemWithFromType(array, formType) {
      let item = null
      for (let index = 0; index < array.length; index++) {
        const children = array[index]
        for (let childIndex = 0; childIndex < children.length; childIndex++) {
          const element = children[childIndex]
          if (element.formType === formType) {
            item = element
            break
          }
        }

        if (item) {
          break
        }
      }

      return item
    },

    /**
     * 循环二维数组
     * @param {*} array
     * @param {*} result
     */
    itemsForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        const children = array[index]
        for (let childIndex = 0; childIndex < children.length; childIndex++) {
          const element = children[childIndex]
          callback(element, index, childIndex, children)
        }
      }
    },

    /**
     * 获取字段是否可编辑
     */
    getItemIsCanEdit(item, type) {
      // authLevel 1 不能查看不能编辑 2可查看  3 可编辑可查看
      return (type === 'update' && item.authLevel == 3) || type !== 'update'
    },

    /**
     * user single_user structure
     */
    getItemRadio(field, data) {
      if (field.formType == 'user' || field.formType == 'structure') {
        data.radio = false
      } else if (field.formType == 'single_user') {
        data.radio = true
      }
    },

    /**
     * 获取error错误
     */
    getFormErrorMessage(crmForm) {
      // 提示第一个error
      if (crmForm.fields) {
        for (
          let index = 0;
          index < crmForm.fields.length;
          index++
        ) {
          const ruleField = crmForm.fields[index]
          if (ruleField.validateState == 'error') {
            this.$message.error(ruleField.validateMessage)
            break
          }
        }
      }
    },

    /**
     * 获取相关联item
     */
    getItemRelatveInfo(list, fromType) {
      let crmItem = null
      if (this.action.type == 'relative') {
        crmItem = this.action.data[fromType]
      } else {
        const childIsArray = list.length > 0 && isArray(list[0])
        const crmObj = childIsArray ? this.getItemWithFromType(list, fromType) : list.find(listItem => {
          return listItem.formType === fromType
        })

        if (crmObj && crmObj.value && crmObj.value.length > 0) {
          crmItem = crmObj.value[0]
        }
      }
      return crmItem
    },

    /**
     * 获取提交参数
     */
    getSubmiteParams(array, data) {
      var params = { entity: {}, field: [] }
      for (let index = 0; index < array.length; index++) {
        const field = array[index]
        if (field.formType == 'product') {
          this.getProductParams(params, data[field.fieldName])
        } else if (field.formType == 'map_address') {
          this.getCustomerAddressParams(params.entity, data[field.fieldName])
        } else if (field.fieldType == 1) {
          const fieldValue = this.getRealParams(field, data[field.fieldName])
          params.entity[field.fieldName] = isEmpty(fieldValue) ? '' : fieldValue
        } else if (field.formType !== 'desc_text') { //  描述文字忽略
          params.field.push({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            name: field.name,
            type: field.type,
            fieldId: field.fieldId,
            value: this.getRealParams(field, data[field.fieldName])
          })
        }
      }
      return params
    },

    /**
     * 获取产品提交参数
     */
    getProductParams(params, dataValue) {
      if (dataValue) {
        params['product'] = dataValue.product ? dataValue.product.map(item => {
          item.salesPrice = item.salesPrice == '' ? 0 : item.salesPrice
          item.num = item.num == '' ? 0 : item.num
          item.discount = item.discount == '' ? 0 : item.discount
          return item
        }) : []
        params.entity['totalPrice'] = dataValue.totalPrice
          ? dataValue.totalPrice
          : 0
        params.entity['discountRate'] = dataValue.discountRate
          ? dataValue.discountRate
          : 0
      } else {
        params['product'] = []
        params.entity['totalPrice'] = ''
        params.entity['discountRate'] = ''
      }
    },

    /**
     * 获取客户位置提交参数
     */
    getCustomerAddressParams(params, dataValue) {
      params['address'] = dataValue.address
        ? dataValue.address.join(',')
        : ''
      params['detailAddress'] = dataValue.detailAddress
      params['location'] = dataValue.location
      params['lng'] = dataValue.lng
      params['lat'] = dataValue.lat
    },

    /**
     * 关联客户 联系人等数据要特殊处理
     */
    getRealParams(field, dataValue) {
      if (
        field.fieldName == 'customerId' ||
        field.fieldName == 'contactsId' ||
        field.fieldName == 'businessId' ||
        field.fieldName == 'leadsId' ||
        field.fieldName == 'contractId') {
        if (dataValue && dataValue.length) {
          return dataValue[0][field.fieldName]
        } else {
          return ''
        }
      } else if (
        field.formType == 'user' ||
        field.formType == 'structure'
      ) {
        return dataValue ? dataValue.join(',') : ''
      } else if (field.formType == 'file') {
        if (dataValue && dataValue.length > 0) {
          return dataValue[0].batchId
        }
        return ''
      } else if (field.formType == 'category') {
        if (dataValue && dataValue.length > 0) {
          return dataValue[dataValue.length - 1]
        }
        return ''
      } else if (field.formType == 'checkbox') {
        if (dataValue && dataValue.length > 0) {
          return dataValue.join(',')
        }
        return ''
      }

      return dataValue
    }

  }
}
