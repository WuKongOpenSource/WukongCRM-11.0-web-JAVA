/** 任务审批路由+ */
import Layout from '@/views/layout/TaskExamineLayout'

const layout = function(hidden, meta = {}) {
  return {
    path: '/taskExamine',
    component: Layout,
    alwaysShow: false,
    hidden: hidden,
    meta: {
      requiresAuth: true,
      permissions: ['oa', 'taskExamine'],
      ...meta
    }
  }
}

export default [
  {
    ...layout(true),
    children: [{
      path: 'task-index/:type',
      meta: {
        redirect: 'task-index/1' // 获取传参的重置链接
      },
      component: () => import('@/views/taskExamine/task/index')
    }]
  },
  {
    ...layout(false),
    ignore: true, // 路由添加时忽略
    children: [{
      path: 'task-index/1',
      meta: {
        title: '我的任务',
        icon: 'my-task'
      }
    }]
  },
  {
    ...layout(false),
    ignore: true,
    children: [{
      path: 'task-index/2',
      meta: {
        title: '下属的任务',
        icon: 'o-task'
      }
    }]
  },

  {
    ...layout(true),
    children: [{
      path: 'examine-index/:type',
      meta: {
        redirect: 'examine-index/my' // 获取传参的重置链接
      },
      component: () => import('@/views/taskExamine/examine/index')
    }]
  },
  {
    ...layout(false),
    ignore: true, // 路由添加时忽略
    children: [{
      path: 'examine-index/my',
      meta: {
        title: '我发出的审批',
        icon: 'apply-for'
      }
    }]
  },
  {
    ...layout(false),
    ignore: true,
    children: [{
      path: 'examine-index/wait',
      meta: {
        title: '待我审批（办公）',
        icon: 'approve'
      }
    }]
  },

  {
    ...layout(true),
    children: [{
      path: 'crm/:type',
      meta: {
        redirect: 'crm/contract' // 获取传参的重置链接
      },
      component: () => import('@/views/taskExamine/crm/index')
    }]
  },
  {
    ...layout(false),
    ignore: true, // 路由添加时忽略
    children: [{
      path: 'crm/contract',
      meta: {
        title: '待我审批（合同）',
        icon: 'contract'
      }
    }]
  },
  {
    ...layout(false),
    ignore: true,
    children: [{
      path: 'crm/receivables',
      meta: {
        title: '待我审批（回款）',
        icon: 'receivables'
      }
    }]
  },
  {
    ...layout(false),
    ignore: true,
    children: [{
      path: 'crm/invoice',
      meta: {
        title: '待我审批（发票）',
        icon: 'invoice'
      }
    }]
  }
]
