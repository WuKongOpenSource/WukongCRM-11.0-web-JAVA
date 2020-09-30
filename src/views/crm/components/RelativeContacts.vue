<template>
  <div
    v-empty="nopermission"
    class="rc-cont"
    xs-empty-icon="nopermission"
    xs-empty-text="暂无权限">
    <flexbox
      v-if="!isSeas"
      class="rc-head"
      direction="row-reverse">
      <el-button
        class="xr-btn--orange rc-head-item"
        icon="el-icon-plus"
        type="primary"
        @click="createClick">新建联系人</el-button>
      <el-button
        v-if="canRelation"
        class="rc-head-item"
        type="primary"
        @click.native="unRelevanceHandleClick">解除关联</el-button>
      <el-popover
        v-if="canRelation"
        v-model="showRelativeView"
        placement="bottom"
        width="700"
        popper-class="no-padding-popover"
        trigger="click"
        style="margin-right: 20px;">
        <crm-relative
          ref="crmrelative"
          v-model="showRelativeView"
          :show="showRelativeView"
          :radio="false"
          :action="{ type: 'condition', data: { moduleType: 'customer', customerId: customerId } }"
          :selected-data="{ 'contacts': list }"
          crm-type="contacts"
          @close="showRelativeView = false"
          @changeCheckout="checkRelativeInfos" />
        <el-button
          slot="reference"
          class="rc-head-item"
          style="margin-right: 0;"
          type="primary"
          @click.native="showRelativeView = true">关联</el-button>
      </el-popover>

    </flexbox>
    <el-table
      v-show="fieldList.length > 0"
      :data="list"
      :height="tableHeight"
      :cell-class-name="cellClassName"
      stripe
      style="width: 100%;border: 1px solid #E6E6E6;"
      @row-click="handleRowClick"
      @selection-change="selectionList = $event">
      <el-table-column
        v-if="canRelation"
        show-overflow-tooltip
        type="selection"
        align="center"
        width="55" />
      <el-table-column
        v-for="(item, index) in fieldList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        show-overflow-tooltip />
      <el-table-column
        label="操作"
        width="100">
        <template slot-scope="scope">
          <flexbox justify="center">
            <span
              v-if="contactsId == scope.row.contactsId"
              class="chief">
            <i class="wk wk-success" />首要联系人</span>
            <el-button
              v-else
              class="set-chief-btn"
              type="text"
              @click.native="setChieflyContacts(scope)">设为首要联系人</el-button>
          </flexbox>
        </template>
      </el-table-column>
    </el-table>
    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :id="detailId"
      crm-type="contacts"
      @handle="detailHandle" />
    <c-r-m-all-create
      v-if="isCreate"
      :action="createActionInfo"
      crm-type="contacts"
      @save-success="createSaveSuccess"
      @close="isCreate=false" />
  </div>
</template>

<script type="text/javascript">
import LoadingMixin from '../mixins/Loading'
import CRMAllCreate from './CRMAllCreate'
import {
  crmCustomerQueryContactsAPI,
  crmCustomerSetContactsAPI
} from '@/api/crm/customer'
import {
  crmBusinessQueryContactsAPI,
  crmBusinessRelateContactsAPI,
  crmBusinessUnrelateContactsAPI,
  crmBusinessSetContactsAPI
} from '@/api/crm/business'
import CrmRelative from '@/components/CreateCom/CrmRelative'

export default {
  name: 'RelativeContacts', // 相关联系人列表  可能再很多地方展示 放到客户管理目录下
  components: {
    CRMFullScreenDetail: () => import('@/components/CRMFullScreenDetail'),
    CRMAllCreate,
    CrmRelative
  },
  mixins: [LoadingMixin],
  props: {
    // 模块ID
    id: [String, Number],
    // 首要联系人ID
    contactsId: [String, Number],
    // 客户类型
    crmType: {
      type: String,
      default: ''
    },
    // 是公海 默认是客户
    isSeas: {
      type: Boolean,
      default: false
    },
    // 联系人人下 新建商机 需要联系人里的客户信息  合同下需要客户和商机信息
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      nopermission: false,
      list: [],
      fieldList: [],
      tableHeight: '400px',
      showFullDetail: false,
      // 控制新建
      isCreate: false,
      // 查看全屏联系人详情的 ID
      detailId: '',
      // 创建的相关信息
      createActionInfo: { type: 'relative', crmType: this.crmType, data: {}},
      // 关联的逻辑
      showRelativeView: false,
      selectionList: []
    }
  },
  inject: ['rootTabs'],
  computed: {
    // 联系人下客户id获取关联商机
    customerId() {
      return this.detail.customerId
    },
    // 是否能关联
    canRelation() {
      return this.crmType == 'business'
    }
  },
  watch: {
    id(val) {
      this.list = []
      this.getDetail()
    },

    'rootTabs.currentName'(val) {
      if (val === 'RelativeContacts') {
        this.getDetail(false)
      }
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {
    /**
     * 关联的数据
     */
    checkRelativeInfos(data) {
      if (data.data.length > 0) {
        const params = { businessId: this.id }
        params.contactsIds = data.data
          .map(item => {
            return item.contactsId
          })
        crmBusinessRelateContactsAPI(params)
          .then(res => {
            this.getDetail()
            this.$message.success('操作成功')
          })
          .catch(() => {})
      }
    },

    /**
     * 取消关联
     */
    unRelevanceHandleClick() {
      if (this.selectionList.length == 0) {
        this.$message.error('请先勾选数据')
      } else {
        this.$confirm('确认取消关联?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            const params = { businessId: this.id }
            params.contactsIds = this.selectionList
              .map(item => {
                return item.contactsId
              })
            crmBusinessUnrelateContactsAPI(params)
              .then(res => {
                this.getDetail()
                this.$message.success('操作成功')
              })
              .catch(() => {})
          })
          .catch(() => {})
      }
    },

    /**
     * 表头数据
     */
    getFieldList() {
      this.fieldList.push({
        prop: 'name',
        width: '200',
        label: '姓名'
      })
      this.fieldList.push({ prop: 'mobile', width: '200', label: '手机' })
      this.fieldList.push({ prop: 'post', width: '200', label: '职务' })
    },

    /**
     * 获取数据
     */
    getDetail(loading = true) {
      this.loading = loading
      const request = {
        customer: crmCustomerQueryContactsAPI,
        business: crmBusinessQueryContactsAPI
      }[this.crmType]
      const params = { pageType: 0 }
      params[this.crmType + 'Id'] = this.id
      request(params)
        .then(res => {
          if (this.fieldList.length == 0) {
            this.getFieldList()
          }
          this.nopermission = false
          this.loading = false
          this.list = res.data.list
        })
        .catch(data => {
          if (data.code == 102) {
            this.nopermission = true
          }
          this.loading = false
        })
    },

    /**
     * 当某一行被点击时会触发该事件
     */
    handleRowClick(row, column, event) {
      if (column.property == 'name') {
        this.detailId = row.contactsId
        this.showFullDetail = true
      }
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'name') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 新建
     */
    createClick() {
      //  客户 下新建联系人
      if (this.crmType == 'customer') {
        this.createActionInfo.data['customer'] = this.detail
      } else if (this.crmType == 'business') {
        this.createActionInfo.data['customer'] = this.detail
        this.createActionInfo.relativeData = {
          businessId: this.detail.businessId
        }
      }
      this.isCreate = true
    },
    createSaveSuccess() {
      if (this.canRelation) {
        this.$refs.crmrelative.refreshList()
      } else {
        this.$bus.emit('crm-tab-num-update')
        this.getDetail()
      }
    },

    /**
     * 设置首要联系人
     */
    setChieflyContacts(data) {
      const request = {
        customer: crmCustomerSetContactsAPI,
        business: crmBusinessSetContactsAPI
      }[this.crmType]

      const params = { contactsId: data.row.contactsId }
      params[this.crmType + 'Id'] = this.id
      this.loading = true
      request(params)
        .then(res => {
          this.$message.success('操作成功')
          this.$emit('update:contactsId', data.row.contactsId)
          this.loading = false
        })
        .catch(data => {
          this.loading = false
        })
    },

    /**
     * 详情操作
     */
    detailHandle(data) {
      if (data.type === 'delete') {
        this.getDetail()
        this.$nextTick(() => {
          this.$bus.emit('crm-tab-num-update')
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../styles/relativecrm.scss';

.set-chief-btn {
  font-size: 12px;
  padding: 4px 12px;
}

.chief {
  font-size: 12px;
  color: #333;
  i {
    font-size: 14px;
    color: #389e0b;
    margin-right: 3px;
  }
}
</style>
