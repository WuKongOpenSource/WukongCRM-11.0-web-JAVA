<template>
  <el-popover
    v-model="showPopover"
    placement="bottom"
    width="320"
    trigger="click"
    popper-class="no-padding-popover">
    <div
      v-loading="loading"
      class="common-words">
      <div
        v-empty="list && list.length == 0"
        xs-empty-icon="none"
        class="word">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="word-item"
          @click="selectScene(item, index)">
          {{ item }}
        </div>
      </div>
      <div class="handle-interval">
        <flexbox
          class="handle-button"
          @click.native="setClick">
          <i class="wk wk-manage handle-button-icon"/>
          <div class="handle-button-name">管理</div>
        </flexbox>
      </div>

    </div>
    <el-button slot="reference" class="word-button">常用语</el-button>
    <set
      :visible.sync="setShow"
      :list="list"
      @update="udpateCommonWords" />
  </el-popover>
</template>

<script>
import { sysConfigQueryPhraseAPI } from '@/api/crm/common'

import Set from './Set'

export default {
  // 常用语
  name: 'CommonWords',
  components: {
    Set
  },
  props: {},
  data() {
    return {
      loading: false,
      showPopover: false,
      setShow: false,
      list: []
    }
  },
  computed: {},
  watch: {
    showPopover(val) {
      if (val && this.list.length == 0) {
        this.getCommonWords()
      }
    }
  },
  mounted() {

  },

  beforeDestroy() {},
  methods: {
    selectScene(item, index) {
      this.$emit('select', item)
      this.showPopover = false
    },

    setClick() {
      this.setShow = true
    },

    /**
     * 获取常用语
     */
    getCommonWords() {
      this.loading = true
      sysConfigQueryPhraseAPI().then(res => {
        this.loading = false
        this.list = res.data || []
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 更新欢迎语
     */
    udpateCommonWords(data) {
      this.list = data
    }
  }
}
</script>

<style lang="scss" scoped>
.common-words {
  position: relative;
}

.word {
  height: 144px;
  border-radius: 4px;
  position: relative;
  overflow-y: auto;
  font-size: 12px;
  margin-bottom: 10px;
  .word-item {
    color: #333;
    padding: 10px 15px;
    cursor: pointer;
    background-color: white;
  }

  .word-item:hover {
    background-color: #f7f8fa;
    color: $xr-color-primary;
  }
}


.handle-button {
  padding: 6px 20px;
  font-size: 12px;
  cursor: pointer;
  color: $xr-color-primary;
  .handle-button-icon {
    margin-right: 8px;
    margin-top: 3px;
  }
  .handle-button-name {
    font-size: 12px;
  }
}
.handle-button:hover {
  .handle-button-name {
    text-decoration: underline;
  }
}

.handle-interval {
  border-top: 1px solid #EFEFEF;
}

.word-button {
  padding: 10px 12px;
}
</style>
