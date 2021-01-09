<template>
  <div class="table-head-container">
    <flexbox
      v-show="selectionList.length == 0"
      class="th-container">
      <slot name="custom"/>
      <div v-if="showSceneView">场景：</div>
      <el-popover
        v-if="showSceneView"
        v-model="showScene"
        trigger="click"
        popper-class="no-padding-popover"
        width="180">
        <el-input
          slot="reference"
          v-model="sceneName"
          :readonly="true"
          class="scene-select">
          <i
            slot="suffix"
            :class="['el-input__icon', 'el-icon-' + iconClass]" />
        </el-input>
        <scene-list
          ref="sceneList"
          :crm-type="crmType"
          @scene="sceneSelect"
          @scene-handle="sceneHandle"
          @hidden-scene="showScene=false" />
      </el-popover>
      <el-button
        v-if="showFilterView"
        type="primary"
        class="filter-button"
        icon="wk wk-screening"
        @click="showFilterClick">高级筛选</el-button>
      <el-button
        v-if="sortData && sortData.order && sortData.column"
        type="primary"
        plain
        @click="handleCallBack({type: 'clear-sort'})">
        {{ `${sortData.column.label}${{ascending: '升序', descending: '降序'}[sortData.order]}` }}<i style="margin-left: 5px;" class="el-icon-close"/>
      </el-button>
      <filter-form
        v-if="showFilterView"
        :field-list="fieldList"
        :dialog-visible.sync="showFilter"
        :obj="filterObj"
        :crm-type="crmType"
        :save-scene="!isSeas"
        @filter="handleFilter" />
      <slot />
    </flexbox>
    <flexbox
      v-if="selectionList.length > 0"
      class="selection-bar">
      <div class="selected—title">已选中 <span class="selected—count">{{ selectionList.length }}</span> 项</div>
      <flexbox class="selection-items-box">
        <el-button
          v-for="(item, index) in getSelectionHandleItemsInfo()"
          v-if="whetherTypeShowByPermision(item.type)"
          :icon="item.icon | wkIconPre"
          :key="index"
          type="primary"
          @click.native="selectionBarClick(item.type)">{{ item.name }}</el-button>
      </flexbox>
    </flexbox>
    <filter-content
      v-if="filterObj.form && filterObj.form.length > 0"
      :obj="filterObj"
      @delete="handleDeleteField" />

    <transfer-handle
      :crm-type="crmType"
      :selection-list="selectionList"
      :dialog-visible.sync="transferDialogShow"
      @handle="handleCallBack" />
    <teams-handle
      :crm-type="crmType"
      :title="teamsTitle"
      :selection-list="selectionList"
      :dialog-visible.sync="teamsDialogShow"
      @handle="handleCallBack" />
    <alloc-handle
      :crm-type="crmType"
      :pool-id="poolId"
      :selection-list="selectionList"
      :dialog-visible.sync="allocDialogShow"
      @handle="handleCallBack" />
    <deal-status-handle
      :crm-type="crmType"
      :selection-list="selectionList"
      :visible.sync="dealStatusShow"
      @handle="handleCallBack" />

    <scene-set
      :dialog-visible.sync="showSceneSet"
      :crm-type="crmType"
      @save-success="updateSceneList" />

    <scene-create
      :field-list="fieldList"
      :crm-type="crmType"
      :dialog-visible.sync="showSceneCreate"
      :obj="sceneFilterObj"
      @save-success="updateSceneList" />

    <put-pool-handle
      :visible.sync="putPoolShow"
      :selection-list="selectionList"
      @handle="handleCallBack" />
  </div>
</template>

<script type="text/javascript">
import { mapGetters } from 'vuex'
import crmTypeModel from '@/views/crm/model/crmTypeModel'
import {
  filterIndexfieldsAPI,
  filterIndexPoolfieldsAPI,
  crmSceneSaveAPI
} from '@/api/crm/common'
import {
  crmLeadsTransformAPI,
  crmLeadsExcelExportAPI,
  crmLeadsDeleteAPI
} from '@/api/crm/leads'
import {
  crmCustomerLockAPI,
  crmCustomerExcelExportAPI,
  crmCustomerPoolExcelExportAPI,
  crmCustomerDeleteAPI,
  crmCustomerPoolDeleteAPI,
  crmCustomerReceiveAPI
} from '@/api/crm/customer'
import {
  crmContactsDeleteAPI,
  crmContactsExcelExportAPI
} from '@/api/crm/contacts'
import {
  crmBusinessDeleteAPI,
  crmBusinessExcelExportAPI
} from '@/api/crm/business'
import {
  crmContractDeleteAPI,
  crmContractExcelExportAPI
} from '@/api/crm/contract'
import {
  crmReceivablesDeleteAPI,
  crmReceivablesExcelExportAPI
} from '@/api/crm/receivables'
import {
  crmProductStatusAPI,
  crmProductExcelExportAPI,
  crmProductDeleteAPI
} from '@/api/crm/product'
import {
  crmReturnVisitDeleteAPI
} from '@/api/crm/visit'


import FilterForm from './FilterForm'
import FilterContent from './FilterForm/FilterContent'
import SceneList from './SceneForm/SceneList' // 场景
import SceneSet from './SceneForm/SceneSet' // 场景设置
import SceneCreate from './SceneForm/SceneCreate'

import TransferHandle from './SelectionHandle/TransferHandle' // 转移
import TeamsHandle from './SelectionHandle/TeamsHandle' // 操作团队成员
import AllocHandle from './SelectionHandle/AllocHandle' // 公海分配操作
import DealStatusHandle from './SelectionHandle/DealStatusHandle' // 客户状态修改操作
import PutPoolHandle from './SelectionHandle/PutPoolHandle' // 放入公海

import { Loading } from 'element-ui'
import { downloadExcelWithResData } from '@/utils'

export default {
  name: 'CRMTableHead', // 客户管理下 重要提醒 回款计划提醒
  components: {
    FilterForm,
    FilterContent,
    SceneList,
    TransferHandle,
    TeamsHandle,
    AllocHandle,
    SceneCreate,
    SceneSet,
    DealStatusHandle,
    PutPoolHandle
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    /** 没有值就是全部类型 有值就是当个类型 */
    crmType: {
      type: String,
      default: ''
    },
    // 辅助 使用 公海没有场景
    isSeas: {
      type: Boolean,
      default: false
    },
    poolId: [String, Number],
    // 公海权限
    poolAuth: Object,
    // 排序信息
    sortData: Object
  },
  data() {
    return {
      loading: false, // loading
      loadingObj: null, // loading 对象
      sceneType: null,
      showScene: false, // 场景操作
      showFilter: false, // 控制筛选框
      fieldList: [],
      filterObj: { form: [] }, // 筛选确定数据
      sceneData: { id: '', bydata: '', name: '' },
      showSceneSet: false, // 展示场景设置
      showSceneCreate: false, // 展示场景添加
      sceneFilterObj: { form: [] }, // 筛选确定数据

      /** 勾选操作数据 */
      selectionList: [],
      transferDialogShow: false,
      teamsDialogShow: false, // 团队操作提示框
      teamsTitle: '', // 团队操作标题名
      allocDialogShow: false, // 公海分配操作提示框
      dealStatusShow: false, // 成交状态修改框
      putPoolShow: false // 客户放入公海

    }
  },
  computed: {
    ...mapGetters(['crm']),
    iconClass() {
      return this.showScene ? 'arrow-up' : 'arrow-down'
    },
    sceneName() {
      return this.sceneData.name || this.getDefaultSceneName()
    },
    // 展示场景
    showSceneView() {
      if (this.isSeas) {
        return false
      } else {
        return true
      }
    },

    // 展示筛选
    showFilterView() {
      if ([].includes(this.crmType)) {
        return false
      } else {
        return true
      }
    }
  },
  watch: {
    loading(val) {
      if (val) {
        this.loadingObj = Loading.service({
          target: document.querySelector('#crm-main-container')
        })
      } else {
        this.loadingObj && this.loadingObj.close()
      }
    }
  },
  mounted() {},
  methods: {
    /** 发布 时候的类型选择 */
    handleTypeDrop(command) {
      this.sceneType = command
    },
    /** 展示高级筛选 */
    showFilterClick() {
      this.getFilterFieldInfo()
    },
    // 获取高级筛选字段数据
    getFilterFieldInfo() {
      const params = {}
      if (this.isSeas) {
        params.poolId = this.poolId
      } else {
        params.label = crmTypeModel[this.crmType]
      }

      const request = this.isSeas ? filterIndexPoolfieldsAPI : filterIndexfieldsAPI

      request(params)
        .then(res => {
          this.fieldList = res.data
          this.showFilter = true
        })
        .catch(() => {})
    },
    handleFilter(form) {
      this.filterObj = form
      this.showFilter = false
      if (form.saveChecked) {
        crmSceneSaveAPI({
          type: crmTypeModel[this.crmType],
          isDefault: form.saveDefault ? 1 : 0,
          name: form.saveName,
          data: JSON.stringify(form.obj)
        })
          .then(res => {
            this.updateSceneList()
          })
          .catch(() => {})
      }
      this.$emit('filter', form.obj)
    },
    // 删除
    handleDeleteField(data) {
      this.filterObj = data.obj
      this.$emit('filter', this.filterObj.obj)
    },
    // 场景操作
    /** 选择了场景 */
    sceneSelect(data) {
      this.sceneData = data
      this.$emit('scene', data)
    },
    sceneHandle(data) {
      if (data.type == 'set') {
        this.showSceneSet = true
      } else if (data.type == 'add') {
        filterIndexfieldsAPI({
          label: crmTypeModel[this.crmType]
        })
          .then(res => {
            this.fieldList = res.data
            this.showSceneCreate = true
          })
          .catch(() => {})
      }
    },
    /**  创建保存成功 */
    updateSceneList() {
      this.$refs.sceneList.getSceneList()
    },
    /** 勾选后的表头操作 */
    headSelectionChange(array) {
      this.selectionList = array
    },
    /** 操作 */
    selectionBarClick(type) {
      if (type == 'transfer') {
        // 转移
        this.transferDialogShow = true
      } else if (type == 'export') {
        let params = {}
        let request = null
        if (this.isSeas) {
          request = crmCustomerPoolExcelExportAPI
          params.poolId = this.poolId
          params.ids = this.selectionList
            .map(item => item.customerId)
            .join(',')
        } else {
          request = {
            customer: crmCustomerExcelExportAPI,
            leads: crmLeadsExcelExportAPI,
            contacts: crmContactsExcelExportAPI,
            business: crmBusinessExcelExportAPI,
            contract: crmContractExcelExportAPI,
            receivables: crmReceivablesExcelExportAPI,
            product: crmProductExcelExportAPI
          }[this.crmType]
          params = this.selectionList
            .map(item => item[`${this.crmType}Id`])
        }

        request(params)
          .then(res => {
            downloadExcelWithResData(res)
          })
          .catch(() => {})
      } else if (
        type == 'transform' ||
        type == 'delete' ||
        type == 'lock' ||
        type == 'unlock' ||
        type == 'start' ||
        type == 'disable' ||
        type == 'get'
      ) {
        var message = ''
        if (type == 'transform') {
          message = '确定将这些线索转换为客户吗?'
        } else if (type == 'delete') {
          message = this.isSeas ? '若客户下有联系人，联系人将一并删除。确定删除？' : `确定删除选中的${this.selectionList.length}项吗？`
        } else if (type == 'lock') {
          message = '确定要锁定这些客户吗？锁定后将不会掉入公海。'
        } else if (type == 'unlock') {
          message = '确定要解锁这些客户吗？'
        } else if (type == 'start') {
          message = '确定要上架这些产品吗?'
        } else if (type == 'disable') {
          message = '确定要下架这些产品吗?'
        } else if (type == 'get') {
          message = '确定要领取该客户吗?'
        }

        this.$confirm(message, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.confirmHandle(type)
          })
          .catch(() => {})
      } else if (type == 'add_user') {
        // 团队操作
        this.teamsTitle = '添加团队成员'
        this.teamsDialogShow = true
      } else if (type == 'delete_user') {
        // 团队操作
        this.teamsTitle = '移除团队成员'
        this.teamsDialogShow = true
      } else if (type == 'alloc') {
        // 公海分配操作
        this.allocDialogShow = true
      } else if (type == 'deal_status') {
        // 客户成交状态操作
        this.dealStatusShow = true
      } else if (type == 'put_seas') {
        // 客户放入公海
        this.putPoolShow = true
      }
    },
    confirmHandle(type) {
      if (type === 'lock' || type === 'unlock') {
        this.loading = true
        crmCustomerLockAPI({
          status: type === 'lock' ? '2' : '1', // 1是正常 2 是锁定
          ids: this.selectionList.map(item => item.customerId).join(',')
        })
          .then(res => {
            this.loading = false
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.$emit('handle', { type: type })
          })
          .catch(() => {
            this.loading = false
          })
      } else if (type === 'transform') {
        this.loading = true
        crmLeadsTransformAPI(this.selectionList.map(item => item.leadsId))
          .then(res => {
            this.loading = false
            this.$message({
              type: 'success',
              message: '转化成功'
            })
            // 刷新待办
            this.$store.dispatch('GetMessageNum')

            this.$emit('handle', { type: type })
          })
          .catch(() => {
            this.loading = false
          })
      } else if (type === 'start' || type === 'disable') {
        this.loading = true
        crmProductStatusAPI({
          ids: this.selectionList.map(item => item.productId),
          status: type === 'start' ? '1' : '0'
        })
          .then(res => {
            this.loading = false
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.$emit('handle', { type: type })
          })
          .catch(() => {
            this.loading = false
          })
      } else if (type === 'delete') {
        const ids = this.selectionList.map(item => item[this.crmType + 'Id'])
        const request = {
          leads: crmLeadsDeleteAPI,
          customer: this.isSeas ? crmCustomerPoolDeleteAPI : crmCustomerDeleteAPI,
          contacts: crmContactsDeleteAPI,
          business: crmBusinessDeleteAPI,
          contract: crmContractDeleteAPI,
          receivables: crmReceivablesDeleteAPI,
          visit: crmReturnVisitDeleteAPI,
          product: crmProductDeleteAPI
        }[this.crmType]
        const params = {
        }
        if (this.isSeas) {
          params.poolId = this.poolId
        }
        params.ids = ids
        this.loading = true
        request(this.isSeas ? params : ids)
          .then(res => {
            this.loading = false
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.$emit('handle', { type: type })
          })
          .catch(() => {
            this.loading = false
          })
      } else if (type === 'get') {
        // 领取
        this.loading = true
        crmCustomerReceiveAPI({
          ids: this.selectionList.map(item => item.customerId),
          poolId: this.poolId
        })
          .then(res => {
            this.loading = false
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            // 刷新待办
            this.$store.dispatch('GetMessageNum')

            this.$emit('handle', { type: type })
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
    /** 获取展示items */
    getSelectionHandleItemsInfo() {
      const handleInfos = {
        transfer: {
          name: '转移',
          type: 'transfer',
          icon: 'transfer'
        },
        transform: {
          name: '转化为客户',
          type: 'transform',
          icon: 'transform'
        },
        export: {
          name: '导出选中',
          type: 'export',
          icon: 'export'
        },
        delete: {
          name: '删除',
          type: 'delete',
          icon: 'delete'
        },
        put_seas: {
          name: '放入公海',
          type: 'put_seas',
          icon: 'seas'
        },
        lock: {
          name: '锁定',
          type: 'lock',
          icon: 'lock'
        },
        unlock: {
          name: '解锁',
          type: 'unlock',
          icon: 'unlock'
        },
        add_user: {
          name: '添加团队成员',
          type: 'add_user',
          icon: 'add'
        },
        delete_user: {
          name: '移除团队成员',
          type: 'delete_user',
          icon: 'remove'
        },
        alloc: {
          name: '分配',
          type: 'alloc',
          icon: 'alloc'
        },
        get: {
          name: '领取',
          type: 'get',
          icon: 'receive'
        },
        start: {
          name: '上架',
          type: 'start',
          icon: 'shelves'
        },
        disable: {
          name: '下架',
          type: 'disable',
          icon: 'sold-out'
        },
        deal_status: {
          name: '更改成交状态',
          type: 'deal_status',
          icon: 's-status'
        }
      }
      if (this.crmType == 'leads') {
        return this.forSelectionHandleItems(handleInfos, [
          'transfer',
          'transform',
          'export',
          'delete'
        ])
      } else if (this.crmType == 'customer') {
        if (this.isSeas) {
          return this.forSelectionHandleItems(handleInfos, [
            'alloc',
            'get',
            'export',
            'delete'
          ])
        } else {
          return this.forSelectionHandleItems(handleInfos, [
            'transfer',
            'put_seas',
            'deal_status',
            'export',
            'delete',
            'lock',
            'unlock',
            'add_user',
            'delete_user'
          ])
        }
      } else if (this.crmType == 'contacts') {
        return this.forSelectionHandleItems(handleInfos, [
          'transfer',
          'export',
          'delete'
        ])
      } else if (this.crmType == 'business') {
        return this.forSelectionHandleItems(handleInfos, [
          'transfer',
          'export',
          'delete',
          'add_user',
          'delete_user'
        ])
      } else if (this.crmType == 'contract') {
        return this.forSelectionHandleItems(handleInfos, [
          'transfer',
          'export',
          'delete',
          'add_user',
          'delete_user'
        ])
      } else if (this.crmType == 'receivables') {
        return this.forSelectionHandleItems(handleInfos, ['transfer', 'export', 'delete'])
      } else if (this.crmType == 'product') {
        return this.forSelectionHandleItems(handleInfos, [
          'transfer',
          'export',
          'delete',
          'start',
          'disable'
        ])
      } else if (this.crmType == 'product') {
        return this.forSelectionHandleItems(handleInfos, [
          'export',
          'start',
          'disable'
        ])
      } else if (this.crmType == 'visit') {
        return this.forSelectionHandleItems(handleInfos, [
          'delete'
        ])
      }
    },
    forSelectionHandleItems(handleInfos, array) {
      const tempsHandles = []
      for (let index = 0; index < array.length; index++) {
        tempsHandles.push(handleInfos[array[index]])
      }
      return tempsHandles
    },
    // 判断是否展示
    whetherTypeShowByPermision(type) {
      if (type == 'transfer') {
        return this.sceneData.bydata == 'transform'
          ? false
          : this.crm[this.crmType].transfer
      } else if (type == 'transform') {
        return this.sceneData.bydata == 'transform'
          ? false
          : this.crm[this.crmType].transform
      } else if (type == 'export') {
        if (this.isSeas) {
          if (this.poolId) {
            return this.poolAuth.excelexport
          }
          return this.crm.pool && this.crm.pool.excelexport
        }
        if (this.crm[this.crmType]) {
          return this.crm[this.crmType].excelexport
        } else {
          return true
        }
      } else if (type == 'delete') {
        if (this.isSeas) {
          if (this.poolId) {
            return this.poolAuth.delete
          }
          return this.crm.pool && this.crm.pool.delete
        }
        return this.crm[this.crmType].delete
      } else if (type == 'put_seas') {
        // 放入公海(客户)
        return this.crm[this.crmType].putinpool
      } else if (type == 'lock' || type == 'unlock') {
        // 锁定解锁(客户)
        return this.crm[this.crmType].lock
      } else if (type == 'add_user' || type == 'delete_user') {
        // 添加 移除团队成员
        return this.crm[this.crmType].teamsave
      } else if (type == 'alloc') {
        // 分配(公海)
        if (this.poolId) {
          return this.poolAuth.distribute
        }
        return this.crm.pool && this.crm.pool.distribute
      } else if (type == 'get') {
        // 领取(公海)
        if (this.poolId) {
          return this.poolAuth.receive
        }
        return this.crm.pool && this.crm.pool.receive
      } else if (type == 'start') {
        // 上架 下架(产品)
        for (let index = 0; index < this.selectionList.length; index++) {
          const element = this.selectionList[index]
          if (element.status == 1) {
            return false
          }
        }
        return this.crm[this.crmType].status
      } else if (type == 'disable') {
        // 上架 下架(产品)
        for (let index = 0; index < this.selectionList.length; index++) {
          const element = this.selectionList[index]
          if (element.status == 0) {
            return false
          }
        }
        return this.crm[this.crmType].status
      } else if (type == 'deal_status') {
        // 客户状态修改
        return this.crm[this.crmType].dealStatus
      }

      return true
    },
    // 子组件 回调的 结果
    handleCallBack(data) {
      this.$emit('handle', { type: data.type })
    },
    // 获取默认场景名字
    getDefaultSceneName() {
      if (this.crmType == 'leads') {
        return '全部线索'
      } else if (this.crmType == 'customer') {
        return '全部客户'
      } else if (this.crmType == 'contacts') {
        return '全部联系人'
      } else if (this.crmType == 'business') {
        return '全部商机'
      } else if (this.crmType == 'contract') {
        return '全部合同'
      } else if (this.crmType == 'receivables') {
        return '全部回款'
      } else if (this.crmType == 'product') {
        return '全部产品'
      } else if (this.crmType === 'visit') {
        return '全部回访'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.table-head-container {
  border-bottom: 1px solid #e6e6e6;
}

.th-container {
  font-size: 13px;
  height: 50px;
  padding: 0 20px;

  .scene-select {
    width: 180px;
    /deep/ .el-input__inner {
      cursor: pointer;
    }
  }

  .filter-button {
    margin-left: 20px;
    /deep/ i {
      font-size: 14px;
      margin-right: 5px;
    }
  }
}
/** 场景和筛选 */
.condition_title {
  cursor: pointer;
}
.condition_title:hover {
  color: $xr-color-primary;
}

.m-arrow {
  margin: 0 8px;
}
.c-filtrate {
  margin: 0 10px 0 30px;
  width: 12px;
}

/** 勾选操作 */
.selection-bar {
  font-size: 12px;
  height: 50px;
  padding: 0 20px;
  color: #777;

  .selected—title {
    flex-shrink: 0;
    padding-right: 20px;
    color: #333;
    .selected—count {
      color: $xr-color-primary;
    }
  }
}

.selection-items-box {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 15px;

  .el-button {
    color: #666;
    background-color: #f9f9f9;
    border-color: #e5e5e5;
    font-size: 12px;
    height: 28px;
    border-radius: 4px;
    /deep/ i {
      font-size: 12px;
      margin-right: 5px;
    }
  }

  .el-button--primary:hover {
    background: $xr-color-primary;
    border-color: $xr-color-primary;
    color: #ffffff;
  }

  .el-button + .el-button {
    margin-left: 15px;
  }
}
</style>
