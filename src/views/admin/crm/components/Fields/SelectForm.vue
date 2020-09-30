<template>
  <div class="box-wrapper">
    <div class="title"><span>{{ attr.isNull ? '*' : '' }}</span>{{ attr.name }}<span v-if="attr.inputTips">{{ '（'+attr.inputTips+'）' }}</span></div>
    <div class="box">
      <flexbox class="select-box">
        <div>{{ attr.defaultValue ? attr.defaultValue :'请选择' }}</div>
        <i class="el-icon-arrow-down el-icon--right"/>
      </flexbox>
    </div>
    <span v-if="isShow" class="el-icon-delete control" @click="handleDelete"/>
  </div>
</template>

<script>
/**
   * 选项
   */
import mixins from './mixin'

export default {
  name: 'SelectForm',
  mixins: [mixins],
  data() {
    return {
    }
  },
  computed: {
  }
}
</script>

<style scoped lang="scss">
  @import "@/styles/mixin.scss";
  @import "form.scss";

  .box {
    font-size: 13px;
    .select-box {
      border: 1px solid #dcdfe6;
      border-radius: $xr-border-radius-base;
      padding: 10px;
      width: 310px;
      color: #333;
      div {
        flex: 1;
      }
    }
  }
</style>
