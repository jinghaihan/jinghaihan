<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
</script>

<template>
  <div class="size-full">
    <VueFlow
      :nodes="[]"
      :edges="[]"
      :pan-on-scroll="true"
      :zoom-on-scroll="false"
      :zoom-on-pinch="true"
      :zoom-on-double-click="true"
      :min-zoom="0.2"
      :max-zoom="3"
      class="size-full"
    >
      <Background :size="2" color="var(--input)" />
    </VueFlow>
  </div>
</template>
