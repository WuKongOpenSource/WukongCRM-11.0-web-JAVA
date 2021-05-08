import {
  loginAPI,
  logoutAPI
} from '@/api/login'
import {
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

const user = {
  state: {
    userInfo: null, // 用户信息
    // 权限信息
    allAuth: null, // 总权限信息 默认空 调整动态路由
    crm: {}, // 客户管理
    bi: {}, // 商业智能
    manage: {}, // 管理后台
    oa: {}, // 办公
    project: {} // 项目管理
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
    SET_AUTH: (state, data) => {
      const token = data.adminToken
      Lockr.set('Admin-Token', token)
      addAuth(token)
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
      commit
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
    }
  }
}

export default user
