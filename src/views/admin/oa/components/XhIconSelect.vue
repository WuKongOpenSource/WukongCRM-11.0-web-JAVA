<template>
  <div>
    <div
      :style="{ backgroundColor: iconColor }"
      class="header-icon">
      <i :class="iconClass" />
    </div>
    <Xh-icon-popover
      :select-icon="selectIcon"
      @select="iconSelect">
      <el-button slot="reference" type="primary" plain>选择图标</el-button>
    </Xh-icon-popover>
  </div>
</template>

<script>
import XhIconPopover from './XhIconPopover'

export default {
  // 审批流图标
  name: 'XhIconSelect',
  components: {
    XhIconPopover
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    // 索引值 用于更新数据
    index: Number,
    // 包含数据源
    item: Object
  },
  data() {
    return {
      dataValue: ''
    }
  },
  computed: {
    iconColor() {
      const temps = this.dataValue.split(',')
      return temps.length > 1 ? temps[1] : '#9376FF'
    },

    iconClass() {
      const temps = this.dataValue.split(',')
      return temps.length > 1 ? temps[0] : 'wk wk-approve'
    },

    selectIcon() {
      const temps = this.dataValue.split(',')
      if (temps.length > 1) {
        return {
          icon: temps[0],
          color: temps[1]
        }
      } else {
        return null
      }
    }
  },
  watch: {
    value: function(val) {
      this.dataValue = val
    }
  },
  mounted() {
    this.dataValue = this.value
  },

  beforeDestroy() {},
  methods: {
    iconSelect(icon, color) {
      this.dataValue = `${icon},${color}`
      this.valueChange()
    },

    valueChange() {
      this.$emit('value-change', {
        index: this.index,
        value: this.dataValue
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.header-icon {
  display: inline-block;
  width: 36px;
  height: 36px;
  text-align: center;
  line-height: 36px;
  border-radius: $xr-border-radius-base;
  margin-right: 30px;
  .wk {
    color: white;
    font-size: 22px;
  }
}
</style>
