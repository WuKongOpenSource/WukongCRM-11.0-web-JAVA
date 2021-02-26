<template>
  <div :class="`is-${formType}`" class="wk-field-view">
    <el-switch
      v-if="formType == 'boolean_value'"
      :value="value"
      disabled
      active-value="1"
      inactive-value="0"/>
    <wk-signature-image
      v-else-if="formType == 'handwriting_sign'"
      :src="value"
      :height="config.signatureHeight"
    />
    <wk-desc-text
      v-else-if="formType == 'desc_text'"
      :value="value"/>
    <span
      v-else-if="formType == 'location'"
      :class="{'can-check':objectHasValue(value, 'address')}"
      @click.stop="mapViewShow=true"
    >{{ objectHasValue(value, 'address') ? value.address : '' }}</span>
    <span
      v-else-if="formType == 'website'"
      :class="{'can-check': !isEmpty}"
      @click.stop="openUrl(value)"
    >{{ value }}</span>

    <map-view
      v-if="mapViewShow"
      :title="value.address"
      :lat="value.lat"
      :lng="value.lng"
      @hidden="mapViewShow=false" />
  </div>
</template>

<script>
import WkSignatureImage from '@/components/NewCom/WkSignaturePad/Image'
import WkDescText from '@/components/NewCom/WkDescText'
import MapView from '@/components/MapView' // 地图详情

import merge from '@/utils/merge'
import { isObject, isEmpty } from '@/utils/types'

const DefaultWkFieldView = {
  signatureHeight: '26px'
}


export default {
  // 特殊字段展示
  name: 'WkFieldView',

  components: {
    WkSignatureImage,
    WkDescText,
    MapView
  },

  props: {
    formType: String,
    value: [String, Object, Array]
  },

  data() {
    return {
      // 控制展示地图详情
      mapViewShow: false
    }
  },

  computed: {
    config() {
      return merge({ ...DefaultWkFieldView }, this.props || {})
    },
    isEmpty() {
      return isEmpty(this.value)
    }
  },

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 判断对象是否值
     */
    objectHasValue(obj, key) {
      if (isObject(obj)) {
        return !isEmpty(obj[key])
      }
      return false
    },

    openUrl(url) {
      if (!url.match(/^https?:\/\//i)) {
        url = 'http://' + url
      }
      window.open(url)
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-field-view {
  .can-check {
    color: $xr-color-primary;
    cursor: pointer;
  }

  &.is-website {
    display: inline;
  }
}
</style>
