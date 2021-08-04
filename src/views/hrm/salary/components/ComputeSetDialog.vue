<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <el-dialog
    ref="wkDialog"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :title="title"
    width="500px"
    @close="handleCancel">
    <div class="form-add-dialog-body">
      <div>计薪人员：{{ number }}人</div>
      <flexbox class="row">
        <div class="row-mark"/>
        <div class="row-label">同步社保数据</div>
        <el-switch
          v-model="form.isSyncInsuranceData"/>
      </flexbox>
      <flexbox class="row">
        <div class="row-mark"/>
        <div class="row-label">考勤数据<el-button
          class="row-btn"
          type="text"
          @click="downloadTemp('attendance')">下载考勤导入模板</el-button></div>
        <wk-file-select
          @change="fileSelect(arguments[0],arguments[1], 'attendance')">
          <el-button class="row-btn" type="text">{{ getAttendanceBtnName() }}</el-button>
        </wk-file-select>
      </flexbox>
      <div class="row">
        <flexbox>
          <div class="row-mark"/>
          <div class="row-label">录入个税扣缴信息（非累计预扣法可跳过此步骤）</div>
        </flexbox>
        <flexbox class="row-children">
          <div class="row-label">专项附加扣除累计<el-button
            class="row-btn"
            type="text"
            @click="downloadTemp('additional')">下载导入模板</el-button></div>
          <wk-file-select
            @change="fileSelect(arguments[0],arguments[1], 'additional')">
            <el-button class="row-btn" type="text">{{ getAdditionalBtnName() }}</el-button>
          </wk-file-select>
        </flexbox>
        <flexbox class="row-children">
          <div class="row-label">截止上月个税累计<el-button
            class="row-btn"
            type="text"
            @click="downloadTemp('lastMonth')">下载导入模板</el-button></div>
          <wk-file-select
            @change="fileSelect(arguments[0],arguments[1], 'lastMonth')">
            <el-button class="row-btn" type="text">{{ getLastMonthBtnName() }}</el-button>
          </wk-file-select>
        </flexbox>
      </div>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="handleCancel">取消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">保存</el-button>
    </span>

  </el-dialog>
</template>

<script>
import {
  hrmSalaryMonthRecordComputeAPI,
  hrmSalaryMonthRecordNumAPI,
  hrmSalaryDownloadAttendanceTempAPI,
  hrmSalaryDownCumulativeOfLastMonthTempAPI,
  hrmSalaryDownAdditionalTempAPI
} from '@/api/hrm/salary'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'
import WkFileSelect from '@/components/NewCom/WkFile/Select'

import { downloadExcelWithResData, verifyFileTypeWithFileName } from '@/utils'

export default {
  // 核算工资
  name: 'ComputeSetDialog',
  components: {
    WkFileSelect
  },
  mixins: [ElDialogLoadingMixin],
  props: {
    // 最新信息 包含 srecordId
    lastData: Object,
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      title: '核算工资',
      number: 0,
      form: {},
      file: null,
      lastMonthFile: null,
      additionalFile: null
    }
  },
  computed: {
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.number = 0
          this.file = null
          this.lastMonthFile = null
          this.additionalFile = null
          this.form = { isSyncInsuranceData: true }
          this.getNum()
        }
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {

    /**
     * 取消选择
     */
    handleCancel() {
      this.$emit('update:visible', false)
    },

    getNum() {
      // 0 未计薪 1 计薪
      hrmSalaryMonthRecordNumAPI(1)
        .then(res => {
          this.number = res.data || 0
        })
        .catch(() => {
        })
    },

    getAttendanceBtnName() {
      return this.file ? this.file.name : '导入考勤数据'
    },

    getLastMonthBtnName() {
      return this.lastMonthFile ? this.lastMonthFile.name : '导入截止上月个税累计'
    },

    getAdditionalBtnName() {
      return this.additionalFile ? this.additionalFile.name : '导入专项附加扣除累计'
    },

    /**
     * 附件操作
     */
    fileSelect(files, event, type) {
      if (files.length) {
        const file = files[0]
        if (verifyFileTypeWithFileName(file.name)) {
          if (type === 'attendance') {
            this.file = file
          } else if (type === 'additional') {
            this.additionalFile = file
          } else if (type === 'lastMonth') {
            this.lastMonthFile = file
          }
        }
      }
      event.target.value = ''
    },

    /**
     * 下载模板操作
     */
    downloadTemp(type) {
      const request = {
        attendance: hrmSalaryDownloadAttendanceTempAPI,
        additional: hrmSalaryDownAdditionalTempAPI,
        lastMonth: hrmSalaryDownCumulativeOfLastMonthTempAPI
      }[type]
      request()
        .then(res => {
          downloadExcelWithResData(res)
        })
        .catch(() => {})
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      this.loading = true

      if (this.file) {
        this.form.attendanceFile = this.file
      }

      if (this.lastMonthFile) {
        this.form.cumulativeTaxOfLastMonthFile = this.lastMonthFile
      }

      if (this.additionalFile) {
        this.form.additionalDeductionFile = this.additionalFile
      }

      this.form.srecordId = this.lastData.srecordId
      hrmSalaryMonthRecordComputeAPI(this.form)
        .then(res => {
          this.$message.success('操作成功')
          this.$emit('change')
          this.handleCancel()
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.form-add-dialog-body {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 55vh;
  .row {
    position: relative;
    margin-top: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e6e6e6;
    &-mark {
      height: 14px;
      width: 4px;
      border-radius: 2px;
      background-color: $xr-color-primary;
    }

    &-label {
      padding: 0 15px;
      flex: 1;
    }

    &-btn {
      padding: 0 15px;
      flex: 1;
    }

    &-children {
      margin-top: 8px;
      padding-left: 3px;
      font-size: 13px;
    }

    .wk-file-select {
      max-width: 120px;
    }
  }
}
</style>
