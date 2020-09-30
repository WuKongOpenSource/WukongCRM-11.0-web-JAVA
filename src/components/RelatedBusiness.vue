<template>
  <div
    :style="{'margin-left': marginLeft}"
    class="related-business">
    <!-- 新建- 相关信息 -->
    <el-popover
      v-if="showAdd"
      v-model="showPopover"
      placement="right-end"
      width="800"
      popper-class="no-padding-popover"
      trigger="click">
      <crm-relative
        v-if="showRelative"
        ref="crmrelative"
        :show="showPopover"
        :radio="false"
        :selected-data="relatedListData"
        :show-types="showTypes"
        @close="crmrelativeClose"
        @changeCheckout="checkInfos"/>
      <span
        v-if="showCRMPermission" slot="reference"
        class="add-btn" @click="showRelative = true">
        <i class="wk wk-l-plus" />
        <span class="label">关联业务</span>
      </span>
    </el-popover>
    <div
      v-for="(items, key) in relatedListData"
      :key="key"
      style="margin-top: 10px;">
      <related-business-cell
        v-for="(item, itemIndex) in items"
        :data="item"
        :cell-index="itemIndex"
        :type="key"
        :key="itemIndex"
        :show-foot="showFoot"
        @unbind="delRelevance"
        @detail="checkRelatedDetail(key, item)"/>
    </div>
  </div>
</template>

<script>
// 相关信息 - 弹出框
import CrmRelative from '@/components/CreateCom/CrmRelative'
import RelatedBusinessCell from '@/views/oa/components/RelatedBusinessCell'

import { mapGetters } from 'vuex'

export default {
  name: 'RelatedBusiness',
  components: {
    CrmRelative,
    RelatedBusinessCell
  },
  props: {
    marginLeft: {
      type: String,
      default: '20px'
    },
    // 编辑时传递所有关联数据   关联联系人-contacts 关联客户-customer 商机-business 合同-contract
    allData: {
      type: Object,
      default: () => {
        return {
          contacts: [],
          customer: [],
          business: [],
          contract: []
        }
      }
    },
    // 展示取消关联
    showFoot: {
      type: Boolean,
      default: false
    },
    showAdd: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showTypes: ['customer', 'contacts', 'business', 'contract'],
      showPopover: false,
      relevanceAll: {
        customerIds: [],
        contractIds: [],
        contactsIds: [],
        businessIds: []
      },
      // 相关信息信息
      relatedListData: {},
      showRelative: false
    }
  },
  computed: {
    ...mapGetters(['crm']),
    showCRMPermission() {
      return this.crm
    }
  },
  watch: {
    allData: function() {
      this.relatedListData = this.allData
    }
  },
  mounted() {
    // 编辑时勾选
    this.relatedListData = this.allData
  },
  methods: {
    crmrelativeClose() {
      this.showPopover = false
    },
    checkInfos(val) {
      this.showPopover = false
      this.relatedListData = val.data
      for (const key in val.data) {
        const list = val.data[key]
        this.relevanceAll[key + 'Ids'] = list.map(item => item[key + 'Id'])
      }
      this.$emit('checkInfos', this.relevanceAll, val.data)
    },
    // 任务页面取消关联
    delRelevance(field, index, item) {
      this.$emit('unbind', field, item, index)
    },
    checkRelatedDetail(field, val) {
      val.key = val[field + 'Id'] || val.id
      this.$emit('checkRelatedDetail', field, val)
    }
  }
}
</script>

<style scoped lang="scss">
.related-business {
  color: #777;
  font-size: 12px;
  margin: 10px 0;
}

// 添加btm
$btn-b-color: #f8faff;
$btn-color: #333333;
$btn-b-hover-color: #eff4ff;

.add-btn {
  margin-top: 8px;
  font-size: 12px;
  color: $btn-color;
  background-color: $btn-b-color;
  border-radius: $xr-border-radius-base;
  display: inline-block;
  padding: 3px 10px;
  cursor: pointer;

  .wk-l-plus {
    font-size: 12px;
  }
}

.add-btn:hover {
  color: $xr-color-primary;
  background-color: $btn-b-hover-color;
}
</style>
