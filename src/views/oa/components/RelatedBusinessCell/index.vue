<template>
  <flexbox class="cell">
    <div class="cell-head">
      <i :class="type | wkIconPre" />
      <span>
        {{ `相关${typeName}-` }}
      </span>
    </div>
    <div
      :class="{'cursor-pointer' :cursorPointer}"
      class="cell-body text-one-line"
      @click="bodyClick">
      {{ name }}
    </div>
    <div class="cell-foot">
      <a
        v-if="showFoot"
        class="cancel-btn"
        @click="footClick">取消关联</a>
    </div>
  </flexbox>
</template>

<script type="text/javascript">
export default {
  name: 'RelatedBusinessCell',
  props: {
    type: {
      type: String,
      default: ''
    },
    cellIndex: Number,
    data: Object,
    showFoot: {
      type: Boolean,
      default: true
    },
    cursorPointer: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  }, // 相关CRM等类型展示布局
  computed: {
    typeName() {
      if (this.type == 'customer') {
        return '客户'
      } else if (this.type == 'contacts') {
        return '联系人'
      } else if (this.type == 'business') {
        return '商机'
      } else if (this.type == 'contract') {
        return '合同'
      }
      return ''
    },

    name() {
      return (
        this.data.name ||
        this.data.businessName ||
        this.data.customerName ||
        this.data.number
      )
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    footClick() {
      this.$emit('unbind', this.type, this.cellIndex, this.data)
    },
    bodyClick() {
      this.$emit('detail', this.type, this.cellIndex, this.data)
    }
  }
}
</script>
<style lang="scss" scoped>
.cell {
  padding: 8px;
  background-color: #f8faff;
  border-radius: $xr-border-radius-base;
  position: relative;
  margin-bottom: 5px;
  color: #333333;
  font-size: 12px;

  .cell-head {
    flex-shrink: 0;
    i {
      display: inline-block;
      width: 15px;
      height: 15px;
      margin-right: 5px;
      color: #666;
      font-size: 14px;
    }
  }

  .cell-body {
    flex: 1;
    color: $xr-color-primary;
    font-size: 12px;
  }

  .cell-body:hover {
    text-decoration: underline;
  }

  .cell-foot {
    flex-shrink: 0;
  }
}

.cancel-btn {
  font-size: 12px;
  color: $xr-color-primary;
}

.cancel-btn:hover {
  text-decoration: underline;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
