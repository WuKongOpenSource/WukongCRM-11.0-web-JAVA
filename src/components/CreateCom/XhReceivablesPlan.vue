<template>
  <el-select
    v-model="dataValue"
    :disabled="disabled"
    style="width: 100%;"
    clearable
    @change="valueChange">
    <el-option
      v-for="(item, index) in option"
      :key="index"
      :label="item.num"
      :value="item.planId"/>
  </el-select>
</template>
<script type="text/javascript">
import StringMixin from './StringMixin'
import {
  crmQueryReceivablesPlansByContractIdAPI
} from '@/api/crm/contract'

export default {
  name: 'XhReceivablesPlan', // 回款 下的 回款计划
  components: {},
  mixins: [StringMixin],
  props: {
    relation: {
      // 相关ID
      type: Object,
      default: () => {
        return {}
      }
    },
    receivablesId: [String, Number]
  },
  data() {
    return {
      option: []
    }
  },
  computed: {},
  watch: {
    relation: function(val) {
      if (val.moduleType) {
        this.getPlanList()
      } else {
        this.option = []
      }
    }
  },
  mounted() {
    if (this.relation.moduleType) {
      this.getPlanList()
    }
  },
  methods: {
    getPlanList() {
      this.loading = true
      const params = { contractId: this.relation.contractId }
      if (this.receivablesId) {
        params.receivablesId = this.receivablesId
      }
      crmQueryReceivablesPlansByContractIdAPI(params)
        .then(res => {
          this.loading = false
          this.option = res.data
        })
        .catch(() => {
          this.loading = false
        })
    },

    // 输入的值
    valueChange(val) {
      this.$emit('value-change', {
        index: this.index,
        value: val,
        data: this.option.find(item => {
          return item.planId == val
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
