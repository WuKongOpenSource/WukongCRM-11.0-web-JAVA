<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <el-card class="statistics-card">
    <flexbox>
      <div v-if="titleShow" class="card-item is-first">
        <i v-if="iconShow" class="wk wk-results-solid card-item__icon" />
        <span class="card-item__title">{{ title }}</span>
      </div>
      <div
        v-for="(field, fIndex) in fieldList"
        :key="fIndex"
        class="card-item">
        <div class="card-item__label">{{ field.label }}</div>
        <div
          :class="{ 'can-visit--underline': field.visit }"
          class="card-item__value"
          @click="itemClick(fIndex, field)"
        >{{ data[field.prop] === '' || data[field.prop] === null ? '--' : data[field.prop] }}</div>
      </div>
      <div v-if="buttonShow" class="card-item">
        <slot v-if="$slots.handle" name="handle" />
        <el-button v-else type="text" @click="detailClick(data)">查看详情</el-button>
        <el-button v-if="deleteButtonShow" class="xr-text-btn delete" type="text" @click="deleteClick(data)">删除</el-button>
      </div>
    </flexbox>
  </el-card>
</template>

<script>

export default {
  // 绩效月统计效果
  name: 'StatisticsCard',
  components: {
  },
  props: {
    titleShow: {
      type: Boolean,
      default: true
    },
    iconShow: {
      type: Boolean,
      default: true
    },
    buttonShow: {
      type: Boolean,
      default: true
    },
    deleteButtonShow: {
      type: Boolean,
      default: false
    },
    title: String,
    data: Object,
    fieldList: Array
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    detailClick() {
      this.$emit('detail-click', this.data)
    },

    deleteClick() {
      this.$emit('delete-click', this.data)
    },

    itemClick(fIndex, field) {
      if (field.visit) {
        this.$emit('select', fIndex, field, this.data)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics-card {
  /deep/ .el-card__body {
    padding: 40px 20px;
  }

  .card-item {
    padding:  0 10px;
    text-align: center;
    flex: 1;
    flex-shrink: 0;

    &.is-first {
      text-align: left;
    }

    &__label {
      font-size: 12px;
      color: #666;
    }

    &__value {
      font-weight: bold;
      margin-top: 8px;
      font-size: 20px;
    }

    &__icon {
      color: $xr-color-primary;
    }

    &__title {
      font-size: 16px;
      font-weight: bold;
      margin-left: 8px;
    }
  }

  .card-item + .card-item {
    border-left: 1px solid $xr-border-line-color;
  }
}

.statistics-card + .statistics-card {
  margin-top: 15px;
}
</style>
