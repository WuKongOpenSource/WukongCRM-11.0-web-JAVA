<template>
  <div class="schedule-calendar">
    <div>
      <Calendar
        ref="calendar"
        :mark-date-more="scheduleList"
        v-bind="$attrs"
        v-on="$listeners"
        @changeMonth="changeMonth"/>
    </div>
  </div>
</template>

<script>
import Calendar from 'vue-calendar-component'
import { canlendarQueryListStatusAPI } from '@/api/calendar'
export default {
  name: 'Schedule',
  components: {
    Calendar
  },
  props: {
    activeTime: {
      type: Object,
      default: () => {
        return {}
      }
    },
    listDataType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 日历事件
      scheduleList: [],
      currentMonthDate: new Date()
    }
  },
  watch: {
  },
  mounted() {
    this.selectDay(new Date(), true)
  },
  methods: {
    /**
     * 切换月份
     */
    changeMonth(val) {
      this.currentMonthDate = new Date(val)
      this.$emit('changeMonth', this.currentMonthDate)
    },

    /**
     * 切换某天
     */
    selectDay(date) {
      this.$refs.calendar.ChoseMonth(date, true)
    },

    /**
     * 切换某月
     */
    selectMouth(date) {
      this.$refs.calendar.ChoseMonth(date)
    },

    /**
     * 获取标注
     */
    getDateList(data) {
      this.scheduleList = []
      canlendarQueryListStatusAPI(data).then(res => {
        res.data.forEach(element => {
          this.scheduleList.push({
            date: element,
            className: 'mark1'
          })
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.schedule-calendar {
  padding: 0px 10px 0px;
  .title {
    height: 44px;
    line-height: 44px;
    border-bottom: 1px solid #e6e6e6;
    .rt {
      color: #2362FB;
      margin-right: 0;
      cursor: pointer;
      .el-icon-plus {
        font-weight: 700;
      }
    }
  }
  .list {
    color: #999;
    padding: 10px 11%;
    font-size: 13px;
    cursor: pointer;
    .list-title {
      margin-bottom: 5px;
    }
    .time {
      margin-right: 10px;
      font-size: 12px;
    }
  }
  .see-more {
    color: #999;
    text-align: center;
    cursor: pointer;
  }
}
.schedule-calendar /deep/ .wh_container {
  max-width: max-content;
  .wh_content_all {
    background: #fff;
    padding-bottom: 0px;
    .wh_top_changge {
      text-align: center;
      display: block;
      margin: 15px 0 10px;
      li {
        color: #2362FB;
        display: inline-block;
        height: 13px;
        .wh_jiantou1,
        .wh_jiantou2 {
          border-color: #333;
          width: 8px;
          height: 8px;
          margin-left: 25px;
          margin-top: 4px;
          border-width: 1px;
        }
        .wh_jiantou1{
          margin-left: 0px;
          margin-right: 28px;
          margin-top: 4px;
        }
      }
      .wh_content_li {
        margin: 0 30px;
        font-weight: 700;
        font-size: 16px;
        color: #333;
      }
    }
    .wh_content {
      padding: 0px;
      width: 105%;
      .wh_content_item {
        color: #333;
        font-size: 12px;
        margin-top: 3px;
        height: 36px;
        position: relative;
        .wh_top_tag {
          color: #333;
        }
        .wh_item_date {
          background: transparent;
          width: 30px;
          height: 30px;
        }
        .wh_item_date:hover {
          background: transparent;
          color: #2362FB;
        }
        .wh_isToday,
        .wh_isToday:hover {
          background: #fcf8e3;
          border-radius: 30px;
          color: #333;
        }
        .wh_chose_day,
        .wh_chose_day:hover {
          background: #2362FB;
          border-radius: 40px;
          color: #fff;
        }
        .mark1:after {
          content: ' ';
          background-color: #2362FB;
          width: 5px;
          height: 5px;
          position: absolute;
          bottom: 0;
          border-radius: 50%;
        }
      }
    }
  }
}
</style>
