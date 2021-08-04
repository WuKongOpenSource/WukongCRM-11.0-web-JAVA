// 人资
import Layout from '@/views/layout/HrmLayout'

const layout = function(meta, alwaysShow, path = '/hrm') {
  return {
    path: path,
    component: Layout,
    alwaysShow: alwaysShow,
    meta: {
      requiresAuth: true,
      ...meta
    }
  }
}

export default [
  {
    ...layout({
      permissions: ['hrm']
    }, false),
    isAll: true,
    children: [{
      name: 'hrmWorkbench',
      path: 'workbench',
      component: () => import('@/views/hrm/workbench/index'),
      meta: {
        title: '工作台',
        icon: 'workbench'
      }
    }]
  },
  {
    ...layout({
      permissions: ['hrm', 'dept', 'index']
    }, false),
    children: [{
      path: 'dept',
      component: () => import('@/views/hrm/dept/index'),
      meta: {
        title: '组织管理',
        icon: 'subordinate'
      }
    }]
  },
  {
    ...layout({
      icon: 'office',
      title: '招聘管理',
      permissionList: [['hrm', 'recruit', 'read'], ['hrm', 'recruit', 'readPost']]
    }, true, '/hrm/recruit'),
    children: [{
      name: 'hrmCandidate',
      path: 'candidate',
      component: () => import('@/views/hrm/recruit/candidate/index'),
      meta: {
        title: '候选人',
        requiresAuth: true,
        permissions: ['hrm', 'recruit', 'read']
      }
    }, {
      name: 'hrmPost',
      path: 'post',
      component: () => import('@/views/hrm/recruit/post/index'),
      meta: {
        title: '招聘职位',
        requiresAuth: true,
        permissions: ['hrm', 'recruit', 'readPost']
      }
    }]
  },
  {
    ...layout({
      permissions: ['hrm', 'employee', 'index']
    }, false),
    children: [{
      name: 'hrmEmployee',
      path: 'employee',
      component: () => import('@/views/hrm/employee/index'),
      meta: {
        title: '员工管理',
        icon: 'user'
      }
    }]
  },
  {
    ...layout({
      permissions: ['hrm', 'attendance', 'readClock']
    }, false),
    children: [{
      name: 'hrmClock',
      path: 'clock',
      component: () => import('@/views/hrm/clock/index'),
      meta: {
        title: '考勤管理',
        icon: 'schedule'
      }
    }]
  },
  {
    ...layout({
      permissions: ['hrm', 'insurance', 'read']
    }, false),
    children: [{
      path: 'insurance-scheme',
      component: () => import('@/views/hrm/insuranceScheme/index'),
      meta: {
        icon: 'social',
        title: '社保管理'
      }
    }, {
      path: 'insurance-scheme/detail/:id',
      hidden: true,
      component: () => import('@/views/hrm/insuranceScheme/Detail'),
      meta: {
        activeMenu: '/hrm/insurance-scheme',
        icon: 'social',
        title: '社保管理'
      }
    }]
  },
  {
    ...layout({
      title: '薪资管理',
      icon: 'payment',
      permissionList: [['hrm', 'salary', 'index'], ['hrm', 'salary', 'history']]
    }, false),
    children: [{
      name: 'hrmSalary',
      path: 'salary',
      component: () => import('@/views/hrm/salary'),
      meta: {
        title: '薪资管理',
        requiresAuth: true,
        permissions: ['hrm', 'salary', 'index']
      }
    }, {
      name: 'hrmSalaryArchives',
      path: 'salaryArchives',
      component: () => import('@/views/hrm/salary/archives'),
      meta: {
        title: '薪资档案',
        requiresAuth: true,
        permissions: ['hrm', 'salary', 'queryArchives']
      }
    },
    {
      path: 'salary/history',
      component: () => import('@/views/hrm/salary/History'),
      meta: {
        title: '历史工资',
        requiresAuth: true,
        permissions: ['hrm', 'salary', 'history']
      }
    }, {
      path: 'salary/history/detail/:id',
      name: 'salaryHistoryDetail',
      hidden: true,
      component: () => import('@/views/hrm/salary/HistoryDetail'),
      meta: {
        activeMenu: '/hrm/salary/history',
        requiresAuth: true,
        permissions: ['hrm', 'salary', 'history']
      }
    },
    {
      path: 'salary/slipHistory',
      component: () => import('@/views/hrm/salary/slip/History'),
      meta: {
        title: '发放记录',
        requiresAuth: true,
        permissions: ['hrm', 'salary', 'queryRecord']
      }
    }, {
      path: 'salary/slipHistory/detail/:id/:month',
      name: 'salarySlipHistoryDetail',
      hidden: true,
      component: () => import('@/views/hrm/salary/slip/HistoryDetail'),
      meta: {
        activeMenu: '/hrm/salary/slipHistory',
        requiresAuth: true,
        permissions: ['hrm', 'salary', 'queryRecord']
      }
    }]
  },
  {
    ...layout({
      icon: 'perform',
      title: '绩效管理',
      permissionList: [['hrm', 'appraisal', 'read'], ['hrm', 'appraisal', 'readEmp']]
    }, true, '/hrm/performance'),
    children: [{
      path: 'index',
      name: 'hrmPerformance',
      component: () => import('@/views/hrm/performance/index'),
      meta: {
        permissions: ['hrm', 'appraisal', 'read'],
        requiresAuth: true,
        title: '考核计划'
      }
    }, {
      path: 'employee',
      component: () => import('@/views/hrm/performance/employee'),
      meta: {
        permissions: ['hrm', 'appraisal', 'readEmp'],
        requiresAuth: true,
        title: '绩效档案'
      }
    }]
  },
  {
    ...layout({
      permissions: ['hrm']
    }, false, '/hrm/self-server'),
    isEmployee: true,
    children: [{
      name: 'myArchives',
      path: 'myArchives',
      component: () => import('@/views/hrm/selfService/myArchives'),
      meta: {
        title: '我的档案',
        icon: 'archive'
      }
    }]
  },
  {
    ...layout({
      permissions: ['hrm']
    }, false, '/hrm/self-server'),
    isEmployee: true,
    children: [{
      name: 'myInsuranceScheme',
      path: 'insuranceScheme',
      component: () => import('@/views/hrm/selfService/insuranceScheme'),
      meta: {
        title: '我的社保',
        icon: 'social'
      }
    }]
  },
  {
    ...layout({
      permissions: ['hrm']
    }, false, '/hrm/self-server'),
    isEmployee: true,
    children: [{
      name: 'mySalarySlip',
      path: 'salarySlip',
      component: () => import('@/views/hrm/selfService/salarySlip'),
      meta: {
        title: '我的工资条',
        icon: 'icon-slip'
      }
    }]
  },
  {
    ...layout({
      permissions: ['hrm']
    }, false, '/hrm/self-server'),
    isEmployee: true,
    children: [{
      name: 'myPerformance',
      path: 'performance',
      component: () => import('@/views/hrm/selfService/performance'),
      meta: {
        title: '绩效管理',
        icon: 'perform'
      }
    }]
  },
  {
    ...layout({
      requiresAuth: false
    }, false),
    hidden: true,
    children: [{
      path: 'tips',
      name: 'hrmTips',
      component: () => import('@/views/hrm/tips'),
      meta: {
        title: '员工端'
      }
    }]
  }
]
