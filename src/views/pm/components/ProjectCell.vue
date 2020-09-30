<template>
  <flexbox class="project-cell">
    <div v-if="drag" class="drag-handle">⋮⋮</div>
    <div
      :style="{ backgroundColor: iconColor }"
      class="project-cell__icon">
      <i :class="iconClass" />
    </div>
    <div class="project-cell__label text-one-line">
      {{ label }}
    </div>
    <i v-if="collect" :class="{ 'is-collect': isCollect }" class="wk wk-focus-on project-cell__collect" @click.stop="$emit('collect')" />
  </flexbox>
</template>

<script>

export default {
  // 项目和标签列表用的cell
  name: 'ProjectCell',
  components: {},
  props: {
    iconClass: String,
    iconColor: String,
    label: String,
    isCollect: Boolean,
    collect: {
      type: Boolean,
      default: true
    },
    drag: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.project-cell {
  position: relative;
  padding: 8px 15px 8px 20px;
  border-radius: $xr-border-radius-base;
  cursor: pointer;

  .drag-handle {
    visibility: hidden;
    width: 16px;
    color: #333;
    cursor: move;
    position: absolute;
    left: 5px;
  }

  &__icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    border-radius: $xr-border-radius-base;
    margin-right: 10px;

    .wk {
      color: white;
      font-size: 12px;
    }
  }

  &__label {
    flex: 1;
    font-size: 13px;
    color: #333;
    font-weight: 600;
  }

  &__collect {
    color: #ccc;
    font-size: 14px;
  }

  &__collect.is-collect {
    color: #F7AD3D;
  }

  &:hover {
    background-color: #f1f1f1;

    .drag-handle {
      visibility: visible;
    }
  }
}
</style>
