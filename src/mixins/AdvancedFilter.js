export default {
  methods: {
    /**
     * 根据类型获取条件
     * @param {String} formType
     * @param {String} fieldName
     */
    getAdvancedFilterOptions(formType, fieldName) {
      // 单行文本、多行文本、网址、手机、邮箱
      // 等于、不等于、包含、不包含、开始于、结束于、为空、不为空
      if (formType == 'text' ||
      formType == 'textarea' ||
      formType == 'website' ||
      formType == 'mobile' ||
      formType == 'email' ||
      formType == 'module') {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 },
          { value: 'contains', label: '包含', disabled: false, type: 3 },
          { value: 'notContains', label: '不包含', disabled: false, type: 4 },
          { value: 'startWith', label: '开始于', disabled: false, type: 12 },
          { value: 'endWith', label: '结束于', disabled: false, type: 13 },
          { value: 'isNull', label: '为空', disabled: false, type: 5 },
          { value: 'isNotNull', label: '不为空', disabled: false, type: 6 }
        ]
      } else if (
        fieldName === 'invoiceStatus' ||
        formType == 'checkStatus' ||
        formType == 'dealStatus'
      ) {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 }
        ]
      } else if (
        // 下拉框 等于、不等于、为空、不为空
        formType == 'select'
      ) {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 },
          { value: 'isNull', label: '为空', disabled: false, type: 5 },
          { value: 'isNotNull', label: '不为空', disabled: false, type: 6 }
        ]
      } else if (
        // 布尔值 等于、不等于
        formType == 'boolean_value'
      ) {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 }
        ]
      } else if (
        formType == 'checkbox' ||
        formType == 'location'
      ) {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 },
          { value: 'contains', label: '包含', disabled: false, type: 3 },
          { value: 'notContains', label: '不包含', disabled: false, type: 4 },
          { value: 'isNull', label: '为空', disabled: false, type: 5 },
          { value: 'isNotNull', label: '不为空', disabled: false, type: 6 }
        ]
        // 数字、货币、百分数
        // 等于、不等于、大于、大于等于、小于、小于等于、区间（范围）、为空、不为空
      } else if (
        formType == 'number' ||
        formType == 'floatnumber' ||
        formType == 'percent'
      ) {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 },
          { value: 'gt', label: '大于', disabled: false, type: 7 },
          { value: 'egt', label: '大于等于', disabled: false, type: 8 },
          { value: 'lt', label: '小于', disabled: false, type: 9 },
          { value: 'elt', label: '小于等于', disabled: false, type: 10 },
          { value: 'range', label: '等于（范围）', disabled: false, type: 14 },
          { value: 'isNull', label: '为空', disabled: false, type: 5 },
          { value: 'isNotNull', label: '不为空', disabled: false, type: 6 }
        ]
        // 日期、日期时间
        // 等于、不等于、早于(大于)、晚于（小于）、不早于（小于等于）、不晚于（大于等于）、等于（时间段）、为空、不为空
      } else if (
        formType == 'date' ||
        formType == 'datetime'
      ) {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 },
          { value: 'lt', label: '早于', disabled: false, type: 9 },
          { value: 'gt', label: '晚于', disabled: false, type: 7 },
          { value: 'egt', label: '不早于', disabled: false, type: 8 },
          { value: 'elt', label: '不晚于', disabled: false, type: 10 },
          { value: 'range', label: '等于（时间段）', disabled: false, type: 14 },
          { value: 'isNull', label: '为空', disabled: false, type: 5 },
          { value: 'isNotNull', label: '不为空', disabled: false, type: 6 }
        ]
        // 日期区间 地址 无判断符
      } else if (
        formType == 'date_interval' ||
        formType == 'position'
      ) {
        return []
        // 人员、部门 包含、不包含、为空、不为空
      } else if (
        formType == 'user' ||
        formType == 'structure' ||
        formType == 'single_user'
      ) {
        return [
          { value: 'contains', label: '包含', disabled: false, type: 3 },
          { value: 'notContains', label: '不包含', disabled: false, type: 4 },
          { value: 'isNull', label: '为空', disabled: false, type: 5 },
          { value: 'isNotNull', label: '不为空', disabled: false, type: 6 }
        ]
      } else {
        return []
      }
    }
  }
}
