import request from '@/utils/request'

/**
 * 合同数量分析/金额分析/回款金额分析
 * count：合同数量分析；money：金额分析；back：回款金额分析
 */
export function biAchievementAnalysisAPI(data) {
  if (data.type === 'count') {
    return request({
      url: 'biEmployee/contractNumStats',
      method: 'post',
      data: data,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  } else if (data.type === 'money') {
    return request({
      url: 'biEmployee/contractMoneyStats',
      method: 'post',
      data: data,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  } else if (data.type === 'back') {
    return request({
      url: 'biEmployee/receivablesMoneyStats',
      method: 'post',
      data: data,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  }
}

export function biAchievementAnalysisExportAPI(data) {
  if (data.type === 'count') {
    return request({
      url: 'biEmployee/contractNumStatsExport',
      method: 'post',
      data: data,
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  } else if (data.type === 'money') {
    return request({
      url: 'biEmployee/contractMoneyStatsExport',
      method: 'post',
      data: data,
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  } else if (data.type === 'back') {
    return request({
      url: 'biEmployee/receivablesMoneyStatsExport',
      method: 'post',
      data: data,
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  }
}

/**
 * 合同汇总表
 * @param {*} data
 */
export function biAchievementSummaryAPI(data) {
  return request({
    url: 'biEmployee/totalContract',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function biAchievementSummaryExportAPI(data) {
  return request({
    url: 'biEmployee/totalContractExport',
    method: 'post',
    data: data,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 发票统计分析
 * @param {*} data
 */
export function biAchievementInvoiceAPI(data) {
  return request({
    url: 'biEmployee/invoiceStats',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 发票统计分析导出
 * @param {*} data
 */
export function biAchievementInvoiceExportAPI(data) {
  return request({
    url: 'biEmployee/invoiceStatsExport',
    method: 'post',
    data: data,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
