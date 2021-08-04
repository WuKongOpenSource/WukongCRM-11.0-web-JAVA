<template>
  <div class="wrapper">
    <ul class="list">
      <li
        v-for="(item, index) in showObj.form"
        :key="index"
        class="list-item">

        <span v-if="item.formType == 'date' || item.formType === 'datetime'">{{ item.name +'&nbsp;' + getConditionName(item) + `${getDateContent(item)}` }}</span>
        <span v-else-if="item.formType == 'position'">{{ item.name +'&nbsp;“' + `${getPositionContent(item)}` + '”' }}</span>
        <span v-else-if="item.formType == 'boolean_value'">{{ item.name +'&nbsp;' + getConditionName(item) }}“<el-switch
          :value="item.value"
          disabled
          active-value="1"
          inactive-value="0"/>”</span>
        <span v-else-if="item.formType === 'business_type'">{{ item.name +'&nbsp;“' + getTypesName(item) + getStatusName(item) + '”' }}</span>
        <span v-else-if="item.formType === 'map_address'">{{ `${item.name} ${item.address.state} ${item.address.city} ${item.address.area}` }}</span>
        <span v-else-if="item.formType === 'checkStatus'">{{ item.name +'&nbsp;' + getConditionName(item)+ getNameValue(item) }}</span>
        <span v-else-if="item.formType === 'dealStatus'">{{ item.name +'&nbsp;' + getConditionName(item)+ getDealStatus(item) }}</span>
        <span v-else-if="item.formType === 'user' || item.formType === 'single_user'">{{ item.name +'&nbsp;' + getConditionName(item) +getValueContent(item) }}</span>
        <span v-else-if="item.formType === 'structure'">{{ item.name +'&nbsp;' + getConditionName(item) + getValueContent(item) }}</span>
        <span v-else-if="item.formType === 'category' && item.value.length > 0">{{ item.name +'&nbsp;“' + item.valueContent + '”' }}</span>
        <span v-else-if="item.formType === 'select' && getSettingValueType(item.setting) != 'string'">{{ item.name +'&nbsp;' + getConditionName(item) + getNameValue(item) }}</span>
        <span v-else>{{ item.name + '&nbsp;' + getConditionName(item) + getValueContent(item) }}</span>
        <i
          class="el-icon-close icon"
          @click="handleDelete(item, index)"/>
      </li>
    </ul>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/types'
import AdvancedFilterMixin from '@/mixins/AdvancedFilter'

export default {
  name: 'FilterContent',
  mixins: [AdvancedFilterMixin],
  props: {
    obj: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      // 展示信息
      showObj: {}
    }
  },
  computed: {},
  watch: {
    obj: function(val) {
      this.showObj = val
    }
  },
  mounted() {
    this.showObj = this.obj
  },
  methods: {
    /**
     * 删除高级筛选条件
     * @param index
     */
    handleDelete(item, index) {
      this.showObj.obj.splice(index, 1)
      this.showObj.form.splice(index, 1)
      this.$emit('delete', { item: item, index: index, obj: this.showObj })
    },

    /**
     * 获取条件名称
     */
    getConditionName(formItem) {
      let conditionName = ''
      this.getAdvancedFilterOptions(formItem.formType, formItem.fieldName).forEach(item => {
        if (item.type === formItem.type) {
          conditionName = item.label
        }
      })
      return conditionName
    },

    /**
     * 商机组展示名称
     */
    getTypesName(data) {
      if (data.typeId) {
        const obj = data.typeOption.find(item => {
          return item.typeId === data.typeId
        })
        return obj.name || ''
      }
      return ''
    },

    /**
     * 获取name value 对象展示值
     */
    getNameValue(data) {
      if (this.isNullCondition(data)) {
        return ''
      }
      const obj = data.setting.find(item => item.value === data.value)
      return obj ? `“${obj.name}”` : ''
    },

    /**
     * 商机阶段展示名称
     */
    getStatusName(data) {
      if (data.statusId) {
        const obj = data.statusOption.find(item => {
          return item.statusId === data.statusId
        })
        if (obj.name) {
          return '-' + obj.name
        }
        return ''
      }
      return ''
    },

    /**
     * 成交状态名称
     */
    getDealStatus(data) {
      if (this.isNullCondition(data)) {
        return ''
      }
      const { value } = data
      if (value == 0) {
        return '“未成交”'
      } else if (value == 1) {
        return '“已成交”'
      }
      return ''
    },

    /**
     * 时间展示
     */
    getDateContent(data) {
      if (this.isNullCondition(data)) {
        return ''
      }

      if (data.type === 14) {
        if (!isEmpty(data.timeType)) {
          return `“${data.timeTypeName}”`
        }
        return `“${data.range.join('-')}”`
      }

      return `“${data.value}”`
    },

    /**
     * 值展示
     */
    getValueContent(data) {
      if (this.isNullCondition(data)) {
        return ''
      }

      if (data.formType == 'number' ||
        data.formType == 'floatnumber' ||
        data.formType == 'percent') {
        if (data.type === 14) {
          return `“${isEmpty(data.min) ? '' : data.min}-${isEmpty(data.max) ? '' : data.max}”`
        } else {
          return `“${data.value}”`
        }
      } else if (data.formType == 'user' || data.formType == 'single_user') {
        const dataValue = data.valueContent || data.value
        return `“${dataValue.map(o => o.realname).join('，')}”`
      } else if (data.formType == 'structure') {
        const dataValue = data.valueContent || data.value
        return `“${dataValue.map(o => o.name).join('，')}”`
      }


      return `“${data.value}”`
    },

    /**
     * isNull条件
     */
    isNullCondition(data) {
      // 如果是空条件 隐藏值
      return data.condition === 'isNull' || data.condition === 'isNotNull'
    },

    /**
     * 地址展示
     */
    getPositionContent(data) {
      return data.value.filter(item => !isEmpty(item.name)).map(item => item.name).join('/')
    },

    /**
     * 获取setting数据类型
     */
    getSettingValueType(setting) {
      if (setting && setting.length > 0) {
        const value = setting[0]
        return typeof value
      }
      return []
    }
  }
}
</script>

<style scoped lang="scss">
@mixin left() {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
@mixin center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper {
  width: 100%;
  min-height: 50px;
  background: white;
  border-top: 1px solid #e1e1e1;
  font-size: 13px;
  overflow-x: scroll;
  color: #aaa;
  @include left;
  .list {
    width: 100%;
    padding: 0 20px;
    margin-bottom: 10px;
    flex-shrink: 0;
    @include left;
    .list-item {
      height: 30px;
      padding: 0 10px;
      margin: 10px 15px 0 0;
      border: 1px solid #e1e1e1;
      border-radius: 3px;
      flex-shrink: 0;
      @include center;
      .icon {
        margin-left: 20px;
        cursor: pointer;
      }
    }
  }
}
</style>
