<template>
  <create-view
    :loading="loading"
    :body-style="{ height: '100%'}">
    <flexbox
      direction="column"
      align="stretch"
      class="crm-create-container">
      <flexbox class="crm-create-header">
        <div style="flex:1;font-size:17px;color:#333;font-weight: bold;">{{ title }}</div>
        <i
          class="el-icon-close close"
          @click="hidenView" />
      </flexbox>
      <div class="crm-create-flex">
        <create-sections title="基本信息">
          <flexbox
            direction="column"
            align="stretch">
            <div class="crm-create-body">
              <wk-form
                ref="dataForm"
                :model="crmForm"
                :rules="dataRules"
                :field-from="crmForm"
                :field-list="crmFields"
                label-position="top"
              />
            </div>
          </flexbox>
        </create-sections>
      </div>
    </flexbox>
  </create-view>
</template>
<script type="text/javascript">
import {
  customFieldListAPI,
  oaExamineFieldListAPI
} from '@/api/admin/crm'

import CreateView from '@/components/CreateView'
import CreateSections from '@/components/CreateSections'

import WkForm from '@/components/NewCom/WkForm'

export default {
  name: 'PreviewFieldView', // 所有新建效果的view
  components: {
    CreateView,
    CreateSections,
    WkForm
  },
  filters: {},
  props: {
    // 类型
    types: {
      type: String,
      default: ''
    },
    typesId: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      // 标题展示名称
      title: '预览',
      loading: false,
      // 自定义字段信息表单
      crmForm: {},
      crmFields: [],
      dataRules: {}
    }
  },
  computed: {},
  watch: {
    types: function(value) {
      this.crmForm = {}
      this.crmFields = []
      this.getField()
    }
  },
  mounted() {
    // 获取title展示名称
    document.body.appendChild(this.$el)
    this.getField()
  },
  destroyed() {
    // remove DOM node after destroy
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    // 获取自定义字段
    getField() {
      this.loading = true
      let request = customFieldListAPI
      const params = {}
      if (this.label !== 'none') {
        params.label = this.label
      }
      if (this.types === 'oa_examine') {
        request = oaExamineFieldListAPI
        params.categoryId = this.typesId
      }

      request(params)
        .then(res => {
          this.getcrmRulesAndModel(res.data)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 根据自定义字段获取自定义字段规则
    getcrmRulesAndModel(list) {
      const dataRules = {}
      const crmFields = []
      for (let index = 0; index < list.length; index++) {
        const item = list[index]
        if (item.isHidden != 1) {
          item['disabled'] = true // 是否可交互
          item.field = item.fieldName
          if (item.isNull === 1) {
            dataRules[item.fieldName] = { required: true,
              message: '',
              trigger: 'change' }
          }
          crmFields.push(item)
        }
      }
      this.dataRules = dataRules
      this.crmFields = crmFields
    },
    hidenView() {
      this.$emit('hiden-view')
    }
  }
}
</script>
<style lang="scss" scoped>
.crm-create-container {
  position: relative;
  height: 100%;
}

.crm-create-flex {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1;
}

.crm-create-header {
  height: 40px;
  margin-bottom: 20px;
  padding: 0 10px;
  flex-shrink: 0;
  .close {
    display: block;
    font-size: 24px;
    color: #909399;
    margin-right: -10px;
    padding: 10px;
    cursor: pointer;
  }
  .close:hover {
    color: $xr-color-primary;
  }
}

.crm-create-body {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
