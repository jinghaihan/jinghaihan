<script setup lang="ts">
import type { NodeLinkItem } from '@/types/web-pipeline'
import { computed, ref } from 'vue'
import { WEB_PIPELINE_EDGES, WEB_PIPELINE_NODE_MAP } from '@/constants/web-pipeline'
import Graph from './graph.vue'
import Sidebar from './sidebar.vue'

const selectedNodeId = ref('')

const selectedNode = computed(() => WEB_PIPELINE_NODE_MAP.get(selectedNodeId.value) ?? null)
const showSidebar = computed(() => Boolean(selectedNode.value))
const linkedNodes = computed(() => {
  const node = selectedNode.value
  if (!node) {
    return {
      previous: [] as NodeLinkItem[],
      next: [] as NodeLinkItem[],
    }
  }

  const previousIdSet = new Set<string>()
  const nextIdSet = new Set<string>()
  for (const edge of WEB_PIPELINE_EDGES) {
    if (edge.target === node.id)
      previousIdSet.add(edge.source)
    if (edge.source === node.id)
      nextIdSet.add(edge.target)
  }

  const toLinks = (ids: Set<string>) => [...ids]
    .map(id => WEB_PIPELINE_NODE_MAP.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => a.stage - b.stage || a.lane - b.lane)
    .map(item => ({ id: item.id, title: item.title }))

  return {
    previous: toLinks(previousIdSet),
    next: toLinks(nextIdSet),
  }
})

function onSelectionChange(nodeId: string): void {
  if (nodeId === selectedNodeId.value)
    return

  selectedNodeId.value = nodeId
}

function onSidebarNodeSelect(nodeId: string): void {
  onSelectionChange(nodeId)
}
</script>

<template>
  <div
    class="grid size-full min-h-0"
    :class="showSidebar ? 'grid-cols-[minmax(0,1fr)_auto]' : ''"
  >
    <section class="min-h-0">
      <Graph
        :selected-node-id="selectedNodeId"
        @selection-change="onSelectionChange"
      />
    </section>
    <div
      v-if="showSidebar && selectedNode"
      class="pb-3 h-full min-h-0"
    >
      <Sidebar
        :node="selectedNode"
        :previous-nodes="linkedNodes.previous"
        :next-nodes="linkedNodes.next"
        @select-node="onSidebarNodeSelect"
      />
    </div>
  </div>
</template>
