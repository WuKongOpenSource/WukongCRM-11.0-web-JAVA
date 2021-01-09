<template>
  <el-select
    v-model="dataValue"
    :disabled="disabled"
    style="width: 100%;"
    @change="valueChange">
    <el-option
      v-for="item in options"
      :key="item.typeId"
      :label="item.name"
      :value="item.typeId"
      :disabled="item.status !== 1"/>
  </el-select>
</template>
<script type="text/javascript">
import StringMixin from './StringMixin'
import { crmBusinessStatusListAPI } from '@/api/crm/business'

export default {
  name: 'XhBusinessStatus', // 商机状态
  components: {},
  mixins: [StringMixin],
  props: {},
  data() {
    return {
      options: []
    }
  },
  computed: {},
  watch: {
  },
  mounted() {
    this.getBusinessStatusList()
  },
  methods: {
    /** 获取商机状态组 */
    getBusinessStatusList() {
      crmBusinessStatusListAPI({})
        .then(res => {
          const list = res.data || []
          this.options = list.filter(item => {
            return item.status === 1
          })
          if (this.dataValue) {
            const hasValueItem = this.options.find(item => {
              return item.typeId == this.dataValue
            })
            if (!hasValueItem) {
              this.dataValue = ''
            }
            this.$emit('value-change', {
              index: this.index,
              value: this.dataValue,
              data: this.options,
              type: 'init' // 初始化下不更改阶段值
            })
          }
        })
        .catch(() => {})
    },
    // 输入的值
    valueChange(val) {
      /** 商机组顺便回调筛选数据 */
      this.$emit('value-change', {
        index: this.index,
        value: val,
        data: this.options
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
