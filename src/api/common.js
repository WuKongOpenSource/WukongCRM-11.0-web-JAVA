import request from '@/utils/request'

/**
 * 员工
 * @param {*} data
 */
export function userListAPI(data) {
  return request({
    url: 'adminUser/queryUserList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 部门
 * @param {*} data
 */
export function depListAPI(data) {
  return request({
    url: 'adminDept/queryDeptTree',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 获取权限范围内部门接口
 * @param {*} data
 */
export function adminStructuresSubIndexAPI(data) {
  return request({
    url: 'adminDept/queryDeptByAuth',
    method: 'post',
    data: data
  })
}

/**
 * 获取权限范围内部门接口
 * @param {*} data
 */
export function getUserByDeptIdAPI(data) {
  return request({
    url: 'adminUser/queryUserByDeptId',
    method: 'post',
    data: data
  })
}

/**
 * 部门下的员工
 * @param {*} data
 */
export function userListByStructidAPI(data) {
  return request({
    url: 'adminUser/userListByStructidAPI',
    method: 'post',
    data: data
  })
}

/**
 * 附件
 * @param {*} data
 */
export const crmFileSaveUrl = process.env.BASE_API + 'adminFile/upload'

export function crmFileSaveAPI(data, config = {}) {
  var param = new FormData()
  Object.keys(data).forEach(key => {
    param.append(key, data[key])
  })
  return request({
    url: 'adminFile/upload',
    method: 'post',
    data: param,
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function crmFileSingleSaveAPI(data, config = {}) {
  var param = new FormData()
  Object.keys(data).forEach(key => {
    param.append(key, data[key])
  })
  return request({
    url: 'adminFile/uploadBySingle',
    method: 'post',
    data: param,
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 公共web文件上传
 * @param data
 */
export function webFileSaveAPI(data) {
  var param = new FormData()
  Object.keys(data).forEach(key => {
    param.append(key, data[key])
    param.append('isPublic', '1')
  })
  return request({
    url: 'adminFile/upload',
    method: 'post',
    data: param,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 唯一图
 * @param {*} data
 */
export function crmFileSaveByBatchIdAPI(data) {
  var param = new FormData()
  Object.keys(data).forEach(key => {
    param.append(key, data[key])
  })
  return request({
    url: 'adminFile/upload',
    method: 'post',
    data: param,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/** 暂时客户管理里面也有 */
/**
 * 附件删除接口
 * @param {*} data
 */
export function crmFileDeleteAPI(data) {
  return request({
    url: `adminFile/deleteById/${data.id}`,
    method: 'post',
    data: data
  })
}

/**
 * 根据批次ID删除文件
 * @param {*} data
 */
export function crmFileRemoveByBatchIdAPI(data) {
  return request({
    url: 'adminFile/deleteByBatchId',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 附件重命名
 * @param {*} data
 */
export function crmFileUpdateAPI(data) {
  return request({
    url: 'adminFile/renameFileById',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 通过path 下载
 * @param {*} data
 */
export function crmFileDownByPathAPI(data) {
  return request({
    url: 'crmPrint/down',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}

/**
 * 权限数据返回
 * @param {*} data
 */
export function adminIndexAuthListAPI(data) {
  return request({
    url: 'adminRole/auth',
    method: 'post',
    data: data
  })
}


/**
 * 系统消息列表
 * label 1 任务 2 日志 3 oa审批 4公告 5 日程 6 客户管理
 * isRead 0 未读 1 已读
 * @param {*} data
 */
export function systemMessageListAPI(data) {
  return request({
    url: 'adminMessage/queryList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 未读消息数
 * @param {*} data
 */
export function systemMessageUnreadCountAPI(data) {
  return request({
    url: 'adminMessage/queryUnreadCount',
    method: 'post',
    data: data
  })
}

/**
 * 读消息
 * @param {*} data
 */
export function systemMessageReadAPI(data) {
  return request({
    url: 'adminMessage/readMessage',
    method: 'post',
    data: data
  })
}

/**
 * 读全部消息
 * @param {*} data
 */
export function systemMessageReadAllAPI(data) {
  return request({
    url: 'adminMessage/readAllMessage',
    method: 'post',
    data: data
  })
}

/**
 * 用户信息
 * @param {*} data
 */
export function systemUserInfoAPI(data) {
  return request({
    url: 'adminUser/queryUserInfo',
    method: 'post',
    data: data
  })
}

/**
 * 系统消息按类别删除
 * @param {*} data
 */
export function systemMessageClearAPI(data) {
  return request({
    url: 'adminMessage/clear',
    method: 'post',
    data: data
  })
}

/**
 * 系统消息删除
 * @param {*} data
 */
export function systemMessageDeleteByIdAPI(id) {
  return request({
    url: `adminMessage/deleteById/${id}`,
    method: 'post'
  })
}

export function downloadFileAPI(url) {
  return request({
    url: url,
    method: 'post',
    data: {},
    responseType: 'blob'
  })
}

/**
 * 已读更新通知
 * @param {*} data
 */
export function readUpdateNoticeAPI(data) {
  return request({
    url: 'adminUser/readNotice',
    method: 'post',
    data: data
  })
}
