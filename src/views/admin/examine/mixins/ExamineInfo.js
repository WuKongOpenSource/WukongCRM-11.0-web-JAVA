import { roleListAPI } from '@/api/admin/employeeDep'

export default {
  data() {
    return {
      wkRoleOption: []
    }
  },

  methods: {
    getListInfo(list, newList) {
      list.forEach(item => {
        // 条件
        if (item.examineType === 0) {
          newList.push(this.getConditonWrapInfo(item))
        } else {
          newList.push(this.getNodeInfo(item))
        }
      })
    },

    /**
     * 审批节点信息
     */
    getNodeInfo(data) {
      const dataInfo = {
        examineType: data.examineType,
        name: data.name,
        conditionList: [],
        deptList: data.deptList,
        examineErrorHandling: data.examineErrorHandling,
        roleId: data.roleId,
        type: data.type,
        userList: data.userList || [],
        chooseType: data.chooseType,
        rangeType: data.rangeType,
        parentLevel: 1,
        tempParentLevel: 1, // 临时变量
        overType: 1, // 临时变量
        isError: false
      }

      if (data.examineType === 5) {
        if (data.type === 1) {
          // overType 1 开启 0 不开启 parentLevel为0
          if (data.parentLevel === 0) {
            dataInfo.overType = 0
            dataInfo.parentLevel = 1
          } else {
            dataInfo.overType = 1
            dataInfo.parentLevel = data.parentLevel
          }
        } else if (data.type === 2) {
          dataInfo.overType = 1
          dataInfo.parentLevel = 1
          dataInfo.tempParentLevel = data.parentLevel
        }
      } else {
        dataInfo.parentLevel = data.parentLevel
      }

      // 角色对象
      if (data.roleId) {
        dataInfo.roleObj = {}
        this.getRoleList().then(roles => {
          this.getRoleObj(data.roleId, roles, dataInfo)
        })
      }

      return dataInfo
    },

    /**
     * 条件节点信息
     */
    getConditionNodeInfo(data, index) {
      const dataInfo = {
        conditionName: data.conditionName,
        sort: index + 1,
        conditionDataList: [],
        examineDataList: [],
        isError: false
      }

      data.conditionDataList.forEach(item => {
        const subItem = {
          name: item.name,
          fieldName: item.fieldName,
          fieldId: item.fieldId,
          type: item.type,
          conditionType: item.conditionType
        }

        // 单选多选
        if (item.type === 3 || item.type === 9) {
          subItem.values = item.values
          this.validateSetting(subItem)
        } else {
          // 数字区间
          if (item.conditionType === 6) {
            if (item.values && item.values.length === 4) {
              subItem.leftValue = parseInt(item.values[0])
              subItem.leftCondition = parseInt(item.values[1])
              subItem.rightCondition = parseInt(item.values[2])
              subItem.rightValue = parseInt(item.values[3])
            } else {
              subItem.leftValue = 0
              subItem.leftCondition = 1
              subItem.rightCondition = 1
              subItem.rightValue = 0
            }
            subItem.values = 0
          } else if (item.conditionType === 8) { // 发起人
            const itemValues = item.values
            subItem.values = {
              deptList: itemValues.deptList.map(item => item.deptId),
              roleList: itemValues.roleList,
              userList: itemValues.userList.map(item => item.userId)
            }
            subItem.deptList = itemValues.deptList
            subItem.userList = itemValues.userList
            subItem.roleList = []
            if (itemValues.roleList.length > 0) {
              this.getRoleList().then(roles => {
                this.getRoleItems(itemValues.roleList, roles, subItem.roleList)
              })
            }
          } else {
            // 数字或金额切换类型的值
            subItem.leftValue = 0
            subItem.leftCondition = 1
            subItem.rightCondition = 1
            subItem.rightValue = 0
            if (item.values && item.values.length > 0) {
              subItem.values = item.values[0]
            } else {
              subItem.values = 0
            }
          }
        }
        dataInfo.conditionDataList.push(subItem)
      })
      return dataInfo
    },

    /**
     * 验证数据
     */
    validateSetting(item) {

    },

    /**
     * 获取角色列表
     */
    getRoleList() {
      return new Promise((resolve, reject) => {
        if (this.wkRoleOption.length > 0) {
          resolve(this.wkRoleOption)
        } else {
          roleListAPI()
            .then(res => {
              this.wkRoleOption = res.data || []
              resolve(this.wkRoleOption)
            })
            .catch(() => {})
        }
      })
    },

    /**
     * 获取角色对象
     */
    getRoleItems(ids, list, newList) {
      for (let index = 0; index < list.length; index++) {
        const item = list[index]
        if (ids.includes(item.roleId)) {
          newList.push(item)
          if (ids.length === newList.length) {
            break
          }
        }
        if (item.list) {
          this.getRoleItems(ids, item.list, newList)
        }
      }
    },

    /**
     * 获取角色对象
     */
    getRoleObj(id, list, dataInfo) {
      for (let index = 0; index < list.length; index++) {
        const item = list[index]
        if (item.roleId === id) {
          dataInfo.roleObj = item
          break
        }
        if (item.list) {
          this.getRoleObj(id, item.list, dataInfo)
        }
      }
    },

    getConditonWrapInfo(conditionWrap) {
      const conditionWrapInfo = {
        examineType: conditionWrap.examineType,
        name: conditionWrap.name,
        conditionList: []
      }
      conditionWrap.conditionList.forEach((item, index) => {
        // 条件
        const conditionNodeInfo = this.getConditionNodeInfo(item, index)

        conditionWrapInfo.conditionList.push(conditionNodeInfo)
        this.getListInfo(item.examineDataList, conditionNodeInfo.examineDataList)
      })

      return conditionWrapInfo
    }

  }
}
