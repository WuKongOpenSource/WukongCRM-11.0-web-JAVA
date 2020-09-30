<template>
  <members-dep
    :popover-display="'block'"
    :dep-checked-data="dataStrucs"
    :user-checked-data="dataUsers"
    @popoverSubmit="popoverSubmit"
    @show="popoverShow">
    <div
      v-if="!$slots.reference"
      slot="membersDep">
      <flexbox
        :class="['is_valid', { 'is_focus': showPopover }]"
        wrap="wrap"
        class="structure-container xh-form-border"
        @click.native="focusClick">
        <div
          v-for="(item, index) in showDataValue"
          :key="index"
          class="user-item"
          @click.stop="deleteItem(item, index)">{{ item.name || item.realname }}
          <i class="delete-icon el-icon-close"/>
        </div>
        <i v-if="allData.length > max" class="el-icon-more" />
        <i
          :class="['el-icon-arrow-up', { 'is-reverse' : showPopover}]"/>
        <div
          v-if="allData.length == 0"
          class="add-item text-one-line">{{ placeholder }}</div>
      </flexbox>
    </div>
    <slot
      v-else
      slot="reference"
      name="reference" />
  </members-dep>

</template>
<script type="text/javascript">
import MembersDep from '@/components/SelectEmployee/MembersDep'

export default {
  name: 'XhStrucUserCell', // 新建 struc-user-cell
  components: {
    MembersDep
  },
  props: {
    // 员工和 部门
    placeholder: {
      type: String,
      default: '请选择'
    },
    users: {
      type: Array,
      default: () => {
        return []
      }
    },
    strucs: {
      type: Array,
      default: () => {
        return []
      }
    },
    value: {
      type: Object,
      default: () => {
        return {
          users: [],
          strucs: []
        }
      }
    },
    max: {
      type: Number,
      default: 2
    },
    /** 索引值 用于更新数据 */
    index: Number,
    /** 包含数据源 */
    item: Object
  },
  data() {
    return {
      showPopover: false,
      dataUsers: [], // 关联的时候展示name 编辑的时候展示realname
      dataStrucs: []
    }
  },
  computed: {
    showDataValue() {
      if (this.allData.length > this.max) {
        return this.allData.slice(0, this.max)
      }
      return this.allData
    },

    allData() {
      const dataUsers = this.dataUsers || []
      const dataStrucs = this.dataStrucs || []
      return dataUsers.concat(dataStrucs)
    }
  },
  watch: {
    value: function(val) {
      this.dataUsers = val.users
      this.dataStrucs = val.strucs
    },
    users: function(val) {
      this.dataUsers = val
    },
    strucs: function(val) {
      this.dataStrucs = val
    }
  },
  created() {
    if (this.value) {
      this.dataUsers = this.value.users
      this.dataStrucs = this.value.strucs
    } else {
      this.dataUsers = this.users || []
      this.dataStrucs = this.strucs || []
    }
  },
  methods: {
    popoverSubmit(users, strucs) {
      this.dataUsers = users
      this.dataStrucs = strucs

      this.$emit('value-change', {
        index: this.index,
        value: { users: users, strucs: strucs }
      })
    },

    popoverShow(val) {
      this.showPopover = val
    },

    /** 删除 */
    deleteItem(item, index) {
      if (item.userId) {
        this.dataUsers.splice(index, 1)
      } else {
        this.dataStrucs.splice(index - this.dataUsers.length, 1)
      }

      this.$emit('value-change', {
        index: this.index,
        value: { users: this.dataUsers, strucs: this.dataStrucs }
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
