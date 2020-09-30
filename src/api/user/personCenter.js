import request from '@/utils/request'

/**
 * 修改头像
 * @param {*} data
 */
export function adminUsersUpdateImgAPI(data) {
  return request({
    url: 'adminUser/updateImg',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 个人详情
 * @param {*} data
 */
export function adminUsersReadAPI(data) {
  return request({
    url: 'adminUser/queryLoginUser',
    method: 'post',
    data: data
  })
}

/**
 * 修改个人信息
 * @param {*} data
 */
export function adminUsersUpdateAPI(data) {
  return request({
    url: 'adminUser/updateUser',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 修改密码
 * @param {*} data
 */
export function adminUsersResetPasswordAPI(data) {
  return request({
    url: 'adminUser/updatePassword',
    method: 'post',
    data: data
  })
}
