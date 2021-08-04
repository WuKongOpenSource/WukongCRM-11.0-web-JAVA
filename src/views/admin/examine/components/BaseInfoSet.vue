<template>
  <el-card
    :loading="loading"
    :body-style="{ height: '100%'}"
    class="base-info-set">
    <div class="base-info-set__header">
      配置基础信息
    </div>
    <create-sections title="基础信息">
      <wk-form
        ref="wkBaseFrom"
        :model="fieldsForm"
        :rules="fieldsRules"
        :field-from="fieldsForm"
        :field-list="fields"
        label-position="top"
        @change="formChange"
      >
        <template slot-scope="{ data, index }">
          <wk-user-dep-select
            v-if="data && data.formType == 'userDep'"
            :user-value.sync="fieldsForm.userList"
            :dep-value.sync="fieldsForm.deptList"
            style="width: 100%;"
            @change="userDepSelectChange(arguments, data, index)"
          />
          <template v-else>
            <slot :data="data" />
          </template>
        </template>
      </wk-form>
    </create-sections>
  </el-card>
</template>
<script type="text/javascript">

import CreateSections from '@/components/CreateSections'
import WkForm from '@/components/NewCom/WkForm'
import WkUserDepSelect from '@/components/NewCom/WkUserDepSelect'

export default {
  name: 'BaseInfoSet',
  components: {
    CreateSections,
    WkForm,
    WkUserDepSelect
  },
  props: {
    fields: Array,
    fieldsForm: Object,
    fieldsRules: Object
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    form() {
      return this.$refs.wkBaseFrom.instance
    }
  },
  mounted() {
  },
  methods: {
    /**
     * 验证
     */
    validate() {
      return new Promise((resolve) => {
        this.form.validate(valid => {
          if (!valid) {
            this.$message.error('请完善基本信息')
          }
          resolve(valid)
        })
      })
    },

    /**
     * change
     */
    formChange(item, index, value) {
      this.$emit('change', item, index, value)
    },

    /**
     * 用户部门选择
     */
    userDepSelectChange(list, item, index) {
      const userList = list[2]
      const deptList = list[3]
      this.$emit('change', item, index, {
        userList,
        deptList
      })
    },

    // /**
    //  * 请求参数
    //  */
    // getSubmiteParams() {
    //   var params = {}
    //   for (let index = 0; index < this.wkBaseFrom.crmFields.length; index++) {
    //     const element = this.wkBaseFrom.crmFields[index]
    //     // 关联产品数据需要特殊拼接
    //     if (element.key === 'dept') {
    //       if (element.value['users']) {
    //         params['userList'] = element.value['users'].map(item => item.userId)
    //       }
    //       if (element.value['strucs']) {
    //         params['deptList'] = element.value['strucs'].map(item => item.id)
    //       }
    //     } else {
    //       params[element.key] = element.value
    //     }
    //   }
    //   return params
    // },


    hidenView() {
      this.$emit('hiden-view')
    }

  }
}
</script>
<style lang="scss" scoped>
.base-info-set {
  &__header {
    height: 40px;
    margin-bottom: 20px;
    padding: 0 10px;
    font-size: 17px;
    color:#333;
    font-weight: bold;
  }

  .wk-form {
    /deep/ .el-form-item.is-textarea {
      flex: 0 0 100%;
    }
  }
}
</style>
