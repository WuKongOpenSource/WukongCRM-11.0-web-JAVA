import request from '@/utils/request'

/**
 * 新建回款
 * @param {*} data
 */
export function crmReceivablesSaveAPI(data) {
  const url = data.entity && data.entity.receivablesId ? 'update' : 'add'
  return request({
    url: 'crmReceivables/' + url,
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 回款列表
 * @param {*} data
 */
export function crmReceivablesIndexAPI(data) {
  return request({
    url: 'crmReceivables/queryPageList',
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
 *
 */
export function crmReceivablesDeleteAPI(data) {
  return request({
    url: 'crmReceivables/deleteByIds',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 回款详情
 * @param {*} data
 */
export function crmReceivablesReadAPI(data) {
  return request({
    url: `crmReceivables/queryById/${data.id}`,
    method: 'post'
  })
}

/**
 * 回款计划删除
 * @param {*} data
 */
export function crmReceivablesPlanDeleteAPI(data) {
  return request({
    url: 'crmReceivablesPlan/deleteByIds',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 回款列表
 * @param {*} data
 *
 */
export function crmReceivablesFileListAPI(data) {
  return request({
    url: 'crmReceivables/queryFileList',
    method: 'post',
    data: data
  })
}

/**
 * tab数量
 * @param {*} data
 *
 */
export function crmReceivablesNumAPI(data) {
  return request({
    url: 'crmReceivables/num',
    method: 'post',
    data: data
  })
}

/**
 * 导出
 * @param {*} data
 */
export function crmReceivablesExcelExportAPI(data) {
  return request({
    url: 'crmReceivables/batchExportExcel',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    responseType: 'blob',
    timeout: 60000
  })
}

export function crmReceivablesExcelAllExportAPI(data) {
  return request({
    url: 'crmReceivables/allExportExcel',
    method: 'post',
    data: data,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 转移
 * @param {*} data
 */
export function crmReceivablesTransferAPI(data) {
  return request({
    url: 'crmReceivables/changeOwnerUser',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 回款计划创建
 * @param {*} data
 */
export function crmReceivablesPlanSaveAPI(data) {
  const url = data.entity && data.entity.planId ? 'update' : 'add'
  return request({
    url: 'crmReceivablesPlan/' + url,
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
