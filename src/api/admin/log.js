import request from '@/utils/request'

/**
 * 查询系统登录日志列表页接口
 * @param {*} data
 */
export function queryLoginLogListAPI(data) {
  return request({
    url: 'adminSysLog/queryLoginLogPageList',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: data
  })
}

/**
 * 系统登录日志导出
 * @param {*} data
 */
export function loginLogExportAPI(data) {
  return request({
    url: 'adminSysLog/exportLoginLog',
    method: 'post',
    data: data,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    timeout: 60000
  })
}

/**
 * 查看系统操作日志接口
 * @param {*} data
 */
export function querySystemLogListAPI(data) {
  return request({
    url: 'adminSysLog/querySysLogPageList',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: data
  })
}

/**
 * 系统操作日志导出
 * @param {*} data
 */
export function systemLogExportAPI(data) {
  return request({
    url: 'adminSysLog/exportSysLog',
    method: 'post',
    data: data,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    timeout: 60000
  })
}
