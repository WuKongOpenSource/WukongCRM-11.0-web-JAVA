<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <transition name="opacity-fade">
    <div
      v-loading="loading"
      :style="{ 'z-index': zIndex }"
      class="crv">
      <el-card v-if="detailData" class="crv-con">
        <div class="crv-header">
          绩效结果确认
          <div class="crv-header__ft">
            <el-button
              :disabled="detailData.waitingNum !== 0 && !canHandle"
              type="primary" @click="submitClick">确认通过</el-button>
            <el-button @click="closeClick">关闭</el-button>
          </div>
        </div>
        <div class="crv-body">
          <div class="crv-des">共{{ detailData.totalNum }}人，待确认{{ detailData.waitingNum }}人</div>
          <div class="crv-list">
            <div
              v-for="(level, lIndex) in detailData.levelDetailInfos"
              :key="lIndex"
              class="crv-list-item">
              <div class="list__header">
                <span class="label-level">{{ level.levelName }}</span><span class="label-num">（{{ level.actualNum }}人）</span>
                <div class="label-des">范围：{{ level.minNum }}-{{ level.maxNum }}%  现状：{{ level.actualWeight }}%</div>
              </div>
              <div class="list__body">
                <flexbox
                  v-for="(employee, eIndex) in level.employees"
                  :key="eIndex"
                  class="list-item">
                  <div class="list-item__body">
                    <div class="can-visit--underline" @click="checkEmployeeDetail(employee)">{{ employee.employeeName }}（{{ employee.score }}分）</div>
                    <el-tooltip :content="`${employee.deptName == null ? '' : employee.deptName}  ${employee.post == null ? '' : employee.post}`" effect="dark" placement="top">
                      <div class="des">{{ `${employee.deptName == null ? '' : employee.deptName}  ${employee.post == null ? '' : employee.post}` }}</div>
                    </el-tooltip>
                  </div>
                  <i class="wk wk-edit" @click="editScoreClick(employee)" />
                </flexbox>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <employee-confirm-performance
        v-if="detailShow"
        :id="rowId"
        handle-type="evaluato-view"
        @change="getDetail"
        @close="detailShow = false"
      />

      <score-edit-dialog
        :visible.sync="scoreEditShow"
        :detail="editData"
        :full-score="detailData ? detailData.fullScore : 0"
        @change="getDetail"
      />
    </div>
  </transition>
</template>
<script type="text/javascript">
import {
  hrmPerformanceEmployeeQueryResultConfirmAPI,
  hrmPerformanceEmployeeResultConfirmAPI
} from '@/api/hrm/selfService/performance'

import EmployeeConfirmPerformance from './EmployeeConfirmPerformance'
import ScoreEditDialog from './ScoreEditDialog'

import { getMaxIndex, objDeepCopy } from '@/utils'

export default {
  name: 'ConfirmResultView',
  components: {
    EmployeeConfirmPerformance,
    ScoreEditDialog
  },
  props: {
    id: [String, Number]
  },
  data() {
    return {
      loading: false,
      zIndex: getMaxIndex(),
      detailData: null,
      // 详情展示
      rowId: '',
      detailShow: false,
      editData: {},
      scoreEditShow: false
    }
  },
  computed: {
    canHandle() {
      if (this.detailData) {
        // 开启强制分布 但 不在范围内 禁止点击
        if (this.detailData.isForce == 1 && this.detailData.hasInRange != 1) {
          return false
        }
        return true
      }
      return false
    }
  },
  watch: {
    id: {
      handler(val) {
        if (val) {
          this.detailData = null
          this.getDetail()
        }
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    /**
     * 详情
     */
    getDetail() {
      this.loading = true
      hrmPerformanceEmployeeQueryResultConfirmAPI(this.id)
        .then(res => {
          const data = res.data || {}
          this.detailData = objDeepCopy(data)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },

    submitClick() {
      let message = '确定要确认通过吗？'
      if (this.detailData.hasInRange == 0) {
        message = '等级分布不符合规定比例，确定通过吗？'
      }
      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          hrmPerformanceEmployeeResultConfirmAPI(this.id)
            .then(res => {
              this.$message.success('操作成功')
              this.$emit('change')
              this.closeClick()
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
    },

    checkEmployeeDetail(employee) {
      this.rowId = employee.employeeAppraisalId
      this.detailShow = true
    },

    editScoreClick(data) {
      this.editData = data
      this.scoreEditShow = true
    },


    /**
     * 关闭
     */
    closeClick() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
.opacity-fade-enter-active,
.opacity-fade-leave-active {
  transition: all 0.2s;
}
.opacity-fade-enter,
.opacity-fade-leave-to {
  opacity: 0;
}
/** 容器布局 */
.crv {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  padding: 40px 0px;
  background-color: #F5F6F9;

  &-con {
    height: 100%;
    margin: 0 auto;
    padding: 15px;
    width: 80%;
    background-color: white;
    /deep/ .el-card__body {
      height: 100%;
    }
  }

  &-header {
    height: 50px;
    line-height: 50px;
    font-weight: bold;
    font-size: 24px;
    &__ft {
      float: right;
    }
  }

  &-des {
    color: #999999;
    padding:  10px 0;
  }

  &-list {
    height: calc(100% - 36px);
    position: relative;
    overflow-y: hidden;
    overflow-x: auto;
    white-space: nowrap;


    &-item {
      display: inline-block;
      width: 250px;
      height: 100%;
      border: 1px solid #E6E6E6;
      border-radius: 4px;
      overflow: hidden;
      vertical-align:top;

      .list__header {
        padding: 15px 15px 0;
        color: #333;
        height: 60px;
        .label-level {
          font-weight: bold;
        }

        .label-num {
          font-size: 13px;
        }

        .label-des {
          color: #999;
          margin-top: 8px;
          font-size: 12px;
        }
      }

      .list__body {
        height: calc(100% - 65px);
        overflow-y: auto;
        padding: 15px;

        .list-item {
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          padding: 15px;
          border-radius: 4px;

          &__body {
            flex: 1;
          }

          .des {
            margin-top: 8px;
            font-size: 12px;
            color: #666;
            overflow: hidden;
            max-width: 150px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .wk-edit {
            flex-shrink: 0;
            padding: 8px;
            color: #2362FB;
            cursor: pointer;
          }
        }

        .list-item + .list-item {
          margin-top: 15px;
        }
      }
    }

    &-item + &-item {
      margin-left: 20px;
    }
  }

  &-body {
    min-width: 900px;
    margin: 0 auto;
    height: calc(100% - 50px);
  }

}

</style>
