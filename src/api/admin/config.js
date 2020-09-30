import request from '@/utils/request'

/**
 * 企业首页
 * @param {*} data
 */
export function adminSystemSaveAPI(data) {
  return request({
    url: 'adminConfig/setAdminConfig',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 企业首页
 * @param {*} data
 */
export function adminSystemIndexAPI(data) {
  return request({
    url: 'adminConfig/queryAdminConfig',
    method: 'post',
    data: data
  })
}
