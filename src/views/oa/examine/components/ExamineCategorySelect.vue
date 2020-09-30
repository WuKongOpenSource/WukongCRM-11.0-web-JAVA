<template>
  <el-dialog
    :visible.sync="showDialog"
    :close-on-click-modal="false"
    title="审批类型"
    width="500px"
    @close="closeView">
    <div class="title">请选择您的审批类型（管理后台可自定义配置审批类型）</div>
    <div
      v-loading="loading"
      class="categorys">
      <flexbox
        wrap="wrap"
        align="stretch">
        <div
          v-for="(item, index) in categorys"
          :key="index"
          class="category-item"
          @click="selectCategorys(item)">
          <div
            :style="{ backgroundColor: item.iconColor }"
            class="category-icon">
            <i :class="item.iconClass" />
          </div>
          <div class="category-label text-one-line">{{ item.title }}</div>
        </div>
      </flexbox>
    </div>
  </el-dialog>
</template>

<script>
import { oaAllExamineCategoryListAPI } from '@/api/oa/examine'

export default {
  name: 'ExamineCategorySelect',
  components: {},
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      categorys: []
    }
  },
  watch: {
    show: function(val) {
      this.showDialog = val
      if (this.categorys && this.categorys.length == 0) {
        this.getDetail()
      }
    }
  },
  mounted() {},
  methods: {
    // 审批类型列表
    getDetail() {
      this.loading = true
      oaAllExamineCategoryListAPI()
        .then(res => {
          this.loading = false
          this.categorys = res.data.map(item => {
            const temps = item.icon ? item.icon.split(',') : []
            if (temps.length > 1) {
              item.iconClass = temps[0]
              item.iconColor = temps[1]
            } else {
              item.iconClass = 'wk wk-approve'
              item.iconColor = '#9376FF'
            }
            return item
          })
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 审批类型选择
    selectCategorys(item) {
      this.$emit('select', item)
      this.$emit('close')
    },
    // 关闭操作
    closeView() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.title {
  position: absolute;
  left: 25px;
  top: 55px;
  font-size: 12px;
  color: #ccc;
}

.categorys {
  height: 250px;
  overflow-y: auto;
  .category-item {
    width: 90px;
    height: 90px;
    padding: 10px;
    text-align: center;
    cursor: pointer;
  }

  .category-item:hover {
    background-color: #ECF2FF;
  }
}

.category-icon {
  display: inline-block;
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  border-radius: $xr-border-radius-base;
  margin-top: 5px;
  .wk {
    color: white;
    font-size: 24px;
  }
}

.category-label {
  color: #333;
  font-size: 14px;
  margin-top: 5px;
}
</style>
