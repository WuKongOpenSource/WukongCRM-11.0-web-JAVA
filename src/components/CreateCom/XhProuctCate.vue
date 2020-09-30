<template>
  <el-cascader
    ref="elCascader"
    :options="options"
    :show-all-levels="false"
    :props="defaultProps"
    v-model="dataValue"
    :disabled="disabled"
    style="width: 100%;"
    change-on-select
    @change="valueChange"/>
</template>
<script type="text/javascript">
import arrayMixin from './arrayMixin'
import { productCategoryIndexAPI } from '@/api/admin/crm'

export default {
  name: 'XhProducCate', // 新建 产品分类
  components: {},
  mixins: [arrayMixin],
  props: {},
  data() {
    return {
      options: [],
      defaultProps: {
        children: 'children',
        label: 'label',
        value: 'categoryId'
      }
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.getProductCategoryIndex()
  },
  methods: {
    /** 获取产品分类数据 */
    getProductCategoryIndex() {
      productCategoryIndexAPI({
        type: 'tree'
      })
        .then(res => {
          this.options = res.data
        })
        .catch(() => {})
    },

    valueChange(val) {
      this.$emit('value-change', {
        index: this.index,
        item: this.item,
        value: val,
        valueContent: this.$refs.elCascader.getCheckedNodes()[0].label // 参考 https://segmentfault.com/q/1010000013063478
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
