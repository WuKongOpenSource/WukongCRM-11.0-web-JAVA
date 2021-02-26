<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    title="选择位置"
    width="500px"
    @close="close">
    <flexbox align="stretch">
      <flexbox-item>
        <div class="area-title">定位</div>
        <el-autocomplete
          v-model="searchInput"
          :fetch-suggestions="querySearchAsync"
          style="width: 100%;"
          placeholder="请输入详细位置名称"
          @blur="inputBlur"
          @focus="inputFocus"
          @select="handleSelect">
          <template slot-scope="{ item }">
            <div class="name">{{ item.address + item.title }}</div>
          </template>
        </el-autocomplete>
        <div
          ref="chosemap"
          class="map"/>
      </flexbox-item>
    </flexbox>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="selectSure">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
import VDistpicker from '@/components/VDistpicker'
import { getBaiduMap } from '@/utils'

export default {
  name: 'ChangeAddress',
  components: {
    VDistpicker
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      map: null,
      searchInput: '', // 搜索
      dialogVisible: false,
      searchCopyInput: '', // 避免修改
      pointAddress: null // 经纬度点
    }
  },
  computed: {},
  watch: {
    show(val) {
      this.dialogVisible = val
      if (val) {
        this.$nextTick(() => {
          getBaiduMap()
            .then(() => {
              var map = new BMap.Map(this.$refs.chosemap, { enableMapClick: true })
              var point = this.value
              map.centerAndZoom(point, 14)
              map.enableScrollWheelZoom()
              this.map = map
              this.addMarkerLabel(point)
            })
        })
      }
    }
  },
  mounted() {

  },
  methods: {
    querySearchAsync(queryString, cb) {
      if (queryString) {
        var options = {
          onSearchComplete: function(results) {
            if (local.getStatus() == BMAP_STATUS_SUCCESS) {
              var address = []
              for (var i = 0; i < results.getCurrentNumPois(); i++) {
                address.push(results.getPoi(i))
              }
              cb(address)
            } else {
              cb([])
            }
          },
          pageCapacity: 20
        }
        var local = new BMap.LocalSearch(this.map, options)
        local.search(queryString)
      } else {
        cb([])
      }
    },
    /**
     * 搜索结果选择
     **/
    handleSelect(item) {
      this.searchInput = item.address + item.title
      this.searchCopyInput = this.searchInput // 只能通过这种方式修改

      this.addMarkerLabel(item.point)
      this.pointAddress = item
    },
    /**
     * Input 失去焦点  searchInput 只能通过选择更改
     **/
    inputBlur() {
      if (this.searchCopyInput !== this.searchInput) {
        this.searchInput = this.searchCopyInput
      }
    },
    inputFocus() {
      this.searchCopyInput = this.searchInput
    },
    /**
     * 创建标注
     */
    addMarkerLabel(point) {
      this.map.clearOverlays()
      this.map.centerAndZoom(point, 14)
      this.map.addOverlay(new BMap.Marker(point))
    },
    /**
     * 关闭
     */
    close() {
      this.$emit('close')
    },
    /**
     * 确定选择
     */
    selectSure() {
      this.$emit('select', this.pointAddress)
      this.close()
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.map {
  height: 150px;
  width: 100%;
  overflow: hidden;
  margin-top: 5px;
}

.area-title {
  font-size: 12px;
  color: #aaa;
  padding-bottom: 10px;
}

.distpicker-address-wrapper /deep/ select {
  height: 34px;
  font-size: 12px;
  border-radius: 0.1rem;
}
/deep/ .el-dialog__body {
  padding: 10px 20px 20px;
}
</style>
