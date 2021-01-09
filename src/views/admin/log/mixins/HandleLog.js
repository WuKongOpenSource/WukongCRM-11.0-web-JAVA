export default {
  data() {
    return {
      modelOptions: [{
        label: '客户管理',
        value: 'crm',
        list: [{
          label: '线索',
          value: 21
        }, {
          label: '客户',
          value: 22
        }, {
          label: '联系人',
          value: 23
        }, {
          label: '商机',
          value: 24
        }, {
          label: '合同',
          value: 25
        }, {
          label: '回款',
          value: 26
        }, {
          label: '发票',
          value: 27
        }, {
          label: '回访',
          value: 28
        }, {
          label: '产品',
          value: 29
        }, {
          label: '市场活动',
          value: 30
        }]
      }, {
        label: '办公管理',
        value: 'oa',
        list: [{
          label: '日历',
          value: 41
        }, {
          label: '日志',
          value: 42
        }]
      }, {
        label: '项目管理',
        value: 'work',
        list: [{
          label: '项目',
          value: 51
        }, {
          label: '任务',
          value: 52
        }]
      }, {
        label: '人力资源',
        value: 'hrm',
        list: [{
          label: '组织管理',
          value: 61
        }, {
          label: '招聘管理',
          value: 62
        }, {
          label: '候选人',
          value: 63
        }, {
          label: '员工管理',
          value: 64
        }, {
          label: '社保管理',
          value: 65
        }, {
          label: '薪资管理',
          value: 66
        }, {
          label: '薪资档案',
          value: 67
        }, {
          label: '工资条',
          value: 68
        }, {
          label: '绩效考核',
          value: 69
        }]
      }, {
        label: '进销存',
        value: 'jxc',
        list: [{
          label: '供应商',
          value: 81
        }, {
          label: '采购订单',
          value: 82
        }, {
          label: '采购退货',
          value: 83
        }, {
          label: '产品管理',
          value: 84
        }, {
          label: '销售订单',
          value: 85
        }, {
          label: '销售退货',
          value: 86
        }, {
          label: '仓库管理',
          value: 87
        }, {
          label: '产品库存',
          value: 88
        }, {
          label: '产品入库',
          value: 89
        }, {
          label: '产品出库',
          value: 90
        }, {
          label: '库存调拨',
          value: 91
        }, {
          label: '库存盘点',
          value: 92
        }, {
          label: '回款',
          value: 93
        }, {
          label: '付款',
          value: 93
        }]
      }],
      sysOptions: [{
        label: '企业首页',
        value: 1
      }, {
        label: '应用管理',
        value: 2
      }, {
        label: '员工管理',
        value: 3
      }, {
        label: '部门管理',
        value: 4
      }, {
        label: '角色管理',
        value: 5
      }, {
        label: '项目管理',
        value: 6
      }, {
        label: '客户管理',
        value: 7
      }, {
        label: '人力资源',
        value: 8
      }, {
        label: '进销存',
        value: 9
      }, {
        label: '其他设置',
        value: 10
      }],
      fieldList: [
        {
          prop: 'realname',
          label: '用户',
          width: 100
        },
        {
          prop: 'createTime',
          label: '时间',
          width: 150
        },
        {
          prop: 'ipAddress',
          label: 'IP地址',
          width: 100
        },
        {
          prop: 'model',
          label: '模块',
          width: 150
        },
        {
          prop: 'behavior',
          label: '行为',
          width: 150
        },
        {
          prop: 'object',
          label: '对象',
          width: 150
        },
        {
          prop: 'detail',
          label: '操作详情',
          width: 100
        }
      ]
    }
  },

  methods: {
    getModelName(model) {
      return {
        crm: '客户管理',
        oa: '办公管理',
        work: '项目管理',
        hrm: '人力资源',
        jxc: '进销存',
        admin: '系统管理'
      }[model]
    }
  }
}
