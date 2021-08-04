<template>
  <flexbox
    :gutter="gutter"
    align="stretch"
    class="wk-base-detail-section"
    wrap="wrap">
    <flexbox-item
      v-for="(item, index) in list"
      :class="[{'is-block': isBlockShowField(item)}, `is-${item.formType}`]"
      :key="index">
      <flexbox
        align="stretch"
        class="wk-base-detail-section__item">
        <div class="item-name">{{ item.name }}</div>
        <div class="item-value">
          <wk-field-view
            :props="item"
            :form-type="item.formType"
            :value="item.value"
          >
            <template slot-scope="{ data }">
              <slot :data="data" name="data" />
            </template>
          </wk-field-view>
        </div>
      </flexbox>
    </flexbox-item>
    <el-dropdown
      v-if="dropdownItems && dropdownItems.length > 0"
      trigger="hover"
      class="wk-base-detail-section__more"
      @command="handleTypeClick">
      <i
        style="cursor: pointer;"
        class="el-icon-more" />
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(item, index) in dropdownItems"
          :key="index"
          :icon="item.icon"
          :command="item.command">{{ item.label }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <slot />
  </flexbox>
</template>

<script>
import FileListView from '@/components/FileListView'
import WkFieldView from '@/components/NewCom/WkForm/WkFieldView'

export default {
  name: 'WkBaseDetailSection',
  components: {
    FileListView,
    WkFieldView
  },
  props: {
    list: Array,
    gutter: {
      type: Number,
      default: 0
    },
    dropdownItems: Array
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    handleTypeClick(type) {
      this.$emit('command-select', type)
    },

    /**
     * 是整行展示字段
     */
    isBlockShowField(item) {
      return [
        'file',
        'detail_table'].includes(item.formType)
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-base-detail-section {
  position: relative;

  .vux-flexbox-item {
    flex: 0 0 50%;
  }
  &__item {
    width: auto;
    padding: 8px;

    .item-name {
      width: 100px;
      margin-right: 10px;
      font-size: 13px;
      flex-shrink: 0;
      color: #777;
      line-height: 40px;
    }
    .item-value {
      flex: 1;
      font-size: 13px;
      color: #333;
      line-height: 40px;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
      overflow: hidden;
    }
  }

  .is-block {
    flex-basis: 100% !important;
  }

  &__more {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
