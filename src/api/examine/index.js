/**
 * Create by yxk at 2020/6/22
 */
import request from '@/utils/request'

/**
 * 进行审批
 */
export function crmExamineRecordAuditAPI(data) {
  return request({
    url: 'examineRecord/auditExamine',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询审批记录
 */
export function crmExamineRecordLogListAPI(data) {
  return request({
    url: 'examineRecord/queryExamineRecordLog',
    method: 'post',
    data: data
  })
}

/**
 * 查询审批流程列表
 */
export function crmExamineRecordRecordListAPI(data) {
  return request({
    url: 'crmExamineRecord/queryExamineRecordList',
    method: 'post',
    data: data
  })
}

/**
 * 查询审批可供设置的字段
 * @param {*} data
 *
 */
export function examinesQueryFieldAPI(data) {
  return request({
    url: 'examines/queryField',
    method: 'post',
    data: data
  })
}

/**
 * 保存审批数据
 * @param {*} data
 */
export function examinesAddAPI(data) {
  return request({
    url: 'examines/addExamine',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询审批列表
 * @param {*} data
 */
export function examinesQueryListAPI(data) {
  return request({
    url: 'examines/queryList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 修改审批状态
 * @param {*} data
 */
export function examinesUpdateStatusAPI(data) {
  return request({
    url: 'examines/updateStatus',
    method: 'post',
    data: data
  })
}

/**
 * 审批详情
 * @param {*} data
 */
export function examinesQueryExamineFlowAPI(data) {
  return request({
    url: 'examines/queryExamineFlow',
    method: 'post',
    data: data
  })
}

/**
 * 获取审批流程有效字段
 * @param {*} data
 */
export function examinesPreviewFiledNameAPI(data) {
  return request({
    url: 'examines/previewFiledName',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 预览审批流程
 * @param {*} data
 */
export function examinesPreviewExamineFlowAPI(data) {
  return request({
    url: 'examines/previewExamineFlow',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 获取审批详情
 */
export function examineRecordQueryListAPI(data) {
  return request({
    url: 'examineRecord/queryExamineRecordList',
    method: 'post',
    data: data
  })
}

/**
 * 查询正常审批流列表
 * @param {*} data
 */
export function examinesQueryPartListAPI(data) {
  return request({
    url: 'examines/queryPartList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询全部审批流列表
 * @param {*} data
 */
export function examineWaitingQueryCrmExamineListAPI(data) {
  return request({
    url: 'examineWaiting/queryCrmExamineList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询全部审批流列表
 * @param {*} data
 */
export function examineWaitingQueryOaExamineListAPI(data) {
  return request({
    url: 'examineWaiting/queryOaExamineList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
