/*
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
 */
import request from '@/utils/request'

/**
 * 查询绩效考核列表
 * @param {*} data
 */
export function hrmPerformanceQueryListAPI(data) {
  return request({
    url: 'hrmAchievementAppraisal/queryAppraisalPageList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}


/**
 * 查询每个绩效状态的数量
 * @param {*} data
 */
export function hrmPerformanceQueryStatusNumPI(data) {
  return request({
    url: 'hrmAchievementAppraisal/queryAppraisalStatusNum',
    method: 'post',
    data: data
  })
}

/**
 * 添加考核
 * @param {*} data
 */
export function hrmPerformanceAddAPI(data) {
  return request({
    url: 'hrmAchievementAppraisal/addAppraisal',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 修改考核
 * @param {*} data
 */
export function hrmPerformanceSetAPI(data) {
  return request({
    url: 'hrmAchievementAppraisal/setAppraisal',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 修改考核状态
 * @param {*} data
 */
export function hrmPerformanceUpdateStatusAPI(data) {
  return request({
    url: 'hrmAchievementAppraisal/updateAppraisalStatus',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 删除考核
 * @param {*} data
 */
export function hrmPerformanceDeleteAPI(id) {
  return request({
    url: `hrmAchievementAppraisal/delete/${id}`,
    method: 'post'
  })
}

/**
 * 终止考核
 * @param {*} data
 */
export function hrmPerformanceStopAPI(id) {
  return request({
    url: `hrmAchievementAppraisal/stopAppraisal/${id}`,
    method: 'post'
  })
}

/**
 * 查询考核详情
 * @param {*} data
 */
export function hrmPerformanceDetailAPI(id) {
  return request({
    url: `hrmAchievementAppraisal/queryAppraisalById/${id}`,
    method: 'post'
  })
}

/**
 * 修改考核状态
 * @param {*} data
 */
export function hrmPerformanceQuerylEmployeeListAPI(data) {
  return request({
    url: 'hrmAchievementAppraisal/queryAppraisalEmployeeList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询员工考核详情
 * @param {*} data
 */
export function hrmPerformanceEmployeeDetailAPI(id) {
  return request({
    url: `hrmAchievementAppraisal/queryEmployeeDetail/${id}`,
    method: 'post'
  })
}


/**
 * 绩效档案详情统计
 * @param {*} data
 */
export function hrmPerformanceEmployeeQueryAppraisalNumAPI(id) {
  return request({
    url: `hrmAchievementAppraisal/queryEmployeeAppraisalCount/${id}`,
    method: 'post'
  })
}

/**
 * 查询考核详情
 * @param {*} data
 */
export function hrmPerformanceAppraisalDetailAPI(id) {
  return request({
    url: `hrmAchievementAppraisal/queryEmployeeDetail/${id}`,
    method: 'post'
  })
}

/**
 * 绩效档案详情列表
 * @param {*} data
 */
export function hrmPerformanceQueryEmployeeAppraisalAPI(data) {
  return request({
    url: 'hrmAchievementAppraisal/queryEmployeeAppraisal',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}


/**
 * 通过绩效id查询员工列表
 * @param {*} data
 */
export function hrmPerformanceQueryEmployeeByAppraisalIdAPI(data) {
  return request({
    url: 'hrmAchievementAppraisal/queryEmployeeListByAppraisalId',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
