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
import { isEmpty } from '@/utils/types'


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
        console.log(data)
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
              ? ['change']
              : ['blur']
        })
      }

      // 特殊类型
      if (item.formType === 'number') {
        const validateCRMNumber = (rule, value, callback) => {
          if (isEmpty(value) || regexIsCRMNumber(value)) {
            callback()
          } else {
            callback(new Error('数字的整数部分须少于15位，小数部分须少于4位'))
          }
        }
        tempList.push({
          validator: validateCRMNumber,
          item: item,
          trigger: ['blur']
        })
      } else if (item.formType === 'floatnumber') {
        const validateCRMMoneyNumber = (rule, value, callback) => {
          if (isEmpty(value) || regexIsCRMMoneyNumber(value)) {
            callback()
          } else {
            callback(new Error('货币的整数部分须少于15位，小数部分须少于2位'))
          }
        }
        tempList.push({
          validator: validateCRMMoneyNumber,
          item: item,
          trigger: ['blur']
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
      }

      return tempList
    }
  }
}
