const getLocationOrigin = () => {
  return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '')
}

const companyName = '悟空CRM'
const version = 'V11.1.0'
const baiduKey = '百度key'

export default {
  version,
  companyName,
  getLocationOrigin,
  baiduKey
}
