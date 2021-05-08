<template>
  <div class="system-customer">
    <xr-header
      icon-class="wk wk-double-gear"
      icon-color="#1CBAF5"
      label="自定义字段设置" />
    <div class="customer-content">
      <el-table
        v-loading="loading"
        :data="tableList"
        :height="tableHeight"
        highlight-current-row
        style="width: 100%">
        <el-table-column
          prop="name"
          label="模块"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <img
              :src="getCustomFieldIcon( scope.row.label)"
              class="table-item-icon" >
            <span class="table-item-label">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="更新时间"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="table-item-time">{{ scope.row.updateTime == 0 ? '暂无' : scope.row.updateTime }}</span>
          </template>
        </el-table-column>

        <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleCustomField('edit', scope.row, scope.$index)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { customFieldIndexAPI } from '@/api/admin/crm'

import XrHeader from '@/components/XrHeader'

export default {
  name: 'CustomField',

  components: {
    XrHeader
  },

  data() {
    return {
      loading: false,
      tableHeight: document.documentElement.clientHeight - 140, // 表的高度
      // 自定义字段设置
      tableList: []
    }
  },

  created() {
    // 控制table的高度
    window.onresize = () => {
      self.tableHeight = document.documentElement.clientHeight - 140
    }

    this.getDetail()
  },

  methods: {
    /**
     * 详情
     */
    getDetail() {
      this.loading = true
      customFieldIndexAPI()
        .then(res => {
          this.tableList = res.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 列表的编辑和预览
     */
    handleCustomField(type, item, index) {
      if (type === 'edit') {
        this.$router.push({
          name: 'customField',
          params: {
            type: {
              1: 'crm_leads',
              2: 'crm_customer',
              3: 'crm_contacts',
              4: 'crm_product',
              5: 'crm_business',
              6: 'crm_contract',
              7: 'crm_receivables',
              17: 'crm_visit',
              18: 'crm_invoice'
            }[item.label],
            id: 'none',
            label: item.label
          }
        })
      }
    },

    /**
     * 根据自定义字段types 获取展示icon
     */
    getCustomFieldIcon(label) {
      if (label === 1) {
        return require('@/assets/img/crm/leads.png')
      } else if (label === 2) {
        return require('@/assets/img/crm/customer.png')
      } else if (label === 3) {
        return require('@/assets/img/crm/contacts.png')
      } else if (label === 5) {
        return require('@/assets/img/crm/business.png')
      } else if (label === 6) {
        return require('@/assets/img/crm/contract.png')
      } else if (label === 4) {
        return require('@/assets/img/crm/product.png')
      } else if (label === 7) {
        return require('@/assets/img/crm/receivables.png')
      } else if (label === 17) {
        return require('@/assets/img/crm/visit.png')
      } else if (label === 18) {
        return require('@/assets/img/crm/invoice.png')
      }
      return require('@/assets/img/crm/product.png')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.system-customer {
  height: 100%;
}
.customer-content {
  border-top: 1px solid $xr-border-line-color;
  border-bottom: 1px solid $xr-border-line-color;
}

.table-item-label {
  vertical-align:middle;
}
.table-item-icon {
  width: 30px;
  height: 30px;
  margin-right: 8px;
  vertical-align:middle;
  border-radius: 4px;
}

.table-item-time {
  color: #999;
}

.el-table {
  /deep/ .el-table__body td {
    height: 60px;
  }
}
</style>
