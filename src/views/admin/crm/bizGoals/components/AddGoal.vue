<template>
  <el-dialog
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="设置目标"
    width="800px"
    custom-class="no-padding-dialog"
    @close="closeClick">
    <div v-loading="loading" class="add-goal">
      <flexbox class="select-wrapper">
        <flexbox-item class="select-item">
          <flexbox>
            <span class="select-label">{{ rangeLabel }}</span>
            <xh-user-cell
              v-if="type == 'user'"
              :radio="false"
              :value="selectDepOrUser"
              class="select-condition"
              placeholder="选择人员"
              @value-change="userChange" />
            <xh-structure-cell
              v-else
              :radio="false"
              :value="selectDepOrUser"
              class="select-condition"
              @value-change="structureChange" />
          </flexbox>
        </flexbox-item>
        <flexbox-item class="select-item">
          <span class="select-label">考核指标</span>
          <el-select
            v-model="typeSelect"
            class="select-condition">
            <el-option
              v-for="item in [{label:'合同金额', value:1},{label:'回款金额', value:2}]"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </el-select>
        </flexbox-item>
      </flexbox>

      <div class="add-goal__handle">
        <el-date-picker
          v-model="dateSelect"
          :clearable="false"
          type="year"
          value-format="yyyy"
          placeholder="选择年" />
        <span class="handle-label">年度业务目标是 ¥ </span>
        <el-input
          v-model="totalGoal"
          class="total-input"
          type="number"
          @input="inputChange('total')" />
        <span class="handle-label">元</span>
        <el-button type="primary" @click="averageClick">平均分配到每月</el-button>
      </div>

      <flexbox class="add-goal__set">
        <flexbox-item
          v-for="(item, index) in quarterList"
          :key="index"
          class="set-item">
          <div class="set-item__hd">
            <p>{{ item.title }}</p>
            <el-input
              v-model="item.all"
              disabled
              type="number"/>
          </div>
          <div class="set-item__bd">
            <div class="set-item-wrapper">
              <span class="set-item__label">{{ getSetLabe(index, 0) }}</span>
              <el-input
                v-model="item.first"
                class="set-item__input"
                type="number"
                @input="inputChange('sub', item, 'first')"
                @blur="inputBlur(index)"/>
            </div>
            <div class="set-item-wrapper">
              <span class="set-item__label">{{ getSetLabe(index, 1) }}</span>
              <el-input
                v-model="item.second"
                class="set-item__input"
                type="number"
                @input="inputChange('sub', item, 'second')"
                @blur="inputBlur(index)"/>
            </div>
            <div class="set-item-wrapper">
              <span class="set-item__label">{{ getSetLabe(index, 2) }}</span>
              <el-input
                v-model="item.third"
                class="set-item__input"
                type="number"
                @input="inputChange('sub', item, 'third')"
                @blur="inputBlur(index)"/>
            </div>
          </div>
        </flexbox-item>
      </flexbox>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click="closeClick">取 消</el-button>
      <el-button
        type="primary"
        @click="sureClick">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  crmAchievementAdd
} from '@/api/admin/crm'

import XhStructureCell from '@/components/CreateCom/XhStructureCell'
import XhUserCell from '@/components/CreateCom/XhUserCell'

import moment from 'moment'
import { floatAdd } from '@/utils'

export default {
  // 新建目标
  name: 'AddGoal',
  components: {
    XhStructureCell,
    XhUserCell
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // department user
    type: String
  },
  data() {
    return {
      loading: false,

      typeSelect: 1,
      dateSelect: '',
      selectDepOrUser: [],
      totalGoal: '0',

      quarterList: []
    }
  },
  computed: {
    rangeLabel() {
      return this.type === 'user' ? '考核人员' : '考核部门'
    }
  },
  watch: {
    visible(value) {
      if (value) {
        this.resetData()
      }
    }
  },
  mounted() {
  },

  beforeDestroy() {},
  methods: {
    /**
     * 部门选择
     */
    structureChange(data) {
      this.selectDepOrUser = data.value || []
    },

    /**
     * 员工
     */
    userChange(data) {
      this.selectDepOrUser = data.value || []
    },

    /**
     * 确定
     */
    sureClick() {
      if (!this.selectDepOrUser.length) {
        this.$message.error(`请选择考核${this.type == 'user' ? '员工' : '部门'}`)
      } else {
        const params = {
          type: this.type == 'user' ? 3 : 2, // 2 部门 3 员工
          year: this.dateSelect,
          status: this.typeSelect
        }

        for (let index = 0; index < this.quarterList.length; index++) {
          const element = this.quarterList[index]
          params[this.getUploadKey(index, 0)] = element.first
          params[this.getUploadKey(index, 1)] = element.second
          params[this.getUploadKey(index, 2)] = element.third
        }

        if (this.type == 'user') {
          params.objIds = this.selectDepOrUser.map(item => {
            return item.userId
          })
        } else {
          params.objIds = this.selectDepOrUser.map(item => {
            return item.id
          })
        }

        this.loading = true
        crmAchievementAdd(params).then(res => {
          this.loading = false
          this.$message.success('操作成功')
          this.$emit('success')
          this.closeClick()
        }).catch(() => {
          this.loading = false
        })
      }
    },

    /**
     * 输入
     */
    inputChange(type, item, key) {
      if (type == 'total') {
        if (!this.totalGoal) {
          this.totalGoal = '0'
        } else {
          this.totalGoal = this.totalGoal.replace(
            /^(\-)*(\d+)\.(\d\d).*$/,
            '$1$2.$3'
          )
        }
      } else {
        if (!item[key]) {
          item[key] = '0'
        } else {
          item[key] = item[key].replace(
            /^(\-)*(\d+)\.(\d\d).*$/,
            '$1$2.$3'
          )
        }
      }
    },

    /**
     * 输入失去焦点
     */
    inputBlur(index) {
      const item = this.quarterList[index]
      item.all = (parseFloat(item.first) + parseFloat(item.second) + parseFloat(item.third)).toFixed(2)

      let totalGoal = 0
      for (let index = 0; index < this.quarterList.length; index++) {
        const item = this.quarterList[index]
        totalGoal += parseFloat(item.all)
      }

      if (totalGoal) {
        this.totalGoal = totalGoal.toFixed(2)
      } else {
        this.totalGoal = 0
      }
    },

    /**
     * 平均
     */
    averageClick() {
      const averageValue = this.totalGoal ? ((this.totalGoal / 12) + 0.001).toFixed(2) : 0
      const allValue = averageValue * 12
      for (let index = 0; index < this.quarterList.length; index++) {
        const element = this.quarterList[index]
        element.first = averageValue
        element.second = averageValue
        element.third = averageValue
        element.all = (averageValue * 3).toFixed(2)
        if (index == this.quarterList.length - 1 && allValue != this.totalGoal) {
          element.third = (this.totalGoal - (averageValue * 11)).toFixed(2)
          element.all = floatAdd(floatAdd(element.first, element.second), element.third)
        }
      }
    },

    /**
     * 获取设置label
     */
    getSetLabe(index, type) {
      return [['1月份', '2月份', '3月份'],
        ['4月份', '5月份', '6月份'],
        ['7月份', '8月份', '9月份'],
        ['10月份', '11月份', '12月份']][index][type]
    },

    getUploadKey(index, type) {
      return [['january', 'february', 'march'],
        ['april', 'may', 'june'],
        ['july', 'august', 'september'],
        ['october', 'november', 'december']][index][type]
    },

    /**
     * 关闭
     */
    closeClick() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    /**
     * 重置数据
     */
    resetData() {
      this.typeSelect = 1
      this.dateSelect = moment()
        .year()
        .toString()
      this.selectDepOrUser = []
      this.totalGoal = '0'

      this.quarterList = [
        {
          title: '第一季度',
          all: 0,
          first: 0,
          second: 0,
          third: 0
        },
        {
          title: '第二季度',
          all: 0,
          first: 0,
          second: 0,
          third: 0
        },
        {
          title: '第三季度',
          all: 0,
          first: 0,
          second: 0,
          third: 0
        },
        {
          title: '第四季度',
          all: 0,
          first: 0,
          second: 0,
          third: 0
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.add-goal {
  padding: 15px 0;
  &__handle {
    text-align: center;
    font-size: 14px;
    color: #333;
    padding: 10px 0;
    border-top: 1px solid $xr-border-line-color;

    .el-date-editor {
      width: 95px;
    }

    .total-input {
      width: 120px;
      /deep/ .el-input__inner {
        text-align: right;
      }
    }

    .handle-label {
      margin: 0 5px;
    }

    .el-button {
      margin-left: 30px;
    }
  }

  &__set {
    border-top: 1px solid $xr-border-line-color;
    padding: 8px 15px;
  }
}

// 筛选信息
.select-wrapper {
  font-size: 14px;
  color: #333;
  padding: 0 15px 15px;
}

.select-item + .select-item {
  margin-left: 30px !important;
}

.select-label {
  margin-right: 20px;
  flex-shrink: 0;
}

.select-condition {
  width: 280px;
}

// 设置信息
.set-item {
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
  font-size: 12px;

  /deep/ .el-input__inner {
    text-align: right;
  }

  &__hd {
    padding: 8px;
    p {
      font-weight: 600;
      margin-bottom: 5px;
    }
    padding-bottom: 10px;
    border-bottom: 1px solid $xr-border-line-color;
  }

  &__bd {
    padding: 8px;

    .set-item-wrapper {
      padding: 5px 0;
      .set-item__label {
        margin-right: 5px;
      }

      .set-item__input {
        width: 115px;

      }
    }
  }
}

.set-item + .set-item {
  margin-left: 15px !important;
}
</style>
