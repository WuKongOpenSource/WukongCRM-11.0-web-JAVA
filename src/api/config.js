import request from '@/utils/request'

/**
 * 查询客户管理导航栏设置接口
 * @param {*} data
 */
export function configHeaderModelSortAPI(data) {
  return request({
    url: 'adminConfig/queryHeaderModelSort',
    method: 'post',
    data: data
  })
}

/**
 * 修改首页顶部导航栏设置接口
 * @param {*} data
 */
export function configSetHeaderModelSortAPI(data) {
  return request({
    url: 'adminConfig/setHeaderModelSort',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

