<script setup lang="ts">
import { computed, ref } from 'vue'
import { WEB_PIPELINE_NODE_MAP } from '@/constants/web-pipeline'
import Graph from './graph.vue'
import Sidebar from './sidebar.vue'

const selectedNodeId = ref('')

const selectedNode = computed(() => WEB_PIPELINE_NODE_MAP.get(selectedNodeId.value) ?? null)
const showSidebar = computed(() => Boolean(selectedNode.value))

function onSelectionChange(nodeId: string): void {
  if (nodeId === selectedNodeId.value)
    return

  selectedNodeId.value = nodeId
}
</script>

<template>
  <div
    class="grid size-full min-h-0"
    :class="showSidebar ? 'grid-cols-[minmax(0,1fr)_auto]' : ''"
  >
    <section class="min-h-0">
      <Graph @selection-change="onSelectionChange" />
    </section>
    <div
      v-if="showSidebar && selectedNode"
      class="pb-3 h-full min-h-0"
    >
      <Sidebar :node="selectedNode" />
    </div>
  </div>
</template>
