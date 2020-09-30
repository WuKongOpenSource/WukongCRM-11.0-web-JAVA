import request from '@/utils/request'

/**
 * 归档任务列表
 * @param {*} data
 */
export function workTaskArchListAPI(workId) {
  return request({
    url: `work/work/archList/${workId}`,
    method: 'post'
  })
}

/**
 * 项目详情
 * @param {*} data
 */
export function workWorkReadAPI(data) {
  return request({
    url: 'work/work/getWorkById',
    method: 'post',
    data: data
  })
}

/**
 * 项目删除
 * @param {*} data
 */
export function workWorkDeleteAPI(workId) {
  return request({
    url: `work/work/deleteWork/${workId}`,
    method: 'post'
  })
}

/**
 * 新建项目
 * @param {*} data
 */
export function workWorkSaveAPI(data) {
  return request({
    url: 'work/work/addWork',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}


/**
 * 编辑项目
 * @param {*} data
 */
export function workWorkUpdateAPI(data) {
  return request({
    url: 'work/work/updateWork',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 退出项目
 * @param {*} data
 */
export function workWorkLeaveAPI(workId) {
  return request({
    url: `work/work/leave/${workId}`,
    method: 'post'
  })
}

/**
 * 任务板列表
 * @param {*} data
 */
export function workTaskIndexAPI(data) {
  return request({
    url: 'work/work/queryTaskByWorkId',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: data
  })
}

/**
 * 任务板列表
 * @param {*} data
 */
export function workTaskOwnerIndexAPI(data) {
  return request({
    url: 'work/work/queryOwnerTaskListByWorkId',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: data
  })
}
// /**
//  * 设置任务类别 改为 saveWorkTaskClass
//  * @param {*} data
//  */
// export function workTaskClassSetAPI(data) {
//   return request({
//     url: 'task/setTaskClass',
//     method: 'post',
//     data: data
//   })
// }

/**
 * 分类删除
 * @param {*} data
 */
export function workTaskclassDeleteAPI(data) {
  return request({
    url: 'work/work/deleteTaskList',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 获取附件列表
 * @param {*} data
 */
export function workWorkFileListAPI(data) {
  return request({
    url: 'work/work/queryTaskFileByWorkId',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 项目 -- 成员列表
 * @param {*} data
 */
export function workWorkOwnerListAPI(data) {
  return request({
    url: 'work/work/queryOwnerRoleList/' + data.workId,
    method: 'post'
  })
}

/**
 * 项目 -- 成员删除
 * @param {*} data
 */
export function workWorkOwnerDelAPI(data) {
  return request({
    url: 'work/work/removeWorkOwnerUser',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 项目 -- 归档已完成任务
 * @param {*} data
 */
export function workTaskArchiveTaskAPI(data) {
  return request({
    url: `work/work/archiveTask/${data.classId}`,
    method: 'post'
  })
}

/**
 * 项目 -- 归档负责人已完成任务
 * @param {*} data
 */
export function workTaskArchiveOwnerTaskAPI(data) {
  return request({
    url: 'work/work/archiveTaskByOwner',
    method: 'post',
    data: data
  })
}

/**
 * 拖拽改变分类
 * @param {*} data
 */
export function workTaskUpdateOrderAPI(data) {
  return request({
    url: 'work/work/updateOrder',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: data
  })
}

/**
 * 拖拽改变分类列表
 * @param {*} data
 */
export function workTaskUpdateClassOrderAPI(data) {
  return request({
    url: 'work/work/updateClassOrder',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: data
  })
}

/**
 * 项目成员添加角色
 * @param {*} data
 */
export function workWorkAddUserGroupAPI(data) {
  return request({
    url: 'work/work/setOwnerRole',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: data
  })
}

/**
 * 项目成员角色列表
 * @param {*} data
 */
export function workWorkGroupListAPI(data) {
  return request({
    url: 'adminRole/queryWorkRoleList',
    method: 'post',
    data: data
  })
}

/**
 * 项目收藏
 * @param {*} data
 */
export function workWorkCollectAPI(workId) {
  return request({
    url: `workCollect/collect/${workId}`,
    method: 'post'
  })
}

/**
 * 修改标签排序
 * @param {*} data
 */
export function workupdateWorkOrderAPI(data) {
  return request({
    url: 'work/work/updateWorkOrder',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: data
  })
}

/**
 * 项目任务导出
 * @param {*} data
 */
export function workTaskExportAPI(data) {
  return request({
    url: 'work/work/workTaskExport',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}

/**
 * 获取导入模板
 * @param {*} data
 */
export function workDownloadExcelAPI(data) {
  return request({
    url: 'work/work/downloadExcel',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}

/**
 * 项目任务导入
 * @param {*} data
 */
export function workExcelImportAPI(data) {
  var param = new FormData()
  Object.keys(data).forEach(key => {
    param.append(key, data[key])
  })
  return request({
    url: 'work/work/excelImport',
    method: 'post',
    data: param,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 项目任务下载错误模板
 * @param {*} data
 */
export function workDownloadErrorExcelAPI(data) {
  return request({
    url: 'work/work/downloadErrorExcel',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}
