import request from '@/utils/request'

/**
 * 新建编辑
 * @param {*} data
 */
export function crmCustomerSaveAPI(data) {
  const url = data.entity && data.entity.customerId ? 'update' : 'add'
  return request({
    url: 'crmCustomer/' + url,
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 列表
 * @param {*} data
 */
export function crmCustomerIndexAPI(data) {
  return request({
    url: 'crmCustomer/queryPageList',
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
 */
export function crmCustomerDeleteAPI(data) {
  return request({
    url: 'crmCustomer/deleteByIds',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 公海列表
 * @param {*} data
 */
export function crmCustomerPoolListAPI(data) {
  return request({
    url: 'crmCustomerPool/queryPageList',
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
 */
export function crmCustomerPoolDeleteAPI(data) {
  return request({
    url: 'crmCustomerPool/deleteByIds',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 设置公海
 * @param {*} data
 */
export function crmCustomerPoolSetAPI(data) {
  return request({
    url: 'crmCustomerPool/setCustomerPool',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 公海设置列表
 * @param {*} data
 */
export function crmCustomerPoolSetListAPI(data) {
  return request({
    url: 'crmCustomerPool/queryPoolSettingList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 公海设置删除
 */
export function crmCustomerPoolSetDeleteAPI(data) {
  return request({
    url: 'crmCustomerPool/deleteCustomerPool',
    method: 'post',
    data: data
  })
}

/**
 * 公海设置详情
 * @param {*} data
 */
export function crmCustomerPoolSetDetailAPI(data) {
  return request({
    url: 'crmCustomerPool/queryPoolById',
    method: 'post',
    data: data
  })
}

/**
 * 公海启停
 * @param {*} data
 */
export function crmCustomerPoolSetChangeStatusAPI(data) {
  return request({
    url: 'crmCustomerPool/changeStatus',
    method: 'post',
    data: data
  })
}

/**
 * 公海客户转移
 * prePoolId 转出公海id
 * postPoolId 转入公海id
 * @param {*} data
 */
export function crmCustomerPoolSetTransferAPI(data) {
  return request({
    url: 'crmCustomerPool/transfer',
    method: 'post',
    data: data
  })
}

/**
 * 转移数据源
 * @param {*} data
 */
export function crmCustomerPoolSetNameListAPI(data) {
  return request({
    url: 'crmCustomerPool/queryPoolNameList',
    method: 'post',
    data: data
  })
}

/**
 * 客户管理用到的公海列表
 * @param {*} data
 */
export function crmCustomerPoolNameListAPI(data) {
  return request({
    url: 'crmCustomerPool/queryPoolNameListByAuth',
    method: 'post',
    data: data
  })
}

/**
 * 获取客户级别选项接口
 * @param {*} data
 */
export function crmCustomerPoolQueryLevelAPI(data) {
  return request({
    url: 'crmCustomerPool/queryCustomerLevel',
    method: 'post',
    data: data
  })
}

/**
 * 详情
 */
export function crmCustomerReadAPI(data) {
  return request({
    url: `crmCustomer/queryById/${data.customerId}`,
    method: 'post',
    data: data
  })
}

// 操作
/**
 * 客户锁定，解锁
 * @param {*} data
 */
export function crmCustomerLockAPI(data) {
  return request({
    url: 'crmCustomer/lock',
    method: 'post',
    data: data
  })
}

/**
 * 客户放入公海
 * @param {*} data
 * customer_id 	客户数组
 */
export function crmCustomerPutInPoolAPI(data) {
  return request({
    url: 'crmCustomer/updateCustomerByIds',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户转移
 * @param {*} data
 */
export function crmCustomerTransferAPI(data) {
  return request({
    url: 'crmCustomer/changeOwnerUser',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户导出
 * @param {*} data
 * customer_id 客户ID
 */
export function crmCustomerExcelExportAPI(data) {
  return request({
    url: 'crmCustomer/batchExportExcel',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    responseType: 'blob'
  })
}

/**
 * 全部导出
 * @param {*} data
 */
export function crmCustomerExcelAllExportAPI(data) {
  return request({
    url: 'crmCustomer/allExportExcel',
    method: 'post',
    data: data,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户导入
 * @param {*} data
 * customer_id 客户ID
 */
export function crmCustomerExcelImportAPI(data) {
  var param = new FormData()
  Object.keys(data).forEach(key => {
    param.append(key, data[key])
  })
  return request({
    url: 'crmCustomer/uploadExcel',
    method: 'post',
    data: param,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 公海客户导入
 * @param {*} data
 * customer_id 客户ID
 */
export function crmCustomerPoolExcelImportAPI(data) {
  var param = new FormData()
  Object.keys(data).forEach(key => {
    param.append(key, data[key])
  })
  return request({
    url: 'crmCustomerPool/uploadExcel',
    method: 'post',
    data: param,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 客户导入模板下载
 * @param {*} data
 *
 */
export const crmCustomerExcelDownloadURL = process.env.BASE_API + 'crmCustomer/downloadExcel'
export function crmCustomerDownloadExcelAPI(data) {
  return request({
    url: 'crmCustomer/downloadExcel',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}

/**
 * 公海导出
 * @param {*} data
 */
export function crmCustomerPoolExcelExportAPI(data) {
  return request({
    url: 'crmCustomerPool/batchExportExcel',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    responseType: 'blob',
    timeout: 60000
  })
}

/**
 * 公海全部导出
 * @param {*} data
 */
export function crmCustomerPoolExcelAllExport(data) {
  return request({
    url: 'crmCustomerPool/allExportExcel',
    method: 'post',
    data: data,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 公海字段查询
 * @param {*} data
 */
export function crmCustomerPoolQueryPoolFieldAPI(data) {
  return request({
    url: 'crmCustomerPool/queryPoolField',
    method: 'post',
    data: data
  })
}

/**
 * 获取公海池 操作权限
 * @param {*} data
 */
export function crmCustomerPoolQueryAuthAPI(data) {
  return request({
    url: 'crmCustomerPool/queryAuthByPoolId',
    method: 'post',
    data: data
  })
}

/**
 * 客户分配
 * @param {*} data
 */
export function crmCustomerDistributeAPI(data) {
  return request({
    url: 'crmCustomer/distributeByIds',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户领取
 * @param {*} data
 */
export function crmCustomerReceiveAPI(data) {
  return request({
    url: 'crmCustomer/receiveByIds',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户下联系人
 * @param {*} data
 */
export function crmCustomerQueryContactsAPI(data) {
  return request({
    url: 'crmCustomer/queryContacts',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户下回访
 * @param {*} data
 */
export function crmCustomerQueryVisitAPI(data) {
  return request({
    url: 'crmCustomer/queryReturnVisit',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户下商机
 * @param {*} data
 */
export function crmCustomerQueryBusinessAPI(data) {
  return request({
    url: 'crmCustomer/queryBusiness',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户下合同
 * @param {*} data
 */
export function crmCustomerQueryContractAPI(data) {
  return request({
    url: 'crmCustomer/queryContract',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户下回款计划
 * @param {*} data
 */
export function crmCustomerQueryReceivablesPlanAPI(data) {
  return request({
    url: 'crmCustomer/queryReceivablesPlan',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户下回款
 * @param {*} data
 */
export function crmCustomerQueryReceivablesAPI(data) {
  return request({
    url: 'crmCustomer/queryReceivables',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

// 团队操作
/**
 * 团队成员创建
 * @param {*} data
 * types crm_leads
 * typesId 分类ID
 */
export function crmCustomerSettingTeamSaveAPI(data) {
  return request({
    url: 'crmCustomer/addMembers',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function crmCustomerSettingTeamDeleteAPI(data) {
  return request({
    url: 'crmCustomer/deleteMembers',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function crmCustomerTeamMembersAPI(data) {
  return request({
    url: `crmCustomer/getMembers/${data.id}`,
    method: 'post'
  })
}

export function crmCustomerUpdateMembersAPI(data) {
  return request({
    url: 'crmCustomer/updateMembers',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 退出团队
 * @param {*} data
 */
export function crmCustomerExitTeamAPI(data) {
  return request({
    url: `crmCustomer/exitTeam/${data.id}`,
    method: 'post'
  })
}

/**
 * 客户标记跟进
 * @param {*} data
 * id 客户IDs
 */
export function crmCustomerSetFollowAPI(data) {
  return request({
    url: 'crmBackLog/setCustomerFollowup',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 客户成交状态修改
 * @param {*} data
 * id 客户IDs
 */
export function crmCustomerDealStatusAPI(data) {
  return request({
    url: 'crmCustomer/setDealStatus',
    method: 'post',
    data: data
  })
}

/**
 * 设置首要联系人
 * @param {*} data
 *
 */
export function crmCustomerSetContactsAPI(data) {
  return request({
    url: 'crmCustomer/setContacts',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 数据查重
 * @param {*} data
 *
 */
export function crmCustomerDataCheckAPI(data) {
  return request({
    url: 'crmCustomer/dataCheck',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 附件列表
 * @param {*} data
 *
 */
export function crmCustomerFileListAPI(data) {
  return request({
    url: 'crmCustomer/queryFileList',
    method: 'post',
    data: data
  })
}

/**
 * tab数量
 * @param {*} data
 *
 */
export function crmCustomerNumAPI(data) {
  return request({
    url: 'crmCustomer/num',
    method: 'post',
    data: data
  })
}

/**
 * 客户标星
 * @param {*} data
 *
 */
export function crmCustomerStarAPI(data) {
  return request({
    url: `crmCustomer/star/${data.id}`,
    method: 'post'
  })
}

/**
 * 发票信息
 * @param {*} data
 */
export function crmCustomerInvoiceAPI(data) {
  return request({
    url: 'crmCustomer/queryInvoice',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 删除发票信息
 * @param {*} data
 */
export function crmCustomerInvoiceInfoAPI(data) {
  return request({
    url: 'crmCustomer/queryInvoiceInfo',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
