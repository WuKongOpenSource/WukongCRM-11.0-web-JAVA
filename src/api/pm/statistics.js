import request from '@/utils/request'

/**
 * 项目任务统计
 * @param {*} data
 */
export function workWorkStatisticAPI(workId) {
  return request({
    url: `work/work/workStatistics/${workId}`,
    method: 'post'
  })
}
