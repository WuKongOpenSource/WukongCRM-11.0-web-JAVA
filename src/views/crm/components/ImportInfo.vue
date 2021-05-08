<template>
  <div
    class="content">
    <div class="content-title">基本信息</div>
    <div
      v-for="(item , index) in showList"
      :key="index"
      class="detail-cell">
      <div class="detail-cell__label">
        {{ item.name }}
      </div>
      <div class="detail-cell__value">
        <wk-field-view
          :props="item"
          :form-type="item.formType"
          :value="item.value"
        >
          <template slot-scope="{ data }">
            <span v-if="data.formType === 'business_type'">{{ detail ? detail.typeName : '' }}</span>
            <span v-else-if="data.formType === 'business_status'">{{ detail ? detail.statusName : '' }}</span>
            <span v-else-if="data.formType === 'category'">{{ detail ? detail.categoryName : '' }}</span>
            <span v-else-if="data.formType === 'receivables_plan'">{{ detail ? detail.planNum : '' }}</span>
            <span v-else>{{ getCommonShowValue(data) }}</span>
          </template>
        </wk-field-view>
      </div>
    </div>
  </div>
</template>

<script>
import WkFieldView from '@/components/NewCom/WkForm/WkFieldView'

import { isArray, isObject } from '@/utils/types'
import { getFormFieldShowName } from '@/components/NewCom/WkForm/utils'

export default {
  //  重要信息 中的列表展示
  name: 'ImportInfo',
  components: {
    WkFieldView
  },
  props: {
    list: Array,
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    showList() {
      return this.list.filter(item => {
        return item.formType !== 'file' &&
        item.formType !== 'detail_table' &&
        item.formType !== 'map_address'
      })
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    /**
     * 获取非附件类型的展示值
     */
    getCommonShowValue(item) {
      if (this.isModule(item)) {
        return this.getModuleName(item)
      } else {
        return getFormFieldShowName(item.formType, item.value, '', item)
      }
    },

    /**
     * 客户等模块类型
     */
    isModule(item) {
      return [
        'customer',
        'business',
        'contract',
        'contacts'].includes(item.formType)
    },

    /**
     * 特殊格式数据获取展示名称
     */
    getModuleName(item) {
      // 模块数据
      const modulefield = {
        customer: 'customerName',
        business: 'businessName',
        contract: 'contractNum',
        contacts: 'name'
      }[item.formType]

      if (modulefield) {
        let data = {}
        if (isObject(item.value)) {
          data = item.value
        } else if (isArray(item.value) && item.value.length > 0) {
          data = item.value[0]
        }
        return data[modulefield] || ''
      }

      // 常规对象数据
      const field = {
        category: 'categoryName'
      }[item.formType]
      return item.value ? item.value[field] : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.import-info {
  overflow: auto;
  height: 100%;
}

.content {
  padding: 20px 10px;
  &-title {
    font-size: 13px;
    font-weight: 600;
  }

  .detail-cell {
    font-size: 12px;
    margin: 20px 0;
    &__label {
      color: #666;
    }
    &__value {
      margin-top: 5px;
      color: #333;
      line-height: 16px;
    }
  }
}
</style>
