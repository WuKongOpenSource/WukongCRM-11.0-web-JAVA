/** 系统管理路由 */
import Layout from '@/views/layout/AdminLayout'

const layout = function(meta = {}, path = '/manage', requiresAuth = true) {
  return {
    path: path,
    component: Layout,
    meta: {
      requiresAuth: requiresAuth,
      ...meta
    }
  }
}

export default [
  {
    ...layout({
      permissions: ['manage', 'system', 'read']
    }),
    children: [{
      name: 'systemconfig',
      path: 'systemconfig', // 企业首页
      component: () => import('@/views/admin/config'),
      meta: {
        title: '企业首页',
        icon: 'enterprise'
      }
    }]
  },
  {
    ...layout({
      permissions: ['manage']
    }),
    children: [{
      path: 'update', // 升级
      component: () => import('@/views/admin/update'),
      meta: {
        title: '在线升级',
        icon: 'data-import'
      }
    }]
  },
  {
    ...layout({
      permissions: ['manage', 'configSet', 'read']
    }),
    children: [{
      name: 'application',
      path: 'application', // 应用管理
      component: () => import('@/views/admin/application'),
      meta: {
        title: '应用管理',
        icon: 'all'
      }
    }]
  },
  {
    ...layout({
      permissions: ['manage', 'users', 'read']
    }),
    children: [{
      name: 'employee-dep',
      path: 'employee-dep', // 员工与部门管理
      component: () => import('@/views/admin/employeeDep'),
      meta: {
        title: '员工与部门管理',
        icon: 's-seas'
      }
    }]
  },
  {
    ...layout({
      permissions: ['manage', 'permission'],
      title: '角色权限管理',
      icon: 'user'
    }, '/manage/role-auth'),
    alwaysShow: true,
    name: 'manage-role-auth',
    children: [{
      name: 'role-auth',
      path: 'role-auth/:pid/:title',
      hidden: true,
      component: () => import('@/views/admin/roleAuth/index'),
      meta: {}
    }]
  },
  {
    ...layout({
      permissions: ['manage', 'examineFlow']
    }),
    children: [{
      name: 'system-examine',
      path: 'system-examine', // 业务审批流
      component: () => import('@/views/admin/examine'),
      meta: {
        title: '业务审批流',
        icon: 'approve'
      }
    }]
  },
  {
    ...layout({
      permissions: ['manage', 'oa']
    }),
    children: [{
      name: 'system-workbench',
      path: 'system-workbench', // 办公审批流
      component: () => import('@/views/admin/oa'),
      meta: {
        title: '办公审批流',
        icon: 'approve'
      }
    }, {
      name: 'workbenchHandlefield',
      path: 'workbench-custom-field/:type/:id/:label',
      component: () => import('@/views/admin/crm/HandleField'),
      hidden: true,
      meta: {
        activeMenu: '/manage/system-workbench'
      }
    }]
  },
  {
    ...layout({
      permissions: ['manage', 'work']
    }),
    children: [{
      name: 'system-project',
      path: 'system-project', // 项目管理
      component: () => import('@/views/admin/project'),
      meta: {
        title: '项目管理',
        icon: 'project'
      }
    }]
  },
  {
    ...layout({
      permissions: ['manage', 'crm'],
      title: '客户管理',
      icon: 'customer'
    }, '/manage/customer'),
    alwaysShow: true,
    children: [{
      path: 'custom-field',
      component: () => import('@/views/admin/crm/customField'),
      meta: {
        title: '自定义字段设置',
        requiresAuth: true,
        permissions: ['manage', 'crm', 'field']
      }
    }, {
      path: 'customer',
      component: () => import('@/views/admin/crm/customer'),
      meta: {
        title: '客户公海规则设置',
        requiresAuth: true,
        permissions: ['manage', 'crm', 'pool']
      }
    }, {
      path: 'print-templates',
      component: () => import('@/views/admin/crm/printTemplates'),
      meta: {
        title: '自定义打印模板',
        requiresAuth: true,
        permissions: ['manage', 'crm', 'print']
      }
    }, {
      path: 'print-detail',
      name: 'crmPrintDetail',
      component: () => import('@/views/admin/crm/printTemplates/PrintTemplateDetail'),
      hidden: true,
      meta: {
        activeMenu: '/manage/customer/print-templates',
        title: '自定义打印模板',
        requiresAuth: true,
        permissions: ['manage', 'crm', 'print']
      }
    }, {
      path: 'biz-param',
      component: () => import('@/views/admin/crm/bizParam'),
      meta: {
        title: '业务参数设置',
        requiresAuth: true,
        permissions: ['manage', 'crm', 'setting']
      }
    }, {
      name: 'crmBizGoals',
      path: 'biz-goals',
      component: () => import('@/views/admin/crm/bizGoals'),
      meta: {
        title: '业绩目标设置',
        requiresAuth: true,
        permissions: ['manage', 'crm', 'achievement']
      }
    }, {
      name: 'handlefield',
      path: 'custom-field/:type/:id/:label',
      component: () => import('@/views/admin/crm/HandleField'),
      hidden: true,
      meta: {
        activeMenu: '/manage/customer/custom-field',
        requiresAuth: true,
        permissions: ['manage', 'crm', 'field']
      }
    }]
  },
  {
    ...layout({}, '/manage', false),
    children: [{
      name: 'system-other',
      path: 'system-other', // 其他配置
      component: () => import('@/views/admin/other'),
      meta: {
        title: '其他设置',
        icon: 'manage'
      }
    }]
  },
  {
    ...layout({
      permissions: ['manage', 'init', 'initData']
    }, '/manage', false),
    children: [{
      path: 'init', // 初始化数据
      component: () => import('@/views/admin/init/Set'),
      meta: {
        title: '初始化数据',
        icon: 'results-solid'
      }
    }]
  }
]
