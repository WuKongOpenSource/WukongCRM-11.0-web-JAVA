import Layout from '@/views/layout/PmLayout'

const layout = function(path = '/project', meta = {}) {
  return {
    path: path,
    component: Layout,
    meta: {
      requiresAuth: true,
      permissions: ['project'],
      ...meta
    }
  }
}

export default [
  {
    ...layout(),
    children: [{
      path: 'workbench', // 工作台
      component: () => import('@/views/pm/task/index'),
      meta: {
        title: '工作台',
        icon: 'workbench'
      }
    }]
  },
  {
    ...layout('/project-list'),
    hidden: true,
    children: [{
      name: 'project-list',
      path: 'project/:id', // 项目
      component: () => import('@/views/pm/project/index'),
      meta: {
        activeMenu: '/project/list'
      }
    }/** , {
      path: 'index', // 展示用
      meta: {
        title: '项目',
        icon: 'project',
        disabled: true // 禁止next
      }
    }*/]
  },
  {
    ...layout(),
    hidden: true,
    children: [{
      path: 'search',
      component: () => import('@/views/pm/project/Search'),
      meta: {
        title: '搜索',
        activeMenu: '/project/list'
      }
    }]
  },
  {
    ...layout(),
    children: [{
      path: 'list', // 项目封面列表
      component: () => import('@/views/pm/project/Corver'),
      meta: {
        title: '项目',
        icon: 'project'
      }
    }]
  },
  {
    ...layout(),
    children: [{
      path: 'statistics', // 统计分析
      component: () => import('@/views/pm/statistics/index'),
      meta: {
        title: '统计分析',
        icon: 'results-solid'
      }
    }]
  },
  {
    ...layout(),
    children: [{
      path: 'archive', // 归档项目
      component: () => import('@/views/pm/archive/index'),
      meta: {
        title: '归档项目',
        icon: 'archive'
      }
    }]
  },
  {
    ...layout('/tag-list'),
    children: [{
      name: 'tag-list',
      path: 'tag/:id', // 项目
      component: () => import('@/views/pm/tag/index'),
      hidden: true,
      meta: {
        activeMenu: '/tag-list/index'
      }
    }, {
      path: 'index', // 展示用
      meta: {
        title: '标签',
        icon: 'label',
        disabled: true // 禁止next
      }
    }]
  },
  {
    ...layout(),
    children: [{
      path: 'recycle', // 回收站
      component: () => import('@/views/pm/recycle/index'),
      meta: {
        title: '回收站',
        icon: 'recycle-bin'
      }
    }]
  }
]
