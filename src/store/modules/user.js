import {
  loginAPI,
  logoutAPI
} from '@/api/login'
import {
  userListAPI,
  depListAPI,
  adminIndexAuthListAPI
} from '@/api/common'
import {
  resetRouter
} from '@/router'

import {
  adminUsersReadAPI
} from '@/api/user/personCenter'

import {
  addAuth,
  removeAuth
} from '@/utils/auth'
import {
  request
} from '@/utils'
import Lockr from 'lockr'
import { debounce } from 'throttle-debounce'

const user = {
  state: {
    userInfo: null, // 用户信息
    // 权限信息
    allAuth: null, // 总权限信息 默认空 调整动态路由
    userList: [], // 管理后台员工和部门
    deptList: [],
    crm: {}, // 客户管理
    bi: {}, // 商业智能
    manage: {}, // 管理后台
    oa: {}, // 办公
    project: {}, // 项目管理
    hrm: {} // 人力资源
  },

  mutations: {
    SET_USERINFO: (state, userInfo) => {
      state.userInfo = userInfo
      localStorage.setItem('loginUserInfo', JSON.stringify(userInfo))
    },
    SET_ALLAUTH: (state, allAuth) => {
      state.allAuth = allAuth
    },
    SET_CRM: (state, crm) => {
      state.crm = crm
    },
    SET_BI: (state, bi) => {
      state.bi = bi
    },
    SET_MANAGE: (state, manage) => {
      state.manage = manage
    },
    SET_OA: (state, oa) => {
      state.oa = oa
    },
    SET_PROJECT: (state, project) => {
      state.project = project
    },
    SET_HRM: (state, hrm) => {
      state.hrm = hrm
    },
    SET_AUTH: (state, data) => {
      const token = data.adminToken
      Lockr.set('Admin-Token', token)
      addAuth(token)
    },
    SET_USERLIST: (state, data) => {
      state.userList = data
    },
    SET_DEPTLIST: (state, data) => {
      state.deptList = data
    }
  },

  actions: {
    // 登录
    Login({
      commit,
      dispatch
    }, userInfo) {
      return new Promise((resolve, reject) => {
        loginAPI(userInfo).then(res => {
          const data = res.data || {}
          if (!data.hasOwnProperty('companyList')) {
            commit('SET_AUTH', data)
            dispatch('GetUserInfo')
          }
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取权限
    getAuth({
      commit,
      dispatch
    }) {
      return new Promise((resolve, reject) => {
        adminIndexAuthListAPI().then((response) => {
          const data = response.data
          Lockr.set('authList', data)
          data.wkFirstModel = data.firstModel
          commit('SET_ALLAUTH', data)
          commit('SET_CRM', data.crm)
          commit('SET_BI', data.bi)
          commit('SET_MANAGE', data.manage)
          commit('SET_OA', data.oa)
          commit('SET_PROJECT', data.project)
          commit('SET_HRM', data.hrm)

          // 获取 管理后台 员工和部门信息
          dispatch('GetUserList')
          dispatch('GetDeptList')
          if (data.hrm) {
            dispatch('GetHrmUserList')
            dispatch('GetHrmDeptList')
          }

          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({
      commit,
      dispatch
    }) {
      return new Promise((resolve, reject) => {
        adminUsersReadAPI().then(response => {
          // 邮件信息 走之前的逻辑
          commit('SET_USERINFO', response.data)
          dispatch('SystemLogoAndName')
          request(response.data)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({
      commit
    }) {
      return new Promise((resolve, reject) => {
        logoutAPI().then(() => {
          /** flush 清空localStorage .rm('authKey') 按照key清除 */
          removeAuth()
          resetRouter()
          resolve()
        }).catch(error => {
          removeAuth()
          resetRouter()
          reject(error)
        })
      })
    },

    debounceGetUserList: debounce(3000, ({ dispatch }) => {
      dispatch('GetUserList')
    }),

    // 管理后台员工列表
    GetUserList({
      commit
    }) {
      return new Promise((resolve, reject) => {
        userListAPI({
          pageType: 0
        }).then(res => {
          commit('SET_USERLIST', res.data.list || [])
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    debounceGetDeptList: debounce(3000, ({ dispatch }) => {
      dispatch('GetDeptList')
    }),

    // 管理后台部门列表
    GetDeptList({
      commit
    }) {
      return new Promise((resolve, reject) => {
        depListAPI({ type: 'tree' }).then(res => {
          commit('SET_DEPTLIST', res.data || [])
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default user
