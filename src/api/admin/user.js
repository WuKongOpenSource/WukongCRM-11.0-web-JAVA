/**
 * Created by yxk at 2020/6/5
 */
import request from '@/utils/request'

/**
 * 查询部门员工列表
 * @param {*} data
 */
export function adminUserQueryByDeptAPI(deptId) {
  return request({
    url: `adminUser/queryDeptUserList/${deptId}`,
    method: 'post'
  })
}


/**
 * 查询部门员工列表
 * @param {*} data
 */
export function adminUserQueryDeptUserByExamineAPI(deptId) {
  return request({
    url: `adminUser/queryDeptUserByExamine/${deptId}`,
    method: 'post'
  })
}
