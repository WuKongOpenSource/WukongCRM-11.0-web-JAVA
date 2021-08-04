<template>
  <div>
    <crm-relative
      v-if="showRelative"
      ref="crmrelative"
      :visible.sync="showRelative"
      :radio="false"
      :selected-data="selectedData"
      :show-types="showTypes"
      @changeCheckout="checkInfos"/>
    <span
      slot="reference"
      class="add-btn" @click="showRelative = true">
      <i class="wk wk-l-plus" />
      <span class="label">关联业务</span>
    </span>
    <div class="related-business">
      <div
        v-for="(items, key) in selectedData"
        :key="key">
        <related-business-cell
          v-for="(item, itemIndex) in items"
          :data="item"
          :cell-index="itemIndex"
          :type="key"
          :key="itemIndex"
          :cursor-pointer="false"
          @unbind="delRelevance"/>
      </div>
    </div>
  </div>
</template>
<script type="text/javascript">
import CrmRelative from '@/components/CreateCom/CrmRelative'
import RelatedBusinessCell from '@/views/oa/components/RelatedBusinessCell'
import { objDeepCopy } from '@/utils'

export default {
  name: 'RelatedBusiness', // 关联业务
  components: {
    CrmRelative,
    RelatedBusinessCell
  },
  props: {
    /** 已选信息 */
    selectedInfos: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      showTypes: ['customer', 'contacts', 'business', 'contract'],
      // 业务弹窗
      showRelative: false,
      // 编辑时勾选
      selectedData: {}
    }
  },
  computed: {},
  watch: {
    selectedInfos: function(data) {
      this.selectedData = data
    }
  },
  mounted() {},
  methods: {
    delRelevance(field, index) {
      this.$confirm('确认取消关联?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'is-particulars'
      })
        .then(() => {
          this.selectedData[field].splice(index, 1)
          this.selectedData = objDeepCopy(this.selectedData)
          this.submitValueChange()
        })
        .catch(() => {
          this.$message.info('已取消操作')
        })
    },
    getTypeName(type) {
      if (type == 'customer') {
        return '客户'
      } else if (type == 'contacts') {
        return '联系人'
      } else if (type == 'business') {
        return '商机'
      } else if (type == 'contract') {
        return '合同'
      }
    },
    checkInfos(val) {
      this.selectedData = val.data
      this.submitValueChange()
    },
    submitValueChange() {
      this.$emit('value-change', {
        index: this.index,
        value: this.selectedData
      })
    }
  }
}
</script>
<style lang="scss" scoped>

.related-business {
  margin-top: 10px;
}

// 添加btm
$btn-b-color: #f8faff;
$btn-color: #333333;
$btn-b-hover-color: #eff4ff;
.add-btn {
  margin-top: 8px;
  font-size: 12px;
  color: $btn-color;
  background-color: $btn-b-color;
  border-radius: $xr-border-radius-base;
  display: inline-block;
  padding: 3px 10px;
  cursor: pointer;

  .wk-l-plus {
    font-size: 12px;
  }
}

.add-btn:hover {
  color: $xr-color-primary;
  background-color: $btn-b-hover-color;
}
</style>
