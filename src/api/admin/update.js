import request from '@/utils/request'

/**
 * 查询版本
 * @param {*} data
 */
export function crmCheckVersionAPI() {
  return request({
    url: 'checkVersion',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 查询数据库
 * @param {*} data
 */
export function crmQueryDatabaseAPI() {
  return request({
    url: 'queryDatabase',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * 数据备份
 * @param {*} data
 */
export function crmBackupDatabaseAPI(data) {
  return request({
    url: 'backupDatabase',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }).then(
    res => {
      return res
    },
    err => {
      return err
    }
  )
}



/**
 * 更新进度
 * @param {*} data
 */
export function crmUpdateAPI(data) {
  return request({
    url: 'projectUpdate',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }).then(
    res => {
      return res
    },
    err => {
      return err
    }
  )
}


/**
 * 更新进度
 * @param {*} data
 */
export function updateProgressAPI() {
  return request({
    url: 'getProgress',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }).then(
    res => {
      return res
    },
    err => {
      return err
    }
  )
}

/**
 * 登录悟空CRM
 * @param {*} data
 */
export function loginWKAPI(data) {
  return request({
    url: 'updates/login',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }).then(
    res => {
      return res
    },
    err => {
      return err
    }
  )
}

