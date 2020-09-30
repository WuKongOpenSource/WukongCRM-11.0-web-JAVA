import request from '@/utils/request'

/**
 *
 * 新建任务列表
 * @param {*} data
 */
export function workTaskClassSaveAPI(data) {
  return request({
    url: 'workTaskClass/saveWorkTaskClass',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 删除任务
 * @param {*} data
 */
export function workTaskDeleteAPI(taskId) {
  return request({
    url: `workTask/deleteWorkTask/${taskId}`,
    method: 'post'
  })
}

/**
 *
 * 编辑任务列表
 * @param {*} data
 */
export function workTaskClassUpateAPI(data) {
  return request({
    url: 'workTaskClass/updateWorkTaskClass',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 新建任务
 * @param {*} data
 */
export function workTaskSaveAPI(data) {
  return request({
    url: 'workTask/saveWorkTask',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 完成任务状态
 * @param {*} data
 */
export function workTaskStatusSetAPI(data) {
  return request({
    url: 'workTask/setWorkTaskStatus',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 完成子任务状态
 * @param {*} data
 */
export function workTaskChildStatusSetAPI(data) {
  return request({
    url: 'workTask/setWorkChildTaskStatus',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 编辑任务标题
 * @param {*} data
 */
export function workTaskTitleSetAPI(data) {
  return request({
    url: 'workTask/setWorkTaskTitle',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 编辑任务描述
 * @param {*} data
 */
export function workTaskDescriptionSetAPI(data) {
  return request({
    url: 'workTask/setWorkTaskDescription',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 分配任务（负责人）
 * @param {*} data
 */
export function workTaskMainUserSetAPI(data) {
  return request({
    url: 'workTask/setWorkTaskMainUser',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 设置任务时间
 * @param {*} data
 */
export function workTaskTimeSetAPI(data) {
  return request({
    url: 'workTask/setWorkTaskTime',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 设置任务标签
 * @param {*} data
 */
export function workTaskLabelSetAPI(data) {
  return request({
    url: 'workTask/setWorkTaskLabel',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 添加任务参与人
 * @param {*} data
 */
export function workTaskOwnerUserSetAPI(data) {
  return request({
    url: 'workTask/setWorkTaskOwnerUser',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 添加任务参与人
 * @param {*} data
 */
export function workTaskOwnerUserDeleteAPI(data) {
  return request({
    url: 'workTask/deleteWorkTaskOwnerUser',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 设置任务优先级
 * @param {*} data
 */
export function workTaskPrioritySetAPI(data) {
  return request({
    url: 'workTask/setWorkTaskPriority',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 新建子任务
 * @param {*} data
 */
export function workSubTaskAddAPI(data) {
  return request({
    url: 'workTask/addWorkChildTask',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 编辑子任务
 * @param {*} data
 */
export function workSubTaskUpdateAPI(data) {
  return request({
    url: 'workTask/updateWorkChildTask',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 *
 * 删除子任务
 * @param {*} data
 */
export function workSubTaskDeleteAPI(taskId) {
  return request({
    url: `workTask/deleteWorkChildTask/${taskId}`,
    method: 'post'
  })
}


// /**
//  * 任务添加附件
//  * @param {*} data
//  */
// export function workTaskFileUploadAPI(data) {
//   var param = new FormData()
//   Object.keys(data).forEach(key => {
//     param.append(key, data[key])
//   })
//   return request({
//     url: 'workTask/uploadWorkTaskFile',
//     method: 'post',
//     data: param,
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   })
// }

// /**
//  *
//  * 任务删除附件
//  * @param {*} data
//  */
// export function workTaskFileDeleteAPI(data) {
//   return request({
//     url: 'oaTask/deleteWorkTaskFile',
//     method: 'post',
//     data: data,
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     }
//   })
// }
