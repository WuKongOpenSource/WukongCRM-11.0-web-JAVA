<template>
  <flexbox justify="flex-start" class="filtrate-content">
    <flexbox justify="flex-start" class="title-box">
      <div class="icon-box">
        <span class="wk wk-my-task icon" />
      </div>
      <span class="text">{{ title }}</span>
    </flexbox>
    <template v-if="showFilterView">
      <time-type-select
        v-if="!showYearSelect"
        @change="timeTypeChange"/>
      <!-- 展示年筛选 -->
      <el-date-picker
        v-if="showYearSelect"
        v-model="yearValue"
        :clearable="false"
        :picker-options="pickerOptions"
        type="year"
        value-format="yyyy"
        placeholder="选择年"/>
      <!-- 展示部门筛选 -->

      <el-select
        v-if="showUserStrucSelect"
        v-model="dataSelect">
        <el-option
          v-for="item in [{label:'按部门', value:1},{label:'按员工', value:2}]"
          :key="item.value"
          :label="item.label"
          :value="item.value"/>
      </el-select>
      <wk-dep-select
        v-if="dataSelect == 1"
        v-model="structuresSelectValue"
        radio
        placeholder="选择部门（默认为本部门及下属部门）"
        class="wk-dep-select" />

      <wk-user-select
        v-if="dataSelect == 2 && showUserSelect"
        v-model="userSelectValue"
        radio
        class="wk-user-select"
        placeholder="选择员工（默认为本人及下属）" />

      <!-- <el-select
      v-model="structuresSelectValue"
      placeholder="选择部门"
      @change="structuresValueChange">
      <el-option
        v-for="item in deptList"
        :key="item.id"
        :label="item.name"
        :value="item.id"/>
    </el-select>
    <el-select
      v-if="showUserSelect"
      v-model="userSelectValue"
      :clearable="true"
      placeholder="选择员工">
      <el-option
        v-for="item in userOptions"
        :key="item.id"
        :label="item.realname"
        :value="item.id"/>
    </el-select> -->
      <!-- 展示商机状态筛选 -->
      <el-select
        v-if="showBusinessSelect"
        v-model="businessStatusValue"
        placeholder="商机组">
        <el-option
          v-for="item in businessOptions"
          :key="item.typeId"
          :label="item.name"
          :value="item.typeId"/>
      </el-select>
      <el-cascader
        v-if="showProductSelect"
        :options="productOptions"
        :show-all-levels="false"
        :props="{
          children: 'children',
          label: 'label',
          value: 'categoryId'
        }"
        v-model="productValue"
        style="width: 100%;"
        change-on-select/>
      <el-select
        v-if="showCustomSelect"
        v-model="customValue"
        @change="customSelectChange">
        <el-option
          v-for="item in customOptions"
          :key="item.value"
          :label="item.name"
          :value="item.value"/>
      </el-select>
      <slot name="append"/>
      <el-button
        type="primary"
        @click.native="postFiltrateValue()">搜索</el-button>
      <slot/>
    </template>
  </flexbox>
</template>

<script type="text/javascript">
import {
  getUserByDeptIdAPI
} from '@/api/common'
import { crmBusinessStatusListAPI } from '@/api/crm/business'
import { productCategoryIndexAPI } from '@/api/admin/crm'

import WkDepSelect from '@/components/NewCom/WkDepSelect'
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import TimeTypeSelect from '@/components/TimeTypeSelect'

import moment from 'moment'

export default {
  name: 'FiltrateHandleView', // 筛选条件
  components: {
    TimeTypeSelect,
    WkDepSelect,
    WkUserSelect
  },
  props: {
    // 模块类型  暂无意义 可不传
    moduleType: {
      type: String
    },
    // 模块标题
    title: {
      type: String,
      default: ''
    },
    showFilterView: {
      default: true,
      type: Boolean
    },
    // 是否展示年
    showYearSelect: {
      default: false,
      type: Boolean
    },
    // 是否展示商机状态筛选
    showBusinessSelect: {
      default: false,
      type: Boolean
    },
    // 展示员工选择
    showUserSelect: {
      default: true,
      type: Boolean
    },
    showCustomSelect: {
      default: false,
      type: Boolean
    },
    customDefault: '',
    customOptions: {
      default: () => {
        return []
      },
      type: Array
    },
    // 展示产品类别选择
    showProductSelect: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      // 年筛选
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      yearValue: '',

      /** 时间类型值 */
      timeTypeValue: {},


      /** 部门选择解析数据 */
      // structuresProps: {
      //   children: 'children',
      //   label: 'label',
      //   value: 'id'
      // },
      dataSelect: 1, // 1 是部门 2 是员工
      // deptList: [], // 部门列表
      structuresSelectValue: '',
      /** 用户列表 */
      // userOptions: [],
      userSelectValue: '',



      /** 商机状态 */
      businessOptions: [],
      businessStatusValue: '',
      /** 产品类别 */
      productValue: [],
      productOptions: [],
      // 图标类型
      customValue: ''
    }
  },
  computed: {
    showUserStrucSelect() {
      return this.showUserSelect
    }
  },
  watch: {},
  mounted() {
    // 自定义选择项 默认值
    if (this.showCustomSelect) {
      this.customValue = this.customDefault
    }
    if (this.showYearSelect) {
      this.yearValue = moment(new Date())
        .year()
        .toString()
    }

    this.$emit('load')
    // 展示员工 不展示新的员工部门筛选效果
    if (this.showBusinessSelect) {
      this.getBusinessStatusList(() => {
        this.postFiltrateValue()
      })
    } else {
      this.postFiltrateValue()
    }

    if (this.showProductSelect) {
      this.getProductCategoryIndex()
    }
  },

  beforeDestroy() {},
  methods: {

    // 选择更改
    customSelectChange() {
      this.$emit('typeChange', this.customValue)
    },
    // 类型选择
    timeTypeChange(data) {
      this.timeTypeValue = data
    },
    /** 部门更改 */
    structuresValueChange(data) {
      // 展示员工筛选，执行更新逻辑
      if (this.showUserSelect) {
        this.userSelectValue = ''
        this.userOptions = []
        this.getUserList() // 更新员工列表
      }
    },
    /** 部门下员工 */
    getUserList() {
      var params = {}
      params.deptId = this.structuresSelectValue
      getUserByDeptIdAPI(params)
        .then(res => {
          this.userOptions = res.data
        })
        .catch(() => {
          this.$emit('error')
        })
    },
    /** 商机阶段 */
    getBusinessStatusList(result) {
      crmBusinessStatusListAPI()
        .then(res => {
          const list = res.data || []
          this.businessOptions = list.filter(item => {
            return item.status === 1
          })
          if (this.businessOptions.length > 0) {
            this.businessStatusValue = this.businessOptions[0].typeId
          }
          result(true)
        })
        .catch(() => {
          this.$emit('error')
        })
    },
    /** 获取产品分类数据 */
    getProductCategoryIndex() {
      productCategoryIndexAPI({
        type: 'tree'
      })
        .then(res => {
          this.productOptions = res.data
        })
        .catch(() => {})
    },
    postFiltrateValue() {
      const params = {}
      if (this.showUserStrucSelect) {
        if (this.dataSelect == 1) {
          params.deptId = this.structuresSelectValue
        }
      } else {
        params.deptId = this.structuresSelectValue
      }

      if (this.showUserStrucSelect) {
        params.isUser = this.dataSelect == 2 ? 1 : 0
      }

      // 展示员工，返回员工参数
      if (this.showUserSelect) {
        if (this.dataSelect == 2) {
          params.userId = this.userSelectValue
        }
      }

      // 展示商机状态 返回商机状态参数
      if (this.showBusinessSelect) {
        params.typeId = this.businessStatusValue
      }

      if (this.showProductSelect) {
        params.categoryId =
          this.productValue.length > 0
            ? this.productValue[this.productValue.length - 1]
            : ''
      }

      // 展示年和展示时间段类型不同时出现
      if (this.showYearSelect) {
        params.year = this.yearValue
      } else {
        if (this.timeTypeValue.type == 'custom') {
          params.startTime = this.timeTypeValue.startTime
          params.endTime = this.timeTypeValue.endTime
        } else {
          params.type = this.timeTypeValue.value
        }
      }
      this.$emit('change', params)
    }
  }
}
</script>
<style lang="scss" scoped>
.filtrate-content {
  padding: 15px 20px 5px 20px;
  .title-box {
    width: 220px;
    display: flex;
    .icon-box {
      width: 34px;
      height: 34px;
      text-align: center;
      line-height: 34px;
      color: $xr-color-primary;
      background-color: #dfe8ff;
      border-radius: 50%;
      margin-right: 10px;
    }
    .text {
      font-size: 17px;
      font-weight: bold;
    }
  }
  .el-date-editor {
    width: 130px;
    margin-right: 15px;
  }

  .el-cascader {
    width: 130px;
    margin-right: 15px;
  }
  .el-select {
    width: 120px;
    margin-right: 15px;
  }

  .el-cascader {
    width: 120px !important;
    margin-right: 15px;
  }

  .wk-user-select,
  .wk-dep-select {
    text-align: left;
    width: 235px;
    margin-right: 15px;
  }
}

// 时间选择
.type-popper {
  .type-content {
    height: 250px;
    overflow-y: auto;
    .type-content-item {
      height: 34px;
      line-height: 34px;
      padding: 0 20px;
      color: #606266;
      position: relative;
      cursor: pointer;
      .mark {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: $xr-border-radius-base;
        margin-right: 5px;
        background-color: transparent;
      }
    }

    .selected {
      color: #409eff;
      font-weight: 700;
      .mark {
        background-color: #409eff;
      }
    }
    .type-content-item:hover {
      background-color: #f5f7fa;
    }
  }

  .type-content-custom {
    padding: 5px 20px 10px;
    position: relative;
    overflow: hidden;
    .el-date-editor {
      width: 100%;
      margin-bottom: 8px;
    }

    button {
      float: right;
    }
  }
}
</style>
