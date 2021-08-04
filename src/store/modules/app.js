import {
  adminSystemIndexAPI
} from '@/api/admin/config'
import {
  crmSettingConfigDataAPI
} from '@/api/admin/crm'
import {
  adminConfigsetIndexAPI
} from '@/api/admin/application'
import { configHeaderModelSortAPI } from '@/api/config'
import Lockr from 'lockr'

/** 记录 侧边索引 */
const app = {
  state: {
    logo: '',
    name: '',
    lang: localStorage.lang || 'cn',
    sidebar: {
      activeIndex: '', // 目前激活的 行
      collapse: Lockr.get('sideBarCollapse') || false
    },
    navbar: {
      activeIndex: '' // 导航目前是第几个 个人中心需要
    },
    // CRM配置信息
    CRMConfig: {},
    // 图片缓存
    imageCache: {},
    headerModule: null, // 置顶模块
    // 模块权限
    moduleAuth: null
  },

  mutations: {
    SET_ACTIVEINDEX: (state, path) => {
      state.sidebar.activeIndex = path
    },
    SET_COLLAPSE: (state, collapse) => {
      state.sidebar.collapse = collapse
      Lockr.set('sideBarCollapse', collapse)
    },
    SET_NAVACTIVEINDEX: (state, path) => {
      state.navbar.activeIndex = path
    },
    SET_APPLOGO: (state, logo) => {
      state.logo = logo
    },
    SET_APPNAME: (state, name) => {
      state.name = name
    },
    SET_LANG: (state, lang) => {
      state.lang = lang
      window.app.$i18n.locale = lang
      localStorage.setItem('lang', lang)
      window.location.reload()
    },
    SET_CRMCONFIG: (state, config) => {
      state.CRMConfig = config
    },
    SET_IMAGECACHE: (state, value) => {
      state.imageCache = value
    },
    SET_MODULEAUTH: (state, value) => {
      state.moduleAuth = value
    },
    SET_HEADERMODULE: (state, value) => {
      state.headerModule = value
    }
  },

  actions: {
    // 登录
    SystemLogoAndName({
      commit
    }) {
      return new Promise((resolve, reject) => {
        adminSystemIndexAPI().then(response => {
          const resData = response.data || {}
          commit('SET_APPNAME', resData.companyName)
          commit('SET_APPLOGO', resData.companyLogo)
          Lockr.set('systemLogo', resData.companyLogo)
          Lockr.set('systemName', resData.companyName)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    /**
     * 获取客户管理配置
     */
    CRMSettingConfig({
      commit
    }) {
      return new Promise((resolve, reject) => {
        crmSettingConfigDataAPI().then(response => {
          commit('SET_CRMCONFIG', response.data)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 置顶应用
    WKHeaderModule({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        configHeaderModelSortAPI().then(response => {
          commit('SET_HEADERMODULE', response.data || [])
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 查询模块权限
    QueryModules({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        adminConfigsetIndexAPI().then(res => {
          const resData = res.data || []
          const auth = {}
          resData.forEach(item => {
            auth[item.module] = item.status === 1
          })
          commit('SET_MODULEAUTH', auth)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default app
