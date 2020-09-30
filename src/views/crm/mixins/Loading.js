import {
  Loading
} from 'element-ui'

export default {
  data() {
    return {
      loading: false,
      tab_loading: null // 放在 tabs-content 里客户的
    }
  },

  watch: {
    loading: function(val) {
      if (val) {
        if (this.tab_loading) {
          this.tab_loading.close()
          this.tab_loading = null
        }
        this.tab_loading = Loading.service({
          target: document.querySelector('.el-tabs__content')
        })
      } else {
        this.tab_loading.close()
      }
    }
  },

  mounted() {},

  deactivated: function() {}

}
