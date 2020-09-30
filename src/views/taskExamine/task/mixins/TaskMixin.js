// 任务用到公共样式方法

export default {
  data() {
    return {
      // 优先级列表 详情 任务列表 用到了 index 3 元素
      priorityList: [
        { id: 3, label: '高', color: '#F95A5A' },
        { id: 2, label: '中', color: '#F7AD3D' },
        { id: 1, label: '低', color: '#67C23A' },
        { id: 0, label: '无', color: '#D8D8D8' }
      ]
    }
  },

  methods: {
    getPriorityColor(priority) {
      if (priority == 1) {
        return {
          color: '#67C23A',
          label: '低'
        }
      } else if (priority == 2) {
        return {
          color: '#F7AD3D',
          label: '中'
        }
      } else if (priority == 3) {
        return {
          color: '#F95A5A',
          label: '高'
        }
      } else {
        return {
          color: 'transparent',
          label: '无'
        }
      }
    }

  }
}
