/*
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
 */
import request from '@/utils/request'

/**
 * 查询绩效档案数量
 * @param {*} data
 */
export function hrmPerformanceEmployeeQueryNumAPI() {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/queryAppraisalNum',
    method: 'post'
  })
}

/**
 * 查询我的绩效
 * @param {*} data
 */
export function hrmPerformanceEmployeeMyListAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/queryMyAppraisal',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询结果确认列表
 * @param {*} data
 */
export function hrmPerformanceEmployeeResultListAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/queryResultConfirmList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询目标确认列表
 * @param {*} data
 */
export function hrmPerformanceEmployeeTargetListAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/queryTargetConfirmList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询结果评定列表
 * @param {*} data
 */
export function hrmPerformanceEmployeeEvaluatoListAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/queryEvaluatoList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询考核详情
 * @param {*} data
 */
export function hrmPerformanceEmployeeAppraisalDetailAPI(id) {
  return request({
    url: `hrmAchievementEmployeeAppraisal/queryEmployeeAppraisalDetail/${id}`,
    method: 'post'
  })
}


/**
 * 填写绩效
 * @param {*} data
 */
export function hrmPerformanceEmployeeWriteAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/writeAppraisal',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 修改目标进度
 * @param {*} data
 */
export function hrmPerformanceEmployeeUpdateScheduleAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/updateSchedule',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 目标确认
 * @param {*} data
 */
export function hrmPerformanceEmployeeTargetConfirmAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/targetConfirm',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 结果评定
 * @param {*} data
 */
export function hrmPerformanceEmployeeResultEvaluatoAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/resultEvaluato',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 修改考评分数
 * @param {*} data
 */
export function hrmPerformanceEmployeeUpdateScoreLevelAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/updateScoreLevel',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询分数配置列表 绩效档案id
 * @param {*} data
 */
export function hrmPerformanceEmployeeQueryLevelListAPI(id) {
  return request({
    url: `hrmAchievementAppraisalScoreLevel/queryScoreLevelList/${id}`,
    method: 'post'
  })
}

/**
 * 查询分数配置列表 绩效id
 * @param {*} data
 */
export function hrmPerformanceEmployeeQueryLevelByAppraisalIdAPI(id) {
  return request({
    url: `hrmAchievementAppraisalScoreLevel/queryScoreLevelListByAppraisalId/${id}`,
    method: 'post'
  })
}

/**
 * 查询绩效结果确认
 * @param {*} data
 */
export function hrmPerformanceEmployeeQueryResultConfirmAPI(id) {
  return request({
    url: `hrmAchievementEmployeeAppraisal/queryResultConfirmByAppraisalId/${id}`,
    method: 'post'
  })
}

/**
 * 绩效结果确认
 * @param {*} data
 */
export function hrmPerformanceEmployeeResultConfirmAPI(id) {
  return request({
    url: `hrmAchievementEmployeeAppraisal/resultConfirm/${id}`,
    method: 'post'
  })
}

/**
 * 查询目标确认列表的绩效筛选条件
 * @param {*} data
 */
export function hrmPEQueryTargetConfirmScreenAPI() {
  return request({
    url: `hrmAchievementEmployeeAppraisal/queryTargetConfirmScreen`,
    method: 'post'
  })
}


/**
 * 查询结果评定列表的绩效筛选条件
 * @param {*} data
 */
export function hrmPEQueryEvaluatoScreenAPI(data) {
  return request({
    url: `hrmAchievementEmployeeAppraisal/queryEvaluatoScreen`,
    method: 'post',
    data: data
  })
}

/**
 * 根据得分获取等级
 * @param {*} data
 */
export function hrmPerformanceEmployeeQueryLevelAPI(data) {
  return request({
    url: 'hrmAchievementEmployeeAppraisal/queryLevelIdByScore',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
