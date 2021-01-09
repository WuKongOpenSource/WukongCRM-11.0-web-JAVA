import {
  examinesPreviewFiledNameAPI,
  examinesPreviewExamineFlowAPI
} from '@/api/examine'
import { isEmpty } from '@/utils/types'
import { debounce } from 'throttle-debounce'

/**
 * debouncedGetWkFlowList
 * initWkFlowData
 * validateWkFlowData
 */
export default {
  data() {
    /**
     * _wkFlowResolve 返回审批流结果
     * {
     *   list 审批未空 无审批流
     * }
     */
    return {
      // 审批信息
      _wkFlowSetFields: null, // 有值有审批流
      _wkFlowSetFieldNames: [],
      _wkFlowParams: {},
      _wkFlowListParams: {},
      _wkFlowResolve: null,
      _wkFieldForm: {} // 自定字段值
    }
  },

  created() {
    this.debouncedGetWkFlowList = debounce(500, this._getWkFlowList)
  },

  methods: {
    /**
     * 初始化审批流
     * data 包含 params 参数
     * fieldForm 自定义字段值
     */
    initWkFlowData(data, resultFun) {
      if (data.params) {
        this._wkFlowParams = data.params
      }
      if (data.fieldForm) {
        this._wkFieldForm = data.fieldForm
      }
      this._wkFlowResolve = resultFun
      this._getWkFlowSetFields()
    },

    /**
     * 获取可设置字段
     */
    _getWkFlowSetFields() {
      examinesPreviewFiledNameAPI(this._wkFlowParams).then(res => {
        this._wkFlowSetFields = res.data
        if (this._wkFlowSetFields) {
          this._wkFlowSetFieldNames = this._wkFlowSetFields.map(item => item.fieldName)
          this._getWkFlowList(null, this._wkFieldForm)
        } else {
          if (this._wkFlowResolve) {
            this._wkFlowResolve({
              list: null
            })
          }
        }
      }).catch(() => {})
    },

    /**
     * 获取审批流展示字段
     */
    _getWkFlowList(field, fieldForm) {
      // 不存在 不监测
      if (!this._wkFlowSetFields) {
        return
      }
      if (this._wkFlowSetFieldNames.includes(field) || !field) {
        const params = {}
        this._wkFlowSetFieldNames.forEach(key => {
          const value = fieldForm ? fieldForm[key] : ''
          if (Array.isArray(value)) {
            params[key] = value.join(',')
          } else {
            params[key] = isEmpty(value) ? '' : value
          }
        })
        this._wkFlowListParams = {
          ...this._wkFlowParams,
          dataMap: params
        }
        examinesPreviewExamineFlowAPI(this._wkFlowListParams).then(res => {
          const resData = res.data || {}

          const wkFlowList = resData.examineFlowList || []
          wkFlowList.forEach(item => {
            item.values = []
          })
          if (this._wkFlowResolve) {
            this._wkFlowResolve({
              list: wkFlowList,
              resData: resData
            })
          }
        }).catch(() => {})
      }
    },

    /**
     * 验证数据是否完整，并反馈结果
     */
    validateWkFlowData(flowList) {
      let pass = true
      const list = []

      if (!flowList) {
        return {
          pass,
          data: null
        }
      }
      flowList.forEach(item => {
        if (item.examineType === 4) {
          if (item.values.length > 0) {
            list.push({
              flowId: item.flowId,
              userList: item.values.map(item => item.userId)
            })
          } else {
            pass = false
          }
        }
      })

      return {
        pass,
        data: {
          ...this._wkFlowListParams,
          optionalList: list
        }
      }
    }
  }
}
