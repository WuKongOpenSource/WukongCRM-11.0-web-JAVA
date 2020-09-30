<template>
  <div class="related-business-list">
    <div
      v-for="(item, index) in options"
      v-if="data[item.type].length > 0"
      :key="index"
      class="list-item">
      <div class="left">
        <span :class="item.icon" class="wk icon" />
        <span>相关{{ item.label }}：</span>
      </div>
      <div class="content">
        <div
          v-for="(child, childIndex) in data[item.type]"
          :key="childIndex"
          class="content-item"
          @click="handlerToDetail(item.type, childIndex)">
          {{ child[item.key] || child.name }}
        </div>
      </div>
    </div>

    <!--<c-r-m-all-detail
      :visible.sync="showRelatedDetail"
      :crm-type="relatedCRMType"
      :listener-ids="['workbench-main-container']"
      :no-listener-ids="['journal-list-box']"
      :id="relatedID"
      class="d-view"/>-->
  </div>
</template>

<script>
/**
 * 相关信息列表
 * @props data {Object}
 */
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'

export default {
  name: 'RelatedBusinessList',
  components: {
    CRMAllDetail
  },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      options: {
        customer: {
          label: '客户',
          type: 'customer',
          key: 'customerName',
          icon: 'wk-customer'
        },
        contacts: {
          label: '联系人',
          type: 'contacts',
          key: 'contactsName',
          icon: 'wk-contacts'
        },
        business: {
          label: '商机',
          type: 'business',
          key: 'businessName',
          icon: 'wk-business'
        },
        contract: {
          label: '合同',
          type: 'contract',
          key: 'name',
          icon: 'wk-contract'
        }
      }
    }
  },
  methods: {
    /**
     * 详情
     * @param type
     * @param index
     */
    handlerToDetail(type, index) {
      this.$emit('select', type, this.data[type][index])
    }
  }
}
</script>

<style scoped lang="scss">
  .related-business-list {
    width: 100%;
    .list-item {
      font-size: 12px;
      padding: 3px 0;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      .left {
        color: #666;
        .icon {
          font-size: 14px;
        }
      }
      .content {
        .content-item {
          line-height: 1.5;
          color: $xr-color-primary;
          margin-bottom: 3px;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
</style>
