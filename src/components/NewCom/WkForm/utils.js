import { isArray, isObject, isEmpty } from '@/utils/types'
import CheckStatusMixin from '@/mixins/CheckStatusMixin'

export function getFormFieldShowName(formType, value, placeholder = '--') {
  if (formType === 'position') {
    return isArray(value) ? value.map(item => item.name).join() : placeholder
  } else if (formType === 'location') {
    return isObject(value) ? value.address : placeholder
  } else if (formType === 'date_interval') {
    return isArray(value) ? value.join('-') : placeholder
  } else if (formType === 'percent') {
    return isEmpty(value) ? placeholder : `${value}%`
  } else if (formType === 'single_user') {
    if (isObject(value)) {
      return value.realname || placeholder
    }
    return value || placeholder
  } else if (formType === 'checkbox') {
    if (isArray(value)) {
      return value.join() || placeholder
    }
    return value || placeholder
  } else if (formType === 'structure') {
    if (isArray(value)) {
      return value.map(item => item.name).join() || placeholder
    }
    return value || placeholder
  } else if (formType === 'user') {
    if (isArray(value)) {
      return value.map(item => item.realname).join() || placeholder
    }
    return value || placeholder
  } else if (formType === 'check_status') {
    return CheckStatusMixin.methods.getStatusName(value)
  }

  return isEmpty(value) ? placeholder : value
}
