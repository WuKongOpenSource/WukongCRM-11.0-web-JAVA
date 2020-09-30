/**
 * Create by yxk at 2020/6/22
 */
import request from '@/utils/request'

/**
 * 查询所有未删除审批流程
 * @param {*} data
 */
export function crmExamineQueryAllAPI(data) {
  return request({
    url: 'crmExamine/queryAllExamine',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

// /**
//  * 根据id查询审批流程 examineId 审批流程id
//  */
// export function QueryExamineById(data) {
//   return request({
//     url: `crmExamine/queryExamineById/${data.examineId}`,
//     method: 'post'
//   })
// }

/**
 * 查询当前启用审核流程步骤
 */
export function crmExamineStepAPI(data) {
  return request({
    url: 'crmExamine/queryExamineStep',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 添加审批流程
 */
export function crmExamineSaveAPI(data) {
  return request({
    url: 'crmExamine/saveExamine',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 停用或删除审批流程
 */
export function crmExamineUpdateStatusAPI(data) {
  return request({
    url: 'crmExamine/updateStatus',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 进行审批 AuditExamine
 */
export function crmExamineRecordAuditAPI(data) {
  return request({
    url: 'crmExamineRecord/auditExamine',
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
    url: 'crmExamineRecord/queryExamineLogList',
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
