import request from '@/utils/request'

/**
 * 新建
 * @param {*} data
 */
export function crmReturnVisitSaveAPI(data) {
  const url = data.entity && data.entity.visitId ? 'update' : 'add'
  return request({
    url: 'crmReturnVisit/' + url,
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 列表
 * @param {*} data
 */
export function crmReturnVisitIndexAPI(data) {
  return request({
    url: 'crmReturnVisit/queryPageList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 删除
 * @param {*} data
 */
export function crmReturnVisitDeleteAPI(data) {
  return request({
    url: 'crmReturnVisit/deleteByIds',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 附件
 * @param {*} data
 */
export function crmReturnVisitFileAPI(data) {
  return request({
    url: 'crmReturnVisit/queryFileList',
    method: 'post',
    data: data
  })
}

/**
 * 详情
 * @param {*} visitId
 */
export function crmReturnVisitReadAPI(visitId) {
  return request({
    url: `crmReturnVisit/queryById/${visitId}`,
    method: 'post'
  })
}
