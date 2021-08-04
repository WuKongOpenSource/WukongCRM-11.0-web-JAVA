/**
 * Created by yxk at 2020/6/1
 * 单个自定义字段生成校验规则
 */
import {
  regexIsCRMNumber,
  regexIsCRMMoneyNumber,
  regexIsCRMMobile,
  regexIsCRMEmail
} from '@/utils'
import { isEmpty, isObject, isArray } from '@/utils/types'


export default {
  methods: {
    /**
     * 唯一性校验
     * @param data
     * @returns {Promise<unknown>}
     * @constructor
     */
    UniquePromise(data) {
      return new Promise(resolve => {
        resolve()
      })
    },

    /**
     * 生成单个字段的验证规则
     * @param item 字段信息
     * @returns {[]}
     */
    getRules(item) {
      const tempList = []

      // 验证必填
      if (item.isNull == 1) {
        tempList.push({
          required: true,
          message: item.name + '不能为空',
          trigger: ['blur', 'change']
        })

        if (item.formType == 'detail_table') {
          tempList.push({
            validator: ({ item }, value, callback) => {
              if (this.getDetailTableIsEmpty(item.fieldExtendList, value)) {
                callback(new Error(item.name + '不能为空'))
              } else {
                callback()
              }
            },
            item: item,
            trigger: ['blur', 'change']
          })
        } else if (item.formType == 'checkbox') {
          tempList.push({
            validator: ({ item }, value, callback) => {
              if (!isArray(value) || value.length === 0) {
                callback(new Error(item.name + '不能为空'))
              } else {
                const emptyObj = value.find(valueItem => isEmpty(valueItem))
                emptyObj === '' ? callback(new Error(item.name + '不能为空')) : callback()
              }
            },
            item: item,
            trigger: ['blur', 'change']
          })
        }
      }

      // 验证唯一
      if (item.isUnique == 1 && this.UniquePromise) {
        const validateUnique = (rule, value, callback) => {
          if (isEmpty(value)) {
            callback()
          } else {
            // 验证唯一
            this.UniquePromise({
              field: item,
              rule: rule,
              value: value
            }).then(() => {
              callback()
            }).catch(msg => {
              callback(new Error(msg || '验证出错'))
            })
          }
        }
        tempList.push({
          validator: validateUnique,
          item: item,
          trigger:
            item.formType == 'checkbox' || item.formType == 'select'
              ? ['change', 'blur']
              : ['blur']
        })
      }

      // 特殊类型
      if (item.formType === 'number' || item.formType === 'percent') {
        const validateCRMNumber = (rule, value, callback) => {
          if (item.hasOwnProperty('precisions')) {
            this._getNumberRule(rule, value, callback)
          } else {
            if (isEmpty(value) || regexIsCRMNumber(value)) {
              callback()
            } else {
              callback(new Error('数字的整数部分须少于15位，小数部分须少于4位'))
            }
          }
        }
        tempList.push({
          validator: validateCRMNumber,
          item: item,
          trigger: ['blur', 'change']
        })
      } else if (item.formType === 'floatnumber') {
        const validateCRMMoneyNumber = (rule, value, callback) => {
          if (item.hasOwnProperty('precisions')) {
            this._getNumberRule(rule, value, callback)
          } else {
            if (isEmpty(value) || regexIsCRMMoneyNumber(value)) {
              callback()
            } else {
              callback(new Error('货币的整数部分须少于15位，小数部分须少于2位'))
            }
          }
        }
        tempList.push({
          validator: validateCRMMoneyNumber,
          item: item,
          trigger: ['blur', 'change']
        })
      } else if (item.formType === 'mobile') {
        const validateCRMMobile = (rule, value, callback) => {
          if (isEmpty(value) || regexIsCRMMobile(value)) {
            callback()
          } else {
            callback(new Error('手机格式有误'))
          }
        }
        tempList.push({
          validator: validateCRMMobile,
          item: item,
          trigger: ['blur']
        })
      } else if (item.formType === 'email') {
        const validateCRMEmail = (rule, value, callback) => {
          if (isEmpty(value) || regexIsCRMEmail(value)) {
            callback()
          } else {
            callback(new Error('邮箱格式有误'))
          }
        }
        tempList.push({
          validator: validateCRMEmail,
          item: item,
          trigger: ['blur']
        })
      } else if (item.formType === 'location' && item.isNull == 1) {
        const validateLocation = (rule, value, callback) => {
          if (!isObject(value) || (
            isObject(value) && isEmpty(value.lat) && isEmpty(value.lng) && isEmpty(value.address)
          )) {
            callback(new Error(item.name + '不能为空'))
          } else {
            callback()
          }
        }
        tempList.push({
          validator: validateLocation,
          item: item,
          trigger: ['change']
        })
      }

      return tempList
    },

    /**
     * 获取数值规则
     */
    _getNumberRule(rule, value, callback) {
      const field = rule.item

      const arr = String(value).split('.')

      const len = String(value)
        .replace('.', '')
        .replace('-', '')
        .length
      const maxlength = field.formType === 'percent' ? 10 : 15

      const min = isEmpty(field.minNumRestrict) ? -Infinity : Number(field.minNumRestrict || -Infinity)
      const max = isEmpty(field.maxNumRestrict) ? Infinity : Number(field.maxNumRestrict || Infinity)

      if (len > maxlength) {
        callback(new Error(`最多支持${maxlength}位数字（包含小数位）`))
      } else if (isEmpty(field.precisions) && String(value).includes('.')) {
        // null 不支持小数  0 不限制小数位
        callback(new Error(`不支持小数`))
      } else if (arr.length > 1 && arr[1].length > Number(field.precisions)) {
        callback(new Error(`小数位不能大于${field.precisions}`))
      } else if (value < min) {
        callback(new Error(`不能小于${min}`))
      } else if (value > max) {
        callback(new Error(`不能大于${max}`))
      } else {
        callback()
      }
    },

    /**
     * 判断明细表格是否是空
     * @param {*} fieldList
     * @param {*} valueObj
     */
    getDetailTableIsEmpty(fieldList, valueObjs) {
      for (let index = 0; index < valueObjs.length; index++) {
        const valueObj = valueObjs[index]
        if (this.judgeFormValueIsEmpty(fieldList, valueObj)) {
          return true
        }
      }
      return false
    },

    /**
     * 判断对象值是否是空
     */
    judgeFormValueIsEmpty(fieldList, valueObj) {
      for (let index = 0; index < fieldList.length; index++) {
        const field = fieldList[index]
        const value = valueObj[field.fieldName]
        if (field.formType === 'location') {
          if (isObject(value) && (!isEmpty(value.lat) || !isEmpty(value.lng) || !isEmpty(value.address))) {
            return false
          }
        } else if (!isEmpty(value)) {
          return false
        }
      }
      return true
    }
  }
}
