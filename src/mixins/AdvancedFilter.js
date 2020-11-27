export default {
  methods: {
    /**
     * 根据类型获取条件
     * @param {*} formType
     */
    getAdvancedFilterOptions(formType) {
      if (
        formType == 'checkStatus' ||
        formType == 'dealStatus'
      ) {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 }
        ]
      } else if (
        formType == 'user' ||
        formType == 'single_user' ||
        formType == 'structure'
      ) {
        return [
          { value: 'contains', label: '包含', disabled: false, type: 3 },
          { value: 'notContains', label: '不包含', disabled: false, type: 4 }
        ]
      } else if (
        formType == 'select'
      ) {
        return [
          { value: 'in', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 }
        ]
      } else if (
        formType == 'checkbox'
      ) {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'contains', label: '包含', disabled: false, type: 3 }
        ]
      } else if (
        formType == 'module' ||
        formType == 'text' ||
        formType == 'textarea'
      ) {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 },
          { value: 'contains', label: '包含', disabled: false, type: 3 },
          { value: 'notContains', label: '不包含', disabled: false, type: 4 }
        ]
      } else if (formType == 'floatnumber' || formType == 'number') {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 },
          { value: 'contains', label: '包含', disabled: false, type: 3 },
          { value: 'notContains', label: '不包含', disabled: false, type: 4 },
          { value: 'isNull', label: '为空', disabled: false, type: 5 },
          { value: 'isNotNull', label: '不为空', disabled: false, type: 6 },
          { value: 'gt', label: '大于', disabled: false, type: 7 },
          { value: 'egt', label: '大于等于', disabled: false, type: 8 },
          { value: 'lt', label: '小于', disabled: false, type: 9 },
          { value: 'elt', label: '小于等于', disabled: false, type: 10 }
        ]
      } else if (formType == 'category') {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isnot', label: '不等于', disabled: false, type: 2 },
          { value: 'contains', label: '包含', disabled: false, type: 3 },
          { value: 'not_contain', label: '不包含', disabled: false, type: 4 }
        ]
      } else if (formType == 'mobile' || formType == 'email') {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 },
          { value: 'contains', label: '包含', disabled: false, type: 3 },
          { value: 'notContains', label: '不包含', disabled: false, type: 4 },
          { value: 'startWith', label: '开始于', disabled: false, type: 8 },
          { value: 'endWith', label: '结束于', disabled: false, type: 10 },
          { value: 'isNull', label: '为空', disabled: false, type: 5 },
          { value: 'isNotNull', label: '不为空', disabled: false, type: 6 }
        ]
      } else {
        return [
          { value: 'is', label: '等于', disabled: false, type: 1 },
          { value: 'isNot', label: '不等于', disabled: false, type: 2 },
          { value: 'contains', label: '包含', disabled: false, type: 3 },
          { value: 'notContains', label: '不包含', disabled: false, type: 4 },
          { value: 'startWith', label: '开始于', disabled: false, type: 8 },
          { value: 'endWith', label: '结束于', disabled: false, type: 10 },
          { value: 'isNull', label: '为空', disabled: false, type: 5 },
          { value: 'isNotNull', label: '不为空', disabled: false, type: 6 },
          { value: 'gt', label: '大于', disabled: false, type: 7 },
          { value: 'egt', label: '大于等于', disabled: false, type: 8 },
          { value: 'lt', label: '小于', disabled: false, type: 9 },
          { value: 'elt', label: '小于等于', disabled: false, type: 10 }
        ]
      }
    }
  }
}
