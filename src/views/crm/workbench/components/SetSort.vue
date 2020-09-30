<template>
  <el-dialog
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    title="仪表盘模块设置"
    custom-class="no-padding-dialog"
    width="650px"
    @close="handleCancel">
    <div class="handle-box">
      <div class="title">拖动以下模块可设置模块位置，点击开启/关闭按钮可设置模块是否在仪表盘显示，点击保存按钮即可生效。</div>

      <flexbox
        align="stretch"
        class="section">
        <div class="left">
          <draggable
            v-model="sortLeft"
            :group="{ name: 'sort'}"
            :options="{ forceFallback: false }"
            class="draggable-box">
            <set-sort-item
              v-for="(item, index) in sortLeft"
              :key="index"
              :title="item.title"
              :icon="item.icon"
              :icon-color="item.iconColor"
              :img="item.img"
              class="content"
            >
              <el-switch
                slot="header"
                v-model="item.show"/>
            </set-sort-item>
          </draggable>
        </div>
        <div class="right">
          <draggable
            v-model="sortRight"
            :group="{ name: 'sort'}"
            :options="{ forceFallback: false }"
            class="draggable-box">
            <set-sort-item
              v-for="(item, index) in sortRight"
              :key="index"
              :title="item.title"
              :icon="item.icon"
              :icon-color="item.iconColor"
              :img="item.img"
              class="content"
            >
              <el-switch
                slot="header"
                v-model="item.show"/>
            </set-sort-item>
          </draggable>
        </div>
      </flexbox>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="handleCancel">取消</el-button>
      <el-button
        type="primary"
        @click.native="handleConfirm">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  crmIndexSortAPI,
  crmIndexSetSortAPI
} from '@/api/crm/workbench'

import SetSortItem from './SetSortItem'
import draggable from 'vuedraggable'

import { Loading } from 'element-ui'

export default {
  // 设置仪表盘排序
  name: 'SetSort',
  components: {
    SetSortItem,
    draggable
  },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      sortLeft: [],
      sortRight: [],
      data: {
        1: {
          title: '合同/回款金额目标及完成情况',
          icon: 'wk wk-target',
          iconColor: '#4983EF',
          img: require('@/assets/img/skeleton/sort-chart.png')
        },
        2: {
          title: '数据汇总',
          icon: 'wk wk-data',
          iconColor: '#BF80FF',
          img: require('@/assets/img/skeleton/sort-data.png')
        },
        3: {
          title: '回款金额目标及完成情况',
          icon: 'wk wk-icon-receivable',
          iconColor: '#FFD144',
          img: require('@/assets/img/skeleton/sort-chart.png')
        },
        4: {
          title: '业绩指标完成率',
          icon: 'wk wk-performance',
          iconColor: '#4983EF',
          img: require('@/assets/img/skeleton/sort-done.png')
        },
        5: {
          title: '销售漏斗',
          icon: 'wk wk-funnel',
          iconColor: '#50CF9E',
          img: require('@/assets/img/skeleton/sort-funnel.png'),
          id: 5
        },
        6: {
          title: '遗忘提醒',
          icon: 'wk wk-clock',
          iconColor: '#ff8400',
          img: require('@/assets/img/skeleton/sort-cell.png')
        },
        7: {
          title: '排行榜',
          icon: 'wk wk-hollow-results',
          iconColor: '#4a5bfd',
          img: require('@/assets/img/skeleton/sort-ranking.png')
        }
      }
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getModelSort()
  },
  methods: {
    /**
     * 排序
     */
    getModelSort() {
      /**
       * 1 合同金额目标及完成情况
       * 2 数据汇总
       * 3 回款金额目标及完成情况
       * 4 业绩指标完成率 (回款金额)
       * 5 销售漏斗
       * 6 遗忘提醒
       * 7 排行榜
       */
      const loading = Loading.service({
        target: document.querySelector(`.el-dialog[aria-label="仪表盘模块设置"]`)
      })

      crmIndexSortAPI().then(res => {
        const left = res.data.left || []
        const right = res.data.right || []

        this.sortLeft = left.map(item => {
          item.show = item.isHidden == 0 // 0显示 1隐藏
          return { ...item, ...this.data[item.modelId] }
        })

        this.sortRight = right.map(item => {
          item.show = item.isHidden == 0
          return { ...item, ...this.data[item.modelId] }
        })

        loading.close()
      }).catch(
        loading.close()
      )
    },

    /**
     * 取消选择
     */
    handleCancel() {
      this.$emit('update:visible', false)
    },

    handleConfirm() {
      const loading = Loading.service({
        target: document.querySelector(`.el-dialog[aria-label="仪表盘模块设置"]`)
      })
      const params = {}
      params.left = this.sortLeft.map(item => {
        const data = {}
        data.isHidden = item.show ? 0 : 1
        data.modelId = item.modelId
        return data
      })
      params.right = this.sortRight.map(item => {
        const data = {}
        data.isHidden = item.show ? 0 : 1
        data.modelId = item.modelId
        return data
      })
      crmIndexSetSortAPI(params)
        .then(res => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.$emit('save')
          this.handleCancel()
          loading.close()
        })
        .catch(() => {
          loading.close()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.handle-box {
  background-color: #efefef;
  color: #333;
  font-size: 12px;
  padding: 15px;
  .title {
    color: #999;
  }
}

.section {
  margin-top: 12px;
  height: 56vh;
  overflow: auto;
  user-select: none;

  .left {
    width: calc(60.5% - 12px);
    margin-right: 12px;
  }
  .right {
    width: 39.5%;
  }

  .content {
    height: 100px;

    /deep/ .el-switch {
      position: absolute;
      right: 0;
      top: 0;
    }
  }

  .content + .content {
    margin-top: 12px;
  }
}

.draggable-box {
  height: 100%;
}
</style>
