<template>
  <div class="employee-department">
    <div class="select-input">
      <slot name="tabs" />
      <!-- 搜索员工列表 -->
      <wk-user-dep
        ref="userDep"
        :radio="radio"
        :user-value="userDataValue"
        :props="props"
        :dep-value="depDataValue"
        :options="userList"
        @userChange="userChange"
        @depChange="depChange"
      />
    </div>
    <div
      v-if="!radio || showPreview"
      class="checked-content">
      <div class="checked-top">
        <span class="select-info">已选择<span class="select-info--num">{{ userDataValue.length + depDataValue.length }}</span>项</span>
        <el-button
          type="text"
          @click="clearAll">清空</el-button>
      </div>
      <div class="select-content">
        <flexbox
          justify="stretch"
          wrap="wrap">
          <div
            v-for="(item, index) in depObjArray"
            :key="`dep${index}`"
            class="select-item text-one-line">{{ item.name }}<i
              class="el-icon-close delete-icon"
              @click="selectDelete(index, 'dep')" /></div>
          <div
            v-for="(item, index) in userObjArray"
            :key="`user${index}`"
            class="select-item text-one-line">{{ item.realname }}<i
              class="el-icon-close delete-icon"
              @click="selectDelete(index, 'user')" /></div>
        </flexbox>
      </div>
    </div>
  </div>
</template>
<script>
import { userListAPI, depListAPI } from '@/api/common'

import WkUserDep from '@/components/NewCom/WkUserDepSelect/src/WkUserDep'

import { valueEquals } from 'element-ui/lib/utils/util'

export default {
  name: 'EmployeeDepartment',
  components: {
    WkUserDep
  },
  props: {
    radio: {
      type: Boolean,
      default: false
    },
    showPreview: {
      type: Boolean,
      default: false
    },
    // 编辑时 -- 用户默认勾选的数据
    userCheckedData: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 编辑时 -- 部门默认勾选的数据
    depCheckedData: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 是否关闭某个类的选择
    closeUser: {
      type: Boolean,
      default: false
    },
    closeDep: {
      type: Boolean,
      default: false
    },
    userRequest: Function,
    userParams: Object
  },
  data() {
    return {
      userList: [],
      depList: [],

      depDataValue: [], // 校准传入值
      userDataValue: []
    }
  },
  computed: {
    props() {
      let selectType = 'all'
      if (this.closeUser) {
        selectType = 'dep'
      } else if (this.closeDep) {
        selectType = 'user'
      }
      return {
        request: this.userRequest,
        params: this.userParams,
        isList: !!this.userRequest,
        selectType,
        showFooter: false
      }
    },
    depObjArray() {
      return this.depList.filter(item => this.depDataValue.includes(item.deptId))
    },
    userObjArray() {
      return this.userList.filter(item => this.userDataValue.includes(item.userId))
    }
  },
  watch: {
    userCheckedData: {
      handler() {
        const userDataValue = this.userCheckedData.map(item => item.userId)
        if (!valueEquals(userDataValue, this.userDataValue)) {
          this.userDataValue = userDataValue
        }
      },
      immediate: true
    },
    depCheckedData: {
      handler() {
        const depDataValue = this.depCheckedData.map(item => item.deptId)
        if (!valueEquals(depDataValue, this.depDataValue)) {
          this.depDataValue = depDataValue
        }
      },
      immediate: true
    }
  },
  created() {
    this.initInfo()
  },
  methods: {
    initInfo() {
      if (!this.closeUser) {
        this.getUserList()
      }
      if (!this.closeDep) {
        this.getDepList()
      }
    },

    /**
     * 部门信息
     */
    getDepList() {
      depListAPI()
        .then(res => {
          this.depList = res.data
        })
        .catch(() => {
        })
    },

    /**
     * 员工操作
     */
    getUserList() {
      let request = userListAPI
      let params = {}
      if (this.userRequest) {
        request = this.userRequest
        params = this.userParams || {}
      } else {
        params = { pageType: 0 }
      }
      request(params)
        .then(res => {
          this.userList = res.data.list || res.data
        })
        .catch(() => {
        })
    },

    /**
     * 删除 清空 等操作
     */
    selectDelete(index, type) {
      if (type === 'user') {
        this.userDataValue.splice(index, 1)
      } else if (type === 'dep') {
        this.depDataValue.splice(index, 1)
      }
    },

    /**
     * 回调数据
     */
    valueChange() {
      this.$emit(
        'select',
        this.userObjArray,
        this.depObjArray
      )
    },

    /**
     * 清空按钮
     */
    clearAll() {
      this.userDataValue = []
      this.depDataValue = []
    },

    userChange(val) {
      this.userDataValue = val
      if (this.radio) {
        this.valueChange()
      }
    },
    depChange(val) {
      this.depDataValue = val
      if (this.radio) {
        this.valueChange()
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mixin.scss';
.employee-department {
  display: flex;
  .select-input {
    flex: 1;
    overflow: hidden;
    border-right: 1px solid $xr-border-line-color;
    .select-input > .el-input {
      margin: 10px 0;
    }

    .el-checkbox {
      margin-left: 0;
      margin-right: 10px;
    }
    .el-breadcrumb {
      margin-bottom: 15px;
    }
    .checkout-box {
      display: flex;
      margin-bottom: 10px;
    }
    .checkout-box > div {
      flex: 1;
      .el-icon-arrow-right {
        float: right;
      }
      span {
        cursor: pointer;
      }
    }
  }

  .checked-content {
    flex: 1;
    .checked-top {
      padding: 0 12px;
      height: 40px;
      line-height: 40px;
      margin-bottom: 12px;
      border-bottom: 1px solid $xr-border-line-color;
      .title {
        color: #999999;
      }
    }
    .select-content {
      padding: 0 12px;
      height: 220px;
      overflow: auto;
      .select-item {
        position: relative;
        flex-shrink: 0;
        background-color: #f3f7ff;
        height: 28px;
        line-height: 28px;
        max-width: 80px;
        font-size: 12px;
        padding: 0 15px 0 5px;
        border-radius: $xr-border-radius-base;
        color: #333;
        margin: 0 10px 10px 0;

        i {
          cursor: pointer;
          color: #666;
          margin-left: 5px;
        }

        i:hover {
          color: $xr-color-primary;
        }
      }
    }
  }
}

.el-tabs /deep/ .el-tabs__nav-wrap {
  padding: 0 12px;
}

.el-tabs /deep/ .el-tabs__nav-wrap::after {
  height: 1px;
}

.el-tabs /deep/ .el-tabs__header {
  margin-bottom: 12px;
}

.el-tabs /deep/ .el-tabs__item {
  font-size: 12px;
  color: #333;
  padding-right: 0;
}

.el-tabs /deep/ .el-tab-pane {
  height: 100%;
}

.el-tabs /deep/ .el-tabs__content {
  margin: 0 12px;
  height: 220px;
}

/* 选择员工 */
.search-img {
  vertical-align: middle;
  margin-right: 8px;
}
.search-list {
  margin: 5px;
  height: 180px;
  overflow: auto;
  margin-right: -10px;
  padding-right: 10px;
}

.checkout-boxs {
  height: 150px;
  overflow-y: auto;
  overflow-x: hidden;
}

.colleagues-list {
  padding: 5px 0;
}

// 选择信息
.select-info {
  display: inline-block;
  width: calc(100% - 40px);

  &--num {
    color: $xr-color-primary;
  }
}

// check样式
.el-checkbox {
  /deep/ .el-checkbox__label {
    color: #333;
  }
}

.all-check {
  display: inline-block;
  padding: 5px 0;
}

.search-input {
  /deep/ .el-input__inner {
    background-color: #f4f4f4;
    border: none;
  }
}

.delete-icon {
  color: #999;
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 2px;

  &:hover {
    color: $xr-color-primary;
  }
}
</style>

