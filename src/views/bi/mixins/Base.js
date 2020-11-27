import FiltrateHandleView from '../components/FiltrateHandleView'

import { debounce } from 'throttle-debounce'
import { downloadExcelWithResData } from '@/utils/index'

export default {
  data() {
    return {
      chartObj: null,
      chartOtherObj: null,
      chartColors: [
        '#6CA2FF',
        '#6AC9D7',
        '#72DCA2',
        '#48E78D',
        '#FECD51',
        '#DBB375',
        '#FF7474',
        '#F59561',
        '#A3AEBC',

        '#4C84FF',
        '#0DBEB4',
        '#00DEDE',
        '#FFAA00',
        '#C7C116',
        '#F7A57C',
        '#F661AC',
        '#8652EE'
      ],
      chartXAxisStyle: {
        axisTick: {
          alignWithLabel: true,
          lineStyle: { width: 0 }
        },
        axisLabel: {
          color: '#333'
        },
        axisLine: {
          lineStyle: { color: '#333' }
        },
        splitLine: {
          show: false
        }
      },
      chartYAxisStyle: {
        axisTick: {
          alignWithLabel: true,
          lineStyle: { width: 0 }
        },
        axisLabel: {
          color: '#333'
        },
        axisLine: {
          lineStyle: { color: '#333' }
        },
        splitLine: {
          show: false
        }
      },
      currentPage: 1,
      pageSizes: [15, 30, 45, 60],
      pageSize: 0,
      total: 0,

      // echart 操作项
      toolbox: {
        showTitle: false,
        feature: {
          saveAsImage: {
            show: true,
            pixelRatio: 2
          }
        }
      }
    }
  },

  components: {
    FiltrateHandleView
  },

  props: {},

  computed: {},

  watch: {},

  mounted() {
    this.debouncedResize = debounce(300, this.resizeFn)

    this.$nextTick(() => {
      window.addEventListener('resize', this.debouncedResize)
    })
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.debouncedResize)
  },

  methods: {
    /**
     * 窗口尺寸发生改变实时调整 EChart 尺寸
     */
    resizeFn() {
      if (this.chartObj) {
        this.chartObj.resize()
      }

      if (this.chartOtherObj) {
        this.chartOtherObj.resize()
      }
    },

    // 页面展示条数
    handleSizeChange(val) {
      this.pageData.limit = val
      this.getList(this.pageData)
    },

    // 分页切换
    handleCurrentChange(val) {
      this.pageData.page = val
      this.getList(this.pageData)
    },

    /**
     * 审批导出
     */
    requestExportInfo(request, params) {
      return new Promise((resolve, reject) => {
        request(params)
          .then(res => {
            downloadExcelWithResData(res)
            resolve && resolve(res)
          })
          .catch(err => {
            reject && reject(err)
          })
      })
    }
  },

  deactivated: function() {}

}
