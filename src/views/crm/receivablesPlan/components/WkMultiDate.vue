<template>
  <el-popover
    v-model="show"
    :visible-arrow="false"
    placement="bottom"
    width="250"
    trigger="click"
    popper-class="no-padding-popover">
    <v-calendar
      :attributes="attributes"
      color="#2362FB"
      @dayclick="onDayClick" />
    <div slot="reference" class="el-select wk-multi-date el-input__inner" style="width: auto;">
      <div
        class="el-select__tags"
        style="width: 100%; width: 300px;">
        <span>
          <span
            v-for="(item, index) in value"
            :key="index"
            class="el-tag el-tag--info el-tag--small el-tag--light">
            <span class="el-select__tags-text">{{ item }}</span>
            <i class="el-tag__close el-icon-close" @click.stop="deleteItem(item, index)"/>
          </span>
        </span>
      </div>
      <span class="el-input__suffix">
        <span class="el-input__suffix-inner">
          <i :class="{'is-reverse': show}" class="el-select__caret el-input__icon el-icon-arrow-up"/>
        </span>
      </span>
    </div>
  </el-popover>
</template>

<script>
import VCalendar from 'v-calendar/lib/components/calendar.umd'

import moment from 'moment'

export default {
  // 多选时间
  name: 'WkMultiDate',

  components: {
    VCalendar
  },

  props: {
    value: Array
  },

  data() {
    return {
      show: false,
      days: []
    }
  },

  computed: {
    dates() {
      return this.days.map(day => day.date)
    },
    attributes() {
      return this.dates.map(date => ({
        highlight: {
          fillMode: 'solid',
          contentClass: 'v-calendar-select'
        },
        dates: date
      }))
    }
  },

  watch: {
    dates() {
      const value = this.dates.map(date => moment(date).format('YYYY-MM-DD'))
      this.$emit('input', value)
      this.$emit('change', value)
    }
  },

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 选择
     */
    onDayClick(day) {
      const idx = this.days.findIndex(d => d.id === day.id)
      if (idx >= 0) {
        this.days.splice(idx, 1)
      } else {
        this.days.push({
          id: day.id,
          date: day.date
        })
      }
    },

    /**
     * 删除
     */
    deleteItem(item, index) {
      this.days.splice(index, 1)
    }
  }
}
</script>

<style lang="scss">
.v-calendar-select {
  background-color: $xr-color-primary !important;
}
</style>
<style lang="scss" scoped>
.wk-multi-date {
  height: auto;
  min-height: 30px;
  cursor: pointer;
  .el-select__tags {
    position: relative;
    top: unset;
    transform: unset;
    padding-right: 30px;
  }
  .el-select__caret {
    color: #c0c4cc;
    font-size: 14px;
    transition: transform .3s;
    transform: rotate(180deg);
    cursor: pointer;
  }
  .el-select__caret.is-reverse {
    transform: rotate(0deg);
  }
  .el-input__icon {
    line-height: 30px;
  }
}
</style>
