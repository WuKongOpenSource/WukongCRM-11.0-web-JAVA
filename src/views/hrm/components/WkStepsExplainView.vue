<template>
  <transition name="opacity-fade">
    <div
      :style="{ 'z-index': zIndex }"
      class="wk-steps-explain-view">
      <div class="label">{{ title }}</div>
      <wk-steps>
        <wk-step
          v-for="(step, index) in steps"
          :key="index"
          :icon="step.icon"
          :label="step.label"
          :des-left="step.desLeft"
          :des-center="step.desCenter"
          :des-right="step.desRight"
          :button="step.button"
          @step-click="stepClick($event, index, step)"
        />
      </wk-steps>
    </div>
  </transition>
</template>

<script>
import WkSteps from '@/components/NewCom/WkSteps'
import WkStep from '@/components/NewCom/WkSteps/WkStep'

import { getMaxIndex } from '@/utils'

export default {
  // 步骤说明视图
  name: 'WkStepsExplainView',
  components: {
    WkSteps,
    WkStep
  },
  props: {
    title: String,
    steps: Array
  },
  data() {
    return {
      zIndex: getMaxIndex()
    }
  },
  computed: {},
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    stepClick(type, index, step) {
      this.$emit('step-click', type, index, step)
    }
  }
}
</script>

<style lang="scss" scoped>
.opacity-fade-enter-active,
.opacity-fade-leave-active {
  transition: all 0.2s;
}
.opacity-fade-enter,
.opacity-fade-leave-to {
  opacity: 0;
}
.wk-steps-explain-view {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: white;

  .label {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    margin-top: 10%;
  }

  .wk-steps {
    margin-top: 10%;
  }
}
</style>
