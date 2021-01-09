<template>
  <el-select
    v-model="dataValue"
    :disabled="disabled"
    :clearable="clearable"
    style="width: 100%;"
    @change="valueChange">
    <el-option
      v-for="(item, index) in option"
      :key="index"
      :label="item.name"
      :value="item.value"/>
  </el-select>
</template>
<script type="text/javascript">
import StringMixin from './StringMixin'

export default {
  name: 'XhSelect', // 新建 select
  components: {},
  mixins: [StringMixin],
  props: {
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      option: []
    }
  },
  computed: {},
  watch: {
    item: {
      handler(val) {
        if (val && (val.setting || val.data.setting)) {
          const data = val.setting ? val : val.data
          var settingList = data.setting
          if (settingList.length > 0 && typeof settingList[0] == 'string') {
            var array = []
            for (let index = 0; index < settingList.length; index++) {
              const element = settingList[index]
              array.push({ name: element, value: element })
            }
            this.option = array
          } else if (
            settingList.length > 0 &&
            settingList[0].statusId &&
            !settingList[0].value
          ) {
            // 商机阶段
            this.option = settingList.map((item, index, array) => {
              item.value = item.statusId
              return item
            })
          } else {
            this.option = settingList
          }
        } else {
          this.option = []
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {},
  methods: {}
}
</script>
<style lang="scss" scoped>
</style>
