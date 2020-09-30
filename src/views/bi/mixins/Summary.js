export default {
  data() {
    return {
      summaryData: null
    }
  },
  methods: {
    getSummariesData(data) {
      this.summaryData = data || {}
    },

    getSummaries(param) {
      const { columns } = param
      const sums = []
      columns.forEach((column, index) => {
        sums[index] = this.summaryData ? this.summaryData[column.property] : ''
      })
      return sums
    }
  }
}
