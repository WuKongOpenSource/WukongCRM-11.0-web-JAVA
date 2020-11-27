import request from '@/utils/request'

/**
 * 销售简报
 * @param {*} data
 */
export function crmQueryBulletinAPI(data) {
  return request({
    url: 'crmInstrument/queryBulletin',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 数据汇总
 * @param {*} data
 */
export function queryDataInfo(data) {
  return request({
    url: 'crmInstrument/queryDataInfo',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 销售简报列表
 */
export function crmIndexIndexListAPI(data) {
  return request({
    url: 'crmInstrument/queryBulletinInfo',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 简报跟进记录数量
 * @param {*} data
 */
export function crmQueryRecordConuntAPI(data) {
  return request({
    url: 'crmInstrument/queryRecordCount',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 业绩指标
 * @param {*} data
 */
export function crmIndexAchievementDataAPI(data) {
  return request({
    url: 'crmInstrument/queryPerformance',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 销售漏斗
 * @param {*} data
 */
export function crmIndexFunnelAPI(data) {
  return request({
    url: 'crmInstrument/sellFunnel',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 销售漏斗详情
 * @param {*} data
 */
export function crmInstrumentSellFunnelBusinessListAPI(data) {
  return request({
    url: 'crmInstrument/sellFunnelBusinessList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 销售趋势
 * @param {*} data
 */
export function crmIndexSaletrendAPI(data) {
  return request({
    url: 'crmInstrument/salesTrend',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 获取简报 跟进记录信息
 * @param {*} data
 */
export function crmIndexGetRecordListAPI(data) {
  data.label = data.crmType
  return request({
    url: 'crmInstrument/queryRecordList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 遗忘提醒
 * @param {*} data
 */
export function crmIndexForgottenCustomerAPI(data) {
  return request({
    url: 'crmInstrument/forgottenCustomerCount',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 遗忘提醒详情
 * @param {*} data
 */
export function crmIndexForgottenCustomerListAPI(data) {
  return request({
    url: 'crmInstrument/forgottenCustomerPageList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 排行榜
 * @param {*} data
 */
export function crmIndexRankingAPI(data) {
  return request({
    url: 'biRanking/ranking',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 仪表盘排序
 * @param {*} data
 */
export function crmIndexSortAPI(data) {
  return request({
    url: 'crmInstrument/queryModelSort',
    method: 'post',
    data: data
  })
}

/**
 * 仪表盘排序设置
 * @param {*} data
 */
export function crmIndexSetSortAPI(data) {
  return request({
    url: 'crmInstrument/setModelSort',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 逾期未联系客户接口
 * @param {*} data
 */
export function crmIndexUnContactCustomerAPI(data) {
  return request({
    url: 'crmInstrument/unContactCustomerPageList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
