<template>
  <el-popover
    :disabled="!hasContent"
    placement="bottom"
    width="200"
    trigger="hover">
    <el-image
      :src="url"
      :style="styleObj"
      style="width: 100%; height: 100%"
      fit="contain"/>
    <div slot="reference">
      <el-image
        v-if="hasContent"
        :src="url"
        :style="{height: height, ...styleObj}"
        style="width: 100%;"
        fit="contain"/>
      <template v-else>--</template>
    </div>
  </el-popover>
</template>

<script>
import { adminFileQueryOneByBatchIdAPI } from '@/api/admin/file'

export default {
  // WkSignatureImage
  name: 'WkSignatureImage',

  components: {},

  props: {
    height: {
      type: String,
      default: '100%'
    },
    src: String // batchId 交互
  },

  data() {
    return {
      url: '',
      styleObj: {}
    }
  },

  computed: {
    hasContent() {
      return !!this.url
    }
  },

  watch: {
    src: {
      handler(val) {
        if (val) {
          this.getData()
        } else {
          this.url = ''
        }
      },
      immediate: true,
      deep: true
    }
  },

  created() {
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    getData() {
      adminFileQueryOneByBatchIdAPI(this.src).then(res => {
        const resData = res.data
        if (resData) {
          const BaseAPI = process.env.BASE_API
          const baseUrl = BaseAPI.padEnd('/') ? BaseAPI.substring(0, BaseAPI.length - 1) : BaseAPI
          const url = baseUrl + resData.url
          if (this.url !== url) {
            this.url = url
          }
        } else {
          this.url = ''
        }
      }).catch(() => {

      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
