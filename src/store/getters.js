const getters = {
  userInfo: state => state.user.userInfo,
  hrmUserInfo: state => state.hrm.hrmUserInfo,
  hrmUserType: state => { // 1 管理员 2 上级
    if (state.user.hrmUserInfo && state.user.hrmUserInfo.role) {
      const role = state.user.hrmUserInfo.role
      if (role.label == 91) {
        return 1
      } else if (role.label == 92) {
        return 2
      }
    }
    return null
  },
  hrmShowType: state => state.hrm.hrmShowType,
  lang: state => state.app.lang,
  app: state => state.app,
  logo: state => {
    if (state.app.logo) {
      return state.app.logo
    }
    return require('@/assets/img/logo.png')
  },
  name: state => {
    if (state.app.name) {
      return state.app.name
    }
    return '悟空CRM'
  },
  collapse: state => state.app.sidebar.collapse,
  activeIndex: state => state.app.sidebar.activeIndex,
  navActiveIndex: state => state.app.navbar.activeIndex,
  headerModule: state => state.app.headerModule,
  userList: state => state.user.userList,
  deptList: state => state.user.deptList,
  hrmUserList: state => state.hrm.hrmUserList,
  hrmDeptList: state => state.hrm.hrmDeptList,

  // 权限
  allAuth: state => state.user.allAuth,
  crm: state => state.user.crm,
  bi: state => state.user.bi,
  manage: state => state.user.manage,
  oa: state => state.user.oa,
  project: state => state.user.project,
  hrm: state => state.user.hrm,

  // 路由
  addRouters: state => state.permission.addRouters,
  crmRouters: state => state.permission.crmRouters,
  taskExamineRouters: state => state.permission.taskExamineRouters,
  workLogRouters: state => state.permission.workLogRouters,
  addressBookRouters: state => state.permission.addressBookRouters,
  projectRouters: state => state.permission.projectRouters,
  biRouters: state => state.permission.biRouters,
  manageRouters: state => state.permission.manageRouters,
  hrmRouters: state => state.permission.hrmRouters,

  // 客户管理信息
  messageNum: state => state.crm.messageNum,
  // 配置信息
  CRMConfig: state => state.app.CRMConfig,
  imageCache: state => state.app.imageCache
}
/**
 * 使用说明
 * import { mapGetters } from 'vuex'
 * computed: {
    ...mapGetters([
      'userInfo'
    ])
  }
 */

export default getters
