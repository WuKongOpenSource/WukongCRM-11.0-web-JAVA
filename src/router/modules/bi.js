/** 商业智能管理路由 */
import Layout from '@/views/layout/BiLayout'
const layout = function(path, alwaysShow, meta) {
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
    ...layout('/bi/customer', true, {
      permissions: ['bi', 'customer'],
      icon: 'customer-solid',
      title: '员工客户分析'
    }),
    children: [
      {
        path: 'total', // 客户总量分析
        component: () => import('@/views/bi/customer/CustomerTotalStatistics'),
        meta: {
          title: '客户总量分析'
        }
      },
      {
        path: 'record', // 客户跟进次数分析
        component: () => import('@/views/bi/customer/CustomerRecordStatistics'),
        meta: {
          title: '客户跟进次数分析'
        }
      },
      {
        path: 'recordmode', // 客户跟进方式分析
        component: () => import('@/views/bi/customer/CustomerRecordModeStatistics'),
        meta: {
          title: '客户跟进方式分析'
        }
      },
      {
        path: 'conversion', // 客户转化率分析
        component: () => import('@/views/bi/customer/CustomerConversionStatistics'),
        meta: {
          title: '客户转化率分析'
        }
      },
      {
        path: 'pool', // 公海客户分析
        component: () => import('@/views/bi/customer/CustomerPoolStatistics'),
        meta: {
          title: '公海客户分析'
        }
      },
      {
        path: 'cycle', // 成交周期分析
        component: () => import('@/views/bi/customer/CustomerCycleStatistics'),
        meta: {
          title: '成交周期分析'
        }
      },
      {
        path: 'customerSatisfaction', // 员工客户满意度分析
        component: () => import('@/views/bi/customer/CustomerSatisfaction'),
        meta: {
          title: '员工客户满意度分析'
        }
      },
      {
        path: 'productSatisfaction', // 产品满意度分析
        component: () => import('@/views/bi/customer/ProductSatisfaction'),
        meta: {
          title: '产品满意度分析'
        }
      }
    ]
  },
  {
    ...layout('/bi/business', true, {
      permissions: ['bi', 'business'],
      icon: 'funnel-solid',
      title: '销售漏斗分析'
    }),
    children: [
      {
        path: 'funnel', // 销售漏斗
        component: () => import('@/views/bi/business/FunnelStatistics'),
        meta: {
          title: '销售漏斗'
        }
      },
      {
        path: 'addBusiness', // 新增商机分析
        component: () => import('@/views/bi/business/BusinessTrendStatistics'),
        meta: {
          title: '新增商机分析'
        }
      },
      {
        path: 'conversion', // 商机转化率分析
        component: () => import('@/views/bi/business/BusinessWinStatistics'),
        meta: {
          title: '商机转化率分析'
        }
      }
    ]
  },
  {
    ...layout('/bi/contract', true, {
      permissions: ['bi', 'contract'],
      icon: 'results-solid',
      title: '员工业绩分析'
    }),
    children: [
      {
        path: 'count', // 合同数量分析
        component: () => import('@/views/bi/achievement/AchievementCountStatistics'),
        meta: {
          title: '合同数量分析'
        }
      },
      {
        path: 'money', // 合同金额分析
        component: () => import('@/views/bi/achievement/AchievementMoneyStatistics'),
        meta: {
          title: '合同金额分析'
        }
      },
      {
        path: 'backMoney', // 回款金额分析
        component: () => import('@/views/bi/achievement/AchievementBackStatistics'),
        meta: {
          title: '回款金额分析'
        }
      },
      {
        path: 'summary', // 合同汇总表
        component: () => import('@/views/bi/achievement/AchievementSummaryStatistics'),
        meta: {
          title: '合同汇总表'
        }
      },
      {
        path: 'invoice', // 发票统计分析
        component: () => import('@/views/bi/achievement/AchievementInvoiceStatistics'),
        meta: {
          title: '发票统计分析'
        }
      }
    ]
  },
  {
    ...layout('/bi/portrait', true, {
      permissions: ['bi', 'portrait'],
      icon: 's-seas',
      title: '客户画像分析'
    }),
    children: [
      {
        path: 'address', // 城市分布分析
        component: () => import('@/views/bi/customerPortrayal/CustomerAddressStatistics'),
        meta: {
          title: '城市分布分析'
        }
      }, {
        path: 'customer/:type', // 客户分析
        hidden: true, // 菜单不展示
        component: () => import('@/views/bi/customerPortrayal/CustomerPortrayalStatistics')
      },
      {
        path: 'customer/industry', // 客户行业分析z
        component: () => import('@/views/bi/customerPortrayal/CustomerPortrayalStatistics'),
        ignore: true, // 路由添加时忽略
        meta: {
          title: '客户行业分析'
        }
      },
      {
        path: 'customer/level', // 客户级别分析
        component: () => import('@/views/bi/customerPortrayal/CustomerPortrayalStatistics'),
        ignore: true, // 路由添加时忽略
        meta: {
          title: '客户级别分析'
        }
      },
      {
        path: 'customer/source', // 客户来源分析
        component: () => import('@/views/bi/customerPortrayal/CustomerPortrayalStatistics'),
        ignore: true, // 路由添加时忽略
        meta: {
          title: '客户来源分析'
        }
      }
    ]
  },
  {
    ...layout('/bi/product', true, {
      permissions: ['bi', 'product'],
      icon: 'product',
      title: '产品分析'
    }),
    children: [
      {
        path: 'sales', // 产品销售情况统计
        component: () => import('@/views/bi/product/ProductStatistics'),
        meta: {
          title: '产品销售情况统计'
        }
      },
      {
        path: 'category', // 产品分类销量分析
        component: () => import('@/views/bi/product/ProductCategoryStatistics'),
        meta: {
          title: '产品分类销量分析'
        }
      }
    ]
  },
  {
    ...layout('/bi/ranking', true, {
      permissions: ['bi', 'ranking'],
      icon: 'left-trophy',
      title: '排行榜'
    }),
    children: [
      {
        path: 'contract', // 合同金额排行
        component: () => import('@/views/bi/ranking/RankingContractStatistics'),
        meta: {
          title: '合同金额排行'
        }
      },
      {
        path: 'receivables', // 回款金额排行
        component: () => import('@/views/bi/ranking/RankingReceivablesStatistics'),
        meta: {
          title: '回款金额排行'
        }
      },
      {
        path: 'signing', // 签约合同排行
        component: () => import('@/views/bi/ranking/RankingSigningStatistics'),
        meta: {
          title: '签约合同排行'
        }
      },
      {
        path: 'product', // 产品销量排行
        component: () => import('@/views/bi/ranking/RankingProductStatistics'),
        meta: {
          title: '产品销量排行'
        }
      },
      {
        path: 'addCustomer', // 新增客户数排行
        component: () => import('@/views/bi/ranking/RankingAddCustomerStatistics'),
        meta: {
          title: '新增客户数排行'
        }
      },
      {
        path: 'addContacts', // 新增联系人数排行
        component: () => import('@/views/bi/ranking/RankingAddContactsStatistics'),
        meta: {
          title: '新增联系人数排行'
        }
      },
      {
        path: 'recordNun', // 跟进次数排行
        component: () => import('@/views/bi/ranking/RankingRecordNunStatistics'),
        meta: {
          title: '跟进次数排行'
        }
      },
      {
        path: 'recordCustomer', // 跟进客户数排行
        component: () => import('@/views/bi/ranking/RankingRecordCustomerStatistics'),
        meta: {
          title: '跟进客户数排行'
        }
      },
      {
        path: 'examine', // 出差次数排行
        component: () => import('@/views/bi/ranking/RankingExamineStatistics'),
        meta: {
          title: '出差次数排行'
        }
      }
    ]
  },
  {
    ...layout('/bi/oa', true, {
      permissions: ['bi', 'oa'],
      icon: 'office',
      title: '办公分析'
    }),
    children: [
      {
        path: 'log', // 日志分析
        component: () => import('@/views/bi/oa/Log'),
        meta: {
          title: '日志分析'
        }
      },
      {
        path: 'examine', // 审批分析
        component: () => import('@/views/bi/oa/Examine'),
        meta: {
          title: '审批分析'
        }
      }
    ]
  },
  {
    ...layout('/bi/target', false, {
      permissions: ['bi', 'achievement']
    }),
    children: [
      {
        path: 'complete', // 业绩目标完成情况
        component: () => import('@/views/bi/TaskCompleteStatistics'),
        meta: {
          icon: 'target-solid',
          title: '业绩目标完成情况'
        }
      }
    ]
  }
]

