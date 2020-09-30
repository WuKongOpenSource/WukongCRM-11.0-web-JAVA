<template>
  <el-popover
    v-model="showPopover"
    :disabled="disabled"
    placement="bottom"
    width="300"
    popper-class="no-padding-popover"
    trigger="click">
    <xh-structure
      v-if="!disabled"
      ref="structure"
      :show="showPopover"
      :radio="radio"
      :selected-data="dataValue"
      @changeCheckout="checkStructure"/>
    <div slot="reference">
      <flexbox
        :class="[disabled ? 'is_disabled' : 'is_valid', { 'is_focus': showPopover }]"
        wrap="wrap"
        class="structure-container xh-form-border"
        @click.native="focusClick">
        <div
          v-for="(item, index) in showDataValue"
          :key="index"
          class="user-item">{{ item.name }}
          <i v-if="!disabled" class="delete-icon el-icon-close" @click.stop="deletestru(item,index)"/>
        </div>
        <i v-if="dataValue.length > max" class="el-icon-more" />
        <i
          :class="['el-icon-arrow-up', { 'is-reverse' : showPopover}]"/>
        <div
          v-if="dataValue.length == 0"
          class="add-item text-one-line">{{ placeholder }}</div>
      </flexbox>
    </div>
  </el-popover>
</template>
<script type="text/javascript">
import XhStructure from './XhStructure'
import arrayMixin from './arrayMixin'

export default {
  name: 'XhStructureCell', // 新建 structure-cell
  components: {
    XhStructure
  },
  mixins: [arrayMixin],
  props: {
    placeholder: {
      type: String,
      default: '选择部门'
    },
    radio: {
      // 是否单选
      type: Boolean,
      default: true
    },
    max: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      showPopover: false // 展示popover
    }
  },
  computed: {

    showDataValue() {
      if (this.dataValue && this.dataValue.length > this.max) {
        return this.dataValue.slice(0, this.max)
      }
      return this.dataValue
    }
  },
  watch: {},
  mounted() {},
  methods: {
    /** 选中 */
    checkStructure(data) {
      if (this.radio && data && data.length) {
        this.showPopover = false
      }
      this.dataValue = data
      this.$emit('value-change', {
        item: this.item,
        index: this.index,
        value: data
      })
    },
    /** 删除 */
    deletestru(item, index) {
      this.dataValue.splice(index, 1)
      this.$emit('value-change', {
        item: this.item,
        index: this.index,
        value: this.dataValue
      })
    },
    /** 聚焦动作 */
    focusClick() {
      this.$emit('focus')
    }
  }
}
</script>
<style lang="scss" scoped>
.structure-container {
  min-height: 34px;
  margin: 3px 0;
  position: relative;
  border-radius: 3px;
  font-size: 12px;
  border: 1px solid #e6e6e6;
  color: #333333;
  padding: 0.5px;
  line-height: 15px;
  max-height: 105px;
  overflow-y: auto;
  .user-item {
    padding: 5px;
    background-color: #F3F7FF;
    border-radius: 3px;
    margin: 3px;
    cursor: pointer;
  }
  .add-item {
    padding: 5px;
    padding-right: 20px;
    color: #ddd;
    cursor: pointer;
  }
  .delete-icon {
    color: #999;
    cursor: pointer;
  }
  &:hover {
    border-color: #c0c4cc;
  }
}

.structure-container.is_disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
  .user-item {
    background-color: #f0f4f8ea;
    color: #c0c4cc;
    cursor: not-allowed;
  }
  .delete-icon {
    color: #c0c4cc;
    cursor: not-allowed;
  }
  .add-item {
    color: #c0c4cc;
    cursor: not-allowed;
  }
}

.structure-container.is_valid:hover {
  border-color: #c0c4cc;
}

.structure-container.is_focus {
  border-color: $xr-focus-border !important;
}

.el-icon-more {
  position: absolute;
  top: 5px;
  right: 20px;
  padding: 6px 10px;
  font-size: 12px;
  background-color: #F3F7FF;
  color: #666;
  border-radius: $xr-border-radius-base;
  &:hover {
    background-color: $xr-color-primary;
    color: white;
  }
}

.el-icon-arrow-up {
  position: absolute;
  top: 10px;
  right: 5px;
  transition: transform .3s;
  color: #c0c4cc;
  font-size: 14px;
  transition: transform .3s;
  transform: rotate(180deg);
  cursor: pointer;
}
.el-icon-arrow-up.is-reverse {
  transform: rotate(0deg);
}
</style>
