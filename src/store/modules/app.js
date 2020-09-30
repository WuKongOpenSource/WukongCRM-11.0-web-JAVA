import {
  adminSystemIndexAPI
} from '@/api/admin/config'
import {
  crmSettingConfigDataAPI
} from '@/api/admin/crm'
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
    headerModule: null // 置顶模块
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
    }
  },

  actions: {
    // 登录
    SystemLogoAndName({
      commit
    }) {
      return new Promise((resolve, reject) => {
        adminSystemIndexAPI().then(response => {
          commit('SET_APPNAME', response.data.companyName)
          commit('SET_APPLOGO', response.data.companyLogo)
          Lockr.set('systemLogo', response.data.companyLogo)
          Lockr.set('systemName', response.data.companyName)
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
          state.headerModule = response.data || []
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default app
