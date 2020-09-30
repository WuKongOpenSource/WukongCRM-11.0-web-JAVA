export default {
  data() {
    return {
      showTable: true
    }
  },
  methods: {
    /**
     * 排序函数
     * @description 根据指定的属性对 table数据数组进行排序
     * @param list {Array} 要进行排序的数组
     * @param key {String} 要进行排序的属性
     * @param sortRule  ascending|descending 升序排列或降序排列，默认升序
     * @return {Array}
     */
    mixinSortFn(list = [], key = null, sortRule = 'ascending') {
      if (Object.prototype.toString.call(list) !== '[object Array]') return []
      if (!key) return list
      function sortFn(a, b) {
        if (a[key] === b[key]) return 0
        const isNumber = !isNaN(Number(a[key])) && !isNaN(Number(b[key])) // 判断两个值是否都能转换成数字，防止出现 '5' > '10'
        const flag = isNumber ? (Number(a[key]) < Number(b[key])) : (a[key] < b[key])
        if (sortRule === 'descending') {
          return flag ? 1 : -1
        }
        return flag ? -1 : 1
      }

      list.sort(sortFn)
    }
  }
}
