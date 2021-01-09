<template>
  <flexbox
    class="project-cell">
    <div v-if="$slots.header" class="project-cell__header">
      <slot name="header" class="project-cell__header" />
    </div>
    <img v-src="data.coverUrl || defaultCorverUrl" v-else class="project-cell__header" >
    <div class="project-cell__body">
      <slot v-if="$slots.body" name="body" />
      <template v-else>
        <div class="label text-one-line">{{ data.name }}</div>
        <div class="des text-one-line">{{ data.description }}</div>
      </template>
    </div>
    <div class="project-cell__footer">
      <i
        v-if="deleteShow"
        title="移至回收站"
        class="wk wk-s-delete"
        @click.stop="handleClick('delete')"/>
      <i
        v-if="editShow"
        title="编辑"
        class="wk wk-circle-edit"
        @click.stop="handleClick('edit')"/>
      <i
        v-if="collectShow"
        :class="{ 'is-collect': data.collect == 1 }"
        title="删除"
        class="wk wk-focus-on"
        @click.stop="handleClick('collect')" />
    </div>
  </flexbox>
</template>

<script>
export default {
  // 项目行
  name: 'ProjectCell',

  components: {},

  props: {
    data: Object,
    editShow: {
      type: Boolean,
      default: true
    },
    deleteShow: {
      type: Boolean,
      default: true
    },
    collectShow: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {
    handleClick(type) {
      this.$emit('handle', type)
    }
  }
}
</script>

<style lang="scss" scoped>
.project-cell {
  cursor: pointer;
  padding: 20px 0;
  background: white;

  &__header {
    width: 150px;
    height: 75px;
    flex-shrink: 0;
    border-radius: $xr-border-radius-base;
  }

  &__body {
    flex: 1;
    margin-left: 15px;

   .label {
     font-size: 16px;
   }

   .des {
     margin-top: 5px;
     color: #999;
     min-height: 16px;
   }
  }

  &__footer {
    flex-shrink: 0;
    i {
      color: #ccc;
      cursor: pointer;
    }
    i:hover {
      color: $xr-color-primary;
    }

    .wk-focus-on.is-collect {
      color: #F7AD3D;
    }
  }
}
.project-cell + .project-cell {
  border-top: 1px solid $xr-border-color-base;
}
</style>
