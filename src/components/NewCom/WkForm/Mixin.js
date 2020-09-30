export default {
  methods: {
    /**
     * 判断是否为普通 整句 文本框
     * @param formType 字段类型
     */
    isTrimInput(formType) {
      return [
        'mobile',
        'email'
      ].includes(formType)
    },
    /**
     * 部门事件
     */
    depOrUserChange(item, index, value, valueList) {
      this.$emit('change', item, index, value, valueList)
    },

    /**
     * 常规组件change事件
     */
    commonChange(item, index, value) {
      this.$emit('change', item, index, value)
    },

    /**
     * 判断是空值
     */
    isEmptyValue(value) {
      return value === null || value == undefined
    },

    /**
     * 旧change回调
     */
    oldChange(dataValue, field, index) {
      this.$set(this.fieldFrom, field.field, dataValue.value)
      this.$emit('change', field, index, dataValue.value)
      this.$refs.form.validateField(field.field)
    },

    /**
     * 选择省市区
     */
    selectProvince(data, item, index) {
      this.fieldFrom[item.field].province = data.value
      this.addressChange(item, index, data, this.fieldFrom[item.field])
    },

    selectCity(data, item, index) {
      this.fieldFrom[item.field].city = data.value
      this.addressChange(item, index, data, this.fieldFrom[item.field])
    },

    selectArea(data, item, index) {
      this.fieldFrom[item.field].area = data.value
      this.addressChange(item, index, data, this.fieldFrom[item.field])
    },

    addressChange(item, index, value) {
      this.$emit('change', item, index, value)
    },

    /**
     * 获取提示语
     */
    getTips(data) {
      const tips = data.tips || data.inputTips
      return tips ? `（${tips}）` : ''
    }
  }
}
