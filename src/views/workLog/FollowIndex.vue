<template>
  <div class="main">
    <record-tab-head
      :tabs="tabs"
      :count="count"
      :select-value.sync="tabsSelectValue"
      @change="tabsChange" />

    <flexbox class="filter-control card">
      <el-input
        v-model="filterForm.search"
        placeholder="关键字搜索"
        prefix-icon="el-icon-search"/>
      <xh-user-cell
        v-if="userSelectShow"
        radio
        class="xh-user-cell"
        placeholder="选择人员"
        @value-change="userChange" />
      <time-type-select
        :width="190"
        :default-type="timeSelect.value"
        @change="timeTypeChange" />
      <el-select
        v-model="filterForm.crmType"
        placeholder="选择">
        <el-option
          v-for="(item, index) in options"
          :key="index"
          :label="item.label"
          :value="item.value" />
      </el-select>
      <el-select
        v-model="filterForm.queryType"
        placeholder="选择">
        <el-option
          v-for="(item, index) in [{ label: '全部', value: 0 }, { label: '跟进记录', value: 1 }, { label: '外勤签到', value: 4 }]"
          :key="index"
          :label="item.label"
          :value="item.value" />
      </el-select>
    </flexbox>

    <div
      v-infinite-scroll="getList"
      :key="`${scrollKey}${tabsSelectValue}`"
      infinite-scroll-distance="100"
      infinite-scroll-disabled="scrollDisabled"
      class="cell-section">
      <log-cell
        v-for="(item, index) in list"
        :item="item"
        :index="index"
        :key="index"
        class="log-cell"
        @crm-detail="checkRelationDetail"
        @delete="logCellDelete"
        @edit="logCellEdit">
        <div
          class="relate-cell"
          @click="checkRelationDetail(item.activityType, item.activityTypeId, true)">
          <i
            :class="item.activityType | crmIconClass"
            class="relate-cell-icon" />
          <span class="relate-cell-type">{{ item.activityType | crmName }}-</span>
          <span class="relate-cell-name">{{ item.crmTypeName }}</span>
        </div>
      </log-cell>
      <p
        v-if="loading"
        class="scroll-bottom-tips">加载中...</p>
      <p
        v-if="noMore"
        class="scroll-bottom-tips">没有更多了</p>
    </div>

    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :crm-type="relationCrmType"
      :id="relationID"
      @handle="detailHandle" />

    <!-- 跟进记录编辑 -->
    <log-edit-dialog
      :visible.sync="logEditDialogVisible"
      :data="logEditData"
      @save="logEditSave"
    />
  </div>
</template>

<script>
import { crmIndexGetRecordListAPI } from '@/api/crm/workbench'

import RecordTabHead from './components/RecordTabHead'
import XhUserCell from '@/components/CreateCom/XhUserCell'
import TimeTypeSelect from '@/components/TimeTypeSelect'
import LogCell from '@/views/crm/components/Activity/LogCell'
import LogEditDialog from '@/views/crm/components/Activity/LogEditDialog'

import crmTypeModel from '@/views/crm/model/crmTypeModel'

export default {
  // 跟进记录
  name: 'FollowIndex',
  components: {
    RecordTabHead,
    XhUserCell,
    TimeTypeSelect,
    LogCell,
    LogEditDialog,
    CRMFullScreenDetail: () =>
      import('@/components/CRMFullScreenDetail')
  },
  filters: {
    crmIconClass(type) {
      return `wk wk-${crmTypeModel.convertTypeToKey(type)}`
    },

    crmName(type) {
      return crmTypeModel.convertTypeToName(type)
    }
  },
  props: {},
  data() {
    return {
      tabsSelectValue: 'all',
      tabs: [
        {
          label: '全部',
          name: 'all'
        },
        {
          label: '我创建的',
          name: '0'
        },
        {
          label: '我下属创建的',
          name: '1'
        }
      ],

      options: [
        { label: '全部', value: '' },
        { label: '线索', value: 1 },
        { label: '客户', value: 2 },
        { label: '联系人', value: 3 },
        { label: '商机', value: 5 },
        { label: '合同', value: 6 }
      ],

      // 总数量
      count: 0,

      // 默认全部  subUser  0 我的  1 我下属的
      filterForm: {
        crmType: '',
        isUser: 1,
        userId: '',
        subUser: '',
        queryType: 0 // 0 全部 1 跟进记录 4 外勤签到
      },

      timeSelect: {
        type: 'default',
        value: 'month'
      },

      list: [],
      loading: false,
      noMore: false,
      page: 1,
      scrollKey: Date.now(),

      showFullDetail: false, // 查看相关客户管理详情
      relationID: '', // 相关ID参数
      relationCrmType: '', // 相关类型

      // 跟进记录编辑
      logEditData: null,
      logEditPosition: {
        seciton: 0,
        index: 0
      },
      logEditDialogVisible: false
    }
  },
  computed: {
    // 无线滚动控制
    scrollDisabled() {
      return this.loading || this.noMore
    },

    userSelectShow() {
      return this.filterForm.subUser !== '0' // 0 是我的
    }
  },
  watch: {
    filterForm: {
      handler() {
        this.refreshList()
      },
      deep: true
    }
  },
  mounted() {},

  beforeDestroy() {},
  methods: {
    /**
     * 中间tabs改变
     */
    tabsChange(type) {
      this.filterForm.subUser = type === 'all' ? '' : type
    },

    /**
     * 刷新列表
     */
    refreshList() {
      this.page = 1
      this.list = []
      this.noMore = false
      this.scrollKey = Date.now()
    },

    /**
     * 获取数据列表
     */
    getList() {
      this.loading = true
      let params = {
        page: this.page,
        limit: 15,
        isUser: 1,
        queryType: 0
      }

      if (this.timeSelect.type) {
        if (this.timeSelect.type === 'custom') {
          params.startTime = this.timeSelect.startTime.replace(/\./g, '-')
          params.endTime = this.timeSelect.endTime.replace(/\./g, '-')
        } else {
          params.type = this.timeSelect.value || ''
        }
      }

      if (this.userSelectShow) {
        params = { ...params, ...this.filterForm }
      } else {
        params.label = this.filterForm.crmType
        params.subUser = this.filterForm.subUser
        params.dataType = this.filterForm.queryType
        params.search = this.filterForm.search
      }

      crmIndexGetRecordListAPI(params)
        .then(res => {
          this.loading = false

          if (this.filterForm.subUser != params.subUser) {
            this.refreshList()
          } else {
            if (!this.noMore) {
              this.list = this.list.concat(res.data.list || [])
              this.page++
            }
            this.count = res.data.totalRow || 0
            this.noMore = res.data.lastPage
          }
        })
        .catch(() => {
          this.noMore = true
          this.loading = false
        })
    },

    /**
     * 查看相关客户管理详情
     */
    checkRelationDetail(type, id, convert = false) {
      this.relationID = id
      this.relationCrmType = convert ? crmTypeModel.convertTypeToKey(type) : type
      this.showFullDetail = true
    },

    /**
     * 筛选条件人员选择
     */
    userChange(data) {
      this.filterForm.userId = data.value.length > 0 ? data.value[0].userId : ''
    },

    /**
     * 时间更改
     */
    timeTypeChange(data) {
      this.timeSelect = data
      this.refreshList()
    },

    /**
     * 详情操作
     */
    detailHandle(data) {
      if (data.type == 'delete') {
        this.refreshList()
      }
    },

    /**
     * 跟进日志删除
     */
    logCellDelete(data, index, seciton) {
      this.list.splice(index, 1)
      this.scrollKey = Date.now()
    },

    /**
     * 跟进日志编辑
     */
    logCellEdit(data, index, seciton) {
      this.logEditData = data
      this.logEditPosition = {
        seciton,
        index
      }
      this.logEditDialogVisible = true
    },

    logEditSave(data) {
      if (this.logEditPosition.index >= 0) {
        this.list.splice(this.logEditPosition.index, 1, data)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './style';

.base-tabs-head {
  margin-bottom: 15px;
}

.cell-section {
  height: calc(100% - 140px);
  overflow: auto;
}

.log-cell {
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
  padding-bottom: 50px !important;
  margin-bottom: 15px;
  position: relative;
}

.relate-cell {
  padding: 13px 55px;
  background-color: #f5f7fa;
  border-radius: 4px;
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  font-size: 12px;
  color: #333;

  &-icon {
    display: inline-block;
    font-size: 14px;
    color: #666;
    margin-right: 5px;
  }

  &-name {
    cursor: pointer;
    color: $xr-color-primary;
  }

  &-name:hover {
    text-decoration: underline;
  }
}
</style>
