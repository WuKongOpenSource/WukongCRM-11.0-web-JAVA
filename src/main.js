/*
 * @Description: 悟空软件
 * @Author: 悟空
 * @Date: 2020-05-14 14:25:43
 * @LastEditTime: 2020-05-26 14:40:09
 * @LastEditors: yang
 */
import 'babel-polyfill'
import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

// 配置信息
import config from '@/config'
window.WKConfig = config
Vue.prototype.WKConfig = config

import ElementUI from 'element-ui'
Vue.use(ElementUI)
import {
  Message
} from 'element-ui'
Vue.prototype.$message.success = function(msg) {
  return Message({
    message: msg,
    duration: 1500,
    type: 'success'
  })
}
Vue.prototype.$message.error = function(msg) {
  return Message({
    message: msg,
    duration: 1500,
    type: 'error'
  })
}
import 'element-ui/lib/theme-chalk/index.css'
import 'el-bigdata-table'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import cache from '@/utils/cache'
cache.loadingCache()

import '@/permission' // permission control
import 'vue2-animate/dist/vue2-animate.min.css'

/** 事件传递 */
import VueBus from 'vue-bus'
Vue.use(VueBus)

/** 常用flex组件 */
import {
  Flexbox,
  FlexboxItem
} from '@/components/Flexbox'
Vue.component('flexbox', Flexbox)
Vue.component('flexbox-item', FlexboxItem)
import XrAvatar from '@/components/XrAvatar'
Vue.component('xr-avatar', XrAvatar)

import FileUpload from '@/components/FileUpload/index.js'
Vue.use(FileUpload)
import WkFileSelect from '@/components/NewCom/WkFile/Select/main.js'
Vue.use(WkFileSelect)
import WkPreviewFile from '@/components/WkPreviewFile/main.js'
Vue.use(WkPreviewFile)
import WkImport from '@/components/WkImport/main.js'
Vue.use(WkImport)

/** 懒加载图片 */
import VueSrc from './directives/src'
Vue.directive('src', VueSrc)

import * as filters from './filters' // global filters
// 注册全局过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
import vueNumeralFilterInstaller from './filters/vueNumeralFilter'
Vue.use(vueNumeralFilterInstaller, { locale: 'chs' })

// 处理时间的过滤器
Vue.use(require('vue-moment'))
import moment from 'moment'
moment.locale('zh_cn')

// 限制数据数值
import inputLimit from './directives/inputLimit'
Vue.use(inputLimit)
// 自定义全局点击空白处组件
import clickoutside from './directives/clickoutside'
Vue.directive('clickoutside', clickoutside)
import elClickoutside from './directives/elClickoutside'
Vue.directive('elclickoutside', elClickoutside)
import permission from './directives/permission'
Vue.directive('permission', permission)

import empty from './directives/empty'
Vue.use(empty)
import debounce from './directives/clickDebounce'
Vue.use(debounce)

// 表情
import {
  emoji
} from './utils/emoji'
Vue.prototype.emoji = emoji

Vue.config.productionTip = false

window.app = new Vue({
  el: '#app',
  router,
  store,
  data: {
    eventHub: new Vue()
  },
  render: h => h(App)
})
