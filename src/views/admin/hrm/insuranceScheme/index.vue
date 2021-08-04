<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <div class="insurance-scheme main">
    <xr-header
      icon-class="wk wk-project"
      icon-color="#33D08F"
      label="社保方案管理" />
    <div class="main-body">
      <div class="main-table-header">
        <el-button
          class="main-table-header-button xr-btn--orange"
          type="primary"
          icon="el-icon-plus"
          @click="createClick">新建参保方案</el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="list"
        :height="tableHeight"
        class="main-table"
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :prop="item.fieldName"
          :label="item.name"
          :min-width="item.width"
          show-overflow-tooltip/>
        <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button
              :disabled="scope.row.label == 2"
              type="text"
              size="small"
              @click="handleClick('edit', scope)">编辑</el-button>
            <el-button
              :disabled="scope.row.roleType == 5"
              type="text"
              size="small"
              @click="handleClick('delete', scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <insurance-scheme-create
      v-if="createViewShow"
      :id="createId"
      @success="getList"
      @close="createViewShow=false"/>
  </div>
</template>

<script>
import {
  hrmConfigDeleteInsuranceSchemeAPI,
  hrmConfigInsuranceSchemListAPI
} from '@/api/admin/hrm'

import XrHeader from '@/components/XrHeader'
import InsuranceSchemeCreate from './Create'

export default {
  // 社保方案列表
  name: 'InsuranceScheme',
  components: {
    XrHeader,
    InsuranceSchemeCreate
  },
  mixins: [],
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 196, // 表的高度
      createViewShow: false,
      createId: '',
      list: [],
      fieldList: [{
        fieldName: 'schemeName',
        name: '方案名称',
        width: 80
      }, {
        fieldName: 'city',
        name: '参保城市',
        width: 80
      }, {
        fieldName: 'personalInsuranceAmount',
        name: '个人社保',
        width: 80
      }, {
        fieldName: 'corporateInsuranceAmount',
        name: '公司社保',
        width: 80
      }, {
        fieldName: 'personalProvidentFundAmount',
        name: '个人公积金',
        width: 80
      }, {
        fieldName: 'corporateProvidentFundAmount',
        name: '公司公积金',
        width: 80
      }, {
        fieldName: 'useCount',
        name: '使用人数',
        width: 80
      }]
    }
  },
  computed: {},
  mounted() {
    var self = this
    /** 控制table的高度 */
    window.onresize = function() {
      self.tableHeight = document.documentElement.clientHeight - 196
    }

    this.getList()
  },
  methods: {
    /**
     * 获取列表数据
     */
    getList() {
      this.loading = true
      hrmConfigInsuranceSchemListAPI({
        pageType: 0
      })
        .then(res => {
          this.list = res.data.list
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     *  添加权限
     */
    createClick() {
      this.createId = ''
      this.createViewShow = true
    },

    /** 列表操作 */
    /**
     * 当某一行被点击时会触发该事件
     */
    handleRowClick(row, column, event) {},

    /**
     * 编辑删除
     */
    handleClick(type, scope) {
      if (type === 'edit') {
        this.createId = scope.row.schemeId
        this.createViewShow = true
      } else if (type === 'delete') {
        // 启用停用
        this.$confirm('您确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            hrmConfigDeleteInsuranceSchemeAPI(scope.row.schemeId)
              .then(res => {
                this.list.splice(scope.$index, 1)
                this.$message({
                  type: 'success',
                  message: '操作成功'
                })
              })
              .catch(() => {})
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  height:100%;

  /deep/ .xr-header {
    padding: 15px 30px;
  }
}

.main-body {
  background-color: white;
  border-top: 1px solid $xr-border-line-color;
  border-bottom: 1px solid $xr-border-line-color;
}

.main-table-header {
  height: 50px;
  background-color: white;
  position: relative;
  .main-table-header-button {
    float: right;
    margin-right: 20px;
    margin-top: 10px;
  }
}

.project-reminder {
  width: auto;
  float: left;
  margin-left: 20px;
  margin-top: 10px;
}
@import '../../styles/table.scss';
</style>
