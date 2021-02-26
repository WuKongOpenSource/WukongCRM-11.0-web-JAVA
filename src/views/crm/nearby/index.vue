<template>
  <div class="map-box">
    <div class="map-title">
      <!-- <flexbox class="map-title-content">
        <img
          src="@/assets/img/crm/customer.png"
          class="title-icon">
        附近的客户
      </flexbox> -->
      <el-menu
        ref="elMenu"
        default-active="nearby"
        mode="horizontal"
        active-text-color="#2362FB"
        @select="menuSelect">
        <el-menu-item
          v-for="(item, index) in menuItems"
          :key="index"
          :index="item.path">
          <img :src="item.icon">
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div v-loading="loading" class="map-content">
      <flexbox align="stretch" class="map-content--title">
        <flexbox-item>
          <div class="title--position">
            <span class="wk wk-icon-position"/>
            <el-tooltip :content="address" class="item" effect="dark" placement="top-start">
              <span class="title--address">{{ address }}</span>
            </el-tooltip>
          </div>
          <el-button type="text" class="el-button--text" @click="changeAddressShow = true">重新选择地址</el-button>
          <span class="place-text">附近&nbsp;</span>
          <el-popover
            v-model="showTypePopover"
            :width="radiusSelectWidth"
            placement="bottom"
            popper-class="no-padding-popover"
            trigger="click">
            <div class="type-popper">
              <div class="type-content">
                <div
                  v-for="(item, index) in memterOptions"
                  :key="index"
                  :class="{ 'selected' : selectType.value == item.value && !showCustomContent}"
                  class="type-content-item"
                  @click="radiusChange(item)">
                  <div class="mark"/>{{ item.label }}
                </div>
                <div
                  :class="{ 'selected' : showCustomContent}"
                  class="type-content-item"
                  @click="showCustomContent = true">
                  <div class="mark"/>自定义
                </div>
              </div>
              <div
                v-if="showCustomContent"
                class="type-content-custom">
                <el-input
                  v-wk-number="'positiveInt'"
                  v-model="mapData.radius">
                  <template slot="append">米</template>
                </el-input>
                <el-button type="primary" @click="radiusChange(null)">确定</el-button>
              </div>
            </div>
            <el-input
              slot="reference"
              v-model="mapData.radius"
              :readonly="true"
              :style="{width: radiusSelectWidth + 'px'}"
              class="type-select">
              <i
                slot="suffix"
                :class="['el-icon-arrow-up', { 'is-reverse' : showTypePopover}]"/>
            </el-input>
          </el-popover>
          <span class="place-text">&nbsp;米的客户</span>
        </flexbox-item>

        <div class="title--right">
          <label class="title-label">客户类型： </label>
          <el-select v-model="mapData.type" @change="getMapInfo">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </div>
      </flexbox>
      <flexbox align="stretch" class="box-content">
        <div
          v-empty="mapList"
          xs-empty-icon="none"
          class="map-content--left">
          <div id="map-scroll">
            <ul ref="nearbyList" :style="{height: mapHeight + 'px'}">
              <li
                v-for="(item, index) in mapList"
                :key="index"
                :style="{backgroundColor: item.customerId === currentId ? '#f7f7f7' : ''}"
                class="map-info--box"
                @click="selectAddress(item)">
                <span class="wk wk-icon-location"/>
                <div class="map-box--content">
                  <div class="map-info--name">
                    <el-tooltip :content="item.customerName" class="item" effect="dark" placement="top-start">
                      <div class="map-customer-name can-visit--underline" @click.stop="checkCustomerDetail(item.customerId)">{{ item.customerName }}</div>
                    </el-tooltip>
                    <!-- <div :title="item.customerName" class="map-customer-name">{{ item.customerName }}</div> -->
                  </div>
                  <div class="map-info--content">负责人: {{ item.ownerUserName }}</div>
                  <div :title="item.detailAddress" class="map-info--content">{{ item.detailAddress }}</div>
                  <div class="map-info--content">距离选择地址: {{ item.distance / 1000 }} km</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <flexbox-item :style="{height: mapHeight + 'px'}" class="map-primity">
          <div
            ref="nearbyMap"
            class="map"/>
        </flexbox-item>
      </flexbox>
    </div>
    <change-address
      :show="changeAddressShow"
      :value="centerPoint"
      @select="handleSelect"
      @close="changeAddressShow = false"/>
    <customer-detail
      v-if="showDview"
      :id="rowID"
      :no-listener-class="['map-customer-name']"
      class="d-view"
      @hide-view="showDview=false"/>
  </div>

</template>
<script type="text/javascript">
import { crmCrmCustomerNearbyCustomerAPI } from '@/api/crm/nearby'

import CustomerDetail from '../customer/Detail'

import { getBaiduMap } from '@/utils'
import { mapGetters } from 'vuex'

export default {
  name: 'NearbyIndex', // 附近客户
  components: {
    ChangeAddress: () => import('./ChangeAddress'),
    CustomerDetail
  },
  props: {},
  data() {
    return {
      map: null,
      radiusSelectWidth: 100,
      showTypePopover: false,
      showCustomContent: false,
      selectType: {},
      currentId: -1,
      // 选中的搜索
      changeAddressShow: false,
      address: '',
      mapList: [],
      markerArr: [],
      loading: true,
      circle: null,
      memterOptions: [
        {
          label: '1千米',
          value: '1000'
        },
        {
          label: '3千米',
          value: '3000'
        },
        {
          label: '5千米',
          value: '5000'
        },
        {
          label: '10千米',
          value: '10000'
        }
      ],
      // 定位图标
      centerPoint: {},
      // 储存搜索的数据
      mapData: {
        radius: '1000',
        type: ''
      },
      mapHeight: document.documentElement.clientHeight - 210, // 地图的高度
      typeOptions: [
        {
          value: '',
          label: '全部'
        },
        {
          value: 2,
          label: '客户'
        },
        {
          value: 9,
          label: '公海'
        }
      ],

      // 详情查看
      showDview: false,
      rowID: null
    }
  },
  computed: {
    ...mapGetters(['crm']),
    menuItems() {
      const temp = []
      if (this.crm && this.crm.customer) {
        temp.push({
          title: '客户',
          path: 'customer',
          icon: require('@/assets/img/crm/customer_not.png')
        })
      }

      if (this.crm && this.crm.pool) {
        temp.push({
          title: '公海',
          path: 'seas',
          icon: require('@/assets/img/crm/seas_not.png')
        })
      }

      if (this.crm && this.crm.customer && this.crm.customer.nearbyCustomer) {
        temp.push({
          title: '附近客户',
          path: 'nearby',
          icon: require('@/assets/img/crm/nearby.png')
        })
      }

      return temp
    }
  },
  watch: {},
  mounted() {
    getBaiduMap()
      .then(() => {
        var map = new BMap.Map(this.$refs.nearbyMap)
        var point = new BMap.Point(116.404, 39.915)
        map.centerAndZoom(point, 14)
        map.enableScrollWheelZoom(true)
        this.map = map
        this.centerPoint = point
        this.getMyPosition()
      })
  },
  deactivated: function() {
    this.$refs.elMenu.activeIndex = 'nearby'
  },
  methods: {
    /**
     * 左侧菜单选择
     */
    menuSelect(key, keyPath) {
      this.$emit('menu-select', key, keyPath)
    },

    /**
     * 获取当前位置
     */
    getMyPosition() {
      var myCity = new BMap.LocalCity()
      myCity.get(this.getFirstPosition)
    },

    /**
     * 定位函数
    */
    getFirstPosition(result) {
      this.centerPoint = result.center
      this.address = result.name
      this.getMapInfo()
    },

    /**
     * 修改半径范围
     */
    radiusChange(item) {
      if (item) {
        this.mapData.radius = item.value
        this.selectType = item
        this.showCustomContent = false
      } else {
        if (!this.mapData.radius) {
          this.mapData.radius = 1000
        }
        this.showCustomContent = true
      }
      this.getMapInfo()
      this.showTypePopover = false
    },

    /**
     * 获取地图信息
     *  lng 经度
        lat 纬度
        type 用来确定模块，这个不确定，先传空
        radius 半径距离
        ownerUserId 负责人
     */
    getMapInfo() {
      this.loading = true
      this.map.clearOverlays()
      const params = { ...this.mapData }
      params.lat = this.centerPoint.lat
      params.lng = this.centerPoint.lng
      crmCrmCustomerNearbyCustomerAPI(params).then(res => {
        this.mapList = res.data
        this.addMarkerLabel()
        this.setCircle()
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    /**
       * 选中
       * @param point 坐标点
       * @param height 信息窗口高度
       */
    selectAddress(item) {
      var allOverlay = this.map.getOverlays()
      this.currentId = item.customerId // 用id做标识来改变li的背景色
      for (let i = 0; i < allOverlay.length; i++) {
        const overlay = allOverlay[i]
        if (overlay._type === 'ComplexCustomOverlay') {
          if (overlay._customerId === item.customerId) {
            // 确保缩放等级不变
            this.map.centerAndZoom(overlay._point, this.map.getZoom())
            overlay._changeOverStyle()
          } else {
            overlay._changeOutStyle()
          }
        }
      }
    },

    /**
     * 添加圆形覆盖物
    */
    setCircle() {
      if (this.circle) {
        this.removeOverlay(this.circle)
      }
      const Circle = new BMap.Circle(this.centerPoint, this.mapData.radius, {
        strokeColor: '#2362FB',
        fillColor: '#2362FB',
        strokeWeight: 2,
        fillOpacity: 0.05,
        strokeOpacity: 0.5,
        strokeStyle: 'solid'
      })
      Circle.setCenter(this.centerPoint)
      this.circle = Circle
      this.circle.type = 'circle'
      this.map.addOverlay(Circle)
      this.map.setCenter(this.centerPoint)
      this.map.panTo(this.centerPoint)
      this.map.setViewport(this.markerArr)
    },

    /**
     * 创建标注
     */
    addMarkerLabel() {
      this.markerArr = []
      // 标注类
      function ComplexCustomOverlay(point, name, customerId) {
        this._type = 'ComplexCustomOverlay'
        this._point = point
        this._name = name
        this._customerId = customerId
      }
      ComplexCustomOverlay.prototype = new BMap.Overlay()
      // 地图发生变化的时候会触发方法
      ComplexCustomOverlay.prototype.initialize = function(map) {
        this._map = map
        var div = this._div = document.createElement('div')
        var span = this._span = document.createElement('span')
        div.className = 'map-marker--custom ' + `marker--${this._customerId}`
        span.className = 'map-custom--text'
        div.appendChild(span)
        div.style.position = 'absolute'
        div.style.zIndex = this._zIndex = BMap.Overlay.getZIndex(this._point.lat)
        div.style.color = 'white'
        div.style.padding = '2px'
        div.style.whiteSpace = 'nowrap'
        div.style.MozUserSelect = 'none'
        div.style.fontSize = '12px'
        span.innerHTML = this._name
        div.appendChild(span)

        var arrow = this._arrow = document.createElement('div')
        arrow.style.background = `url(${require('@/assets/img/nearby_bg.png')}) no-repeat`
        arrow.style.position = 'absolute'
        arrow.style.width = '20px'
        arrow.style.height = '15px'
        arrow.style.transform = 'scale(0.5)'
        arrow.style.top = '24px'
        arrow.style.left = '75px'
        arrow.style.opacity = '0.95'
        arrow.style.overflow = 'hidden'
        div.appendChild(arrow)

        this._changeOverStyle = function() {
          this._div.style.backgroundColor = '#fba019'
          this._div.style.whiteSpace = 'normal'
          this._div.style.zIndex = '1'
          this._arrow.style.backgroundPosition = '0px -20px'
        }
        this._changeOutStyle = function() {
          if (self.currentId !== this._customerId) {
            this._div.style.backgroundColor = '#2362FB'
            this._div.style.whiteSpace = 'nowrap'
            this._div.style.zIndex = this._zIndex
            this._arrow.style.backgroundPosition = '0px 0px'
          }
        }

        const that = this
        div.onmouseover = function() {
          that._changeOverStyle()
        }

        div.onmouseout = function() {
          that._changeOutStyle()
        }

        div.onclick = () => {
          let item = null
          for (let i = 0; i < self.mapList.length; i++) {
            // 将被选中的放在第一位
            if (this._customerId === self.mapList[i].customerId) {
              item = self.mapList.splice(i, 1)
              self.mapList.unshift(item[0])
              self.$refs.nearbyList.scrollTop = 0
              self.selectAddress(item[0])
              break
            }
          }
        }
        self.map.getPanes().labelPane.appendChild(div)
        return div
      }

      ComplexCustomOverlay.prototype.draw = function() {
        var map = this._map
        var pixel = map.pointToOverlayPixel(this._point)
        // 需要动态给标注设置偏移量
        this._div.style.left = pixel.x - parseInt(this._arrow.style.left) - 10 + 'px'
        this._div.style.top = pixel.y - 30 + 'px'
      }
      const self = this
      this.mapList.forEach(item => {
        const itemPoint = new BMap.Point(item.lng, item.lat)
        const Marker = new ComplexCustomOverlay(itemPoint, item.customerName, item.customerId)
        self.markerArr.push(itemPoint)
        self.map.addOverlay(Marker)
      })
    },

    /**
     * 删除指定的覆盖物
    */
    removeOverlay(item) {
      // 获取所有的覆盖物
      var allOverlay = this.map.getOverlays()
      for (let i = 0; i < allOverlay.length; i++) {
        if (allOverlay[i].type == item.type) {
          this.map.removeOverlay(allOverlay[i])
        }
      }
    },

    /**
     * 回调选中
    */
    handleSelect(data) {
      this.centerPoint = data.point
      this.address = data.address + data.title
      this.getMapInfo()
    },

    /**
     * 查看客户详情
     */
    checkCustomerDetail(customerId) {
      this.rowID = customerId
      this.showDview = true
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/table.scss';

.map-box {
  width: 100%;
  overflow-x: auto;
  height: auto;
}
.map-content {
  min-width: 900px;
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  border-bottom: 1px solid #e6e6e6;
  border-radius: 2px;
  padding-bottom: 5px;
}
.map-primity {
  height: 100%;
  margin-right: 25px;
  .map {
     height:100%;
     width: 100%;
     overflow: hidden;
}
}
.map-content--title {
  position: relative;
  border-bottom: 1px solid #e6e6e6;
  font-size: 13px;
  line-height: 50px;
  padding: 0 10px;
  width: 100%;
  .title--position {
    display: inline-block;
    /deep/.wk-icon-position {
      color: #2362FB;
      display: inline-block;
      vertical-align: top;
      font-size: 20px;
    }
  }
  .title--address {
    width: 150px;
    display: inline-block;
    font-size: 13px;
    vertical-align: bottom;
    color: #333;
    padding-left: 5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .title--right {
    flex-shrink: 0;
    right: 25px;
    width: 262px;
    margin-right: 9px;
    .title-label {
      font-size: 13px;
    }
  }
  .el-button--text {
    color: #2362FB;
    font-size: 12px;
    margin: 0 37px 0 16px;
  }
  .el-input--width {
    width: 80px;
    margin: 0 10px;
  }
  .place-text {
    color: #333;
  }
}
.map-content--left {
  flex-shrink: 0;
  width: 300px;
  height: 100%;
  ul {
    overflow-y: auto;
  }
}

.map-title {
  height: 60px;
  position: relative;
  z-index: 100;
  .map-title-content {
    float: left;
    width: auto;
    padding-left: 28px;
    font-size: 16px;
    margin-top: 15px;
    .title-icon {
      width: 30px;
      height: 30px;
      margin-right: 10px;
  }
  }
}
.box-content {
  margin-top: 5px;
}
.area-title {
  font-size: 12px;
  color: #aaa;
  padding-left: 10px;
}

.distpicker-address-wrapper /deep/ select {
  height: 34px;
  font-size: 12px;
  border-radius: 0.1rem;
}
/deep/.map-info--box:hover {
  background-color: #F7F7F7 !important;
}
/deep/.map-info--box {
  width: 100%;
  height: auto;
  display: flex;
  padding: 15px 10px 0px 12px;
  cursor: pointer;
  .map-box--content {
    height: 100%;
    width: 230px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e4e4e4;
  }
  .wk-icon-location {
    color: red;
    display: inline-block;
    margin-right: 10px;
    font-size: 20px;
      }
/deep/.map-info--name {
      width: 100%;
      display: flex;
      font-size: 14px;
      padding-bottom: 10px;
      position: relative;
      .map-customer-name {
         width: auto;
         margin-top: 4px;
         overflow: hidden;
         white-space: nowrap;
         text-overflow: ellipsis;
      }
      .fun-count {
        position: absolute;
        left: 2px;
        top: 1px;
        color: red;
        font-size: 10px;
        transform: scale(0.5);
      }
  }
  .map-info--content {
     font-size: 13px;
     width: 240px;
     overflow: hidden;
     padding-bottom: 6px;
     white-space: nowrap;
     text-overflow: ellipsis;
     color: #333;
  }
}
  .map--top {
    margin-top: 15px;
  }
  /deep/ .map-window--name {
    display: flex;
    color: #2362FB;
    padding-bottom: 10px;
    /deep/.info--name {
         width: 260px;
         line-height: 14px;
         overflow: hidden;
         white-space: nowrap;
         text-overflow: ellipsis;
      }
  }
  /deep/ .map-window--img {
    width: 12px;
    height: 12px;
    margin-right: 8px;
  }
  /deep/ .map-window--content{
     font-size: 12px;
     padding: 0px 10px 8px 0px;
     overflow: hidden;
     white-space: nowrap;
     text-overflow: ellipsis;
     color: #333;
  }
  /deep/.map-marker--custom {
    background-color: #2362FB;
    width: 180px;
    height: 30px;
    border-radius: 6px;
    line-height: 30px;
    font-size: 12px;
    padding-bottom: 10px;
    text-align: center;
    opacity: 0.95;
    position: relative;
    .map-custom--text {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .map-custom--pover {
      position: absolute;
      bottom: -23px;
      font-size: 14px;
      color: #2362FB;
      opacity: 0.8;
    }
  }
  .optionCustom {
    width: 100%;
    .el-button--text {
       color: #666;
    }
  }
   /deep/.el-select-dropdown__item {
      background-color: #fff !important;
    }
  .optionCustom:hover {
    .el-button--text {
       color: #2362FB;
    }
    background-color: #F5F7FA;
  }
  .type-popper {
  .type-content {
    max-height: 250px;
    overflow-y: auto;
    .type-content-item {
      height: 34px;
      line-height: 34px;
      padding: 0 20px;
      color: #606266;
      position: relative;
      cursor: pointer;
      /deep/.el-input {
        margin-bottom: 5px;
      }
      .mark {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: $xr-border-radius-base;
        margin-right: 5px;
        background-color: transparent;
      }
    }

    .selected {
      color: #409eff;
      font-weight: 700;
      .mark {
        background-color: #409eff;
      }
    }
    .type-content-item:hover {
      background-color: #f5f7fa;
    }
  }

  .type-content-custom {
    padding: 5px 20px 10px;
    position: relative;
    overflow: hidden;
    .el-date-editor {
      width: 100%;
      margin-bottom: 8px;
    }

    button {
      margin-top: 5px;
      float: right;
    }
  }
}
.el-icon-arrow-up {
  position: absolute;
  top: 18px;
  right: 5px;
  color: #c0c4cc;
  font-size: 14px;
  transition: transform .3s;
  transform: rotate(180deg);
  cursor: pointer;
}
.el-icon-arrow-up.is-reverse {
  transform: rotate(0deg);
}

.d-view {
  position: fixed;
  min-width: 926px;
  width: 75%;
  top: 60px;
  bottom: 0px;
  right: 0px;
}
</style>
