<template>
  <div v-loading="loading">
    <div class="content-title">
      <span>日志规则设置</span>
      <el-tooltip
        content="您可以配置日志规则，在日志模块可以根据日志规则来统计日志完成情况"
        effect="dark"
        placement="top">
        <i class="wk wk-help wk-help-tips"/>
      </el-tooltip>
      <el-button
        type="primary"
        class="rt"
        size="medium"
        @click="save">保存</el-button>
    </div>
    <div class="content-body">
      <create-sections title="日报规则">
        <div slot="header" :class="{ 'is-inactive': dayForm.status == 0}" class="rule-set">
          <el-switch
            v-model="dayForm.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#2362FB"/>
          <span class="label">已启用规则</span>
        </div>

        <el-form ref="dayForm" :model="dayForm" label-width="120px">
          <el-form-item>
            <template slot="label">
              <span>谁需要提交</span>
              <el-tooltip
                content="默认全部员工"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <wk-user-select
              v-model="dayForm.memberUserId"
              :radio="false"
              style="width: 100%;"/>
          </el-form-item>

          <el-form-item label="需要统计的日志">
            <el-checkbox-group v-model="dayForm.effectiveDay">
              <el-checkbox v-for="item in weekDaysOptions" :label="item.value" :key="item.value">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="开始提交时间">
            <el-select v-model="dayForm.startTime" >
              <el-option
                v-for="item in dayTimeOptions"
                :key="item"
                :label="item"
                :value="item"/>
            </el-select>
          </el-form-item>

          <el-form-item label="结束提交时间">
            <el-select v-model="dayForm.endTime" >
              <el-option
                v-for="item in dayTimeOptions"
                :key="item"
                :label="item"
                :value="item"/>
            </el-select>
          </el-form-item>


        </el-form>
      </create-sections>
      <create-sections title="周报规则">
        <div slot="header" :class="{ 'is-inactive': weekForm.status == 0}" class="rule-set">
          <el-switch
            v-model="weekForm.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#2362FB"/>
          <span class="label">已启用规则</span>
        </div>
        <el-form ref="weekForm" :model="weekForm" label-width="120px">
          <el-form-item>
            <template slot="label">
              <span>谁需要提交</span>
              <el-tooltip
                content="默认全部员工"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <wk-user-select
              v-model="weekForm.memberUserId"
              :radio="false"
              style="width: 100%;"/>
          </el-form-item>

          <el-form-item>
            <template slot="label">
              <span>开始提交时间</span>
              <el-tooltip
                content="开始时间为选择时间的00:00"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <el-select v-model="weekForm.startDay" >
              <el-option
                v-for="item in weekDaysOptions"
                :key="item.value"
                :label="`每${item.label}`"
                :value="parseInt(item.value)"/>
            </el-select>
          </el-form-item>

          <el-form-item>
            <template slot="label">
              <span>结束提交时间</span>
              <el-tooltip
                content="截止时间为选择时间的24:00"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <el-select v-model="weekForm.endDay" >
              <el-option
                v-for="item in weekDaysOptions"
                :key="item.value"
                :label="`每${item.label}`"
                :value="parseInt(item.value)"/>
            </el-select>
          </el-form-item>


        </el-form>
      </create-sections>
      <create-sections title="月报规则">
        <div slot="header" :class="{ 'is-inactive': monthForm.status == 0}" class="rule-set">
          <el-switch
            v-model="monthForm.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#2362FB"/>
          <span class="label">已启用规则</span>
        </div>
        <el-form ref="monthForm" :model="monthForm" label-width="120px">
          <el-form-item>
            <template slot="label">
              <span>谁需要提交</span>
              <el-tooltip
                content="默认全部员工"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <wk-user-select
              v-model="monthForm.memberUserId"
              :radio="false"
              style="width: 100%;"/>
          </el-form-item>

          <el-form-item>
            <template slot="label">
              <span>开始提交时间</span>
              <el-tooltip
                content="开始时间为选择时间的00:00"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <el-select v-model="monthForm.startDay" >
              <el-option
                v-for="item in monthTimeOptions"
                :key="item.value"
                :label="`${item.label}`"
                :value="item.value"/>
            </el-select>
          </el-form-item>

          <el-form-item>
            <template slot="label">
              <span>结束提交时间</span>
              <el-tooltip
                content="截止时间为选择时间的24:00"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <el-select v-model="monthForm.endDay" >
              <el-option
                v-for="item in monthTimeOptions"
                :key="item.value"
                :label="`${item.label}`"
                :value="item.value"/>
            </el-select>
          </el-form-item>


        </el-form>
      </create-sections>
    </div>
  </div>
</template>

<script>
import {
  oaLogRuleSetAPI,
  oaLogRuleQueryAPI
} from '@/api/admin/other'

import CreateSections from '@/components/CreateSections'
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import { objDeepCopy } from '@/utils'


export default {
  name: 'LogRuleSet', // 日志规则设置

  components: {
    CreateSections,
    WkUserSelect
  },

  data() {
    return {
      loading: false, // 展示加载中效果

      weekDaysOptions: [
        {
          label: '周一',
          value: '1'
        },
        {
          label: '周二',
          value: '2'
        },
        {
          label: '周三',
          value: '3'
        },
        {
          label: '周四',
          value: '4'
        },
        {
          label: '周五',
          value: '5'
        },
        {
          label: '周六',
          value: '6'
        },
        {
          label: '周日',
          value: '7'
        }
      ],
      dayTimeOptions: [],
      monthTimeOptions: [],
      dayForm: {
        effectiveDay: ['1', '2', '3', '4', '5'],
        memberUserId: []
      },
      weekForm: {
        memberUserId: []
      },
      monthForm: {
        memberUserId: []
      }
    }
  },

  created() {
    for (let index = 7; index <= 23; index++) {
      this.dayTimeOptions.push(index < 10 ? `0${index}:00` : `${index}:00`)
    }

    for (let index = 1; index <= 31; index++) {
      this.monthTimeOptions.push({
        label: `每月${index}号`,
        value: index
      })
    }
    this.getDetail()
  },

  methods: {
    /**
     * 获取详情
     */
    getDetail() {
      this.loading = true
      oaLogRuleQueryAPI()
        .then(res => {
          this.loading = false
          const dayData = res.data[0] || {}
          this.dayForm = {
            type: dayData.type,
            status: dayData.status,
            ruleId: dayData.ruleId,
            memberUserId: (dayData.memberUser || []).map(item => item.userId),
            effectiveDay: dayData.effectiveDay ? dayData.effectiveDay.split(',') : [],
            startTime: dayData.startTime,
            endTime: dayData.endTime
          }
          const weekData = res.data[1] || {}
          this.weekForm = {
            type: weekData.type,
            status: weekData.status,
            ruleId: weekData.ruleId,
            memberUserId: (weekData.memberUser || []).map(item => item.userId),
            startDay: weekData.startDay,
            endDay: weekData.endDay
          }
          const monthData = res.data[2] || {}
          this.monthForm = {
            type: monthData.type,
            status: monthData.status,
            ruleId: monthData.ruleId,
            memberUserId: (monthData.memberUser || []).map(item => item.userId),
            startDay: monthData.startDay,
            endDay: monthData.endDay
          }
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 保存操作
     */
    save() {
      if (this.dayForm.status == 1) {
        for (const key in this.dayForm) {
          const value = this.dayForm[key]
          // if (key == 'memberUser' && value.length == 0) {
          //   this.$message.error('请选择日报谁需要提交')
          //   return
          // } else
          if (key == 'weekDaysOptions' && value.length == 0) {
            this.$message.error('请选择需要统计的日志')
            return
          } else if ((key == 'startTime' || key == 'endTime') && !value) {
            this.$message.error('请选择日报规则时间')
            return
          }
        }
      }

      if (this.weekForm.status == 1) {
        for (const key in this.weekForm) {
          const value = this.weekForm[key]
          // if (key == 'memberUser' && value.length == 0) {
          //   this.$message.error('请选择谁需要提交')
          //   return
          // } else
          if ((key == 'startDay' || key == 'endDay') && !value) {
            this.$message.error('请选择周报规则时间')
            return
          }
        }
      }

      if (this.monthForm.status == 1) {
        for (const key in this.monthForm) {
          const value = this.monthForm[key]
          // if (key == 'memberUser' && value.length == 0) {
          //   this.$message.error('请选择谁需要提交')
          //   return
          // } else
          if ((key == 'startDay' || key == 'endDay') && !value) {
            this.$message.error('请选择月报规则时间')
            return
          }
        }
      }

      this.loading = true
      const dayForm = objDeepCopy(this.dayForm)
      dayForm.memberUserId = dayForm.memberUserId.join(',')
      dayForm.effectiveDay = dayForm.effectiveDay.join(',')

      const weekForm = objDeepCopy(this.weekForm)
      weekForm.memberUserId = weekForm.memberUserId.join(',')
      const monthForm = objDeepCopy(this.monthForm)
      monthForm.memberUserId = monthForm.memberUserId.join(',')

      oaLogRuleSetAPI([dayForm, weekForm, monthForm])
        .then(res => {
          this.loading = false
          this.getDetail()
          this.$message.success('操作成功')
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.content-title {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.content-title > span {
  display: inline-block;
  height: 36px;
  line-height: 36px;
  margin-left: 20px;
}

.content-body {
  height: calc(100% - 60px);
  padding: 15px 15px 30px;
  overflow-y: auto;
}

.el-form-item {
  margin-bottom: 10px;
}

.el-form {
  margin-top: 15px;
  width: 80%;
}

.user-container {
  width: 200px;
}

.rule-set {
  margin-left: 8px;

  &.is-inactive {
    color: #E2E2E2;
  }

  .label {
    font-size: 13px;
  }
}
</style>
