<template>
  <div class="wk-approve-flow-wrap">
    <el-button-group>
      <el-button
        :disabled="scale <= 0.5"
        icon="el-icon-minus"
        @click="scaleClick('minus')"/>
      <el-button
        :disabled="scale > 3"
        icon="el-icon-plus"
        @click="scaleClick('plus')"/>
    </el-button-group>
    <div
      :style="{
        transform: `scale(${scale})`
      }"
      class="wk-approve-flow">
      <wk-node
        v-if="sendNode"
        :visible-arrow="false"
        :node="sendNode"
        :parent="list"
        disabled
        header-color="#15388b" />
      <template v-for="(item, index) in list">
        <wk-condition-wrap
          v-if="item.examineType === 0"
          :key="index"
          :index="index"
          :node="item"
          :parent="list"
          @node-click="nodeClick"/>
        <wk-node
          v-else
          :index="index"
          :key="index"
          :parent="list"
          :node="item"
          @node-click="nodeClick" />
      </template>
      <wk-end-node />
      <wk-condition-set
        :visible.sync="conditionSetVisible"
        :node="editNode"
        :condition-parent="conditionParent"
        :condition-parent-index="conditionParentIndex"
        :props="config"
      />
      <wk-node-set
        :visible.sync="nodeSetVisible"
        :node="editNode"
        :props="config"
      />
    </div>
  </div>
</template>

<script>
import WkNode from './WkNode'
import WkConditionWrap from './WkConditionWrap'
import AddNodeBtn from './AddNodeBtn'
import WkEndNode from './WkEndNode'
import WkConditionSet from './WkConditionSet'
import WkNodeSet from './WkNodeSet'

import merge from '@/utils/merge'
import NodeSetMixin from './NodeSet'

const DefaultFlowProps = {
  // 条件选择数据参数
  conditionSelectRequest: null,
  conditionSelectParams: null
}

export default {
  name: 'WkApproveFlow',

  components: {
    WkNode,
    WkConditionWrap,
    AddNodeBtn,
    WkEndNode,
    WkConditionSet,
    WkNodeSet
  },

  mixins: [NodeSetMixin],

  props: {
    props: {
      type: Object,
      default: () => {
        return {}
      }
    },
    sendNode: Object,
    list: Array
  },

  data() {
    return {
      editNode: null,
      editNodeIndex: null,
      conditionParent: [],
      conditionParentIndex: 0,
      conditionSetVisible: false,
      nodeSetVisible: false,
      errorList: [],
      scale: 1
    }
  },

  computed: {
    config() {
      return merge({ ...DefaultFlowProps }, this.props || {})
    }
  },

  watch: {},

  created() {
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 查看详情
     */
    nodeClick(data) {
      const { node, index, conditionParent } = data
      this.editNode = node
      if (node.examineType > 0) {
        this.nodeSetVisible = true
      } else {
        this.conditionParent = conditionParent
        this.conditionParentIndex = index
        this.conditionSetVisible = true
      }
    },

    /**
     * 缩放
     */
    scaleClick(type) {
      if (type === 'minus') {
        this.scale = this.scale - 0.1
      } else if (type === 'plus') {
        this.scale = this.scale + 0.1
      }
    },

    /**
     * 获取参数
     */
    getParams() {
      this.errorList = []
      const newList = []
      this.getListParams(this.list, newList)
      console.log(newList, this.errorList)
      if (this.errorList.length > 0) {
        return {
          isError: true,
          list: this.errorList
        }
      } else {
        return {
          isError: false,
          list: newList
        }
      }
    },

    getListParams(list, newList) {
      list.forEach(item => {
        // 条件
        if (item.examineType === 0) {
          newList.push(this.getConditonWrapParams(item))
        } else {
          newList.push(this.getNodeParams(item))
        }
      })
    },

    /**
     * 审批节点信息
     */
    getNodeParams(data) {
      data.isError = this.getWkNodeErrorStatus(data)

      if (data.isError) {
        this.errorList.push(data)
      }

      const dataParams = {
        examineType: data.examineType,
        name: data.name,
        deptList: data.deptList,
        examineErrorHandling: data.examineErrorHandling,
        roleId: data.roleId,
        type: data.type,
        userList: data.userList.map(item => item.userId),
        chooseType: data.chooseType,
        rangeType: data.rangeType
      }

      if (data.examineType === 5) {
        if (data.type === 1) {
          // overType 1 开启 0 不开启 parentLevel为0
          dataParams.parentLevel = data.overType === 1 ? data.parentLevel : 0
        } else if (data.type === 2) {
          dataParams.parentLevel = data.tempParentLevel
        }
      } else {
        dataParams.parentLevel = data.parentLevel
      }

      return dataParams
    },

    /**
     * 条件节点信息
     */
    getConditionNodeParams(data, index) {
      // data.isError = data.conditionDataList.length === 0
      data.isError = false
      if (data.isError) {
        this.errorList.push(data)
      }

      const dataParams = {
        conditionName: data.conditionName,
        sort: index + 1,
        conditionDataList: []
      }

      data.conditionDataList.forEach(item => {
        const subItem = {
          name: item.name,
          fieldName: item.fieldName,
          type: item.type,
          fieldId: item.fieldId,
          conditionType: item.conditionType
        }

        if (item.type === 3 || item.type === 9) {
          subItem.values = item.values
        } else {
          if (item.conditionType === 6) {
            subItem.values = [item.leftValue, item.leftCondition, item.rightCondition, item.rightValue]
          } else if (item.conditionType === 8) {
            subItem.values = item.values
          } else {
            subItem.values = [item.values]
          }
        }
        dataParams.conditionDataList.push(subItem)
      })



      return dataParams
    },

    getConditonWrapParams(conditionWrap) {
      const conditionWrapParams = {
        examineType: conditionWrap.examineType,
        name: conditionWrap.name,
        conditionList: []
      }
      conditionWrap.conditionList.forEach((item, index) => {
        // 条件
        const conditionNodeParams = this.getConditionNodeParams(item, index)
        conditionNodeParams.examineDataList = []

        conditionWrapParams.conditionList.push(conditionNodeParams)
        this.getListParams(item.examineDataList, conditionNodeParams.examineDataList)
      })

      return conditionWrapParams
    }
  }
}
</script>

<style lang="scss">
@import '@/components/ApprovalFlow/flow.scss';
</style>
