import request from '@/utils/request'

/**
 * 新建商机
 * @param {*} data
 */
export function crmBusinessSaveAPI(data) {
  const url = data.entity && data.entity.businessId ? 'update' : 'add'
  return request({
    url: `crmBusiness/${url}`,
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
export function crmBusinessIndexAPI(data) {
  return request({
    url: 'crmBusiness/queryPageList',
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
export function crmBusinessDeleteAPI(data) {
  return request({
    url: 'crmBusiness/deleteByIds',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 商机状态组
 * @param {*} data
 */
export function crmBusinessStatusListAPI(data) {
  return request({
    url: 'crmBusiness/queryBusinessStatusOptions',
    method: 'post',
    data: data
  })
}


/**
 * 商机下的状态组
 * @param {*} data
 */
export function crmBusinessStatusByIdAPI(data) {
  return request({
    url: `crmBusiness/queryBusinessStatus/${data.businessId}`,
    method: 'post',
    data: data
  })
}

/**
 * 详情
 * @param {*} data
 */
export function crmBusinessReadAPI(data) {
  return request({
    url: `crmBusiness/queryById/${data.businessId}`,
    method: 'post'
  })
}

/**
 * 商机转移
 * @param {*} data
 */
export function crmBusinessTransferAPI(data) {
  return request({
    url: 'crmBusiness/changeOwnerUser',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 商机转移
 * @param {*} data
 */
export function crmBusinessAdvanceAPI(data) {
  return request({
    url: 'crmBusiness/boostBusinessStatus',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 商机相关产品
 * @param {*} data
 */
export function crmBusinessProductAPI(data) {
  return request({
    url: 'crmBusiness/queryProduct',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 合同
 * @param {*} data
 */
export function crmBusinessQueryContractAPI(data) {
  return request({
    url: 'crmBusiness/queryContract',
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
 */
export function crmBusinessSettingTeamSaveAPI(data) {
  return request({
    url: 'crmBusiness/addMembers',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function crmBusinessSettingTeamDeleteAPI(data) {
  return request({
    url: 'crmBusiness/deleteMembers',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function crmBusinessTeamMembersAPI(data) {
  return request({
    url: `crmBusiness/getMembers/${data.id}`,
    method: 'post'
  })
}

export function crmBusinessUpdateMembersAPI(data) {
  return request({
    url: 'crmBusiness/updateMembers',
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
export function crmBusinessExitTeamAPI(data) {
  return request({
    url: `crmBusiness/exitTeam/${data.id}`,
    method: 'post'
  })
}

/**
 * 商机关联联系人
 * @param {*} data
 */
export function crmBusinessRelateContactsAPI(data) {
  return request({
    url: 'crmBusiness/relateContacts',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 商机取消关联联系人
 * @param {*} data
 */
export function crmBusinessUnrelateContactsAPI(data) {
  return request({
    url: 'crmBusiness/unrelateContacts',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 商机下联系人
 * @param {*} data
 */
export function crmBusinessQueryContactsAPI(data) {
  return request({
    url: 'crmBusiness/queryContacts',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 设置首要联系人
 * @param {*} data
 *
 */
export function crmBusinessSetContactsAPI(data) {
  return request({
    url: 'crmBusiness/setContacts',
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
export function crmBusinessFileListAPI(data) {
  return request({
    url: 'crmBusiness/queryFileList',
    method: 'post',
    data: data
  })
}

/**
 * tab数量
 * @param {*} data
 *
 */
export function crmBusinessNumAPI(data) {
  return request({
    url: 'crmBusiness/num',
    method: 'post',
    data: data
  })
}

/**
 * 商机导出
 * @param {*} data
 */
export function crmBusinessExcelExportAPI(data) {
  return request({
    url: 'crmBusiness/batchExportExcel',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    responseType: 'blob',
    timeout: 60000
  })
}

export function crmBusinessExcelAllExportAPI(data) {
  return request({
    url: 'crmBusiness/allExportExcel',
    method: 'post',
    data: data,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 标星
 * @param {*} data
 *
 */
export function crmBusinessStarAPI(data) {
  return request({
    url: `crmBusiness/star/${data.id}`,
    method: 'post'
  })
}
