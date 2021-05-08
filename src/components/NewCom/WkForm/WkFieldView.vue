<template>
  <div
    :class="`is-${formType}`"
    class="wk-field-view"
  >
    <template v-if="ignoreFields.includes(props.field)">
      <slot :data="$props" />
    </template>
    <span v-else-if="isCommonType">{{ getCommonShowValue() }}</span>
    <el-switch
      v-else-if="formType == 'boolean_value'"
      :value="value"
      disabled
      active-value="1"
      inactive-value="0"
    />
    <wk-signature-image
      v-else-if="formType == 'handwriting_sign'"
      :src="value"
      :height="config.signatureHeight"
    />
    <wk-desc-text
      v-else-if="formType == 'desc_text'"
      :key="Date.now().toString()"
      :value="value"
    />
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
    <file-list-view
      v-else-if="formType == 'file'"
      :list="value || []"
    />
    <wk-detail-table-view
      v-else-if="formType == 'detail_table'"
      :show-type="props.precisions === 2 ? 'table' : 'default'"
      :title="props.name"
      :add-field-list="props.fieldExtendList"
      :field-form="value"
      :field-list="props.fieldList"
    >
      <template slot-scope="{ data }">
        <slot :data="data" />
      </template>
    </wk-detail-table-view>
    <template v-else>
      <slot :data="$props" />
    </template>

    <map-view
      v-if="mapViewShow"
      :title="value.address"
      :lat="value.lat"
      :lng="value.lng"
      @hidden="mapViewShow=false"
    />
  </div>
</template>

<script>
import WkSignatureImage from '@/components/NewCom/WkSignaturePad/Image'
import WkDescText from '@/components/NewCom/WkDescText'
import MapView from '@/components/MapView' // 地图详情
import FileListView from '@/components/FileListView' // 附件
import WkDetailTableView from '@/components/NewCom/WkDetailTable/View'

import merge from '@/utils/merge'
import { isObject, isEmpty } from '@/utils/types'
import { getFormFieldShowName } from './utils'

const DefaultWkFieldView = {
  signatureHeight: '26px'
}

export default {
  // 特殊字段展示
  name: 'WkFieldView',

  components: {
    WkSignatureImage,
    WkDescText,
    MapView,
    FileListView,
    WkDetailTableView
  },

  props: {
    props: Object, // 自定义字段参数信息
    formType: String,
    value: [String, Object, Array, Number],
    // 忽略的字段直接输出
    ignoreFields: {
      type: Array,
      default: () => {
        return []
      }
    }
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
    },
    isCommonType() {
      return [
        'text',
        'textarea',
        'website',
        'select',
        'checkbox',
        'number',
        'floatnumber',
        'percent',
        'mobile',
        'email',
        'date',
        'datetime',
        'date_interval',
        'user',
        'structure',
        'position'
      ].includes(this.formType)
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
    },

    /**
     * 获取类型的展示值
     */
    getCommonShowValue() {
      return getFormFieldShowName(this.formType, this.value, '', this.props)
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-field-view {
  overflow: hidden;
  text-overflow: ellipsis;
	.can-check {
		color: $xr-color-primary;
		cursor: pointer;
	}

	&.is-website {
		display: inline;
	}
}
</style>
