<template>
  <el-popover
    ref="popover"
    :placement="placement"
    :width="popoverWidth"
    v-model="popoverVisible"
    popper-class="no-padding-popover"
    trigger="click">
    <div v-if="popoverContentShow">
      <employee-department
        ref="employeeDepartment"
        v-bind="$attrs"
        @select="popoverSubmit"
      />
      <div class="popover-footer">
        <el-button @click="popoverVisible = false">取 消</el-button>
        <el-button
          v-if="!isRadio"
          type="primary"
          @click="popoverSubmit">确 定</el-button>
      </div>
    </div>
    <div
      slot="reference"
      :style="{'display':contentBlock ? 'block' : 'inline-block'}"
      @click="showContentClick">
      <slot name="membersDep" />
    </div>
  </el-popover>

</template>
<script>
import EmployeeDepartment from './main'

export default {
  name: 'MembersDep',
  components: {
    EmployeeDepartment
  },
  inheritAttrs: false,
  props: {
    // 内容框类型
    contentBlock: {
      type: Boolean,
      default: true
    },
    // 显示位置
    placement: {
      type: String,
      default: 'bottom-start'
    }
  },
  data() {
    return {
      popoverVisible: false,
      data: {},
      // 内容展示
      popoverContentShow: false
    }
  },
  computed: {
    popoverWidth() {
      return this.isRadio ? '300' : '600'
    },

    isRadio() {
      return this.$attrs.radio || false
    },

    employeeDepartment() {
      return this.$refs.employeeDepartment
    }
  },
  watch: {
    popoverVisible(val) {
      if (val) {
        // this.updateCheckInfoByWatch()
      }

      this.$emit('show', val)
    }
  },
  methods: {
    // 提交按钮
    popoverSubmit() {
      this.popoverVisible = false
      this.$emit(
        'popoverSubmit',
        this.employeeDepartment.userObjArray,
        this.employeeDepartment.depObjArray
      )
    },

    // 内容可见
    showContentClick() {
      if (!this.popoverContentShow) {
        this.popoverContentShow = true
      }
    }

  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mixin.scss';

.popover-footer {
  background-color: #f7f8fa;
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
  border-top: 1px solid $xr-border-line-color;

  .el-button {
    float: right;
    margin-top: 6px;
    padding: 6px 12px;
  }

  .el-button + .el-button {
    margin-left: 0;
    margin-right: 10px;
  }
}
</style>

