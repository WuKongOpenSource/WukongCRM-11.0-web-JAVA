<template>
  <el-dialog
    v-loading="loading"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="选择打印模板"
    width="400px"
    @close="handleCancel">
    <div class="handle-box">
      <flexbox
        class="handle-item"
        align="stretch">
        <div
          class="handle-item-name"
          style="margin-top: 8px;">模板：</div>
        <el-select
          v-model="templateId"
          class="handle-item-content">
          <el-option
            v-for="item in options"
            :key="item.templateId"
            :label="item.templateName"
            :value="item.templateId"/>
        </el-select>
      </flexbox>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="handleCancel">取消</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { printTemplateListAPI } from '@/api/admin/crm'

import crmTypeModel from '@/views/crm/model/crmTypeModel'

export default {
  // 模板打印
  name: 'TemplatePrint',
  components: {},
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    crmType: {
      type: String,
      default: ''
    },
    detail: Object
  },
  data() {
    return {
      loading: true,
      options: [],
      templateId: ''
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getOptions()
  },
  methods: {
    /**
     * 取消选择
     */
    handleCancel() {
      // 重置状态
      this.$emit('update:visible', false)
    },

    getOptions() {
      this.loading = true
      printTemplateListAPI({
        type: crmTypeModel.convertKeyToType(this.crmType),
        pageType: 0
      })
        .then(res => {
          this.options = res.data.list || []
          if (this.options.length) {
            this.templateId = this.options[0].templateId
          } else {
            this.templateId = ''
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      if (this.templateId) {
        // this.$router.push({
        //   name: 'print',
        //   query: {
        //     templateId: this.templateId,
        //     id: this.detail[`${this.crmType}Id`]
        //   }
        // })
        const id = this.detail[`${this.crmType}Id`]
        const routeData = this.$router.resolve(`/print/?templateId=${this.templateId}&id=${id}`)
        window.open(routeData.href, '_blank')
        this.handleCancel()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.handle-box {
  color: #333;
  font-size: 12px;
}
.handle-item {
  padding-bottom: 15px;
  .handle-item-name {
    flex-shrink: 0;
    width: 90px;
  }
  .handle-item-content {
    flex: 1;
  }
}
.handle-bar {
  position: relative;
  margin-top: 10px;
  height: 30px;
  button {
    float: right;
    margin-right: 10px;
  }
}
</style>
