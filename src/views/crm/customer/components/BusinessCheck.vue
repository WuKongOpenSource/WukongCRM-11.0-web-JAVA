<template>
  <div
    v-empty="!canShowIndex"
    class="container"
    xs-empty-icon="nopermission"
    xs-empty-text="暂无权限">
    <div class="header">
      <i class="wk wk-customer" />
      <span class="name">{{ data.row.customerName }}</span>
      <span class="detail">{{ `商机个数：（${list.length}）个` }}</span>
      <i class="el-icon-close close" @click="hidenView"/>
    </div>
    <el-table
      v-loading="loading"
      :data="list"
      :cell-style="cellStyle"
      :header-cell-style="headerCellStyle"
      height="250"
      stripe
      style="margin-right:3px;"
      highlight-current-row
      @row-click="handleRowClick">
      <el-table-column
        v-for="(item, index) in fieldList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
        header-align="center"
        show-overflow-tooltip/>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { crmCustomerQueryBusinessAPI } from '@/api/crm/customer'

export default {
  /** 客户管理 的 客户列表  相关商机列表*/
  name: 'BusinessCheck',
  components: {},
  props: {
    show: Boolean,
    data: {
      type: Object,
      default: () => {
        return {
          row: {
            name: ''
          }
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      fieldList: []
    }
  },
  computed: {
    ...mapGetters(['crm']),
    canShowIndex() {
      return this.crm.business && this.crm.business.index
    }
  },
  watch: {
    show: {
      handler(val) {
        if (
          this.canShowIndex &&
          val &&
          this.data.row &&
          this.data.row.businessCount > 0 &&
          this.list.length == 0
        ) {
          this.getDetail()
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.fieldList.push({
      prop: 'businessName',
      width: '200',
      label: '商机名称'
    })
    this.fieldList.push({
      prop: 'money',
      width: '200',
      label: '商机金额'
    })
    this.fieldList.push({
      prop: 'customerName',
      width: '200',
      label: '客户名称'
    })
    this.fieldList.push({ prop: 'typeName', width: '200', label: '商机状态组' })
    this.fieldList.push({ prop: 'statusName', width: '200', label: '状态' })
  },
  methods: {
    getDetail() {
      this.loading = true
      crmCustomerQueryBusinessAPI({
        pageType: 0,
        customerId: this.data.row.customerId
      })
        .then(res => {
          this.loading = false
          this.list = res.data.list
        })
        .catch(() => {
          this.loading = false
        })
    },
    hidenView() {
      document.querySelector('#app').click()
      this.$emit('close', this.$el, this.data)
    },
    // 当某一行被点击时会触发该事件
    handleRowClick(row, column, event) {
      this.$emit('click', row)
    },
    /** 通过回调控制style */
    cellStyle({ row, column, rowIndex, columnIndex }) {
      return { fontSize: '12px', textAlign: 'center', cursor: 'pointer' }
    },
    headerCellStyle({ row, column, rowIndex, columnIndex }) {
      return { fontSize: '12px', textAlign: 'center' }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
}

.header {
  height: 40px;
  padding: 0 10px;
  line-height: 40px;
  color: #333;

  .name {
    font-size: 14px;
    font-weight: 600;
    padding: 0 10px 0 5px;

  }
  .detail {
    font-size: 12px;
  }
  .close {
    cursor: pointer;
    position: absolute;
    font-weight: 600;
    font-size: 18px;
    color: #909399;
    top: 0;
    right: 10px;
    padding: 10px;
  }
}

.wk-customer {
  color: $xr-color-primary;
  font-size: 12px;
}

.el-table {
  border-top: 1px solid $xr-border-line-color;
}
</style>
