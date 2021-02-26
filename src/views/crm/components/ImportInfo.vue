<template>
  <div
    class="content">
    <div class="content-title">基本信息</div>
    <p
      v-for="(item , index) in showList"
      :key="index"
      class="detail-cell">
      <span class="detail-cell__label">
        {{ item.name }}
      </span><br>
      <span class="detail-cell__value">
        <wk-field-view
          v-if="item.formType == 'boolean_value' || item.formType == 'handwriting_sign' || item.formType == 'website'"
          :form-type="item.formType"
          :value="item.value"
        />
        <span v-else>{{ getValueContent(item) }}</span>
      </span>
    </p>
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
    list: Array
  },
  data() {
    return {}
  },
  computed: {
    showList() {
      return this.list.filter(item => {
        return item.formType !== 'file'
      })
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    getValueContent(item) {
      if (item.formType === 'map_address') {
        return item.value ? item.value.detailAddress : ''
      } else if (
        item.formType === 'structure' ||
        item.formType === 'user' ||
        item.formType === 'checkbox') {
        if (isArray(item.value)) {
          const field = {
            structure: 'name',
            user: 'realname',
            checkbox: ''
          }[item.formType]
          return item.value
            .map(item => {
              return field ? item[field] : item
            })
            .join('，')
        } else {
          return ''
        }
      } else if (item.formType === 'single_user') {
        if (isObject(item.value) && item.value.realname) {
          return item.value.realname
        } else {
          return ''
        }
      } else if (
        item.formType === 'customer' ||
        item.formType === 'business' ||
        item.formType === 'contract' ||
        item.formType === 'contacts' ||
        item.formType === 'category' ||
        item.formType === 'statusName' ||
        item.formType === 'typeName') {
        const field = {
          customer: 'customerName',
          business: 'businessName',
          contract: 'contractNum',
          contacts: 'contactsName',
          category: 'categoryName',
          statusName: 'statusName',
          typeName: 'typeName'
        }[item.formType]
        if (isArray(item.value)) {
          return item.value.length > 0 ? item.value[0][field] : ''
        } else {
          return item.value ? item.value[field] : ''
        }
      } else {
        return getFormFieldShowName(item.formType, item.value, '')
      }
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
      display: inline-block;
      margin-top: 5px;
      color: #333;
      line-height: 16px;
    }
  }
}
</style>
