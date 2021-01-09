<template>
  <el-dialog
    ref="wkDialog"
    :title="businessTitle"
    :visible.sync="businessDialogVisible"
    :before-close="businessClose"
    :close-on-click-modal="false"
    width="600px">
    <div class="business-list">
      <div class="business-label">商机组名称</div>
      <el-input
        :maxlength="20"
        v-model="name"
        style="width: 60%;"/>
    </div>
    <div class="business-list">
      <div class="business-label">应用部门</div>
      <el-select
        v-model="businessDep"
        multiple
        style="width: 60%;">
        <el-option
          v-for="item in optionsDep"
          :key="item.id"
          :label="item.label"
          :value="item.id"/>
      </el-select>
      <div class="business-des">默认全公司</div>
    </div>
    <div class="business-setting">
      <div>阶段设置</div>
      <div class="business-setting-content">
        <div class="business-setting-table-header">
          <span>阶段</span>
          <span>阶段名称</span>
          <span>赢单率</span>
        </div>
        <div class="business-setting-table-body">
          <div
            v-for="(item, index) in settingList"
            :key="index"
            class="business-setting-table">
            <span>{{ '阶段' + (index+1) }}</span>
            <span>
              <el-input
                :maxlength="20"
                v-model="item.name"
                size="mini"/>
            </span>
            <span class="icon-span">
              <el-input-number
                v-model="item.rate"
                :controls="false"
                :min="0"
                :max="100"
                step-strictly/> %
              <span class="icon-box">
                <span
                  class="el-icon-circle-plus"
                  @click="addIcon"/>
                <span
                  v-if="index != 0"
                  class="el-icon-remove"
                  @click="removeIcon(index)"/>
              </span>
            </span>
          </div>
          <div class="business-setting-table">
            <span>结束</span>
            <span>赢单</span>
            <span>{{ winSingle }} %</span>
          </div>
          <div class="business-setting-table">
            <span>结束</span>
            <span>输单</span>
            <span>{{ loseSingle }} %</span>
          </div>
          <div class="business-setting-table">
            <span>结束</span>
            <span>无效</span>
            <span>{{ invalidSingle }} %</span>
          </div>
        </div>
      </div>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button
        v-debounce="businessSubmit"
        type="primary">确 定</el-button>
      <el-button @click="businessClose">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { depListAPI } from '@/api/common'
import {
  businessGroupAddAPI,
  businessGroupUpdateAPI
} from '@/api/admin/crm'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'
import { isEmpty } from '@/utils/types'

export default {
  mixins: [ElDialogLoadingMixin],
  props: {
    businessDialogVisible: Boolean,
    businessTitle: String,
    /** 编辑时候传递进来的信息 */
    infoData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      loading: false,
      optionsDep: [],
      businessDep: [],
      settingList: [],
      name: '',
      // 赢单
      winSingle: 100,
      loseSingle: 0,
      invalidSingle: 0
    }
  },
  watch: {
    infoData: function(val) {
      this.name = val.name
      this.businessDep = val.businessDep.map((item, index) => {
        return item.id
      })
      this.settingList = val.settingList
      if (!this.settingList || this.settingList.length == 0) {
        this.settingList = [{ name: '', rate: '' }]
      }
    }
  },
  mounted() {
    depListAPI().then(res => {
      this.optionsDep = res.data
    })
  },
  methods: {
    businessClose() {
      this.$emit('businessClose')
    },
    businessSubmit() {
      if (!this.name) {
        this.$message.error('请填写商机组名称')
      } else if (!this.businessDep) {
        this.$message.error('请关联应用部门')
      } else {
        var pass = true
        for (let index = 0; index < this.settingList.length; index++) {
          const item = this.settingList[index]
          if (isEmpty(item.name) || isEmpty(item.rate)) {
            pass = false
            this.$message.error('请完善阶段信息')
            break
          }
        }
        if (pass) {
          this.loading = true
          let request = null
          const params = {
            crmBusinessType: {
              name: this.name,
              typeId: this.infoData.typeId || null
            },
            deptIds: this.businessDep,
            crmBusinessStatus: this.settingList
          }
          if (this.businessTitle == '添加商机组') {
            request = businessGroupAddAPI
          } else {
            request = businessGroupUpdateAPI
          }
          request(params)
            .then(res => {
              this.$message.success('操作成功')
              this.$emit('businessSubmit')
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        }
      }
    },
    // 增加
    addIcon() {
      this.settingList.push({ name: '', rate: '' })
    },
    // 删除
    removeIcon(val) {
      this.settingList.splice(val, 1)
    }
  }
}
</script>

<style scoped>
.business-list {
  margin-bottom: 15px;
}
.business-label {
  display: inline-block;
  width: 100px;
}
.business-des {
  display: inline-block;
  color: #999;
  font-size: 12px;
  width: 60px;
}
.business-setting-content {
  border: 1px solid #e6e6e6;
  margin-top: 10px;
}
.business-setting-table-header {
  background: #f5f5f5;
}
.business-setting-table,
.business-setting-table-header {
  display: flex;
  text-align: center;
  height: 50px;
  line-height: 50px;
}
.business-setting-table-body {
  height: 250px;
  overflow-y: auto;
}
.business-setting-table > span,
.business-setting-table-header > span,
.business-setting-table > .el-input {
  flex: 1;
}
.business-setting-table > span > .el-input-number,
.business-setting-table > span > .el-input {
  width: 70%;
}
.business-setting-table > .icon-span > .el-input-number,
.business-setting-table > .icon-span > .el-input {
  width: 50%;
}
.business-setting-table > span .el-icon-circle-plus {
  color: #2362FB;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.business-setting-table > span .el-icon-remove {
  color: #ff6767;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.business-setting-table:nth-child(2n + 1) {
  background: #f7f8fa;
}
.icon-box {
  width: 50px;
  display: inline-block;
  text-align: left;
  margin-left: 10px;
}
</style>
