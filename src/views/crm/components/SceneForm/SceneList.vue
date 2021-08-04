<template>
  <div class="scene-container">
    <div class="scene-list">
      <div
        v-for="(item, index) in sceneList"
        :key="index"
        :class="{'scene-list-item-select':item.sceneId == sceneSelectId}"
        class="scene-list-item"
        @click="selectScene(item, index)">
        {{ item.name }}
      </div>
    </div>
    <div class="handle-interval">
      <flexbox
        class="handle-button"
        @click.native="addScene">
        <i class="wk wk-add handle-button-icon"/>
        <div class="handle-button-name">新建场景</div>
      </flexbox>
      <flexbox
        class="handle-button"
        @click.native="setScene">
        <i class="wk wk-manage handle-button-icon"/>
        <div class="handle-button-name">管理</div>
      </flexbox>
    </div>

  </div>
</template>

<script type="text/javascript">
import crmTypeModel from '@/views/crm/model/crmTypeModel'
import { mapGetters } from 'vuex'
import { crmSceneIndexAPI } from '@/api/crm/common'

export default {
  name: 'SceneList', // 客户管理下 重要提醒 回款计划提醒
  components: {},
  props: {
    /** 没有值就是全部类型 有值就是当个类型 */
    crmType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 场景列表
      sceneSelectId: -1,
      sceneList: []
    }
  },
  computed: {
    ...mapGetters(['crm'])
  },
  watch: {},
  mounted() {
    if (this.crm[this.crmType].index) {
      this.getSceneList()
    }
  },
  methods: {
    getSceneList() {
      crmSceneIndexAPI({
        type: crmTypeModel[this.crmType]
      })
        .then(res => {
          const resData = res.data || []
          const defaultScenes = resData.filter(item => item.isDefault === 1)

          let currentScene = null
          if (defaultScenes && defaultScenes.length > 0) {
            currentScene = defaultScenes[0]
          } else if (resData.length > 0) {
            currentScene = resData[0]
          }

          if (currentScene) {
            currentScene.id = currentScene.sceneId
            currentScene.bydata = currentScene.bydata || ''
            this.sceneSelectId = currentScene.sceneId
            this.$emit('scene', currentScene)
          }

          this.sceneList = resData
        })
        .catch(() => {
          this.$emit('scene', { id: '', name: '', bydata: '' })
        })
    },

    // 选择场景、
    selectScene(item, index) {
      this.sceneSelectId = item.sceneId
      this.$emit('scene', {
        id: item.sceneId,
        name: item.name,
        bydata: item.bydata
      })
      this.$emit('hidden-scene')
    },
    // 添加场景
    addScene() {
      this.$emit('scene-handle', { type: 'add' })
    },
    // 设置场景
    setScene() {
      this.$emit('scene-handle', { type: 'set' })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.scene-container {
  position: relative;
  width: 180px;
}

.scene-list {
  max-height: 240px;
  overflow-y: auto;
  font-size: 12px;
  margin-bottom: 10px;
  .scene-list-item {
    color: #333;
    padding: 10px 15px;
    cursor: pointer;
    background-color: white;
  }
  .scene-list-item:hover {
    background-color: #f7f8fa;
    color: $xr-color-primary;
  }

  .scene-list-item-select {
    color: $xr-color-primary;
    background-color: #f7f8fa;
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
</style>
